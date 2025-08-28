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
      // If lesson record exists, update phase 1 as completed and phase 2 as current
      await prisma.lessonRecord.update({
        where: {
          userId_articleId: {
            userId,
            articleId,
          },
        },
        data: {
          phase1: { status: 2, elapsedTime: 0 }, // Phase 1 completed
          phase2: { status: 1, elapsedTime: 0 }, // Phase 2 current
        },
      });

      return NextResponse.json(
        {
          message:
            "Lesson started successfully! Phase 1 completed, moved to Phase 2.",
        },
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

    // Find all UserActivities for MC and SA questions
    const allUserActivities = await prisma.userActivity.findMany({
      where: {
        userId,
        activityType: {
          in: ["MC_QUESTION", "SA_QUESTION"],
        },
        completed: true,
      },
      select: {
        id: true,
        activityType: true,
        details: true,
      },
    });

    // Filter activities based on articleId in details
    const userActivities = allUserActivities.filter((activity) => {
      const details = activity.details as any;
      return details?.articleId === cleanArticleId;
    });

    if (userActivities.length === 0) {
      return NextResponse.json({ message: "No Data Exists" }, { status: 404 });
    }

    // Get XP logs for these activities
    const activityIds = userActivities.map((a) => a.id);
    const allXPLogs = await prisma.xPLog.findMany({
      where: {
        userId,
        activityId: { in: activityIds },
        activityType: { in: ["MC_QUESTION", "SA_QUESTION"] },
      },
    });

    const mcqLogs = allXPLogs.filter(
      (log) => log.activityType === "MC_QUESTION"
    );
    const saqLogs = allXPLogs.filter(
      (log) => log.activityType === "SA_QUESTION"
    );

    // MCQ: Count correct answers based on XP earned (1 XP = 1 correct answer)
    const mcqCorrectCount = mcqLogs.reduce(
      (total, log) => total + (log.xpEarned > 0 ? 1 : 0),
      0
    );

    // SAQ: Use total XP score as before
    const saqScore = saqLogs.reduce((total, log) => total + log.xpEarned, 0);

    return NextResponse.json(
      {
        mcqScore: mcqCorrectCount, // Count of correct MCQ answers
        saqScore: saqScore, // Sum of SAQ XP scores
        mcqCount: mcqLogs.length,
        saqCount: saqLogs.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting quiz performance", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
