import { getOne, updateOne } from "../handlers/handler-factory";
import { DBCollection } from "../models/enum";
import { levelCalculation } from "@/lib/utils";
import { ExtendedNextRequest } from "./auth-controller";
import { NextResponse } from "next/server";
import db from "@/configs/firestore-config";

export const getUser = getOne(DBCollection.USERS);
export const updateUser = updateOne(DBCollection.USERS);

interface RequestContext {
  params: {
    id: string;
  };
}

export async function postActivityLog(
  req: ExtendedNextRequest,
  { params: { id } }: RequestContext
) {
  try {
    //getUser
    // const userRef = await db.collection("users").doc(id).get();

    // const userData = userRef.data();

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
      articleId: data.articleId || "STSTEM",
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
      details: data.details || {},
      ...data,
    };

    // if not exists will create
    if (!getActivity.exists) {
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
    } else {
      //Update if have data
      await collectionRef.doc(documentId).set(commonData);
    }

    //Update Xp and Level
    if (commonData.xpEarned !== 0) {
      await db
        .collection("users")
        .doc(id)
        .update({
          xp: commonData.finalXp,
          level: commonData.finalLevel,
          ceftLevel: levelCalculation(commonData.finalXp).cefrLevel,
        });
    }

    return NextResponse.json({
      message: "Success",
    });
  } catch (error) {
    console.log("getActivity => ", error);
    return NextResponse.json({
      message: "Error",
    });
  }
}

export async function getActivityLog(
  req: ExtendedNextRequest,
  { params: { id } }: RequestContext
) {
  try {
    const results: any[] = [];
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
