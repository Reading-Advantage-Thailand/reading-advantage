import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { requireRole } from "@/server/middleware/guards";
import { buildSchoolFilter } from "@/server/utils/authorization";

export async function getSystemLicenses(req: NextRequest) {
  try {
    // Use the new guard system
    const authResult = await requireRole([Role.SYSTEM])(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { user } = authResult;

    // Get all licenses with their users
    const licenses = await prisma.license.findMany({
      include: {
        licenseUsers: {
          select: {
            userId: true, // Only fetch userId
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
        createdAt: "desc",
      },
    });

    // Collect all userIds from licenses
    const allUserIds = licenses.flatMap((license) =>
      license.licenseUsers.map((licenseUser) => licenseUser.userId)
    );

    // Fetch XP logs for all userIds
    const xpLogs = await prisma.xPLog.findMany({
      where: {
        userId: {
          in: allUserIds,
        },
      },
      select: {
        userId: true,
        xpEarned: true,
      },
    });

    // Group XP logs by userId
    const userXpMap = new Map<string, number>();
    xpLogs.forEach((log: { userId: string; xpEarned: number | null }) => {
      const currentXp = userXpMap.get(log.userId) || 0;
      userXpMap.set(log.userId, currentXp + (log.xpEarned || 0));
    });

    // Process licenses to include XP totals
    const processedLicenses = licenses.map((license) => {
      let totalXp = 0;

      license.licenseUsers.forEach((licenseUser) => {
        totalXp += userXpMap.get(licenseUser.userId) || 0;
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
        isActive: license.expiresAt
          ? new Date(license.expiresAt) > new Date()
          : false,
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
    // Use the new guard system
    const authResult = await requireRole([Role.SYSTEM])(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { user } = authResult;

    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const period = searchParams.get("period"); // 'day', 'week', 'month', 'all'

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (dateFrom && dateTo) {
      startDate = new Date(dateFrom);
      endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
    } else if (period && period !== "all") {
      endDate = new Date();

      switch (period) {
        case "day":
          startDate = new Date();
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 7);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "month":
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
      period: period || "all",
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

export async function refreshMaterializedViews(req: NextRequest) {
  try {
    // Use the new guard system - only SYSTEM admins can refresh materialized views
    const authResult = await requireRole([Role.SYSTEM])(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { user } = authResult;

    const MATERIALIZED_VIEWS = [
      'mv_student_velocity',
      'mv_assignment_funnel',
      'mv_srs_health',
      'mv_genre_engagement',
      'mv_activity_heatmap',
      'mv_cefr_ra_alignment',
      'mv_daily_activity_rollups',
    ];

    const results: { view: string; status: string; error?: string }[] = [];
    const startTime = Date.now();

    for (const viewName of MATERIALIZED_VIEWS) {
      try {
        // Try CONCURRENTLY first (allows reads during refresh)
        await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${viewName}`);
        results.push({ view: viewName, status: 'success (concurrent)' });
      } catch (error: any) {
        // Fall back to regular refresh if CONCURRENTLY fails
        try {
          await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW ${viewName}`);
          results.push({ view: viewName, status: 'success' });
        } catch (fallbackError: any) {
          results.push({
            view: viewName,
            status: 'failed',
            error: fallbackError?.message || String(fallbackError),
          });
        }
      }
    }

    const duration = Date.now() - startTime;
    const successCount = results.filter((r) => r.status.includes('success')).length;
    const failedCount = results.filter((r) => r.status === 'failed').length;

    return NextResponse.json({
      message: 'Materialized views refresh completed',
      summary: {
        total: MATERIALIZED_VIEWS.length,
        success: successCount,
        failed: failedCount,
        duration: `${duration}ms`,
      },
      results,
      refreshedAt: new Date().toISOString(),
      refreshedBy: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error refreshing materialized views:", error);
    return NextResponse.json(
      { message: "Internal server error", error: String(error) },
      { status: 500 }
    );
  }
}
