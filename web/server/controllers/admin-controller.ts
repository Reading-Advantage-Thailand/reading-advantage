import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    if (!user?.license_id) {
      return NextResponse.json(
        { message: "User has no License" },
        { status: 401 }
      );
    }

    const license = await prisma.license.findUnique({
      where: { id: user.license_id },
      include: {
        licenseUsers: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!license) {
      return NextResponse.json(
        { message: "License not found" },
        { status: 401 }
      );
    }

    const licenseUsers = license.licenseUsers.map((lu) => lu.user);

    const teacherCount = licenseUsers.filter(
      (user) => user.role === Role.TEACHER
    ).length;

    const cefrValues = licenseUsers
      .map((user) => cefrToNumber[user.cefrLevel])
      .filter((value) => value !== undefined);

    let averageCefrLevel = "A1";
    if (cefrValues.length > 0) {
      const averageCefrValue =
        cefrValues.reduce((sum, value) => sum + value, 0) / cefrValues.length;
      const numberToCefr = Object.fromEntries(
        Object.entries(cefrToNumber).map(([k, v]) => [v, k])
      );
      averageCefrLevel = numberToCefr[Math.round(averageCefrValue)] || "A1";
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userIds = licenseUsers.map((user) => user.id);

    const xpLogs = await prisma.xPLog.findMany({
      where: {
        userId: { in: userIds },
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    const totalXp = xpLogs.reduce((sum, log) => sum + log.xpEarned, 0);

    // Get user activities for the last 6 months
    const userActivities = await prisma.userActivity.findMany({
      where: {
        userId: { in: userIds },
        createdAt: { gte: sixMonthsAgo },
      },
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
      orderBy: { createdAt: "desc" },
      take: 5000,
    });

    // Get article data for activities that reference articles
    const articleIds = new Set<string>();
    userActivities.forEach(activity => {
      // Only get article IDs from ARTICLE_READ and ARTICLE_RATING activities
      if ((activity.activityType === 'ARTICLE_READ' || 
           activity.activityType === 'ARTICLE_RATING') && 
          activity.targetId) {
        articleIds.add(activity.targetId);
      }
    });

    console.log(`Admin dashboard - Found ${articleIds.size} unique article IDs to fetch`);

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

    console.log(`Admin dashboard - Retrieved ${articles.length} articles with CEFR levels`);

    const articleMap = new Map(articles.map(article => [article.id, article]));

    const filteredActivityLog = userActivities.map((activity) => {
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

    // Count how many activities have CEFR levels
    const activitiesWithCEFR = filteredActivityLog.filter(a => a.details?.cefr_level).length;
    console.log(`Admin dashboard - Total activities: ${filteredActivityLog.length}, With CEFR level: ${activitiesWithCEFR}`);

    const licenseData = [
      {
        id: license.id,
        school_name: license.schoolName,
        total_licenses: license.maxUsers,
        used_licenses: license.licenseUsers.length,
        expires_at: license.expiresAt,
      },
    ];

    return NextResponse.json(
      {
        data: {
          license: licenseData,
          userData: licenseUsers.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            cefr_level: user.cefrLevel,
            xp: user.xp,
            level: user.level,
            license_id: user.licenseId,
          })),
          xpEarned: totalXp,
          filteredActivityLog,
          averageCefrLevel,
          teacherCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in getAdminDashboard:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
