import { protect } from "@/server/controllers/auth-controller";
import { logRequest } from "@/server/middleware";
import { createEdgeRouter } from "next-connect";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ExtendedNextRequest } from "@/server/controllers/auth-controller";

const router = createEdgeRouter<NextRequest, {}>();

router.use(logRequest);
router.use(protect);

async function getVocabularyForMagicDefense(req: ExtendedNextRequest) {
  try {
    const userId = req.session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's vocabulary words
    // Prioritize words that are due for review (spaced repetition)
    const vocabularies = await prisma.userWordRecord.findMany({
      where: {
        userId: userId,
        saveToFlashcard: true,
      },
      orderBy: [
        { due: "asc" }, // Words due for review first
        { createdAt: "desc" }, // Then recent words
      ],
      take: 50, // Get up to 50 words
    });

    if (vocabularies.length === 0) {
      return NextResponse.json({
        message:
          "No vocabulary found. Please save some vocabulary words first.",
        vocabulary: [],
        status: 200,
      });
    }

    // Transform to the format expected by the game
    // VocabularyItem { term: string, translation: string }
    const gameVocabulary = vocabularies
      .map((vocab) => {
        const wordData = vocab.word as any;

        // Extract vocabulary and definition
        const term = wordData.vocabulary || "";

        // Get translation (prefer Thai, fallback to English)
        let translation = "";
        if (wordData.definition) {
          translation =
            wordData.definition.th ||
            wordData.definition.en ||
            wordData.definition.cn ||
            wordData.definition.tw ||
            wordData.definition.vi ||
            "";
        }

        return {
          term,
          translation,
        };
      })
      .filter((item) => item.term && item.translation); // Filter out invalid entries

    // Ensure we have at least 10 words for a good game experience
    if (gameVocabulary.length < 10) {
      return NextResponse.json({
        message: `You need at least 10 vocabulary words to play. You currently have ${gameVocabulary.length}.`,
        vocabulary: gameVocabulary,
        status: 200,
      });
    }

    return NextResponse.json({
      message: "Vocabulary retrieved successfully",
      vocabulary: gameVocabulary,
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching vocabulary for magic defense:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

router.get(getVocabularyForMagicDefense as any);

export async function GET(request: NextRequest) {
  const result = await router.run(request, {});
  if (result instanceof NextResponse) {
    return result;
  }
  throw new Error("Expected a NextResponse from router.run");
}
