import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function getSystemLicenses(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== Role.SYSTEM) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all licenses with their users and XP data
    const licenses = await prisma.license.findMany({
      include: {
        licenseUsers: {
          include: {
            user: {
              include: {
                xpLogs: {
                  select: {
                    xpEarned: true,
                    createdAt: true,
                  },
                },
              },
            },
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Process licenses to include XP totals
    const processedLicenses = licenses.map((license) => {
      let totalXp = 0;

      license.licenseUsers.forEach((licenseUser) => {
        const userXp = licenseUser.user.xpLogs.reduce(
          (sum, log) => sum + log.xpEarned,
          0
        );
        totalXp += userXp;
      });

      return {
        id: license.id,
        key: license.key,
        schoolName: license.schoolName,
        expiresAt: license.expiresAt,
        maxUsers: license.maxUsers,
        licenseType: license.licenseType,
        currentUsers: license.licenseUsers.length,
        totalXp,
        isActive: license.expiresAt ? new Date(license.expiresAt) > new Date() : false,
        createdAt: license.createdAt,
        updatedAt: license.updatedAt,
        owner: license.owner,
      };
    });

    return NextResponse.json({
      data: processedLicenses,
      total: processedLicenses.length,
    });
  } catch (error) {
    console.error("Error fetching licenses:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function getSchoolXpData(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== Role.SYSTEM) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const period = searchParams.get('period'); // 'day', 'week', 'month', 'all'

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (dateFrom && dateTo) {
      startDate = new Date(dateFrom);
      endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
    } else if (period && period !== 'all') {
      endDate = new Date();
      
      switch (period) {
        case 'day':
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'month':
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
          startDate.setHours(0, 0, 0, 0);
          break;
      }
    }

    // Build where condition for XP logs
    const whereCondition: any = {};
    if (startDate && endDate) {
      whereCondition.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Get all licenses with school XP data
    const licensesWithXp = await prisma.license.findMany({
      where: {
        schoolName: {
          not: "",
        },
      },
      include: {
        licenseUsers: {
          include: {
            user: {
              include: {
                xpLogs: {
                  where: whereCondition,
                  select: {
                    xpEarned: true,
                    createdAt: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Process data to get school XP totals
    const schoolXpMap = new Map<string, number>();

    licensesWithXp.forEach((license) => {
      if (license.schoolName) {
        let schoolXp = 0;
        
        license.licenseUsers.forEach((licenseUser) => {
          const userXp = licenseUser.user.xpLogs.reduce(
            (sum, log) => sum + log.xpEarned,
            0
          );
          schoolXp += userXp;
        });

        const currentXp = schoolXpMap.get(license.schoolName) || 0;
        schoolXpMap.set(license.schoolName, currentXp + schoolXp);
      }
    });

    // Convert to array and sort by XP
    const schoolXpData = Array.from(schoolXpMap.entries())
      .map(([school, xp]) => ({ school, xp }))
      .sort((a, b) => b.xp - a.xp);

    return NextResponse.json({
      data: schoolXpData,
      total: schoolXpData.length,
      period: period || 'all',
      dateRange: startDate && endDate ? { from: startDate, to: endDate } : null,
    });
  } catch (error) {
    console.error("Error fetching school XP data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
