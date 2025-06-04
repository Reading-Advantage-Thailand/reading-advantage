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
}

export async function getAssignments(req: ExtendedNextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get("classroomId");
    const articleId = searchParams.get("articleId");

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

      const result: any[] = [];

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

      return NextResponse.json(result, { status: 200 });
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

    if (!studentId) {
      return NextResponse.json(
        { message: "Missing studentId in query parameters" },
        { status: 400 }
      );
    }

    let query: any = db
      .collection("student-assignments")
      .doc(studentId)
      .collection("assignments");

    if (status) {
      query = query.where("status", "==", parseInt(status));
    }

    // Add ordering by due date
    query = query.orderBy("dueDate", "asc");

    const snapshot = await query.get();
    const assignments: StudentAssignment[] = snapshot.docs.map(
      (doc: any) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as StudentAssignment)
    );

    return NextResponse.json(assignments, { status: 200 });
  } catch (error) {
    console.error("Error fetching student assignments:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
