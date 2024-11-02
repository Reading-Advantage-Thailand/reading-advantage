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

export async function getUserRecords(
  req: ExtendedNextRequest,
  { params: { id } }: RequestContext
) {
  try {
    const limit = req.nextUrl.searchParams.get("limit") || 10;
    const nextPage = req.nextUrl.searchParams.get("nextPage");

    const records = await db
      .collection("users")
      .doc(id)
      .collection("article-records")
      .orderBy("created_at", "desc")
      .get();

    const results = records.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });

    return NextResponse.json({
      results,
    });
  } catch (error) {
    console.error("Error getting documents", error);
    return NextResponse.json(
      { message: "Internal server error", results: [] },
      { status: 500 }
    );
  }
}

export async function getUserHeatmap(
  req: ExtendedNextRequest,
  { params: { id } }: RequestContext
) {
  try {
    const records = await db
      .collection("users")
      .doc(id)
      .collection("heatmap")
      .doc("activity")
      .get();

    const results = records.data();

    return NextResponse.json({
      results,
    });
  } catch (error) {
    console.log("Error getting documents", error);
    return NextResponse.json(
      { message: "Internal server error", results: [] },
      { status: 500 }
    );
  }
}

export async function getAllUsers(req: NextRequest) {
  try {
    const users = await db.collection("users").get();
    const results = users.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });

    return NextResponse.json({
      results,
    });
  } catch (error) {
    console.error("Error getting documents", error);
    return NextResponse.json(
      { message: "Internal server error", results: [] },
      { status: 500 }
    );
  }
}

export async function updateUserData(req: ExtendedNextRequest) {
  try {
    const data = await req.json();
    const userRef = db.collection("users").where("email", "==", data.email);
    const user = await userRef.get();

    if (user.empty) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        { status: 404 }
      );
    }
    console.log();
    const license = await db
      .collection(DBCollection.LICENSES)
      .where("id", "==", data.license_id)
      .get();

    const licenseData = license.docs.map((license) => license.data());

    if (license.empty) {
      return NextResponse.json(
        {
          message: "License not found",
        },
        { status: 404 }
      );
    } else if (licenseData[0].total_licenses <= licenseData[0].used_licenses) {
      return NextResponse.json(
        {
          message: "License is already used",
        },
        { status: 404 }
      );
    }
    if (!license.empty && user) {
      await db
        .collection(DBCollection.LICENSES)
        .doc(licenseData[0].id)
        .update({
          used_licenses: licenseData[0].used_licenses + 1,
        });

      await db.collection(DBCollection.USERS).doc(user.docs[0].id).update({
        role: data.role,
        expired_date: licenseData[0].expiration_date,
        license_id: licenseData[0].id,
      });

      return NextResponse.json(
        { message: "Update user successfully" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error updating documents", error);
    return NextResponse.json(
      { message: "Internal server error", results: [] },
      { status: 500 }
    );
  }
}
