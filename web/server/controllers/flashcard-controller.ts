import { ExtendedNextRequest } from "./auth-controller";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import db from "@/configs/firestore-config";

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
              path: ['vocabulary'],
              equals: word.vocabulary
            }
          }
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
            }
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
    console.log("articleId", articleId);

    const word = await prisma.userWordRecord.findMany({
      where: {
        userId: id,
        ...(articleId && { articleId }),
      },
      orderBy: {
        createdAt: 'desc'
      }
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
    // Access request body
    const { id } = await req.json();

    //Delete sentence
    const wordRef = db.collection("user-word-records").doc(id);
    await wordRef.delete();

    return NextResponse.json({
      messeges: "Sentence deleted",
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

    // Validate that one source is provided (either article or story+chapter)
    if (!articleId && (!storyId || chapterNumber === undefined)) {
      return NextResponse.json(
        { message: "Must provide articleId or storyId with chapterNumber" },
        { status: 400 }
      );
    }

    // Check if sentence is already saved
    let query = db
      .collection("user-sentence-records")
      .where("userId", "==", id)
      .where("sn", "==", sn);

    if (articleId) {
      query = query.where("articleId", "==", articleId);
    } else {
      query = query
        .where("storyId", "==", storyId)
        .where("chapterNumber", "==", chapterNumber);
    }

    const userSentenceRecord = await query.limit(1).get();

    if (!userSentenceRecord.empty) {
      return NextResponse.json(
        { message: "Sentence already saved" },
        { status: 400 }
      );
    }

    // Prepare data for saving
    const recordData: Record<string, any> = {
      userId: id,
      sentence,
      translation,
      sn,
      timepoint,
      endTimepoint,
      createdAt: new Date(),
      difficulty,
      due,
      elapsed_days,
      lapses,
      reps,
      scheduled_days,
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

    await db.collection("user-sentence-records").add(recordData);

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
    // Get sentences
    console.log(articleId, "articleId");

    const sentencesRef = articleId
      ? db
          .collection("user-sentence-records")
          .where("userId", "==", id)
          .where("articleId", "==", articleId)
      : db
          .collection("user-sentence-records")
          .where("userId", "==", id)
          .orderBy("createdAt", "desc");

    const sentencesSnapshot = await sentencesRef.get();
    const sentences = sentencesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

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
    // Access request body
    const { id } = await req.json();

    //Delete sentence
    const sentenceRef = db.collection("user-sentence-records").doc(id);
    await sentenceRef.delete();

    return NextResponse.json({
      messeges: "Sentence deleted",
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
    const vocabulariesRef = db
      .collection("user-word-records")
      .where("userId", "==", id)
      .orderBy("createdAt", "desc");

    const vocabulariesSnapshot = await vocabulariesRef.get();
    const vocabularies = vocabulariesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

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

    const existingVocab = await db
      .collection("user-word-records")
      .where("userId", "==", id)
      .where("articleId", "==", articleId)
      .where("word.vocabulary", "==", word.vocabulary)
      .limit(1)
      .get();

    if (!existingVocab.empty) {
      return NextResponse.json(
        { message: "Vocabulary already exists" },
        { status: 400 }
      );
    }

    await db.collection("user-word-records").add({
      userId: id,
      articleId,
      word,
      createdAt: new Date(),
      difficulty,
      due,
      elapsed_days,
      lapses,
      reps,
      scheduled_days,
      stability,
      state,
      saveToFlashcard,
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

    const vocabularyRef = db.collection("user-word-records").doc(id);
    await vocabularyRef.delete();

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
