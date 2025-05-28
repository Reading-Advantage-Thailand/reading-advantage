import { NextResponse } from "next/server";
import db from "@/configs/firestore-config";
import { ExtendedNextRequest } from "./auth-controller";

export async function getAssignments(req: ExtendedNextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const classroomId = searchParams.get("classroomId");
    const articleId = searchParams.get("articleId");

    if (!classroomId || !articleId) {
      return NextResponse.json(
        { message: "Missing classroomId or articleId in query parameters" },
        { status: 400 }
      );
    }

    const assignmentsRef = db
      .collection("assignments")
      .doc(classroomId)
      .collection(articleId);

    const snapshot = await assignmentsRef.get();

    const assignments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as { studentId: string }),
    }));

    // ดึง display_name จาก users collection
    const assignmentsWithNames = await Promise.all(
      assignments.map(async (assignment) => {
        const userRef = db.collection("users").doc(assignment.studentId);
        const userSnap = await userRef.get();

        const displayName = userSnap.exists
          ? userSnap.data()?.display_name || null
          : null;

        return {
          ...assignment,
          displayName,
        };
      })
    );

    return NextResponse.json(assignmentsWithNames, { status: 200 });
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

    const checkPromises = selectedStudents.map(async (studentId: string) => {
      const assignmentRef = db
        .collection("assignments")
        .doc(classroomId)
        .collection(articleId)
        .doc(studentId);

      const docSnap = await assignmentRef.get();
      if (!docSnap.exists) {
        studentsToSave.push(studentId);

        batch.set(assignmentRef, {
          title,
          description,
          dueDate,
          classroomId,
          articleId,
          userId,
          studentId,
          createdAt,
          status: 0, // 0: not started, 1: in progress, 2: completed
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
                { message: "Missing required fields: classroomId, articleId, studentId, or updates" },
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

        await assignmentRef.update(updates);

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