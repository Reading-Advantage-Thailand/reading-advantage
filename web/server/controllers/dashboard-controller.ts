import { NextRequest, NextResponse } from "next/server";
import { calculateClassXp } from "@/server/controllers/classroom-controller";
import { calculateXpForLast30Days } from "@/server/controllers/license-controller";
import { updateUserActivityLog } from "@/lib/aggregateUserActiveChart";
import { sendDiscordWebhook } from "@/server/utils/send-discord-webhook";
import { ExtendedNextRequest } from "./auth-controller";
import { postRankingLeaderboard } from "./leaderboard-controller";
import { updateArticlesByTypeGenre } from "./article-controller";
import { calculateSchoolsXp } from "./classroom-controller";
import { updateAllUserActivity } from "./activity-controller";

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
    const updateUserActive = await updateUserActivityLog();
    const updateUserActivity = await updateAllUserActivity();

    const classXpStatus = updateClassXp
      ? "Class Activity updated successfully."
      : "Failed to update Class Activity.";
    const xp30daysStatus = updateXp30days
      ? "Total XP Gained (Last 30 Days) updated successfully."
      : "Failed to update Total XP Gained (Last 30 Days).";
    const userActieStatus = updateUserActive
      ? "Active Users updated successfully."
      : "Failed to update Active Users.";
    const updateUserActivityStatus = updateUserActivity
      ? "User Activity updated successfully."
      : "Failed to update User Activity.";

    const timeTakenMinutes = ((Date.now() - timeTaken) / (1000 * 60)).toFixed(
      2
    );

    await sendDiscordWebhook({
      title: "Updated Admin Dashboard",
      embeds: [
        {
          description: {
            "update-status": `\n${classXpStatus}\n${xp30daysStatus}\n${userActieStatus}\n${updateUserActivityStatus}\nTime taken: ${timeTakenMinutes} minutes`,
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
    console.error("Error updating admin dashboard", err);
    await sendDiscordWebhook({
      title: "Update Admin Dashboard Failed",
      embeds: [
        {
          description: {
            "Error Detail": `${err}`,
          },
          color: 0xff0000,
        },
      ],
      color: 0xff0000,
      reqUrl,
      userAgent
    });
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function updateSystemDashboard(req: ExtendedNextRequest) {
  const userAgent = req.headers.get("user-agent") || "";
  const reqUrl = req.url;
  try {
    const timeTaken = Date.now();

    await sendDiscordWebhook({
      title: "Updating System Dashboard",
      embeds: [
        {
          description: {
            status: "Updating System Dashboard...",
          },
          color: 0x0099ff,
        },
      ],
      color: 0x0099ff,
      reqUrl,
      userAgent,
    });

    const updateRankingLeaderboard = await postRankingLeaderboard(req);
    const updateArticlesTypeGenre = await updateArticlesByTypeGenre(req);
    const updateSchoolsXp = await calculateSchoolsXp(req);

    const rankingLeaderboardStatus = updateRankingLeaderboard
      ? "Ranking leaderboard updated successfully."
      : "Failed to update Ranking leaderboard.";
    const updateArticlesTypeGenreStatus = updateArticlesTypeGenre
      ? "Articles by type and genre updated successfully."
      : "Failed to update Articles by type and genre.";
    const updateSchoolsXpStatus = updateSchoolsXp
      ? "Top Schools by XP Gained updated successfully."
      : "Failed to update Top Schools by XP Gained.";

    const timeTakenMinutes = ((Date.now() - timeTaken) / (1000 * 60)).toFixed(
      2
    );

    await sendDiscordWebhook({
      title: "Updated System Dashboard",
      embeds: [
        {
          description: {
            "update-status": `\n${rankingLeaderboardStatus}\n${updateArticlesTypeGenreStatus}\n${updateSchoolsXpStatus}\nTime taken: ${timeTakenMinutes} minutes`,
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
        "Update System Dashboard": "success",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error Updating System Dashboard", err);
    await sendDiscordWebhook({
      title: "Update System Dashboard Failed",
      embeds: [
        {
          description: {
            "Error Detail": `${err}`,
          },
          color: 0xff0000,
        },
      ],
      color: 0xff0000,
      reqUrl,
      userAgent
    });
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
