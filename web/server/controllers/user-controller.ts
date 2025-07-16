import { getOne, updateOne } from "../handlers/handler-factory";
import { DBCollection } from "../models/enum";
import { levelCalculation } from "@/lib/utils";
import { ExtendedNextRequest } from "./auth-controller";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ActivityType } from "@prisma/client";
import { create, update } from "lodash";

export async function getUser(
  req: ExtendedNextRequest,
  { params: { id } }: RequestContext
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        userActivities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        xpLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
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

interface RequestContext {
  params: {
    id: string;
  };
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

    const targetId = data.articleId || data.storyId || data.contentId || '';
    
    // Get article metadata if this is an article-related activity
    let articleMetadata = {};
    if (data.articleId && (activityType === ActivityType.ARTICLE_READ || activityType === ActivityType.ARTICLE_RATING)) {
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
      const finalXp = (currentUser?.xp || 0) + data.xpEarned;
      const levelData = levelCalculation(finalXp);

      await prisma.user.update({
        where: { id },
        data: {
          xp: finalXp,
          level: typeof levelData.raLevel === 'number' ? levelData.raLevel : parseInt(levelData.raLevel.toString()),
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

    const targetId = data.articleId || data.storyId || data.contentId || '';

    if (!targetId) {
      return NextResponse.json({
        message: "Target ID is required for update",
        status: 400,
      });
    }

    // Get article metadata if this is an article-related activity
    let articleMetadata = {};
    if (data.articleId && (activityType === ActivityType.ARTICLE_READ || activityType === ActivityType.ARTICLE_RATING)) {
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
          level: typeof levelData.raLevel === 'number' ? levelData.raLevel : parseInt(levelData.raLevel.toString()),
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
        createdAt: 'desc',
      },
    });

    // Get XP logs for the user
    const xpLogs = await prisma.xPLog.findMany({
      where: {
        userId: id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Combine and format the data to match the expected structure
    const formattedResults = results.map((activity) => ({
      id: activity.id,
      userId: activity.userId,
      activityType: activity.activityType,
      targetId: activity.targetId,
      timer: activity.timer,
      details: activity.details,
      completed: activity.completed,
      timestamp: activity.createdAt,
      timeTaken: activity.timer || 0,
      xpEarned: xpLogs.find(log => log.activityId === activity.id)?.xpEarned || 0,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt,
    }));

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

    // Get user activities related to articles
    const activities = await prisma.userActivity.findMany({
      where: {
        userId: id,
        activityType: {
          in: [ActivityType.ARTICLE_READ, ActivityType.ARTICLE_RATING],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    const results = activities.map((activity) => ({
      id: activity.id,
      userId: activity.userId,
      targetId: activity.targetId, // This would be the article ID
      activityType: activity.activityType,
      completed: activity.completed,
      details: activity.details,
      created_at: activity.createdAt,
      updated_at: activity.updatedAt,
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
        createdAt: 'desc',
      },
    });

    // Process activities to create heatmap data
    const heatmapData: { [key: string]: number } = {};
    
    activities.forEach((activity) => {
      const date = activity.createdAt.toISOString().split('T')[0]; // Get YYYY-MM-DD format
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
        createdAt: 'desc',
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
    // Get all user activities and their XP logs in one query with join
    const activitiesWithXp = await prisma.userActivity.findMany({
      where: {
        userId: id,
      },
      include: {
        user: {
          select: {
            xpLogs: {
              where: {
                userId: id,
              },
              select: {
                xpEarned: true,
                activityId: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const user = await prisma.user.findUnique({
      where: { id },
      select: { xp: true, level: true },
    });

    // Create a map for XP earned by activity ID
    const xpLogs = await prisma.xPLog.findMany({
      where: {
        userId: id,
      },
      select: {
        activityId: true,
        xpEarned: true,
      },
    });

    const xpEarnedByActivity = new Map(
      xpLogs.map(log => [log.activityId, log.xpEarned])
    );

    // Get unique article IDs for activities that might need metadata
    const articleIds = activitiesWithXp
      .filter(activity => 
        (activity.activityType === 'ARTICLE_READ' || activity.activityType === 'ARTICLE_RATING') &&
        activity.targetId &&
        (!activity.details || !((activity.details as any)?.type))
      )
      .map(activity => activity.targetId)
      .filter((id, index, self) => self.indexOf(id) === index);

    // Fetch article metadata for activities that need it
    const articlesMetadata = await prisma.article.findMany({
      where: {
        id: { in: articleIds },
      },
      select: {
        id: true,
        type: true,
        genre: true,
        subGenre: true,
        title: true,
        cefrLevel: true,
        raLevel: true,
      },
    });

    // Create a map for quick lookup
    const articleMetadataMap = new Map(
      articlesMetadata.map(article => [
        article.id,
        {
          type: article.type,
          genre: article.genre,
          subgenre: article.subGenre,
          title: article.title,
          cefr_level: article.cefrLevel,
          level: article.raLevel,
        }
      ])
    );

    // Calculate cumulative XP values for proper initial/final XP tracking
    let cumulativeXp = user?.xp || 0;

    const formattedResults = activitiesWithXp.map((activity, index) => {
      const xpEarned = xpEarnedByActivity.get(activity.id) || 0;
      
      // Calculate XP at the time of this activity
      const finalXp = cumulativeXp;
      const initialXp = finalXp - xpEarned;
      
      // Update cumulative XP for next iteration (going backwards in time)
      cumulativeXp -= xpEarned;
      
      // Get article metadata from details or from fetched data
      let articleMetadata = {};
      if (activity.targetId && (activity.activityType === 'ARTICLE_READ' || activity.activityType === 'ARTICLE_RATING')) {
        const detailsMetadata = activity.details as any;
        const fetchedMetadata = articleMetadataMap.get(activity.targetId);
        
        articleMetadata = {
          type: detailsMetadata?.type || fetchedMetadata?.type || "Unknown Type",
          genre: detailsMetadata?.genre || fetchedMetadata?.genre || "Unknown Genre",
          subgenre: detailsMetadata?.subgenre || fetchedMetadata?.subgenre || "Unknown Subgenre",
          title: detailsMetadata?.title || fetchedMetadata?.title || "Unknown Title",
          cefr_level: detailsMetadata?.cefr_level || fetchedMetadata?.cefr_level || "A1",
          level: detailsMetadata?.level || fetchedMetadata?.level || user?.level || 1,
        };
      }
      
      return {
        contentId: activity.id,
        userId: activity.userId,
        articleId: activity.targetId,
        activityType: activity.activityType.toLowerCase().replace('_', '_'),
        activityStatus: activity.completed ? "completed" : "in_progress",
        timestamp: activity.createdAt.toISOString(),
        timeTaken: activity.timer || 0,
        xpEarned: xpEarned,
        initialXp: initialXp,
        finalXp: finalXp,
        initialLevel: user?.level || 1,
        finalLevel: user?.level || 1,
        details: {
          ...articleMetadata,
          ...(activity.details as any),
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
