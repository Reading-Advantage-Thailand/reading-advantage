import { ExtendedNextRequest } from "./auth-controller";
import { NextRequest, NextResponse } from "next/server";
import db from "@/configs/firestore-config";

interface RequestContext {
  params: {
    id: string;
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
        const userWordRecord = await db
          .collection("user-word-records")
          .where("userId", "==", id)
          .where("articleId", "==", articleId)
          .where("word.vocabulary", "==", word.vocabulary)
          .get();

        if (!userWordRecord.empty) {
          wordAllReadySaved.push(word.vocabulary);
        } else {
          await db.collection("user-word-records").add({
            userId: id,
            articleId,
            saveToFlashcard,
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
  req: ExtendedNextRequest,
  { params: { id } }: RequestContext
) {
  try {
    // Get words
    const wordSnapshot = await db
      .collection("user-word-records")
      .where("userId", "==", id)
      .get();

    const word = wordSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

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

    // Check if user has already saved this sentence
    const userSentenceRecord = await db
      .collection("user-sentence-records")
      .where("userId", "==", id)
      .where("articleId", "==", articleId)
      .where("sn", "==", sn)
      .limit(1)
      .get();

    if (!userSentenceRecord.empty) {
      return NextResponse.json(
        { message: "Sentence already saved" },
        { status: 400 }
      );
    }
    // Create user article record
    await db.collection("user-sentence-records").add({
      userId: id,
      articleId,
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
    });
    return NextResponse.json({
      message: "Sentence updated",
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
  try {
    // Get sentences
    const sentencesRef = db
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

// Get vocabularies for a user
export async function getVocabulariesFlashcard(
  req: ExtendedNextRequest,
  { params: { id } }: RequestContext
) {
  try {
    // Get vocabularies from user-word-records collection
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

// Add new vocabulary
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

    // Check if vocabulary already exists
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

    // Add new vocabulary
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

// Delete vocabulary
export async function deleteVocabulariesFlashcard(req: ExtendedNextRequest) {
  try {
    const { id } = await req.json();

    // Delete vocabulary document
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
