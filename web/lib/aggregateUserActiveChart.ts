import db from "@/configs/firestore-config";
const admin = require("firebase-admin");
import { NextResponse } from "next/server";

export async function updateUserActivityLog() {
  try {
    const activityData: Record<string, Set<string>> = {};

    const activitySnapshot = await db.collection("user-activity-log").get();
    const activityPromises = activitySnapshot.docs.map(async (doc) => {
      const subCollections = await doc.ref.listCollections();
      const subCollectionPromises = subCollections.map(
        async (subCollection) => {
          const subSnapshot = await subCollection.get();
          subSnapshot.docs.forEach((subDoc) => {
            const data = subDoc.data();
            if (data.timestamp && data.userId) {
              // แปลง timestamp เป็นวันที่ (format "YYYY-MM-DD")
              const timestamp: Date = data.timestamp.toDate
                ? data.timestamp.toDate()
                : new Date(data.timestamp);
              const dateStr = timestamp.toISOString().slice(0, 10);
              if (!activityData[dateStr]) {
                activityData[dateStr] = new Set();
              }
              activityData[dateStr].add(data.userId);
            }
          });
        }
      );
      await Promise.all(subCollectionPromises);
    });
    await Promise.all(activityPromises);

    const totalResult = Object.entries(activityData).map(([date, userSet]) => ({
      date,
      noOfUsers: userSet.size,
      userIds: Array.from(userSet),
    }));
    //console.log("Total user activity result:", totalResult);

    const usersSnapshot = await db.collection("users").get();
    const licenseToUserSet: Record<string, Set<string>> = {};

    usersSnapshot.forEach((doc) => {
      const user = doc.data();
      const userId = doc.id;
      const licenseId = user.license_id;
      if (licenseId) {
        if (!licenseToUserSet[licenseId]) {
          licenseToUserSet[licenseId] = new Set();
        }
        licenseToUserSet[licenseId].add(userId);
      }
    });
    //console.log("License mapping from users:", licenseToUserSet);

    const licenseResult: Record<string, { date: string; noOfUsers: number }[]> =
      {};
    totalResult.forEach(({ date, userIds }) => {
      for (const [licenseId, userSet] of Object.entries(licenseToUserSet)) {
        const activeUsersForLicense = userIds.filter((userId) =>
          userSet.has(userId)
        );
        if (!licenseResult[licenseId]) {
          licenseResult[licenseId] = [];
        }
        licenseResult[licenseId].push({
          date,
          noOfUsers: activeUsersForLicense.length,
        });
      }
    });
    //console.log("License-based user activity result:", licenseResult);

    const statsRef = db.collection("active-users-log").doc("active-users");

    const totalArray = totalResult.map(({ date, noOfUsers }) => ({
      date,
      noOfUsers,
    }));

    await statsRef.set(
      {
        total: totalArray,
        licenses: licenseResult,
      },
      { merge: true }
    );

    //console.log("Data successfully updated in Firestore (stats/userStats)");
    return NextResponse.json({ totalArray, licenseResult }, { status: 200 });
  } catch (err) {
    console.error("Error updating user activity log:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
