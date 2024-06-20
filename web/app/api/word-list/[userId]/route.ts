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
    } = await req.json();

    // Get user id from token
    const sub = session.user.id;

    // Check if user has already saved this sentence
    const userSentenceRecord = await db
      .collection("user-sentence-records")
      .where("userId", "==", sub)
      .where("articleId", "==", articleId)
      .where("sn", "==", sn)
      .limit(1)
      .get();

    if (!userSentenceRecord.empty) {
      return new Response(
        JSON.stringify({
          message: "Sentence already saved",
        }),
        { status: 400 }
      );
    }
    // Create user article record
    const userSentenceRecordRef = await db
      .collection("user-sentence-records")
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
