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
        "Lesson status already exists, no action taken."
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

    await db
      .collection("users")
      .doc(userId)
      .collection("lesson-records")
      .doc(articleId)
      .set(lessonStatus);

    return NextResponse.json("Create lesson phase status success!");
  } catch (error) {
    console.error("Error creating lesson status", error);
    return NextResponse.json(
      { message: "Internal server error", results: [] },
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
    const phaseKey = `phase${phase}`;
    const updateData: Record<string, any> = {};
    updateData[`${phaseKey}.status`] = status;
    updateData[`${phaseKey}.elapsedTime`] = elapsedTime;

    await db
      .collection("users")
      .doc(userId)
      .collection("lesson-records")
      .doc(articleId)
      .update(updateData);

    if (phase < 14) {
      const nextPhaseKey = `phase${phase + 1}`;
      const nextPhaseData: Record<string, any> = {};
      nextPhaseData[`${nextPhaseKey}.status`] = 1;

      await db
        .collection("users")
        .doc(userId)
        .collection("lesson-records")
        .doc(articleId)
        .update(nextPhaseData);
    }

    return NextResponse.json({ message: "Update successful" });
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
