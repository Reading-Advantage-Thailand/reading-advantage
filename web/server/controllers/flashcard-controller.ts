import { ExtendedNextRequest } from "./auth-controller";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fsrs, generatorParameters, Rating, State } from "ts-fsrs";

interface RequestContext {
  params: {
    id: string;
    articleId?: string;
  };
}

interface WordList {
  vocabulary: string;
  definition: {
    en: string;
    th: string;
    cn: string;
    tw: string;
    vi: string;
  };
  audioUrl: string;
  endTime: number;
  startTime: number;
  index: number;
  [key: string]: any;
}

export async function getFlashcardStats(
  req: ExtendedNextRequest,
  { params: { id } }: RequestContext
) {
  try {
    const type = req.nextUrl.searchParams.get("type"); // "vocabulary" or "sentences"

    if (type === "vocabulary") {
      const vocabularies = await prisma.userWordRecord.findMany({
        where: { userId: id },
        orderBy: { createdAt: "desc" },
      });

      const stats = calculateFlashcardStats(vocabularies);
      return NextResponse.json({
        message: "Vocabulary stats retrieved",
        stats,
        vocabularies,
        status: 200,
      });
    } else if (type === "sentences") {
      const sentences = await prisma.userSentenceRecord.findMany({
        where: { userId: id },
        orderBy: { createdAt: "desc" },
      });

      const stats = calculateFlashcardStats(sentences);
      return NextResponse.json({
        message: "Sentences stats retrieved",
        stats,
        sentences,
        status: 200,
      });
    } else {
      // Return both
      const [vocabularies, sentences] = await Promise.all([
        prisma.userWordRecord.findMany({
          where: { userId: id },
          orderBy: { createdAt: "desc" },
        }),
        prisma.userSentenceRecord.findMany({
          where: { userId: id },
          orderBy: { createdAt: "desc" },
        }),
      ]);

      return NextResponse.json({
        message: "Flashcard stats retrieved",
        vocabularyStats: calculateFlashcardStats(vocabularies),
        sentenceStats: calculateFlashcardStats(sentences),
        vocabularies,
        sentences,
        status: 200,
      });
    }
  } catch (error) {
    console.error("Error getting flashcard stats:", error);
    return NextResponse.json({
      message: "Internal server error",
      error,
      status: 500,
    });
  }
}

function calculateFlashcardStats(cards: any[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return cards.reduce(
    (stats, card) => {
      stats.total++;

      const dueDate = new Date(card.due);
      const cardDate = new Date(
        dueDate.getFullYear(),
        dueDate.getMonth(),
        dueDate.getDate()
      );

      if (cardDate <= today) {
        stats.due++;
      }

      switch (card.state) {
        case 0: // New
          stats.new++;
          break;
        case 1: // Learning
        case 3: // Relearning
          stats.learning++;
          break;
        case 2: // Review
          stats.review++;
          break;
      }

      return stats;
    },
    { total: 0, new: 0, learning: 0, review: 0, due: 0 }
  );
}

export async function updateFlashcardProgress(
  req: ExtendedNextRequest,
  { params: { id } }: RequestContext
) {
  try {
    const { cardId, rating, type } = await req.json();

    if (!cardId || !rating || !type) {
      return NextResponse.json({
        message: "Missing required fields: cardId, rating, type",
        status: 400,
      });
    }

    const isVocabulary = type === "vocabulary";

    // Get current card with proper typing
    let currentCard;
    if (isVocabulary) {
      currentCard = await prisma.userWordRecord.findUnique({
        where: { id: cardId },
      });
    } else {
      currentCard = await prisma.userSentenceRecord.findUnique({
        where: { id: cardId },
      });
    }

    if (!currentCard || currentCard.userId !== id) {
      return NextResponse.json({
        message: "Card not found or unauthorized",
        status: 404,
      });
    }

    // Calculate next review using FSRS
    const f = fsrs(generatorParameters());
    const now = new Date();

    const cardObj = {
      due: new Date(currentCard.due),
      stability: currentCard.stability,
      difficulty: currentCard.difficulty,
      elapsed_days: currentCard.elapsedDays,
      scheduled_days: currentCard.scheduledDays,
      reps: currentCard.reps,
      lapses: currentCard.lapses,
      state: currentCard.state as State,
      last_review: new Date(),
    };

    const schedulingInfo = f.repeat(cardObj, now);
    // Use the rating provided by user
    let selectedSchedule;
    switch(rating) {
      case 1: // Again
        selectedSchedule = schedulingInfo[Rating.Again];
        break;
      case 2: // Hard
        selectedSchedule = schedulingInfo[Rating.Hard];
        break;
      case 3: // Good
        selectedSchedule = schedulingInfo[Rating.Good];
        break;
      case 4: // Easy
        selectedSchedule = schedulingInfo[Rating.Easy];
        break;
      default:
        selectedSchedule = schedulingInfo[Rating.Good];
    }

    // Update card data structure to match Prisma schema
    const updateData = {
      difficulty: selectedSchedule.card.difficulty,
      due: selectedSchedule.card.due,
      elapsedDays: selectedSchedule.card.elapsed_days,
      lapses: selectedSchedule.card.lapses,
      reps: selectedSchedule.card.reps,
      scheduledDays: selectedSchedule.card.scheduled_days,
      stability: selectedSchedule.card.stability,
      state: selectedSchedule.card.state,
    };

    // Update with proper typing
    if (isVocabulary) {
      await prisma.userWordRecord.update({
        where: { id: cardId },
        data: updateData,
      });
    } else {
      await prisma.userSentenceRecord.update({
        where: { id: cardId },
        data: updateData,
      });
    }

    return NextResponse.json({
      message: "Card progress updated",
      status: 200,
    });
  } catch (error) {
    console.error("Error updating flashcard progress:", error);
    return NextResponse.json({
      message: "Internal server error",
      status: 500,
    });
  }
}

export async function postSaveWordList(
  req: ExtendedNextRequest,
  { params: { id } }: RequestContext
) {
  try {
    const {
      due,
      stability,
      difficulty,
      elapsed_days,
      scheduled_days,
      reps,
      lapses,
      state,
      articleId,
      saveToFlashcard,
      foundWordsList,
    } = await req.json();

    const wordAllReadySaved: string[] = [];

    await Promise.all(
      foundWordsList.map(async (word: WordList) => {
        const existingRecord = await prisma.userWordRecord.findFirst({
          where: {
            userId: id,
            articleId: articleId,
            word: {
              path: ["vocabulary"],
              equals: word.vocabulary,
            },
          },
        });

        if (existingRecord) {
          wordAllReadySaved.push(word.vocabulary);
        } else {
          await prisma.userWordRecord.create({
            data: {
              userId: id,
              articleId,
              saveToFlashcard,
              word: word,
              difficulty,
              due,
              elapsedDays: elapsed_days,
              lapses,
              reps,
              scheduledDays: scheduled_days,
              stability,
              state,
            },
          });
        }
      })
    );

    if (wordAllReadySaved.length > 0) {
      return NextResponse.json({
        message: `Word already saved
            ${wordAllReadySaved.join(", ")}`,
        status: 400,
      });
    } else {
      return NextResponse.json({
        message: "Word saved",
        status: 200,
      });
    }
  } catch (error) {
    console.error("postSaveWordList => ", error);
    return NextResponse.json({
      message: "Internal server error",
      status: 500,
    });
  }
}

export async function getWordList(
  req: NextRequest,
  { params: { id } }: RequestContext
) {
  try {
    const articleId = req.nextUrl.searchParams.get("articleId");

    const word = await prisma.userWordRecord.findMany({
      where: {
        userId: id,
        ...(articleId && { articleId }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      message: "User word retrieved",
      word,
      status: 200,
    });
  } catch (error) {
    return NextResponse.json({
      message: "Internal server error",
      error,
      status: 500,
    });
  }
}

export async function deleteWordlist(req: ExtendedNextRequest) {
  try {
    const { id } = await req.json();

    await prisma.userWordRecord.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({
      message: "Word deleted",
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({
      message: "Internal server error",
      status: 500,
    });
  }
}

export async function postSentendcesFlashcard(
  req: ExtendedNextRequest,
  { params: { id } }: RequestContext
) {
  try {
    const {
      articleId,
      storyId,
      chapterNumber,
      sentence,
      translation,
      sn,
      timepoint,
      endTimepoint,
      difficulty,
      due,
      elapsed_days,
      lapses,
      reps,
      scheduled_days,
      stability,
      state,
      audioUrl,
    } = await req.json();

    if (!articleId && (!storyId || chapterNumber === undefined)) {
      return NextResponse.json(
        { message: "Must provide articleId or storyId with chapterNumber" },
        { status: 400 }
      );
    }

    let whereClause: any = {
      userId: id,
      sn: sn,
    };

    if (articleId) {
      whereClause.articleId = articleId;
    } else {
      whereClause.storyId = storyId;
      whereClause.chapterNumber = chapterNumber;
    }

    const existingSentence = await prisma.userSentenceRecord.findFirst({
      where: whereClause,
    });

    if (existingSentence) {
      return NextResponse.json(
        { message: "Sentence already saved" },
        { status: 400 }
      );
    }

    // Prepare the translation object with all available translations from the article
    let fullTranslation = translation;

    if (articleId) {
      // Get the article to fetch all available translations
      const article = await prisma.article.findUnique({
        where: { id: articleId },
        select: {
          translatedPassage: true,
        },
      });

      if (article?.translatedPassage) {
        const translatedPassage = article.translatedPassage as Record<string, string[]> | null;
        
        if (translatedPassage) {
          // Create a comprehensive translation object with all available languages
          fullTranslation = {};
          
          // Map language codes to match the database format
          const languageMapping: Record<string, string> = {
            "zh-CN": "cn",
            "zh-TW": "tw",
            "th": "th",
            "vi": "vi",
            "en": "en",
          };

          // Add translations for all available languages at the sentence index
          Object.entries(translatedPassage).forEach(([langCode, sentences]) => {
            const mappedLangCode = languageMapping[langCode] || langCode;
            if (sentences && sentences[sn] !== undefined) {
              fullTranslation[mappedLangCode] = sentences[sn];
            }
          });

          // Keep any existing translation that was passed in (in case client has additional info)
          if (translation && typeof translation === 'object') {
            fullTranslation = { ...fullTranslation, ...translation };
          }
        }
      }
    }

    const recordData: any = {
      userId: id,
      sentence,
      translation: fullTranslation,
      sn,
      timepoint,
      endTimepoint,
      difficulty,
      due: new Date(due),
      elapsedDays: elapsed_days,
      lapses,
      reps,
      scheduledDays: scheduled_days,
      stability,
      state,
      audioUrl,
    };

    if (articleId) {
      recordData.articleId = articleId;
    } else {
      recordData.storyId = storyId;
      recordData.chapterNumber = chapterNumber;
    }

    await prisma.userSentenceRecord.create({
      data: recordData,
    });

    return NextResponse.json({
      message: "Sentence saved",
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({
      message: "Internal server error",
      status: 500,
    });
  }
}

export async function getSentencesFlashcard(
  req: ExtendedNextRequest,
  { params: { id } }: RequestContext
) {
  const articleId = req.nextUrl.searchParams.get("articleId");
  try {
    const sentences = await prisma.userSentenceRecord.findMany({
      where: {
        userId: id,
        ...(articleId && { articleId }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      message: "User sentence retrieved",
      sentences,
      status: 200,
    });
  } catch (error) {
    console.error("Error retrieving sentences:", error);
    return NextResponse.json({
      message: "Internal server error",
      error,
      status: 500,
    });
  }
}

export async function deleteSentencesFlashcard(req: ExtendedNextRequest) {
  try {
    const { id } = await req.json();

    await prisma.userSentenceRecord.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({
      message: "Sentence deleted",
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({
      message: "Internal server error",
      status: 500,
    });
  }
}

export async function getVocabulariesFlashcard(
  req: ExtendedNextRequest,
  { params: { id } }: RequestContext
) {
  try {
    const vocabularies = await prisma.userWordRecord.findMany({
      where: {
        userId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      message: "Vocabularies retrieved successfully",
      vocabularies,
      status: 200,
    });
  } catch (error) {
    console.error("Error getting vocabularies:", error);
    return NextResponse.json({
      message: "Internal server error",
      error,
      status: 500,
    });
  }
}

export async function postVocabulariesFlashcard(
  req: ExtendedNextRequest,
  { params: { id } }: RequestContext
) {
  try {
    const {
      articleId,
      word,
      difficulty = 0,
      due = new Date(),
      elapsed_days = 0,
      lapses = 0,
      reps = 0,
      scheduled_days = 0,
      stability = 0,
      state = 0,
      saveToFlashcard = true,
    } = await req.json();

    const existingVocab = await prisma.userWordRecord.findFirst({
      where: {
        userId: id,
        articleId: articleId,
        word: {
          path: ["vocabulary"],
          equals: word.vocabulary,
        },
      },
    });

    if (existingVocab) {
      return NextResponse.json(
        { message: "Vocabulary already exists" },
        { status: 400 }
      );
    }

    await prisma.userWordRecord.create({
      data: {
        userId: id,
        articleId,
        word,
        difficulty,
        due: new Date(due),
        elapsedDays: elapsed_days,
        lapses,
        reps,
        scheduledDays: scheduled_days,
        stability,
        state,
        saveToFlashcard,
      },
    });

    return NextResponse.json({
      message: "Vocabulary added successfully",
      status: 201,
    });
  } catch (error) {
    console.error("Error adding vocabulary:", error);
    return NextResponse.json({
      message: "Internal server error",
      status: 500,
    });
  }
}

export async function deleteVocabulariesFlashcard(req: ExtendedNextRequest) {
  try {
    const { id } = await req.json();

    await prisma.userWordRecord.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({
      message: "Vocabulary deleted successfully",
      status: 200,
    });
  } catch (error) {
    console.error("Error deleting vocabulary:", error);
    return NextResponse.json({
      message: "Internal server error",
      status: 500,
    });
  }
}

export async function getClozeTestSentences(
  req: ExtendedNextRequest,
  { params: { deckId } }: { params: { deckId: string } }
) {
  try {
    const userId = req.session?.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get sentence flashcards for the user (simplified approach without deck verification for now)
    const sentences = await prisma.userSentenceRecord.findMany({
      where: {
        userId: userId,
        // Add filtering for due sentences if needed
      },
      orderBy: {
        due: "asc",
      },
      take: 10, // Limit to 10 sentences for the game
    });

    // Transform sentences to ClozeTestData format
    const clozeTests = await Promise.all(
      sentences.map(async (sentence) => {
        // Get article information
        let articleTitle = "Practice Sentence";
        let audioUrl: string | undefined;
        let startTime: number | undefined;
        let endTime: number | undefined;

        if (sentence.articleId) {
          try {
            const article = await prisma.article.findUnique({
              where: { id: sentence.articleId },
              select: { 
                title: true,
              },
            });
            
            if (article && article.title) {
              articleTitle = article.title;
            }
          } catch (error) {
            console.error("Error fetching article:", error);
          }
        }

        // Use audio information from sentence record
        if (sentence.audioUrl) {
          audioUrl = sentence.audioUrl;
          startTime = sentence.timepoint;
          endTime = sentence.endTimepoint;
        }

        // Split sentence into words with position information
        const words = sentence.sentence.split(' ').map((word, index, array) => {
          const previousWords = array.slice(0, index).join(' ');
          const start = previousWords.length + (index > 0 ? 1 : 0); // +1 for space
          return {
            word: word,
            start: start / sentence.sentence.length, // Normalize to 0-1 range
            end: (start + word.length) / sentence.sentence.length,
          };
        });

        // Parse translation JSON safely
        let translation: { th?: string; cn?: string; tw?: string; vi?: string; } | undefined;
        
        if (sentence.translation && typeof sentence.translation === 'object') {
          const translationObj = sentence.translation as any;
          translation = {
            th: translationObj.th as string,
            cn: translationObj.cn as string, 
            tw: translationObj.tw as string,
            vi: translationObj.vi as string,
          };
        }

        return {
          id: sentence.id,
          articleId: sentence.articleId || "",
          articleTitle,
          sentence: sentence.sentence,
          words,
          translation,
          audioUrl,
          startTime,
          endTime,
          difficulty: "medium" as const,
        };
      })
    );

    return NextResponse.json({
      clozeTests,
      totalCount: clozeTests.length,
    });

  } catch (error) {
    console.error("Error fetching sentences for cloze test:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function saveClozeTestResults(
  req: ExtendedNextRequest
) {
  try {
    const userId = req.session?.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { results, totalScore, totalQuestions, timeTaken, difficulty } = body;
    
    // Update FSRS data for each sentence based on performance
    const updatePromises = results.map(async (result: any) => {
      try {
        const sentence = await prisma.userSentenceRecord.findFirst({
          where: {
            id: result.sentenceId,
            userId: userId,
          },
        });

        if (sentence) {
          // Calculate new FSRS values based on performance
          const rating = result.correct ? 3 : 1; // Good vs Again
          const now = new Date();
          
          // Simple FSRS-like update (you can enhance this with the actual FSRS library)
          const newStability = result.correct 
            ? Math.min(sentence.stability * 1.3, 365) 
            : Math.max(sentence.stability * 0.8, 1);
          
          const newDue = new Date(now.getTime() + newStability * 24 * 60 * 60 * 1000);
          const newReps = sentence.reps + 1;
          const newLapses = result.correct ? sentence.lapses : sentence.lapses + 1;

          await prisma.userSentenceRecord.update({
            where: { id: result.sentenceId },
            data: {
              stability: newStability,
              due: newDue,
              reps: newReps,
              lapses: newLapses,
              state: result.correct ? 2 : 1, // Review : Learning
              updatedAt: now,
            },
          });
        }
      } catch (error) {
        console.error(`Error updating sentence ${result.sentenceId}:`, error);
      }
    });

    await Promise.all(updatePromises);

    // Log the activity for XP calculation
    try {
      await prisma.userActivity.create({
        data: {
          userId: userId,
          activityType: "SENTENCE_CLOZE_TEST",
          targetId: userId, // Using userId as targetId for this activity
          completed: true,
          details: {
            score: totalScore,
            totalQuestions: totalQuestions,
            accuracy: (totalScore / totalQuestions) * 100,
            difficulty: difficulty,
            timeTaken: timeTaken,
            xpEarned: Math.floor(totalScore * 5),
          },
        },
      });
    } catch (error) {
      console.error("Error logging activity:", error);
    }

    return NextResponse.json({
      message: "Cloze test results saved successfully",
      xpEarned: Math.floor(totalScore * 5),
      updatedSentences: results.length,
    });

  } catch (error) {
    console.error("Error saving cloze test results:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
