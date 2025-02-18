import { ExtendedNextRequest } from "./auth-controller";
import { NextRequest, NextResponse } from "next/server";
import db from "@/configs/firestore-config";

interface RequestContext {
  params: {
    id: string;
  };
}

type User = {
  id: string;
  display_name: string;
  license_id: string;
};

type Classroom = {
  classroomName: string;
  license_id: string;
  student: { studentId: string }[];
};

type ActivityLog = {
  userId: string;
  xpEarned: number;
  timestamp: Date;
  activityStatus: string;
};

type RankingEntry = {
  rank: number;
  name: string;
  xp: number;
  classroom: string;
};

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

export async function postRankingLeaderboard(
  req: NextRequest
): Promise<NextResponse> {
  try {
    //console.log("Clearing old leaderboard data...");

    const leaderboardRef = db.collection("leaderboard");
    const existingDocs = await leaderboardRef.get();
    await Promise.all(existingDocs.docs.map((doc) => doc.ref.delete()));

    //console.log("Old leaderboard data cleared.");

    //console.log("Fetching data...");

    const [classSnapshot, userSnapshot] = await Promise.all([
      db.collection("classroom").get(),
      db.collection("users").get(),
    ]);

    const classrooms: Classroom[] = classSnapshot.docs.map(
      (doc) => doc.data() as Classroom
    );
    const usersData: User[] = userSnapshot.docs.map(
      (doc) => doc.data() as User
    );

    const classroomMap: Record<
      string,
      { classroomName: string; license_id: string }
    > = {};
    classrooms.forEach((classroom) => {
      classroom.student.forEach(({ studentId }) => {
        classroomMap[studentId] = {
          classroomName: classroom.classroomName,
          license_id: classroom.license_id,
        };
      });
    });

    const activitySnapshot = await db.collection("user-activity-log").get();
    const activityLog: ActivityLog[] = [];

    await Promise.all(
      activitySnapshot.docs.map(async (doc) => {
        const subCollections = await doc.ref.listCollections();
        await Promise.all(
          subCollections.map(async (subCollection) => {
            const subSnapshot = await subCollection.get();
            subSnapshot.docs.forEach((subDoc) => {
              const data = subDoc.data();
              let activityTimestamp: Date;

              if (data.timestamp?._seconds) {
                activityTimestamp = new Date(data.timestamp._seconds * 1000);
              } else if (data.timestamp?.toDate) {
                activityTimestamp = data.timestamp.toDate();
              } else {
                activityTimestamp = new Date(data.timestamp);
              }

              if (
                data.timestamp &&
                data.userId &&
                data.activityStatus === "completed"
              ) {
                activityLog.push({
                  userId: data.userId,
                  xpEarned: data.xpEarned || 0,
                  timestamp: activityTimestamp,
                  activityStatus: data.activityStatus,
                });
              }
            });
          })
        );
      })
    );

    //console.log(`Loaded ${activityLog.length} activity logs.`);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const filteredActivities = activityLog.filter(({ timestamp }) => {
      return (
        timestamp.getMonth() === currentMonth &&
        timestamp.getFullYear() === currentYear
      );
    });

    //console.log(`Found ${filteredActivities.length} activities for this month.`);

    // รวมค่า XP ตาม userId
    const userXpMap: Record<string, number> = {};
    filteredActivities.forEach(({ userId, xpEarned }) => {
      userXpMap[userId] = (userXpMap[userId] || 0) + xpEarned;
    });

    //console.log("XP Calculation:", userXpMap);

    const combinedData = usersData
      .filter((user) => user.license_id && user.license_id !== "Unknown")
      .map((user) => {
        const { id: userId, display_name: name, license_id: licenseId } = user;
        const xp = userXpMap[userId] || 0;
        const classroomInfo = classroomMap[userId] || {
          classroomName: "Unknown",
          license_id: "Unknown",
        };

        return {
          rank: 0,
          name,
          xp,
          classroom: classroomInfo.classroomName,
          license_id: licenseId || classroomInfo.license_id,
        };
      });

    //console.log("Final User Data:", combinedData);

    for (const [license_id, users] of Object.entries(
      combinedData.reduce((acc, user) => {
        if (!acc[user.license_id]) acc[user.license_id] = [];
        acc[user.license_id].push(user);
        return acc;
      }, {} as Record<string, RankingEntry[]>)
    )) {
      const rankedUsers = users
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 5)
        .map((user, index) => ({
          ...user,
          rank: index + 1,
        }));

      const subCollectionRef = db.collection("leaderboard");
      await subCollectionRef.doc().set({
        license_id,
        ranking: rankedUsers,
      });
    }

    //console.log("Leaderboard updated successfully");

    return NextResponse.json({ message: "Leaderboard updated successfully" });
  } catch (error) {
    console.error("❌ Error updating leaderboard:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
