import { ExtendedNextRequest } from "./auth-controller";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const lessonRecord = await prisma.lessonRecord.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });

    if (!lessonRecord) {
      return NextResponse.json({ currentPhase: 1, elapsedTime: 0 });
    }

    let currentPhase = 1;
    let elapsedTime = 0;

    // Check each phase to find the current one (status = 1)
    for (let phase = 1; phase <= 14; phase++) {
      const phaseKey = `phase${phase}` as keyof typeof lessonRecord;
      const phaseData = lessonRecord[phaseKey] as any;
      
      if (phaseData?.status === 1) {
        currentPhase = phase;
        // Get elapsed time from previous phase if available
        if (phase > 1) {
          const prevPhaseKey = `phase${phase - 1}` as keyof typeof lessonRecord;
          const prevPhaseData = lessonRecord[prevPhaseKey] as any;
          elapsedTime = prevPhaseData?.elapsedTime || 0;
        }
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

    const existingLessonRecord = await prisma.lessonRecord.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });

    if (existingLessonRecord) {
      return NextResponse.json(
        { message: "Lesson status already exists, no action taken." },
        { status: 200 }
      );
    }

    // Create lesson status with initial phase configuration
    const lessonStatus = {
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

    await prisma.$transaction(async (tx) => {
      // Create lesson record
      await tx.lessonRecord.create({
        data: {
          userId,
          articleId,
          ...lessonStatus,
        },
      });

      // Update assignment status if classroomId is provided
      const classroomId = req.nextUrl.searchParams.get("classroomId");
      console.log("ClassroomId received:", classroomId);
      
      if (classroomId) {
        // Check if assignment exists and update its status
        const assignment = await tx.assignment.findFirst({
          where: {
            classroomId,
            articleId,
            userId,
          },
        });

        if (assignment) {
          await tx.assignment.update({
            where: { id: assignment.id },
            data: { status: "IN_PROGRESS" },
          });
        }
      }
    });

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

    await prisma.$transaction(async (tx) => {
      // Get current lesson record
      const lessonRecord = await tx.lessonRecord.findUnique({
        where: {
          userId_articleId: {
            userId,
            articleId,
          },
        },
      });

      if (!lessonRecord) {
        throw new Error("Lesson record not found");
      }

      // Prepare update data for current phase
      const phaseKey = `phase${phase}` as keyof typeof lessonRecord;
      const updateData: any = {};
      updateData[phaseKey] = { status, elapsedTime };

      // If phase < 14, set next phase to status 1 (in progress)
      if (phase < 14) {
        const nextPhaseKey = `phase${phase + 1}` as keyof typeof lessonRecord;
        updateData[nextPhaseKey] = { status: 1, elapsedTime: 0 };
      }

      // Update lesson record
      await tx.lessonRecord.update({
        where: {
          userId_articleId: {
            userId,
            articleId,
          },
        },
        data: updateData,
      });

      // Handle assignment completion if this is phase 13 and status is completed (2)
      const classroomId = req.nextUrl.searchParams.get("classroomId");
      console.log("ClassroomId received:", classroomId);
      
      if (classroomId && phase === 13 && status === 2) {
        // Find and update assignment
        const assignment = await tx.assignment.findFirst({
          where: {
            classroomId,
            articleId,
            userId,
          },
        });

        if (assignment) {
          await tx.assignment.update({
            where: { id: assignment.id },
            data: { status: "COMPLETED" },
          });
        }
      }
    });

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

    // Note: This function seems to be looking for quiz performance data
    // which might be stored in a different way in the original Firebase structure.
    // For now, I'll return a basic structure that matches the expected response.
    // You may need to adjust this based on how quiz scores are actually stored.

    const userActivity = await prisma.userActivity.findFirst({
      where: {
        userId,
        targetId: cleanArticleId,
        activityType: "ARTICLE_READ",
      },
    });

    if (!userActivity) {
      return NextResponse.json({ message: "No Data Exists" }, { status: 404 });
    }

    // Extract scores from the details JSON if available
    const details = userActivity.details as any;
    const mcqScore = details?.mcqScore || details?.scores || 0;
    const saqScore = details?.saqScore || details?.scores || 0;

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
