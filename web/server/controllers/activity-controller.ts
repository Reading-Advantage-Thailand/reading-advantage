import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ActivityType } from "@prisma/client";

// Types for activity creation
interface CreateActivityData {
  userId: string;
  activityType: ActivityType;
  targetId: string;
  completed?: boolean;
  details?: any;
}

// GET user activity logs
// GET /api/activity

export async function getAllUserActivity() {
  try {
    // Get all activities without date filter
    const activityCounts = await prisma.userActivity.groupBy({
      by: ["activityType"],
      _count: {
        id: true,
      },
    });

    const totalUsers = await prisma.user.count();

    const userActivityData = {
      totalUsers,
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
      totalLessonFlashcardCount: 0,
      totalLessonSentenceFlashcardsCount: 0,
    };

    activityCounts.forEach((activity) => {
      switch (activity.activityType) {
        case "ARTICLE_RATING":
        case "STORIES_RATING":
        case "CHAPTER_RATING":
          userActivityData.totalRatingCount += activity._count.id;
          break;
        case "ARTICLE_READ":
        case "STORIES_READ":
        case "CHAPTER_READ":
          userActivityData.totalReadingCount += activity._count.id;
          break;
        case "LA_QUESTION":
          userActivityData.totalLaQuestionCount += activity._count.id;
          break;
        case "LEVEL_TEST":
          userActivityData.totalLevelTestCount += activity._count.id;
          break;
        case "MC_QUESTION":
          userActivityData.totalMcQuestionCount += activity._count.id;
          break;
        case "SA_QUESTION":
          userActivityData.totalSaQuestionCount += activity._count.id;
          break;
        case "SENTENCE_FLASHCARDS":
          userActivityData.totalSentenceFlashcardsCount += activity._count.id;
          break;
        case "VOCABULARY_FLASHCARDS":
          userActivityData.totalVocabularyFlashcardsCount += activity._count.id;
          break;
        case "VOCABULARY_MATCHING":
          userActivityData.totalVocabularyActivityCount += activity._count.id;
          break;
        case "SENTENCE_MATCHING":
        case "SENTENCE_ORDERING":
        case "SENTENCE_WORD_ORDERING":
        case "SENTENCE_CLOZE_TEST":
          userActivityData.totalSentenceActivityCount += activity._count.id;
          break;
        case "LESSON_FLASHCARD":
          userActivityData.totalLessonFlashcardCount += activity._count.id;
          break;
        case "LESSON_SENTENCE_FLASHCARDS":
          userActivityData.totalLessonSentenceFlashcardsCount += activity._count.id;
          break;
      }
    });

    return NextResponse.json(
      {
        userActivityData,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error fetching user activities from database:", err);
    
    if (err instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        { message: "Database operation failed", code: err.code },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function getAllUsersActivity() {
  try {
    // Get recent activities with minimal data
    const recentActivities = await prisma.userActivity.findMany({
      select: {
        id: true,
        userId: true,
        activityType: true,
        targetId: true,
        completed: true,
        createdAt: true,
        details: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // Much smaller subset
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    // Get article data for activities that reference articles
    const articleIds = new Set<string>();
    recentActivities.forEach(activity => {
      // Check if targetId looks like an article ID or if activity is article-related
      if (activity.activityType === 'ARTICLE_READ' || 
          activity.activityType === 'ARTICLE_RATING' ||
          (activity.targetId && (
            activity.targetId.startsWith('cmeso') || // Legacy article IDs
            activity.targetId.length > 10 // Likely article IDs
          ))) {
        articleIds.add(activity.targetId);
      }
    });

    // Fetch article data for CEFR levels
    const articles = await prisma.article.findMany({
      where: {
        id: { in: Array.from(articleIds) }
      },
      select: {
        id: true,
        cefrLevel: true,
        title: true,
        raLevel: true,
      }
    });

    const articleMap = new Map(articles.map(article => [article.id, article]));

    const data = recentActivities.map((activity) => {
      let details: any = activity.details || {};
      
      // Add CEFR level to details if this activity references an article
      const article = articleMap.get(activity.targetId);
      if (article) {
        details = {
          ...details,
          cefr_level: article.cefrLevel,
          title: article.title,
          level: article.raLevel,
        };
      }

      return {
        id: activity.id,
        userId: activity.userId,
        activityType: activity.activityType,
        targetId: activity.targetId,
        completed: activity.completed,
        timestamp: activity.createdAt,
        details: details,
        user: activity.user,
      };
    });

    // Get aggregated activity data for summary
    const activityCounts = await prisma.userActivity.groupBy({
      by: ["activityType", "userId"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 100, // Limit to top 100 most active users
    });

    return NextResponse.json({ 
      data,
      summary: activityCounts 
    }, { status: 200 });
  } catch (err) {
    console.error("Error fetching user activities from database:", err);
    
    if (err instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        { message: "Database operation failed", code: err.code },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function getActiveUsers(licenseId?: string) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (licenseId) {
      // For specific license, get limited data to avoid timeout
      const license = await prisma.license.findUnique({
        where: { id: licenseId },
        select: {
          id: true,
          licenseUsers: {
            select: {
              userId: true,
            },
            take: 100, // Limit users to reduce query size
          },
        },
      });

      if (!license) {
        return {
          total: [],
          licenses: { [licenseId]: [] },
        };
      }

      const userIds = license.licenseUsers.map((lu) => lu.userId);

      if (userIds.length === 0) {
        return {
          total: [],
          licenses: { [licenseId]: [] },
        };
      }

      // Limit activities query to prevent timeout
      const activities = await prisma.userActivity.findMany({
        where: {
          userId: { in: userIds },
          createdAt: { gte: thirtyDaysAgo },
        },
        select: {
          userId: true,
          createdAt: true,
        },
        take: 5000, // Add limit to prevent large queries
      });

      const dateMap: { [date: string]: Set<string> } = {};

      activities.forEach((activity) => {
        const date = activity.createdAt.toISOString().split("T")[0];
        if (!dateMap[date]) {
          dateMap[date] = new Set();
        }
        dateMap[date].add(activity.userId);
      });

      const licenseData = Object.keys(dateMap)
        .sort()
        .map((date) => ({
          date,
          noOfUsers: dateMap[date].size,
        }));

      return {
        total: licenseData,
        licenses: { [licenseId]: licenseData },
      };
    }

    // For all licenses query - use more aggressive limiting
    const activities = await prisma.userActivity.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        userId: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            licenseId: true,
          },
        },
      },
      take: 10000, // Hard limit to prevent timeout
      orderBy: {
        createdAt: "desc", // Get most recent activities
      },
    });

    const totalDateMap: { [date: string]: Set<string> } = {};
    const licenseDateMap: {
      [licenseId: string]: { [date: string]: Set<string> };
    } = {};

    activities.forEach((activity) => {
      const date = activity.createdAt.toISOString().split("T")[0];
      const userId = activity.userId;
      const userLicenseId = activity.user.licenseId;

      if (!totalDateMap[date]) {
        totalDateMap[date] = new Set();
      }
      totalDateMap[date].add(userId);

      if (userLicenseId) {
        if (!licenseDateMap[userLicenseId]) {
          licenseDateMap[userLicenseId] = {};
        }
        if (!licenseDateMap[userLicenseId][date]) {
          licenseDateMap[userLicenseId][date] = new Set();
        }
        licenseDateMap[userLicenseId][date].add(userId);
      }
    });

    const totalData = Object.keys(totalDateMap)
      .sort()
      .map((date) => ({
        date,
        noOfUsers: totalDateMap[date].size,
      }));

    const licensesData: Record<string, { date: string; noOfUsers: number }[]> =
      {};

    Object.keys(licenseDateMap).forEach((licenseId) => {
      licensesData[licenseId] = Object.keys(licenseDateMap[licenseId])
        .sort()
        .map((date) => ({
          date,
          noOfUsers: licenseDateMap[licenseId][date].size,
        }));
    });

    return {
      total: totalData,
      licenses: licensesData,
    };
  } catch (error) {
    console.error("Error fetching active user activities from database:", error);
    
    if (error instanceof PrismaClientKnownRequestError) {
      // If it's a connection timeout, return minimal data
      if (error.code === 'P2024') {
        return { 
          message: "Database connection timeout - returning cached data", 
          total: [],
          licenses: {}
        };
      }
      return { 
        message: "Database operation failed", 
        code: error.code 
      };
    }
    
    return { message: "Internal server error" };
  }
}

export async function getDailyActiveUsers(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const licenseId = searchParams.get("licenseId") || undefined;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let userIdFilter: string[] = [];

    if (licenseId) {
      const license = await prisma.license.findUnique({
        where: { id: licenseId },
        include: {
          licenseUsers: {
            select: {
              userId: true,
            },
          },
        },
      });

      if (!license) {
        return NextResponse.json({
          total: [],
          licenses: { [licenseId]: [] },
        }, { status: 200 });
      }

      userIdFilter = license.licenseUsers.map((lu) => lu.userId);
    }

    const whereCondition: any = {
      createdAt: { gte: thirtyDaysAgo },
    };

    if (licenseId && userIdFilter.length > 0) {
      whereCondition.userId = { in: userIdFilter };
    }

    const activities = await prisma.userActivity.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            licenseId: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const totalDateMap: { [date: string]: Map<string, any> } = {};
    const licenseDateMap: {
      [licenseId: string]: { [date: string]: Map<string, any> };
    } = {};

    activities.forEach((activity) => {
      const date = activity.createdAt.toISOString().split("T")[0];
      const userId = activity.userId;
      const user = activity.user;
      const userLicenseId = activity.user.licenseId;

      // Total data
      if (!totalDateMap[date]) {
        totalDateMap[date] = new Map();
      }
      totalDateMap[date].set(userId, user);

      // License data
      if (userLicenseId) {
        if (!licenseDateMap[userLicenseId]) {
          licenseDateMap[userLicenseId] = {};
        }
        if (!licenseDateMap[userLicenseId][date]) {
          licenseDateMap[userLicenseId][date] = new Map();
        }
        licenseDateMap[userLicenseId][date].set(userId, user);
      }
    });

    const totalData = Object.keys(totalDateMap)
      .sort()
      .map((date) => ({
        date,
        users: Array.from(totalDateMap[date].values()),
      }));

    const licensesData: Record<string, { date: string; users: any[] }[]> = {};

    Object.keys(licenseDateMap).forEach((licenseId) => {
      licensesData[licenseId] = Object.keys(licenseDateMap[licenseId])
        .sort()
        .map((date) => ({
          date,
          users: Array.from(licenseDateMap[licenseId][date].values()),
        }));
    });

    return NextResponse.json({
      total: totalData,
      licenses: licensesData,
    }, { status: 200 });

  } catch (error) {
    console.error("Error in GET /api/v1/activity/daily-active-users:", error);
    
    if (error instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        { message: "Database operation failed", code: error.code },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function getActiveUser(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const licenseId = searchParams.get("licenseId") || undefined;

    const response = await getActiveUsers(licenseId);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/v1/activity/active-users:", error);
    
    if (error instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        { message: "Database operation failed", code: error.code },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function updateAllUserActivity() {
  try {
    // Get today's date for activity calculation
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    // Get total users count
    const totalUsers = await prisma.user.count();

    // Get activity counts by type for today
    const activityCounts = await prisma.userActivity.groupBy({
      by: ["activityType"],
      where: {
        createdAt: {
          gte: startOfDay,
        },
      },
      _count: {
        id: true,
      },
    });

    // Initialize total counts
    const totalCounts = {
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
      totalLessonFlashcardCount: 0,
      totalLessonSentenceFlashcardsCount: 0,
    };

    // Map activity types to counts
    activityCounts.forEach((activity) => {
      switch (activity.activityType) {
        case "ARTICLE_RATING":
        case "STORIES_RATING":
        case "CHAPTER_RATING":
          totalCounts.totalRatingCount += activity._count.id;
          break;
        case "ARTICLE_READ":
        case "STORIES_READ":
        case "CHAPTER_READ":
          totalCounts.totalReadingCount += activity._count.id;
          break;
        case "LA_QUESTION":
          totalCounts.totalLaQuestionCount += activity._count.id;
          break;
        case "LEVEL_TEST":
          totalCounts.totalLevelTestCount += activity._count.id;
          break;
        case "MC_QUESTION":
          totalCounts.totalMcQuestionCount += activity._count.id;
          break;
        case "SA_QUESTION":
          totalCounts.totalSaQuestionCount += activity._count.id;
          break;
        case "SENTENCE_FLASHCARDS":
          totalCounts.totalSentenceFlashcardsCount += activity._count.id;
          break;
        case "VOCABULARY_FLASHCARDS":
          totalCounts.totalVocabularyFlashcardsCount += activity._count.id;
          break;
        case "VOCABULARY_MATCHING":
          totalCounts.totalVocabularyActivityCount += activity._count.id;
          break;
        case "SENTENCE_MATCHING":
        case "SENTENCE_ORDERING":
        case "SENTENCE_WORD_ORDERING":
        case "SENTENCE_CLOZE_TEST":
          totalCounts.totalSentenceActivityCount += activity._count.id;
          break;
        case "LESSON_FLASHCARD":
          totalCounts.totalLessonFlashcardCount += activity._count.id;
          break;
        case "LESSON_SENTENCE_FLASHCARDS":
          totalCounts.totalLessonSentenceFlashcardsCount += activity._count.id;
          break;
      }
    });

    const userActivityData = {
      totalUsers,
      ...totalCounts,
    };

    return NextResponse.json(
      {
        updateUserActivity: "success",
        data: userActivityData,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error calculating user activity from database:", err);
    
    if (err instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        { message: "Database operation failed", code: err.code },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a new user activity record
export async function createUserActivity(activityData: CreateActivityData) {
  try {
    const activity = await prisma.userActivity.create({
      data: {
        userId: activityData.userId,
        activityType: activityData.activityType,
        targetId: activityData.targetId,
        completed: activityData.completed ?? false,
        details: activityData.details || null,
        createdAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: "Activity created successfully",
        data: activity,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating user activity:", err);
    
    if (err instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        { message: "Database operation failed", code: err.code },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Get user activities by user ID
export async function getUserActivities(userId: string, limit?: number) {
  try {
    const activities = await prisma.userActivity.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit || 100,
    });

    return NextResponse.json(
      {
        data: activities,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error fetching user activities:", err);
    
    if (err instanceof PrismaClientKnownRequestError) {
      return NextResponse.json(
        { message: "Database operation failed", code: err.code },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete user activity by ID
export async function deleteUserActivity(activityId: string) {
  try {
    await prisma.userActivity.delete({
      where: {
        id: activityId,
      },
    });

    return NextResponse.json(
      {
        message: "Activity deleted successfully",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error deleting user activity:", err);
    
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        return NextResponse.json(
          { message: "Activity not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { message: "Database operation failed", code: err.code },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update user activity
export async function updateUserActivity(activityId: string, updateData: Partial<Omit<CreateActivityData, 'userId'>>) {
  try {
    const activity = await prisma.userActivity.update({
      where: {
        id: activityId,
      },
      data: {
        activityType: updateData.activityType,
        targetId: updateData.targetId,
        completed: updateData.completed,
        details: updateData.details || null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: "Activity updated successfully",
        data: activity,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error updating user activity:", err);
    
    if (err instanceof PrismaClientKnownRequestError) {
      if (err.code === 'P2025') {
        return NextResponse.json(
          { message: "Activity not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { message: "Database operation failed", code: err.code },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
