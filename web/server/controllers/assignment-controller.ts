import { NextResponse } from "next/server";
import db from "@/configs/firestore-config";
import { ExtendedNextRequest } from "./auth-controller";

interface StudentAssignment {
  id: string;
  classroomId: string;
  articleId: string;
  title: string;
  description: string;
  dueDate: string;
  status: number;
  createdAt: string;
  teacherId: string;
  displayName: string | null;
  teacherDisplayName?: string;
}

export async function getAssignments(req: ExtendedNextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get("classroomId");
    const articleId = searchParams.get("articleId");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!classroomId) {
      return NextResponse.json(
        { message: "Missing classroomId in query parameters" },
        { status: 400 }
      );
    }

    if (articleId) {
      const assignmentsRef = db
        .collection("assignments")
        .doc(classroomId)
        .collection(articleId);

      const snapshot = await assignmentsRef.get();
      const metaDoc = await assignmentsRef.doc("meta").get();
      const metaData = metaDoc.exists ? metaDoc.data() : {};

      const students = snapshot.docs
        .filter((doc) => doc.id !== "meta")
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as { studentId: string }),
        }));

      return NextResponse.json({ meta: metaData, students }, { status: 200 });
    } else {
      const articlesSnap = await db
        .collection("assignments")
        .doc(classroomId)
        .listCollections();

      let result: any[] = [];

      for (const articleCol of articlesSnap) {
        const metaDoc = await articleCol.doc("meta").get();
        const metaData = metaDoc.exists ? metaDoc.data() : {};

        const snapshot = await articleCol.get();
        const students = snapshot.docs
          .filter((doc) => doc.id !== "meta")
          .map((doc) => ({
            id: doc.id,
            ...(doc.data() as { studentId: string }),
          }));

        result.push({
          articleId: articleCol.id,
          meta: metaData,
          students,
        });
      }

      // Apply search filter if provided
      if (search && search.trim() !== "") {
        const searchLower = search.toLowerCase().trim();
        result = result.filter(
          (assignment) =>
            assignment.meta.title?.toLowerCase().includes(searchLower) ||
            assignment.meta.description?.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      const totalCount = result.length;
      const offset = (page - 1) * limit;
      const paginatedResult = result.slice(offset, offset + limit);

      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return NextResponse.json(
        {
          assignments: paginatedResult,
          pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            hasNextPage,
            hasPrevPage,
            limit,
          },
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function postAssignment(req: ExtendedNextRequest) {
  try {
    const data = await req.json();

    const {
      classroomId,
      articleId,
      title,
      description,
      dueDate,
      selectedStudents,
      userId,
    } = data;

    const createdAt = new Date().toISOString();
    const batch = db.batch();
    const studentsToSave: string[] = [];

    // Teacher perspective - existing structure
    const metaRef = db
      .collection("assignments")
      .doc(classroomId)
      .collection(articleId)
      .doc("meta");

    batch.set(metaRef, {
      title,
      description,
      dueDate,
      classroomId,
      articleId,
      userId,
      createdAt,
    });

    const checkPromises = selectedStudents.map(async (studentId: string) => {
      const assignmentRef = db
        .collection("assignments")
        .doc(classroomId)
        .collection(articleId)
        .doc(studentId);

      const docSnap = await assignmentRef.get();
      if (!docSnap.exists) {
        studentsToSave.push(studentId);

        let displayName = null;
        try {
          const userSnap = await db.collection("users").doc(studentId).get();
          displayName = userSnap.exists
            ? userSnap.data()?.display_name || null
            : null;
        } catch {
          displayName = null;
        }

        // Teacher perspective
        batch.set(assignmentRef, {
          studentId,
          status: 0,
          displayName,
        });

        // Student perspective - new structure
        const assignmentId = `${classroomId}_${articleId}`;
        const studentAssignmentRef = db
          .collection("student-assignments")
          .doc(studentId)
          .collection("assignments")
          .doc(assignmentId);

        batch.set(studentAssignmentRef, {
          classroomId,
          articleId,
          title,
          description,
          dueDate,
          status: 0,
          createdAt,
          teacherId: userId,
          displayName,
        });
      }
    });

    await Promise.all(checkPromises);
    await batch.commit();

    return NextResponse.json(
      {
        message: `${studentsToSave.length} assignments created successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating assignment:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function updateAssignment(req: ExtendedNextRequest) {
  try {
    const data = await req.json();
    const { classroomId, articleId, studentId, updates } = data;

    if (!classroomId || !articleId || !studentId || !updates) {
      return NextResponse.json(
        {
          message:
            "Missing required fields: classroomId, articleId, studentId, or updates",
        },
        { status: 400 }
      );
    }

    const batch = db.batch();

    // Update teacher perspective
    const assignmentRef = db
      .collection("assignments")
      .doc(classroomId)
      .collection(articleId)
      .doc(studentId);

    const docSnap = await assignmentRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { message: "Assignment not found" },
        { status: 404 }
      );
    }

    if (studentId === "meta") {
      const allowedMetaFields = [
        "title",
        "description",
        "dueDate",
        "classroomId",
        "articleId",
        "userId",
        "createdAt",
      ];
      const filteredUpdates: Record<string, any> = {};
      for (const key of allowedMetaFields) {
        if (updates.hasOwnProperty(key)) {
          filteredUpdates[key] = updates[key];
        }
      }
      if (Object.keys(filteredUpdates).length === 0) {
        return NextResponse.json(
          { message: "No valid metadata fields to update" },
          { status: 400 }
        );
      }
      batch.update(assignmentRef, filteredUpdates);

      // Update student-assignments for all students in this assignment
      const studentsSnapshot = await db
        .collection("assignments")
        .doc(classroomId)
        .collection(articleId)
        .get();

      const assignmentId = `${classroomId}_${articleId}`;

      studentsSnapshot.docs
        .filter((doc) => doc.id !== "meta")
        .forEach((doc) => {
          const studentAssignmentRef = db
            .collection("student-assignments")
            .doc(doc.id)
            .collection("assignments")
            .doc(assignmentId);

          // Only update relevant fields for student view (exclude userId, createdAt)
          const studentUpdates: Record<string, any> = {};
          if (filteredUpdates.title)
            studentUpdates.title = filteredUpdates.title;
          if (filteredUpdates.description)
            studentUpdates.description = filteredUpdates.description;
          if (filteredUpdates.dueDate)
            studentUpdates.dueDate = filteredUpdates.dueDate;

          if (Object.keys(studentUpdates).length > 0) {
            batch.update(studentAssignmentRef, studentUpdates);
          }
        });
    } else {
      const allowedFields = ["status", "displayName"];
      const filteredUpdates: Record<string, any> = {};
      for (const key of allowedFields) {
        if (updates.hasOwnProperty(key)) {
          filteredUpdates[key] = updates[key];
        }
      }
      if (Object.keys(filteredUpdates).length === 0) {
        return NextResponse.json(
          { message: "No valid fields to update" },
          { status: 400 }
        );
      }

      batch.update(assignmentRef, filteredUpdates);

      // Update student perspective
      const assignmentId = `${classroomId}_${articleId}`;
      const studentAssignmentRef = db
        .collection("student-assignments")
        .doc(studentId)
        .collection("assignments")
        .doc(assignmentId);

      batch.update(studentAssignmentRef, filteredUpdates);
    }

    await batch.commit();

    return NextResponse.json(
      { message: "Assignment updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function getStudentAssignments(req: ExtendedNextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const status = searchParams.get("status");
    const dueDateFilter = searchParams.get("dueDateFilter");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!studentId) {
      return NextResponse.json(
        { message: "Missing studentId in query parameters" },
        { status: 400 }
      );
    }

    const snapshot = await db
      .collection("student-assignments")
      .doc(studentId)
      .collection("assignments")
      .orderBy("dueDate", "asc")
      .get();

    let assignments: StudentAssignment[] = snapshot.docs.map(
      (doc: any) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as StudentAssignment)
    );

    // Get unique teacher IDs
    const teacherIds = [
      ...new Set(
        assignments.map((assignment) => assignment.teacherId).filter(Boolean)
      ),
    ];

    // Fetch teacher display names
    const teacherDisplayNames: { [key: string]: string } = {};

    if (teacherIds.length > 0) {
      const teacherPromises = teacherIds.map(async (teacherId) => {
        try {
          const teacherDoc = await db.collection("users").doc(teacherId).get();
          if (teacherDoc.exists) {
            const teacherData = teacherDoc.data();
            teacherDisplayNames[teacherId] =
              teacherData?.display_name ||
              teacherData?.email ||
              "Unknown Teacher";
          } else {
            teacherDisplayNames[teacherId] = "Unknown Teacher";
          }
        } catch (error) {
          console.error(`Error fetching teacher ${teacherId}:`, error);
          teacherDisplayNames[teacherId] = "Unknown Teacher";
        }
      });

      await Promise.all(teacherPromises);
    }

    // Update assignments with teacher display names
    assignments = assignments.map((assignment) => ({
      ...assignment,
      teacherDisplayName:
        teacherDisplayNames[assignment.teacherId] || "Unknown Teacher",
    }));

    // Apply search filter
    if (search && search.trim() !== "") {
      const searchLower = search.toLowerCase().trim();

      assignments = assignments.filter((assignment) => {
        const titleMatch = assignment.title
          ?.toLowerCase()
          .includes(searchLower);
        const descMatch = assignment.description
          ?.toLowerCase()
          .includes(searchLower);
        const nameMatch = assignment.displayName
          ?.toLowerCase()
          .includes(searchLower);
        const teacherMatch = teacherDisplayNames[assignment.teacherId]
          ?.toLowerCase()
          .includes(searchLower);

        return titleMatch || descMatch || nameMatch || teacherMatch;
      });
    }

    // Apply status filter
    if (status && status !== "all") {
      assignments = assignments.filter(
        (assignment) => assignment.status === parseInt(status)
      );
    }

    // Apply due date filter
    if (dueDateFilter && dueDateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      assignments = assignments.filter((assignment) => {
        const dueDate = new Date(assignment.dueDate);
        switch (dueDateFilter) {
          case "overdue":
            return dueDate < today;
          case "today":
            return dueDate >= today && dueDate < tomorrow;
          case "upcoming":
            return dueDate >= tomorrow;
          default:
            return true;
        }
      });
    }

    // Apply pagination in memory
    const totalCount = assignments.length;
    const offset = (page - 1) * limit;
    const paginatedAssignments = assignments.slice(offset, offset + limit);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json(
      {
        assignments: paginatedAssignments,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching student assignments:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
