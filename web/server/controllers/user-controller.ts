import { getOne, updateOne } from "../handlers/handler-factory";
import { DBCollection } from "../models/enum";
import { levelCalculation } from "@/lib/utils";
import { ExtendedNextRequest } from "./auth-controller";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ActivityType } from "@prisma/client";

interface RequestContext {
  params: {
    id: string;
  };
}

export async function getUser(
  req: ExtendedNextRequest,
  { params: { id } }: RequestContext
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        userActivities: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        xpLogs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        xp: user.xp,
        level: user.level,
        cefr_level: user.cefrLevel,
        display_name: user.name,
        expired_date: user.expiredDate,
        license_id: user.licenseId,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error getting user", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function updateUser(
  req: ExtendedNextRequest,
  { params: { id } }: RequestContext
) {
  try {
    const data = await req.json();

    const user = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        xp: data.xp,
        level: data.level,
        cefrLevel: data.cefr_level,
        expiredDate: data.expired_date,
        licenseId: data.license_id,
      },
    });

    return NextResponse.json({
      data: user,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function postActivityLog(
  req: ExtendedNextRequest,
  { params: { id } }: RequestContext
) {
  try {
    // Data from frontend
    const data = await req.json();

    // Convert activity type to enum format
    const activityType = data.activityType.toUpperCase() as ActivityType;

    // Validate activity type
    if (!Object.values(ActivityType).includes(activityType)) {
      return NextResponse.json({
        message: "Invalid activity type",
        status: 400,
      });
    }

    const targetId = data.articleId || data.storyId || data.contentId || "";

    // Get article metadata if this is an article-related activity
    let articleMetadata = {};
    if (
      data.articleId &&
      (activityType === ActivityType.ARTICLE_READ ||
        activityType === ActivityType.ARTICLE_RATING)
    ) {
      const article = await prisma.article.findUnique({
        where: { id: data.articleId },
        select: {
          type: true,
          genre: true,
          subGenre: true,
          title: true,
          cefrLevel: true,
          raLevel: true,
        },
      });

      if (article) {
        articleMetadata = {
          type: article.type,
          genre: article.genre,
          subgenre: article.subGenre,
          title: article.title,
          cefr_level: article.cefrLevel,
          level: article.raLevel,
        };
      }
    }

    // Check if activity already exists
    const existingActivity = await prisma.userActivity.findUnique({
      where: {
        userId_activityType_targetId: {
          userId: id,
          activityType: activityType,
          targetId: targetId,
        },
      },
    });

    const commonData = {
      userId: id,
      activityType: activityType,
      targetId: targetId,
      timer: data.timeTaken || 0,
      details: {
        ...articleMetadata,
        ...data.details,
      },
      completed: data.activityStatus === "completed",
    };

    let activity;

    if (!existingActivity) {
      // Create new activity
      activity = await prisma.userActivity.create({
        data: commonData,
      });
    } else if (data.activityStatus === "completed") {
      // Update existing activity
      activity = await prisma.userActivity.update({
        where: { id: existingActivity.id },
        data: {
          ...commonData,
          updatedAt: new Date(),
        },
      });
    } else {
      activity = existingActivity;
    }

    // Create XP log if XP is earned
    if (data.xpEarned && data.xpEarned > 0) {
      await prisma.xPLog.create({
        data: {
          userId: id,
          xpEarned: data.xpEarned,
          activityId: activity.id,
          activityType: activityType,
        },
      });

      // Update user XP and level
      const currentUser = req.session?.user;

      // For initial level test, set XP directly instead of adding to existing XP
      const finalXp = data.isInitialLevelTest
        ? data.xpEarned
        : (currentUser?.xp || 0) + data.xpEarned;

      const levelData = levelCalculation(finalXp);

      await prisma.user.update({
        where: { id },
        data: {
          xp: finalXp,
          level:
            typeof levelData.raLevel === "number"
              ? levelData.raLevel
              : parseInt(levelData.raLevel.toString()),
          cefrLevel: levelData.cefrLevel,
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      message: "Success",
      status: 200,
    });
  } catch (error) {
    console.error("postActivity => ", error);
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

    // Convert activity type to enum format
    const activityType = data.activityType.toUpperCase() as ActivityType;

    // Validate activity type
    if (!Object.values(ActivityType).includes(activityType)) {
      return NextResponse.json({
        message: "Invalid activity type",
        status: 400,
      });
    }

    const targetId = data.articleId || data.storyId || data.contentId || "";

    if (!targetId) {
      return NextResponse.json({
        message: "Target ID is required for update",
        status: 400,
      });
    }

    // Get article metadata if this is an article-related activity
    let articleMetadata = {};
    if (
      data.articleId &&
      (activityType === ActivityType.ARTICLE_READ ||
        activityType === ActivityType.ARTICLE_RATING)
    ) {
      const article = await prisma.article.findUnique({
        where: { id: data.articleId },
        select: {
          type: true,
          genre: true,
          subGenre: true,
          title: true,
          cefrLevel: true,
          raLevel: true,
        },
      });

      if (article) {
        articleMetadata = {
          type: article.type,
          genre: article.genre,
          subgenre: article.subGenre,
          title: article.title,
          cefr_level: article.cefrLevel,
          level: article.raLevel,
        };
      }
    }

    // Find existing activity
    const existingActivity = await prisma.userActivity.findUnique({
      where: {
        userId_activityType_targetId: {
          userId: id,
          activityType: activityType,
          targetId: targetId,
        },
      },
    });

    const commonData = {
      userId: id,
      activityType: activityType,
      targetId: targetId,
      timer: data.timeTaken || 0,
      details: {
        ...articleMetadata,
        ...data.details,
      },
      completed: data.activityStatus === "completed",
    };

    let activity;

    if (!existingActivity) {
      // Create new activity if it doesn't exist
      activity = await prisma.userActivity.create({
        data: commonData,
      });
    } else {
      // Update existing activity
      activity = await prisma.userActivity.update({
        where: { id: existingActivity.id },
        data: {
          ...commonData,
          updatedAt: new Date(),
        },
      });
    }

    // Create XP log if XP is earned
    if (data.xpEarned && data.xpEarned > 0) {
      await prisma.xPLog.create({
        data: {
          userId: id,
          xpEarned: data.xpEarned,
          activityId: activity.id,
          activityType: activityType,
        },
      });

      // Update user XP and level
      const currentUser = req.session?.user;
      const finalXp = (currentUser?.xp || 0) + data.xpEarned;
      const levelData = levelCalculation(finalXp);

      await prisma.user.update({
        where: { id },
        data: {
          xp: finalXp,
          level:
            typeof levelData.raLevel === "number"
              ? levelData.raLevel
              : parseInt(levelData.raLevel.toString()),
          cefrLevel: levelData.cefrLevel,
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      message: "Activity log processed successfully",
      status: 200,
    });
  } catch (error) {
    console.error("putActivityLog => ", error);
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
    // Get all user activities for the user
    const results = await prisma.userActivity.findMany({
      where: {
        userId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get XP logs for the user
    const xpLogs = await prisma.xPLog.findMany({
      where: {
        userId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Create a map for XP lookup by activityType and timestamp
    const xpMap = new Map();
    xpLogs.forEach((log) => {
      const key = `${log.activityType}_${log.createdAt.getTime()}`;
      xpMap.set(key, log.xpEarned);
    });

    // Combine and format the data to match the expected structure
    const formattedResults = results.map((activity) => {
      // Try to match XP by activityType and timestamp (within 1 minute)
      let xpEarned = 0;
      const activityTime = activity.createdAt.getTime();

      // Look for XP log with same activityType within 1 minute
      for (const log of xpLogs) {
        if (log.activityType === activity.activityType) {
          const timeDiff = Math.abs(log.createdAt.getTime() - activityTime);
          if (timeDiff <= 60000) {
            // 1 minute tolerance
            xpEarned = log.xpEarned;
            break;
          }
        }
      }

      return {
        id: activity.id,
        userId: activity.userId,
        activityType: activity.activityType,
        targetId: activity.targetId,
        timer: activity.timer,
        details: activity.details,
        completed: activity.completed,
        timestamp: activity.createdAt,
        timeTaken: activity.timer || 0,
        xpEarned,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
        // Add contentId and articleId for compatibility
        contentId: activity.targetId,
        articleId: activity.targetId,
      };
    });

    return NextResponse.json({
      results: formattedResults,
      message: "success",
    });
  } catch (error) {
    console.error("getActivity => ", error);
    return NextResponse.json({
      message: "Error",
      status: 500,
    });
  }
}

export async function getUserRecords(
  req: ExtendedNextRequest,
  { params: { id } }: RequestContext
) {
  try {
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");
    const nextPage = req.nextUrl.searchParams.get("nextPage");
    const activities = await prisma.userActivity.findMany({
      where: {
        userId: id,
        activityType: {
          in: [ActivityType.ARTICLE_READ, ActivityType.ARTICLE_RATING],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const articleMap = new Map();

    activities.forEach((activity) => {
      const articleId =
        (activity.details as any)?.articleId || activity.targetId;

      if (!articleMap.has(articleId)) {
        articleMap.set(articleId, {
          readActivity: null,
          ratingActivity: null,
        });
      }

      const articleData = articleMap.get(articleId);

      if (activity.activityType === ActivityType.ARTICLE_READ) {
        articleData.readActivity = activity;
      } else if (activity.activityType === ActivityType.ARTICLE_RATING) {
        articleData.ratingActivity = activity;
      }
    });

    const results: any[] = [];

    articleMap.forEach((data, articleId) => {
      if (data.readActivity) {
        const readActivity = data.readActivity;
        const ratingActivity = data.ratingActivity;

        let extractedRating = 0;
        if (ratingActivity?.details) {
          try {
            const detailsObj =
              typeof ratingActivity.details === "string"
                ? JSON.parse(ratingActivity.details)
                : ratingActivity.details;
            extractedRating = detailsObj?.rating || 0;
          } catch (e) {
            extractedRating = 0;
          }
        }

        const resultItem = {
          id: readActivity.id,
          userId: readActivity.userId,
          targetId: articleId,
          activityType: "ARTICLE_READ_WITH_RATING",
          completed: readActivity.completed,
          details: {
            level: (readActivity.details as any)?.level || 0,
            articleTitle: (readActivity.details as any)?.articleTitle || "",
            rating: extractedRating,
            rated: extractedRating,
            score: (readActivity.details as any)?.score || 0,
            scores: (readActivity.details as any)?.score || 0,
            timer: (readActivity.details as any)?.timer || 0,
            ratingCompleted: ratingActivity?.completed || false,
          },
          created_at: readActivity.createdAt,
          updated_at: ratingActivity?.updatedAt || readActivity.updatedAt,
        };

        results.push(resultItem);
      }
    });

    results.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
    const limitedResults = results.slice(0, limit);

    return NextResponse.json({
      results: limitedResults,
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
    // Get user activities and group by date for heatmap
    const activities = await prisma.userActivity.findMany({
      where: {
        userId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Process activities to create heatmap data
    const heatmapData: { [key: string]: number } = {};

    activities.forEach((activity) => {
      const date = activity.createdAt.toISOString().split("T")[0]; // Get YYYY-MM-DD format
      heatmapData[date] = (heatmapData[date] || 0) + 1;
    });

    return NextResponse.json({
      results: heatmapData,
    });
  } catch (error) {
    console.error("Error getting documents", error);
    return NextResponse.json(
      { message: "Internal server error", results: [] },
      { status: 500 }
    );
  }
}

export async function getAllUsers(req: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const results = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      xp: user.xp,
      level: user.level,
      cefrLevel: user.cefrLevel,
      expiredDate: user.expiredDate,
      licenseId: user.licenseId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

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

    // Find user by email
    const user = await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Find license
    const license = await prisma.license.findUnique({
      where: {
        id: data.license_id,
      },
      include: {
        licenseUsers: true,
      },
    });

    if (!license) {
      return NextResponse.json(
        {
          message: "License not found",
        },
        { status: 404 }
      );
    }

    const usedLicenses = license.licenseUsers.length;

    if (license.maxUsers <= usedLicenses) {
      return NextResponse.json(
        {
          message: "License is already used",
        },
        { status: 404 }
      );
    }

    // Create license-user relationship
    await prisma.licenseOnUser.create({
      data: {
        userId: user.id,
        licenseId: license.id,
      },
    });

    // Update user data
    await prisma.user.update({
      where: { id: user.id },
      data: {
        role: data.role,
        expiredDate: license.expiresAt,
        licenseId: license.id,
      },
    });

    return NextResponse.json(
      { message: "Update user successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating documents", error);
    return NextResponse.json(
      { message: "Internal server error", results: [] },
      { status: 500 }
    );
  }
}

export async function getUserActivityData(
  req: ExtendedNextRequest,
  { params: { id } }: RequestContext
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { xp: true, level: true },
    });

    // Get user activities
    const activities = await prisma.userActivity.findMany({
      where: {
        userId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get XP logs for these activities
    const xpLogs = await prisma.xPLog.findMany({
      where: {
        userId: id,
        activityId: { in: activities.map((a) => a.id) },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Create a map of activity ID to XP log
    const xpLogMap = new Map(xpLogs.map((log) => [log.activityId, log]));

    // Get article details for activities that reference articles
    const articleIds = activities
      .map((activity) => activity.targetId)
      .filter((id) => id);

    const articles = await prisma.article.findMany({
      where: {
        id: { in: articleIds },
      },
      select: {
        id: true,
        title: true,
        type: true,
        genre: true,
        subGenre: true,
        cefrLevel: true,
        raLevel: true,
      },
    });

    const articleMap = new Map(
      articles.map((article) => [article.id, article])
    );

    // Calculate cumulative XP progression
    let cumulativeXp = 0;

    const formattedResults = activities.map((activity) => {
      const article = articleMap.get(activity.targetId);
      const xpLog = xpLogMap.get(activity.id);

      const xpEarned = xpLog?.xpEarned || 0;
      const initialXp = cumulativeXp;
      const finalXp = cumulativeXp + xpEarned;

      // Update cumulative XP for next iteration
      cumulativeXp += xpEarned;

      // Safely extract details
      const details = (activity.details as any) || {};

      return {
        contentId: activity.targetId,
        userId: id,
        articleId: activity.targetId,
        activityType: activity.activityType.toLowerCase(),
        activityStatus: activity.completed ? "completed" : "in_progress",
        timestamp: activity.createdAt.toISOString(),
        timeTaken: activity.timer || 0,
        xpEarned: xpEarned,
        initialXp: initialXp,
        finalXp: finalXp,
        initialLevel: user?.level || 1,
        finalLevel: user?.level || 1,
        details: {
          title: article?.title || details.title || "Activity",
          level: article?.raLevel || details.level || user?.level || 1,
          cefr_level: article?.cefrLevel || details.cefr_level || "A1",
          type: article?.type || details.type,
          genre: article?.genre || details.genre,
          subgenre: article?.subGenre || details.subgenre || details.subGenre,
          ...details,
        },
      };
    });

    return NextResponse.json({
      results: formattedResults,
      message: "success",
    });
  } catch (error) {
    console.error("Error fetching user activity data:", error);
    return NextResponse.json({
      message: "Error fetching user activity data",
      status: 500,
    });
  }
}

export async function getStudentData(
  req: ExtendedNextRequest,
  { params: { id } }: RequestContext
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        xp: true,
        level: true,
        cefrLevel: true,
        expiredDate: true,
        licenseId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        message: "Student not found",
        status: 404,
      });
    }

    const studentData = {
      ...user,
      display_name: user.name,
      cefr_level: user.cefrLevel,
    };

    return NextResponse.json({
      data: studentData,
      message: "success",
    });
  } catch (error) {
    console.error("Error fetching student data:", error);
    return NextResponse.json({
      message: "Error fetching student data",
      status: 500,
    });
  }
}

export async function resetUserProgress(
  req: ExtendedNextRequest,
  { params: { id } }: RequestContext
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await prisma.userActivity.deleteMany({
      where: { userId: id },
    });

    await prisma.xPLog.deleteMany({
      where: { userId: id },
    });

    await prisma.user.update({
      where: { id },
      data: {
        xp: 0,
        level: 0,
        cefrLevel: "",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "User progress reset successfully",
      status: 200,
    });
  } catch (error) {
    console.error("Error resetting user progress:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function getUserXpLogs(
  req: ExtendedNextRequest,
  { params: { id } }: RequestContext
) {
  try {
    const xpLogs = await prisma.xPLog.findMany({
      where: {
        userId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const activityIds = xpLogs.map((log) => log.activityId);
    const activities = await prisma.userActivity.findMany({
      where: {
        id: { in: activityIds },
      },
    });

    const activityMap = new Map(
      activities.map((activity) => [activity.id, activity])
    );
    const formattedResults = xpLogs.map((xpLog) => {
      const activity = activityMap.get(xpLog.activityId);

      return {
        id: xpLog.activityId,
        userId: xpLog.userId,
        activityType: xpLog.activityType,
        targetId: activity?.targetId || "",
        timer: activity?.timer,
        details: activity?.details || {},
        completed: activity?.completed || true,
        timestamp: xpLog.createdAt,
        timeTaken: activity?.timer || 0,
        xpEarned: xpLog.xpEarned,
        createdAt: xpLog.createdAt,
        updatedAt: xpLog.updatedAt,
        contentId: activity?.targetId || "",
        articleId: activity?.targetId || "",
      };
    });

    return NextResponse.json({
      results: formattedResults,
      message: "success",
    });
  } catch (error) {
    console.error("getUserXpLogs => ", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
