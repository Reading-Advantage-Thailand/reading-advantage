import { protect } from "@/server/controllers/auth-controller";
import { logRequest } from "@/server/middleware";
import { createEdgeRouter } from "next-connect";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ExtendedNextRequest } from "@/server/controllers/auth-controller";

const router = createEdgeRouter<NextRequest, {}>();

router.use(logRequest);
router.use(protect);

async function completeDragonFlightGame(req: ExtendedNextRequest) {
  try {
    const userId = req.session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      correctAnswers,
      totalAttempts,
      accuracy,
      dragonCount,
      timeTaken,
      difficulty,
    } = body;

    // Validate required fields
    if (
      correctAnswers === undefined ||
      totalAttempts === undefined ||
      accuracy === undefined
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          message: "correctAnswers, totalAttempts, and accuracy are required",
        },
        { status: 400 }
      );
    }

    // Calculate XP: correctAnswers * accuracy
    // Example: 8 correct * 0.8 accuracy = 6.4 → 6 XP
    const xpEarned = Math.floor(correctAnswers * accuracy);

    // Create unique target ID for this game session
    const uniqueTargetId = `dragon-flight-${userId}-${Date.now()}`;

    try {
      // Create user activity record
      const activity = await prisma.userActivity.create({
        data: {
          userId: userId,
          activityType: "DRAGON_FLIGHT",
          targetId: uniqueTargetId,
          completed: true,
          timer: timeTaken || 0,
          details: {
            correctAnswers,
            totalAttempts,
            accuracy,
            dragonCount: dragonCount || 0,
            xpEarned,
            difficulty,
            gameSession: uniqueTargetId,
          },
        },
      });

      // Create XP log entry if XP was earned
      if (xpEarned > 0) {
        await prisma.xPLog.create({
          data: {
            userId: userId,
            xpEarned: xpEarned,
            activityId: activity.id,
            activityType: "DRAGON_FLIGHT",
          },
        });

        // Update user's total XP
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (user) {
          await prisma.user.update({
            where: { id: userId },
            data: { xp: user.xp + xpEarned },
          });

          // Update session if available
          if (req.session?.user) {
            req.session.user.xp = user.xp + xpEarned;
          }

          // Update Game Ranking
          if (difficulty) {
            await prisma.gameRanking.upsert({
              where: {
                userId_gameType_difficulty: {
                  userId: userId,
                  gameType: "DRAGON_FLIGHT",
                  difficulty: difficulty,
                },
              },
              update: {
                totalXp: {
                  increment: xpEarned,
                },
              },
              create: {
                userId: userId,
                gameType: "DRAGON_FLIGHT",
                difficulty: difficulty,
                totalXp: xpEarned,
              },
            });
          }
        }
      }

      return NextResponse.json({
        message: "Game completed successfully",
        xpEarned,
        activityId: activity.id,
        status: 200,
      });
    } catch (error) {
      console.error("Error logging dragon flight activity:", error);
      return NextResponse.json(
        {
          error: "Failed to log activity",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error completing dragon flight game:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

router.post(completeDragonFlightGame as any);

export async function POST(request: NextRequest) {
  const result = await router.run(request, {});
  if (result instanceof NextResponse) {
    return result;
  }
  throw new Error("Expected a NextResponse from router.run");
}
