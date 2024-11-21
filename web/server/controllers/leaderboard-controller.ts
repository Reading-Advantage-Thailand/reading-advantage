import { ExtendedNextRequest } from "./auth-controller";
import { NextRequest, NextResponse } from "next/server";
import db from "@/configs/firestore-config";

interface RequestContext {
  params: {
    id: string;
  };
}

export async function getAllRankingLeaderboard(req: NextRequest) {
  try {
    const leaderboardData = await db.collection("leaderboard").get();
    const leaderboard = leaderboardData.docs.map((doc) => doc.data());

    return NextResponse.json({ results: leaderboard });
  } catch (error) {
    console.error("Error getting documents", error);
    return NextResponse.json(
      { message: "Internal server error", results: [] },
      { status: 500 }
    );
  }
}

export async function getRankingLeaderboardById(
  req: ExtendedNextRequest,
  { params: { id } }: RequestContext
) {
  try {
    const leaderboardData = await db
      .collection("leaderboard")
      .where("license_id", "==", id)
      .get();

    const leaderboard = leaderboardData.docs.map((doc) => doc.data());

    return NextResponse.json({ results: leaderboard });
  } catch (error) {
    console.error("Error getting documents", error);
    return NextResponse.json(
      { message: "Internal server error", results: [] },
      { status: 500 }
    );
  }
}

export async function postRankingLeaderboard(req: NextRequest) {
  try {
    // get all classrooms
    const classData = await db.collection("classroom").get();
    const classsData = classData.docs.map((doc) => doc.data());
    // get all users
    const users = await db.collection("users").get();
    const usersData = users.docs.map((doc) => doc.data());

    // get all activities
    const activityLog: any[] = [];
    const getActivity = await db.collection("user-activity-log").get();
    // Iterate through each document to get subcollections
    const promises = getActivity.docs.map(async (doc) => {
      const subCollections = await doc.ref.listCollections();
      const subCollectionPromises = subCollections.map((subCollection) =>
        subCollection.get().then((array) =>
          array.docs.map((doc) =>
            activityLog.push({
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

    // Step: Filter activities for the current month
    const activityFilter = activityLog.filter((log) => {
      const date = new Date(log.timestamp);
      return (
        date.getMonth() === new Date().getMonth() &&
        date.getFullYear() === new Date().getFullYear()
      );
    });

    // Step: Map classrooms by studentId
    const classroomMap = classsData.reduce((acc, classroom) => {
      classroom.student.forEach(({ studentId }: { studentId: string }) => {
        acc[studentId] = {
          classroomName: classroom.classroomName,
          license_id: classroom.license_id,
        };
      });
      return acc;
    }, {} as Record<string, { classroomName: string; license_id: string }>);

    // Step: Aggregate XP by userId
    const userXpMap = activityFilter.reduce((acc, { userId, xpEarned }) => {
      acc[userId] = (acc[userId] || 0) + xpEarned;
      return acc;
    }, {} as Record<string, number>);

    // Step: Map users with their classrooms and XP
    const combinedData = usersData.map((user) => {
      const { id: userId, display_name: name, license_id: licenseId } = user;
      const xp = userXpMap[userId] || 0;
      const classroomInfo = classroomMap[userId] || {
        classroomName: "Unknown",
        license_id: "Unknown",
      };

      return {
        name,
        xp,
        classroom: classroomInfo.classroomName,
        license_id: licenseId || classroomInfo.license_id,
      };
    });

    // Step: Group by licenses_id
    const groupedByLicense = combinedData.reduce((acc, user) => {
      const { license_id } = user;
      if (!acc[license_id]) acc[license_id] = [];
      acc[license_id].push(user);
      return acc;
    }, {} as Record<string, { name: string; xp: number; classroom: string }[]>);

    const result = Object.entries(groupedByLicense).map(
      ([license_id, users]) => {
        const rankedUsers = users
          .sort((a, b) => b.xp - a.xp)
          .slice(0, 5) // Sort by XP in descending order
          .map((user, index) => ({
            rank: index + 1,
            name: user.name,
            xp: user.xp,
            classroom: user.classroom,
          }));

        return {
          license_id,
          ranking: rankedUsers,
        };
      }
    );

    const lastResult = result.filter(
      (data) => data.license_id && data.license_id !== "Unknown"
    );

    try {
      for (const licenseId of lastResult) {
        const dataRef = db
          .collection("leaderboard")
          .where("license_id", "==", licenseId.license_id);
        const snapshot = await dataRef.get();

        if (snapshot.empty) {
          await db.collection("leaderboard").doc().set({
            license_id: licenseId.license_id,
            ranking: licenseId.ranking,
          });
        } else {
          await db.collection("leaderboard").doc(snapshot.docs[0].id).update({
            ranking: licenseId.ranking,
          });
        }
      }

      return NextResponse.json({
        message: "Leaderboard updated successfully",
      });
    } catch (error) {
      console.error("Error updating leaderboard:", error);
      return NextResponse.json(
        { message: "Internal server error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error getting documents", error);
    return NextResponse.json(
      { message: "Internal server error", results: [] },
      { status: 500 }
    );
  }
}
