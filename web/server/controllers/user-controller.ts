import { getOne, updateOne } from "../handlers/handler-factory";
import { DBCollection } from "../models/enum";
import { levelCalculation } from "@/lib/utils";
import { ExtendedNextRequest } from "./auth-controller";
import { NextRequest, NextResponse } from "next/server";
import db from "@/configs/firestore-config";

export const getUser = getOne(DBCollection.USERS);
export const updateUser = updateOne(DBCollection.USERS);

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

export async function postActivityLog(
  req: ExtendedNextRequest,
  { params: { id } }: RequestContext
) {
  try {
    //Data from frontend
    const data = await req.json();
    // getActivityLog
    const replType = data.activityType.replace(/_/g, "-");

    const validActivityTypes = [
      "level_test",
      "mc_question",
      "sa_question",
      "la_question",
      "article_rating",
      "article_read",
    ];

    const collectionRef = db
      .collection("user-activity-log")
      .doc(id)
      .collection(`${replType}-activity-log`);

    const documentId =
      data.articleId || id || data.contentId || collectionRef.doc().id;

    const getActivity = await db
      .collection("user-activity-log")
      .doc(id)
      .collection(`${replType}-activity-log`)
      .doc(documentId)
      .get();

    const commonData = {
      userId: id,
      // articleId: data.articleId || "STSTEM",
      activityType: data.activityType,
      activityStatus: data.activityStatus || "in_progress",
      timestamp: new Date(),
      timeTaken: data.timeTaken || 0,
      xpEarned: data.xpEarned || 0,
      initialXp: req.session?.user.xp as number,
      finalXp: (req.session?.user.xp as number) + data.xpEarned || 0,
      initialLevel: req.session?.user.level as number,
      finalLevel: levelCalculation(
        (req.session?.user.xp as number) + data.xpEarned || 0
      ).raLevel,
      // details: data.details || {},
      ...data,
    };

    if (id) {
      // if not exists will create
      if (!getActivity.exists) {
        // createActivityLogTable
        const userRef = await db.collection("user-activity-log").doc(id).get();

        if (!userRef.exists) {
          await db.collection("user-activity-log").doc(id).set({ id: id });
        }
        // createActivityLog
        if (validActivityTypes.includes(data.activityType)) {
          await collectionRef.doc(documentId).set(commonData);
        } else {
          const createRefdoc = collectionRef.doc();
          await createRefdoc.set({
            contentId: createRefdoc.id,
            ...commonData,
          });
        }
      } else if (commonData.activityStatus === "completed") {
        //Update if have data
        await collectionRef.doc(documentId).update(commonData);
      }

      //Update Xp and Level
      if (commonData.xpEarned !== 0) {
        await db
          .collection("users")
          .doc(id)
          .update({
            xp: commonData.finalXp,
            level: commonData.finalLevel,
            cefr_level: levelCalculation(commonData.finalXp).cefrLevel,
          });
      }

      //update Rating to article-records collection
      if (
        commonData.activityType === "article_rating" &&
        commonData.details.Rating
      ) {
        await db
          .collection("users")
          .doc(id)
          .collection("article-records")
          .doc(commonData.articleId)
          .update({ rated: commonData.details.Rating });
      }
      return NextResponse.json({
        message: "Success",
        status: 200,
      });
    } else {
      return NextResponse.json({
        message: "invalid user",
        status: 500,
      });
    }
  } catch (error) {
    console.log("postActivity => ", error);
    return NextResponse.json({
      message: "Error",
      status: 500,
    });
  }
}

export async function getActivityLog(
  req: ExtendedNextRequest,
  { params: { id } }: RequestContext
) {
  try {
    const results: any[] = [];

    // createActivityLogTable
    const userRef = await db.collection("user-activity-log").doc(id).get();

    if (!userRef.exists) {
      await db.collection("user-activity-log").doc(id).set({ id });
    }

    const getActivity = await db
      .collection("user-activity-log")
      .doc(id)
      .listCollections();

    const promises = getActivity.map((subCollection) =>
      subCollection.get().then((array) =>
        array.docs.map((doc) =>
          results.push({
            ...doc.data(),
            timestamp: doc.data().timestamp.toDate(),
          })
        )
      )
    );

    await Promise.all(promises);

    return NextResponse.json({
      results,
      message: "succcess",
    });
  } catch (error) {
    console.log("getActivity => ", error);
    return NextResponse.json({
      message: "Error",
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
