import { NextRequest, NextResponse } from "next/server";
import db from "@/configs/firestore-config";
import { ensureLevelIsNumber } from "@/lib/migrate-user-levels";

export async function POST(req: NextRequest) {
  try {
    console.log("Starting user level migration...");

    // Get all users from database
    const usersSnapshot = await db.collection("users").get();
    const users = usersSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    }));

    let migratedCount = 0;
    let totalCount = users.length;

    // Process users in batches to avoid overwhelming the database
    const batchSize = 50;
    const batches = [];

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      batches.push(batch);
    }

    for (const batch of batches) {
      const promises = batch.map(async (user) => {
        const currentLevel = user.level;
        const correctedLevel = ensureLevelIsNumber(currentLevel);

        // Only update if level was actually a string
        if (typeof currentLevel === "string" && currentLevel !== "") {
          await db.collection("users").doc(user.id).update({
            level: correctedLevel,
          });
          migratedCount++;
        }
      });

      await Promise.all(promises);
    }

    return NextResponse.json({
      success: true,
      message: "User level migration completed",
      migratedCount,
      totalCount,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { success: false, error: "Migration failed" },
      { status: 500 }
    );
  }
}
