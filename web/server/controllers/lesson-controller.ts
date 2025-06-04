import { ExtendedNextRequest } from "./auth-controller";
import { NextRequest, NextResponse } from "next/server";
import db from "@/configs/firestore-config";

export interface Context {
  params: {
    userId: string;
  };
}

export async function getLessonStatus(
  req: NextRequest,
  { params: { userId } }: Context
) {
  try {
    const articleId = req.nextUrl.searchParams.get("articleId");

    if (!articleId) {
      throw new Error("articleId is required");
    }

    const LessonData = await db
      .collection("users")
      .doc(userId)
      .collection("lesson-records")
      .doc(articleId)
      .get();

    const lessonData = LessonData.data();

    if (!lessonData) {
      return NextResponse.json({ currentPhase: 1, elapsedTime: 0 });
    }

    let currentPhase = 1;
    let elapsedTime = 0;

    for (let phase = 1; phase <= 14; phase++) {
      const phaseKey = `phase${phase}`;
      if (lessonData[phaseKey]?.status === 1) {
        currentPhase = phase;
        elapsedTime = lessonData[`phase${phase - 1}`]?.elapsedTime || 0;
        break;
      }
    }

    return NextResponse.json({ currentPhase, elapsedTime });
  } catch (error) {
    console.error("Error getting documents", error);
    return NextResponse.json(
      { message: "Internal server error", results: [] },
      { status: 500 }
    );
  }
}

export async function postLessonStatus(
  req: NextRequest,
  { params: { userId } }: Context
) {
  try {
    const articleId = req.nextUrl.searchParams.get("articleId");

    if (!articleId) {
      throw new Error("articleId is required");
    }

    const existingLessonData = await db
      .collection("users")
      .doc(userId)
      .collection("lesson-records")
      .doc(articleId)
      .get();

    if (existingLessonData.exists) {
      return NextResponse.json(
        { message: "Lesson status already exists, no action taken." },
        { status: 200 }
      );
    }

    let lessonStatus = {
      phase1: { status: 2, elapsedTime: 0 },
      phase2: { status: 0, elapsedTime: 0 },
      phase3: { status: 0, elapsedTime: 0 },
      phase4: { status: 0, elapsedTime: 0 },
      phase5: { status: 0, elapsedTime: 0 },
      phase6: { status: 0, elapsedTime: 0 },
      phase7: { status: 0, elapsedTime: 0 },
      phase8: { status: 0, elapsedTime: 0 },
      phase9: { status: 0, elapsedTime: 0 },
      phase10: { status: 0, elapsedTime: 0 },
      phase11: { status: 0, elapsedTime: 0 },
      phase12: { status: 0, elapsedTime: 0 },
      phase13: { status: 0, elapsedTime: 0 },
      phase14: { status: 0, elapsedTime: 0 },
    };

    const batch = db.batch();

    // Create lesson status
    const lessonRef = db
      .collection("users")
      .doc(userId)
      .collection("lesson-records")
      .doc(articleId);

    batch.set(lessonRef, lessonStatus);

    // Update assignment status if classroomId is provided
    const classroomId = req.nextUrl.searchParams.get("classroomId");
    console.log("ClassroomId received:", classroomId);
    if (classroomId) {
      // Update teacher perspective (assignments collection)
      const assignmentRef = db
        .collection("assignments")
        .doc(classroomId)
        .collection(articleId)
        .doc(userId);

      // Check if assignment exists before updating
      const assignmentDoc = await assignmentRef.get();
      if (assignmentDoc.exists) {
        batch.update(assignmentRef, { status: 1 });

        // Update student perspective (student-assignments collection)
        const assignmentId = `${classroomId}_${articleId}`;
        const studentAssignmentRef = db
          .collection("student-assignments")
          .doc(userId)
          .collection("assignments")
          .doc(assignmentId);

        batch.update(studentAssignmentRef, { status: 1 });
      }
    }

    await batch.commit();

    return NextResponse.json(
      { message: "Create lesson phase status success!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating lesson status", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function putLessonPhaseStatus(
  req: NextRequest,
  { params: { userId } }: Context
) {
  try {
    console.log("Request received for userId:", userId);

    const articleId = req.nextUrl.searchParams.get("articleId");
    const { phase, status, elapsedTime } = await req.json();

    if (!articleId || !phase) {
      return NextResponse.json(
        { message: "articleId and phase are required" },
        { status: 400 }
      );
    }

    const batch = db.batch();

    const lessonRef = db
      .collection("users")
      .doc(userId)
      .collection("lesson-records")
      .doc(articleId);

    const phaseKey = `phase${phase}`;
    const updateData: Record<string, any> = {};
    updateData[`${phaseKey}.status`] = status;
    updateData[`${phaseKey}.elapsedTime`] = elapsedTime;

    batch.update(lessonRef, updateData);

    if (phase < 14) {
      const nextPhaseKey = `phase${phase + 1}`;
      const nextPhaseData: Record<string, any> = {};
      nextPhaseData[`${nextPhaseKey}.status`] = 1;
      batch.update(lessonRef, nextPhaseData);
    }

    const classroomId = req.nextUrl.searchParams.get("classroomId");
    console.log("ClassroomId received:", classroomId);
    if (classroomId && phase === 13 && status === 2) {
      const assignmentRef = db
        .collection("assignments")
        .doc(classroomId)
        .collection(articleId)
        .doc(userId);

      const studentAssignmentRef = db
        .collection("student-assignments")
        .doc(userId)
        .collection("assignments")
        .doc(`${classroomId}_${articleId}`);

      batch.update(assignmentRef, { status: 2 });
      batch.update(studentAssignmentRef, { status: 2 });
    }

    await batch.commit();

    return NextResponse.json({ message: "Update successful" }, { status: 200 });
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function getUserQuizPerformance(
  req: NextRequest,
  { params: { userId } }: Context
) {
  try {
    const articleId = req.nextUrl.searchParams.get("articleId");

    if (!articleId) {
      return NextResponse.json(
        { message: "articleId is required" },
        { status: 400 }
      );
    }

    const decodedArticleId = decodeURIComponent(articleId);
    const cleanArticleId = decodedArticleId.split("/")[0];

    const articleData = await db
      .collection("users")
      .doc(userId)
      .collection("article-records")
      .doc(cleanArticleId)
      .get();

    if (!articleData.exists) {
      return NextResponse.json({ message: "No Data Exists" }, { status: 404 });
    }

    const quizData = articleData.data();
    const mcqScore = quizData?.scores;
    const saqScore = quizData?.scores;

    return NextResponse.json({ mcqScore, saqScore }, { status: 200 });
  } catch (error) {
    console.error("Error getting documents", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
