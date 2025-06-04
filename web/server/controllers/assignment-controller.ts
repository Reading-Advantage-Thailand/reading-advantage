import { NextResponse } from "next/server";
import db from "@/configs/firestore-config";
import { ExtendedNextRequest } from "./auth-controller";

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

        batch.set(assignmentRef, {
          studentId,
          status: 0,
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
      await assignmentRef.update(filteredUpdates);
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
      await assignmentRef.update(filteredUpdates);
    }

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
