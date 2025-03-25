import db from "@/configs/firestore-config";
const admin = require("firebase-admin");
import { NextRequest, NextResponse } from "next/server";

// GET user activity logs
// GET /api/activity

export async function getAllUserActivity() {
  try {
    const toDay = new Date()
      .toLocaleDateString("en-GB")
      .split("/")
      .reverse()
      .join("-");

    let userActivityLogRef = db.collection("activity-distribution").doc(toDay);
    let userActivityLogSnapshot = await userActivityLogRef.get();
    let userActivityData = userActivityLogSnapshot.data();

    if (!userActivityData) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const previousDay = yesterday
        .toLocaleDateString("en-GB")
        .split("/")
        .reverse()
        .join("-");

      userActivityLogRef = db
        .collection("activity-distribution")
        .doc(previousDay);
      userActivityLogSnapshot = await userActivityLogRef.get();
      userActivityData = userActivityLogSnapshot.data();

      if (!userActivityData) {
        return NextResponse.json({ message: "No data found" }, { status: 404 });
      }
    }

    console.log(userActivityData);

    return NextResponse.json(
      {
        userActivityData,
      },
      { status: 200 }
    );
  } catch (err) {
    console.log("Error getting documents", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function getAllUsersActivity() {
  try {
    const data: any[] = [];

    const getActivity = await db.collection("user-activity-log").get();

    // Iterate through each document to get subcollections
    const promises = getActivity.docs.map(async (doc) => {
      const subCollections = await doc.ref.listCollections();
      const subCollectionPromises = subCollections.map((subCollection) =>
        subCollection.get().then((array) =>
          array.docs.map((doc) =>
            data.push({
              ...doc.data(),
              timestamp: doc.data().timestamp.toDate(),
            })
          )
        )
      );
      await Promise.all(subCollectionPromises);
    });

    // Wait for all promises to resolve
    await Promise.all(promises);

    //console.log(userActivityStats);
    return NextResponse.json(
      {
        data,
      },
      { status: 200 }
    );
  } catch (err) {
    console.log("Error getting documents", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function getActivitveUsers(licenseId?: string) {
  try {
    const activeUsersSnapshot = await db.collection("active-users-log").get();

    let totalData: { date: string; noOfUsers: number }[] = [];
    let licensesData: Record<string, { date: string; noOfUsers: number }[]> =
      {};

    const promises = activeUsersSnapshot.docs.map(async (doc) => {
      const data = doc.data();

      if (Array.isArray(data.total)) {
        data.total.forEach((entry: any) => {
          if (entry.date && entry.noOfUsers !== undefined) {
            totalData.push({ date: entry.date, noOfUsers: entry.noOfUsers });
          }
        });
      }

      if (data.licenses && typeof data.licenses === "object") {
        Object.keys(data.licenses).forEach((licenseKey) => {
          if (!licensesData[licenseKey]) {
            licensesData[licenseKey] = [];
          }

          const licenseEntries = data.licenses[licenseKey];

          if (Array.isArray(licenseEntries)) {
            licenseEntries.forEach((entry: any) => {
              if (entry.date && entry.noOfUsers !== undefined) {
                licensesData[licenseKey].push({
                  date: entry.date,
                  noOfUsers: entry.noOfUsers,
                });
              }
            });
          }
        });
      }
    });

    await Promise.all(promises);

    totalData.sort((a, b) => (a.date < b.date ? -1 : 1));
    Object.keys(licensesData).forEach((license) => {
      licensesData[license].sort((a, b) => (a.date < b.date ? -1 : 1));
    });

    if (licenseId) {
      return {
        total: totalData,
        licenses: {
          [licenseId]: licensesData[licenseId] || [],
        },
      };
    }

    return {
      total: totalData,
      licenses: licensesData,
    };
  } catch (error) {
    console.error("Error fetching active user logs:", error);
    return { message: "Internal server error" };
  }
}

export async function getActiveUser(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const licenseId = searchParams.get("licenseId") || undefined;

    const response = await getActivitveUsers(licenseId);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/v1/activity/active-users:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function updateAllUserActivity() {
  try {
    const userActivityLogRef = db.collection("user-activity-log");
    const userActivityLogSnapshot = await userActivityLogRef.get();

    let totalUsers = 0;
    const totalCounts: { [key: string]: number } = {
      totalRatingCount: 0,
      totalReadingCount: 0,
      totalLaQuestionCount: 0,
      totalLevelTestCount: 0,
      totalMcQuestionCount: 0,
      totalSaQuestionCount: 0,
      totalSentenceFlashcardsCount: 0,
      totalVocabularyFlashcardsCount: 0,
      totalVocabularyActivityCount: 0,
      totalSentenceActivityCount: 0,
    };

    const activityTypes = [
      {
        name: "ratingLogRef",
        collection: "article-rating-activity-log",
        countKey: "totalRatingCount",
      },
      {
        name: "readingLogRef",
        collection: "article-read-activity-log",
        countKey: "totalReadingCount",
      },
      {
        name: "laLogRef",
        collection: "la-question-activity-log",
        countKey: "totalLaQuestionCount",
      },
      {
        name: "levelTestLogRef",
        collection: "level-test-activity-log",
        countKey: "totalLevelTestCount",
      },
      {
        name: "mcQuestionLogRef",
        collection: "mc-question-activity-log",
        countKey: "totalMcQuestionCount",
      },
      {
        name: "saQuestionLogRef",
        collection: "sa-question-activity-log",
        countKey: "totalSaQuestionCount",
      },
      {
        name: "SentenceClozeTestLogRef",
        collection: "sentence-cloze-test-activity-log",
        countKey: "totalSentenceActivityCount",
      },
      {
        name: "SentenceFlashcardsLogRef",
        collection: "sentence-flashcards-activity-log",
        countKey: "totalSentenceFlashcardsCount",
      },
      {
        name: "SentenceMatchingLogRef",
        collection: "sentence-matching-activity-log",
        countKey: "totalSentenceActivityCount",
      },
      {
        name: "SentenceOrderingLogRef",
        collection: "sentence-ordering-activity-log",
        countKey: "totalSentenceActivityCount",
      },
      {
        name: "SentenceWordOrderingLogRef",
        collection: "sentence-word-ordering-activity-log",
        countKey: "totalSentenceActivityCount",
      },
      {
        name: "VocabularyFlashcardsLogRef",
        collection: "vocabulary-flashcards-activity-log",
        countKey: "totalVocabularyFlashcardsCount",
      },
      {
        name: "VocabularyMatchingLogRef",
        collection: "vocabulary-matching-activity-log",
        countKey: "totalVocabularyActivityCount",
      },
    ];

    for (const doc of userActivityLogSnapshot.docs) {
      totalUsers++;
      const promises = activityTypes.map(async (activity) => {
        const snapshot = await doc.ref.collection(activity.collection).get();
        totalCounts[activity.countKey] += snapshot.size;
      });

      await Promise.all(promises);
    }

    const userActivityData = {
      totalUsers,
      ...totalCounts,
    };

    console.log(userActivityData);

    const updateUserActivity = await db
      .collection("activity-distribution")
      .doc(
        new Date().toLocaleDateString("en-GB").split("/").reverse().join("-")
      )
      .set(userActivityData);

    return NextResponse.json(
      {
        updateUserActivity,
      },
      { status: 200 }
    );
  } catch (err) {
    console.log("Error getting documents", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
