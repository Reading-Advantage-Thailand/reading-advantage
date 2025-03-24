import { NextRequest, NextResponse } from "next/server";
import { calculateClassXp } from "@/server/controllers/classroom-controller";
import { calculateXpForLast30Days } from "@/server/controllers/license-controller";
import { updateUserActivityLog } from "@/lib/aggregateUserActiveChart";
import { sendDiscordWebhook } from "@/server/utils/send-discord-webhook";
import { ExtendedNextRequest } from "./auth-controller";

export async function updateAdminDashboard(req: ExtendedNextRequest) {
  const userAgent = req.headers.get("user-agent") || "";
  const reqUrl = req.url;
  try {
    const timeTaken = Date.now();

    await sendDiscordWebhook({
      title: "Updating Admin Dashboard",
      embeds: [
        {
          description: {
            status: "Updating Admin Dashboard...",
          },
          color: 0x0099ff,
        },
      ],
      color: 0x0099ff,
      reqUrl,
      userAgent,
    });

    const updateClassXp = await calculateClassXp(req);
    const updateXp30days = await calculateXpForLast30Days();
    const updateUserActivity = await updateUserActivityLog();

    const classXpStatus = updateClassXp
      ? "Class XP updated successfully."
      : "Failed to update Class XP.";
    const xp30daysStatus = updateXp30days
      ? "XP for last 30 days updated successfully."
      : "Failed to update XP for last 30 days.";
    const userActivityStatus = updateUserActivity
      ? "User activity log updated successfully."
      : "Failed to update user activity log.";

    const timeTakenMinutes = ((Date.now() - timeTaken) / (1000 * 60)).toFixed(
      2
    );

    await sendDiscordWebhook({
      title: "Updated Admin Dashboard",
      embeds: [
        {
          description: {
            "update-status": `\n${classXpStatus}\n${xp30daysStatus}\n${userActivityStatus}\nTime taken: ${timeTakenMinutes} minutes`,
          },
          color: 0x0099ff,
        },
      ],
      color: 0x0099ff,
      reqUrl,
      userAgent,
    });

    return NextResponse.json(
      {
        "update Admin Dashboard": "success",
      },
      { status: 200 }
    );
  } catch (err) {
    console.log("Error updating admin dashboard", err);
    await sendDiscordWebhook({
      title: "Error Updating Admin Dashboard",
      embeds: [
        {
          description: {
            status: "Error updating admin dashboard",
            error: String(err),
          },
          color: 0xff0000,
        },
      ],
      color: 0xff0000,
      reqUrl,
      userAgent,
    });
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
