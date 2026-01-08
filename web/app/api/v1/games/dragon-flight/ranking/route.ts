import { protect } from "@/server/controllers/auth-controller";
import { logRequest } from "@/server/middleware";
import { createEdgeRouter } from "next-connect";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ExtendedNextRequest } from "@/server/controllers/auth-controller";
import { ActivityType } from "@prisma/client";

const router = createEdgeRouter<NextRequest, {}>();

router.use(logRequest);
router.use(protect);

async function getDragonFlightRanking(req: ExtendedNextRequest) {
  try {
    const userId = req.session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Get current user's license/school info
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { licenseId: true, schoolId: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. Fetch rankings from GameRanking table
    const gameRankings = await prisma.gameRanking.findMany({
      where: {
        gameType: "DRAGON_FLIGHT",
        user: {
          licenseId: currentUser.licenseId || undefined,
          schoolId: !currentUser.licenseId ? currentUser.schoolId : undefined,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        totalXp: "desc",
      },
    });

    // 4. Group by difficulty
    type RankingEntry = {
      userId: string;
      name: string;
      image: string | null;
      xp: number;
    };

    const sortedRankings: Record<string, RankingEntry[]> = {
      easy: [],
      normal: [],
      hard: [],
      extreme: [],
    };

    gameRankings.forEach((rank) => {
      const difficulty = rank.difficulty;
      if (sortedRankings[difficulty]) {
        if (sortedRankings[difficulty].length < 20) {
          sortedRankings[difficulty].push({
            userId: rank.userId,
            name: rank.user.name || "Unknown Dragon Rider",
            image: rank.user.image,
            xp: rank.totalXp,
          });
        }
      }
    });

    return NextResponse.json({ rankings: sortedRankings });
  } catch (error) {
    console.error("Error fetching dragon flight rankings:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

router.get(getDragonFlightRanking as any);

export async function GET(request: NextRequest) {
  const result = await router.run(request, {});
  if (result instanceof NextResponse) {
    return result;
  }
  throw new Error("Expected a NextResponse from router.run");
}
