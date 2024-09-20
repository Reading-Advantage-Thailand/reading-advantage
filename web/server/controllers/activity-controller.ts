import { NextResponse } from "next/server";
import db from "@/configs/firestore-config";

// GET user activity logs
// GET /api/activity

export async function getAllUserActivity() {
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

    const userActivityStats = [];

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

    userActivityStats.push({
      totalUsers,
      ...totalCounts,
    });

    return NextResponse.json(
      {
        userActivityStats,
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
