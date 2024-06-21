import db from "@/configs/firestore-config";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function POST(req: Request, res: Response) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(
        JSON.stringify({
          message: "Unauthorized",
        }),
        { status: 403 }
      );
    }

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
      userId,
      saveToFlashcard,
      word
    } = await req.json();

     // Get user id from token
    const sub = session.user.id;
    console.log("userId", userId);
    console.log("sub", sub);

    /*
    {
    "due": "2024-06-21T03:56:43.788Z",
    "stability": 0,
    "difficulty": 0,
    "elapsed_days": 0,
    "scheduled_days": 0,
    "reps": 0,
    "lapses": 0,
    "state": 0,
    "articleId": "j3J4uUf1oVWNlKtQcam7",
    "userId": "w9FZImkGDmTPPn7x5urEtSr7Ch12",
    "saveToFlashcard": true,
    "word": {
        "vocabulary": "photos",
        "definition": {
            "tw": "照片",
            "vi": "hình ảnh",
            "th": "รูปถ่าย",
            "en": "pictures taken with a camera",
            "cn": "照片"
        }
    }
}
    
    */

   
    /*
    // Check if user has already saved this sentence
    const userWordRecord = await db
      .collection("user-word-records")
      .where("userId", "==", sub)
      .where("articleId", "==", articleId)
      .where("sn", "==", sn)
      .limit(1)
      .get();

    if (!userWordRecord.empty) {
      return new Response(
        JSON.stringify({
          message: "Sentence already saved",
        }),
        { status: 400 }
      );
    }
    // Create user article record
    const userWordRecordRef = await db
      .collection("user-word-records")
      .add({
        userId: sub,
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
      });
      */

    // Create response
    return new Response(
      JSON.stringify({
        message: "Sentence saved",
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.log("error", error);
    return new Response(
      JSON.stringify({
        message: "Internal server error",
      }),
      { status: 500 }
    );
  }
}
