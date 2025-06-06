import { getOne, updateOne } from "../handlers/handler-factory";
import { DBCollection } from "../models/enum";
import { levelCalculation } from "@/lib/utils";
import { ExtendedNextRequest } from "./auth-controller";
import { NextRequest, NextResponse } from "next/server";
import db from "@/configs/firestore-config";
import { create, update } from "lodash";

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
      "stories_rating",
      "stories_read",
      "chapter_rating",
      "chapter_read",
    ];

    const collectionRef = db
      .collection("user-activity-log")
      .doc(id)
      .collection(`${replType}-activity-log`);

    const documentId =
      data.articleId ||
      data.storyId ||
      id ||
      data.contentId ||
      collectionRef.doc().id;

    const getActivity = await db
      .collection("user-activity-log")
      .doc(id)
      .collection(`${replType}-activity-log`)
      .doc(documentId)
      .get();

    const commonData = {
      userId: id,
      chapterNumber: data.chapterNumber || 0,
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
            last_activity: commonData.timestamp,
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

      if (
        commonData.activityType === "chapter_rating" &&
        commonData.details.Rating
      ) {
        const storiesRecords = await db
          .collection("users")
          .doc(id)
          .collection("stories-records")
          .doc(commonData.storyId)
          .get();

        if (storiesRecords.exists) {
          await db
            .collection("users")
            .doc(id)
            .collection("stories-records")
            .doc(commonData.storyId)
            .update({
              rated: commonData.details.Rating,
              chapterNumber: commonData.chapterNumber,
            });
        } else {
          await db
            .collection("users")
            .doc(id)
            .collection("stories-records")
            .doc(commonData.storyId)
            .set({
              created_at: commonData.timestamp,
              rated: commonData.details.Rating,
              score: 0,
              status: 0,
              chapterNumber: commonData.chapterNumber,
              storyId: commonData.storyId,
              title: commonData.details.title,
              raLevel: commonData.details.raLevel,
              cefr_level: commonData.details.cefr_level,
              updated_at: commonData.timestamp,
            });
        }
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

export async function putActivityLog(
  req: ExtendedNextRequest,
  { params: { id } }: RequestContext
) {
  try {
    // Data from frontend
    const data = await req.json();

    // Replace underscores with hyphens for collection name
    const replType = data.activityType.replace(/_/g, "-");

    const collectionRef = db
      .collection("user-activity-log")
      .doc(id)
      .collection(`${replType}-activity-log`);

    const articleId = data.articleId;

    if (!articleId) {
      return NextResponse.json({
        message: "Article ID is required for update",
        status: 400,
      });
    }

    // Find document by articleId in the collection
    const querySnapshot = await collectionRef
      .where("articleId", "==", articleId)
      .limit(1)
      .get();

    let documentId: string;

    if (querySnapshot.empty) {
      // If no document exists, create a new one
      const newDocRef = collectionRef.doc();
      documentId = newDocRef.id;

      const newData = {
        userId: id,
        chapterNumber: data.chapterNumber || 0,
        activityType: data.activityType,
        activityStatus: data.activityStatus || "in_progress",
        timestamp: new Date(),
        timeTaken: data.timeTaken || 0,
        xpEarned: data.xpEarned || 0,
        initialXp: req.session?.user.xp as number,
        finalXp: (req.session?.user.xp as number) + (data.xpEarned || 0),
        initialLevel: req.session?.user.level as number,
        finalLevel: levelCalculation(
          (req.session?.user.xp as number) + (data.xpEarned || 0)
        ).raLevel,
        ...data,
        created_at: new Date(), // Add creation timestamp
      };

      await newDocRef.set(newData);
    } else {
      // Get the first (and should be only) document
      const activityDoc = querySnapshot.docs[0];
      documentId = activityDoc.id;

      // Prepare update data
      const updateData = {
        userId: id,
        chapterNumber: data.chapterNumber || 0,
        activityType: data.activityType,
        activityStatus: data.activityStatus || "in_progress",
        timestamp: new Date(),
        timeTaken: data.timeTaken || 0,
        xpEarned: data.xpEarned || 0,
        initialXp: req.session?.user.xp as number,
        finalXp: (req.session?.user.xp as number) + (data.xpEarned || 0),
        initialLevel: req.session?.user.level as number,
        finalLevel: levelCalculation(
          (req.session?.user.xp as number) + (data.xpEarned || 0)
        ).raLevel,
        ...data,
        updated_at: new Date(), // Add update timestamp
      };

      // Update the existing activity log using the found documentId
      await collectionRef.doc(documentId).update(updateData);
    }

    // Update XP and Level if XP is earned
    if (data.xpEarned !== 0) {
      await db
        .collection("users")
        .doc(id)
        .update({
          xp: (req.session?.user.xp as number) + (data.xpEarned || 0),
          level: levelCalculation(
            (req.session?.user.xp as number) + (data.xpEarned || 0)
          ).raLevel,
          cefr_level: levelCalculation(
            (req.session?.user.xp as number) + (data.xpEarned || 0)
          ).cefrLevel,
          last_activity: new Date(),
        });
    }

    // Update Rating to article-records collection
    if (data.activityType === "article_rating" && data.details?.Rating) {
      const articleRecordRef = db
        .collection("users")
        .doc(id)
        .collection("article-records")
        .doc(data.articleId);

      const articleRecord = await articleRecordRef.get();

      if (articleRecord.exists) {
        await articleRecordRef.update({
          rated: data.details.Rating,
          updated_at: new Date(),
        });
      }
    }

    // Update Rating to stories-records collection
    if (data.activityType === "chapter_rating" && data.details?.Rating) {
      const storiesRecordRef = db
        .collection("users")
        .doc(id)
        .collection("stories-records")
        .doc(data.storyId);

      const storiesRecord = await storiesRecordRef.get();

      if (storiesRecord.exists) {
        await storiesRecordRef.update({
          rated: data.details.Rating,
          chapterNumber: data.chapterNumber,
          updated_at: new Date(),
        });
      }
    }

    return NextResponse.json({
      message: "Activity log processed successfully",
      status: 200,
    });
  } catch (error) {
    console.log("putActivityLog => ", error);
    return NextResponse.json({
      message: "Error processing activity log",
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
