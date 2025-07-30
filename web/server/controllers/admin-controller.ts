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

    const userIds = licenseUsers.map((user) => user.id);

    const xpLogs = await prisma.xPLog.findMany({
      where: {
        userId: { in: userIds },
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    const totalXp = xpLogs.reduce((sum, log) => sum + log.xpEarned, 0);

    const userActivities = await prisma.userActivity.findMany({
      where: {
        userId: { in: userIds },
        createdAt: { gte: thirtyDaysAgo },
      },
      include: {
        user: {
          select: {
            id: true,
            cefrLevel: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const filteredActivityLog = userActivities.map((activity) => ({
      userId: activity.userId,
      activityType: activity.activityType,
      timestamp: activity.createdAt,
      completed: activity.completed,
      details: {
        ...((activity.details as any) || {}),
        cefr_level: activity.user.cefrLevel,
      },
    }));

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
