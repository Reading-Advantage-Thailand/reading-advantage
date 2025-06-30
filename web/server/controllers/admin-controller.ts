import { NextRequest, NextResponse } from "next/server";
import db from "@/configs/firestore-config";
import { ExtendedNextRequest } from "./auth-controller";
import { getCurrentUser } from "@/lib/session";
import { Role } from "@prisma/client";

// Map CEFR levels to numerical values
const cefrToNumber: Record<string, number> = {
  "A0-": 0,
  A0: 1,
  "A0+": 2,
  A1: 3,
  "A1+": 4,
  "A2-": 5,
  A2: 6,
  "A2+": 7,
  "B1-": 8,
  B1: 9,
  "B1+": 10,
  "B2-": 11,
  B2: 12,
  "B2+": 13,
  "C1-": 14,
  C1: 15,
  "C1+": 16,
  "C2-": 17,
  C2: 18,
};

export async function getAdminDashboard() {
  try {
    const user = await getCurrentUser();

    if (user?.license_id) {
      const licenseRef = await db
        .collection("licenses")
        .doc(user?.license_id)
        .get();

      if (!licenseRef.exists) {
        return NextResponse.json(
          {
            message: "License not found",
          },
          { status: 401 }
        );
      }

      const licenseData = [licenseRef.data()];

      //console.log(licenseData);
      const userRef = await db.collection("users").get();
      const userData = userRef.docs.map((data) => data.data());

      const userRole = userData.filter(
        (users) => users.license_id === user?.license_id
      );

      const teacherCount = userRole.filter(
        (users) => users.role === Role.TEACHER
      ).length;

      // Map numerical values back to CEFR levels
      const numberToCefr = Object.fromEntries(
        Object.entries(cefrToNumber).map(([k, v]) => [v, k])
      );

      // Filter and calculate the average CEFR level
      const cefrValues = userRole
        .map((user: any) => cefrToNumber[user.cefr_level])
        ?.filter((value: any) => value !== undefined); // Filter out invalid/missing levels

      const averageCefrValue =
        cefrValues?.reduce((sum: number, value: any) => sum + value, 0) /
        cefrValues?.length;

      const averageCefrLevel = numberToCefr[Math.round(averageCefrValue)];

      const userIds = userRole.map((users: any) => users.id);

      const activityData: any[] = [];

      const getActivity = await db.collection("user-activity-log").get();

      // Iterate through each document to get subcollections
      const promises = getActivity.docs.map(async (doc) => {
        const subCollections = await doc.ref.listCollections();
        const subCollectionPromises = subCollections.map((subCollection) =>
          subCollection.get().then((array) =>
            array.docs.map((doc) =>
              activityData.push({
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

      const filteredActivityLog = activityData.filter((activity: any) =>
        userIds.includes(activity.userId)
      );

      const xpRef = await db
        .collection("xp-gained-log")
        .where("license_id", "==", user?.license_id)
        .get();

      let totalXp = 0;

      xpRef.docs.forEach((doc) => {
        const data = doc.data();
        totalXp += data.total_xp || 0;
      });

      return NextResponse.json(
        {
          data: {
            license: licenseData,
            userData: userRole,
            xpEarned: totalXp,
            filteredActivityLog,
            averageCefrLevel,
            teacherCount,
          },
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "User have no Licenes" },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
