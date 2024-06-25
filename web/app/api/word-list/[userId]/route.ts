import db from "@/configs/firestore-config";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

interface WordList {
  vocabulary: string;
  definition: {
    en: string;
    th: string;
    cn: string;
    tw: string;
    vi: string;
  };
}
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
      saveToFlashcard,
      foundWordsList,
    } = await req.json();

    // Get user id from token
    const sub = session.user.id;
    const wordAllReadySaved: string[] = [];

    await Promise.all(
      foundWordsList.map(async (word: WordList) => {
        const userWordRecord = await db
          .collection("user-word-records")
          .where("userId", "==", sub)
          .where("articleId", "==", articleId)
          .where("word.vocabulary", "==", word.vocabulary)
          .limit(1)
          .get();

        if (!userWordRecord.empty) {
          wordAllReadySaved.push(word.vocabulary);
        } else {
          await db.collection("user-word-records").add({
            userId: sub,
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
      return new Response(
        JSON.stringify({
          message: `Word already saved
          ${wordAllReadySaved.join(", ")}`,
        }),
        { status: 400 }
      );
    } else {
      return new Response(
        JSON.stringify({
          message: "Word saved",
        }),
        { status: 200 }
      );
    }
  } catch (error: any) {
 
    return new Response(
      JSON.stringify({
        message: "Internal server error",
      }),
      { status: 500 }
    );
  }
}