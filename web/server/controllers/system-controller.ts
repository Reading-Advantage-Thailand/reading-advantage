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

/**
 * Materialized views in dependency order:
 * - Level 1: Student-level views (no dependencies)
 * - Level 2: Class-level views (depend on student data)
 * - Level 3: School-level rollups
 */
const MATERIALIZED_VIEWS = [
  // Level 1: Student-level metrics
  { name: 'mv_student_velocity', level: 1 },
  { name: 'mv_srs_health', level: 1 },
  { name: 'mv_genre_engagement', level: 1 },
  { name: 'mv_activity_heatmap', level: 1 },
  
  // Level 2: Class-level metrics (depend on students)
  { name: 'mv_assignment_funnel', level: 2 },
  { name: 'mv_cefr_ra_alignment', level: 2 },
  
  // Level 3: School-level rollups
  { name: 'mv_daily_activity_rollups', level: 3 },
] as const;

interface RefreshResult {
  view: string;
  level: number;
  status: 'success' | 'success_concurrent' | 'failed';
  duration: number;
  error?: string;
}

/**
 * Send NOTIFY to Postgres for cache invalidation
 */
async function notifyMetricsUpdate(
  viewNames: string[],
  metadata: {
    timestamp: string;
    success: number;
    failed: number;
  }
): Promise<void> {
  try {
    const payload = JSON.stringify({
      views: viewNames,
      timestamp: metadata.timestamp,
      success: metadata.success,
      failed: metadata.failed,
    });
    
    // Send NOTIFY to trigger cache invalidation
    // Escape single quotes in payload
    const escapedPayload = payload.replace(/'/g, "''");
    await prisma.$executeRawUnsafe(
      `NOTIFY metrics_update, '${escapedPayload}'`
    );
    
    console.log('[NOTIFY] Sent metrics_update:', payload);
  } catch (error: any) {
    console.error('[NOTIFY] Failed to send metrics_update notification:', error.message);
  }
}

/**
 * Refresh a single materialized view with CONCURRENTLY fallback
 */
async function refreshView(
  viewName: string,
  level: number
): Promise<RefreshResult> {
  const startTime = Date.now();
  
  try {
    // Try CONCURRENTLY first (allows reads during refresh)
    await prisma.$executeRawUnsafe(
      `REFRESH MATERIALIZED VIEW CONCURRENTLY ${viewName}`
    );
    
    const duration = Date.now() - startTime;
    console.log(`[REFRESH] ✓ ${viewName} (CONCURRENTLY) - ${duration}ms`);
    
    return {
      view: viewName,
      level,
      status: 'success_concurrent',
      duration,
    };
  } catch (error: any) {
    console.warn(`[REFRESH] CONCURRENTLY failed for ${viewName}, trying regular refresh`);
    
    // Fall back to regular refresh if CONCURRENTLY fails
    try {
      await prisma.$executeRawUnsafe(
        `REFRESH MATERIALIZED VIEW ${viewName}`
      );
      
      const duration = Date.now() - startTime;
      console.log(`[REFRESH] ✓ ${viewName} (regular) - ${duration}ms`);
      
      return {
        view: viewName,
        level,
        status: 'success',
        duration,
      };
    } catch (fallbackError: any) {
      const duration = Date.now() - startTime;
      console.error(`[REFRESH] ✗ ${viewName} failed:`, fallbackError.message);
      
      return {
        view: viewName,
        level,
        status: 'failed',
        duration,
        error: fallbackError.message || String(fallbackError),
      };
    }
  }
}

export async function refreshMaterializedViews(req: NextRequest) {
  const requestStartTime = Date.now();
  
  try {
    // Use the new guard system - only SYSTEM admins can refresh materialized views
    const authResult = await requireRole([Role.SYSTEM])(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { user } = authResult;

    console.log(`[REFRESH] Starting materialized view refresh (user: ${user.email})`);

    const results: RefreshResult[] = [];
    
    // Group views by level for better observability
    const viewsByLevel = MATERIALIZED_VIEWS.reduce((acc, view) => {
      if (!acc[view.level]) acc[view.level] = [];
      acc[view.level].push(view);
      return acc;
    }, {} as Record<number, typeof MATERIALIZED_VIEWS[number][]>);
    
    // Refresh each level in order
    for (const level of [1, 2, 3]) {
      const views = viewsByLevel[level] || [];
      if (views.length === 0) continue;
      
      console.log(`[REFRESH] Level ${level}: Refreshing ${views.length} views in parallel`);
      const levelStartTime = Date.now();
      
      // Refresh views at the same level in parallel
      const levelResults = await Promise.all(
        views.map(view => refreshView(view.name, view.level))
      );
      
      const levelDuration = Date.now() - levelStartTime;
      const levelSuccess = levelResults.filter(r => r.status !== 'failed').length;
      const levelFailed = levelResults.filter(r => r.status === 'failed').length;
      
      console.log(
        `[REFRESH] Level ${level} complete: ${levelSuccess} success, ${levelFailed} failed (${levelDuration}ms)`
      );
      
      results.push(...levelResults);
    }

    const duration = Date.now() - requestStartTime;
    const successCount = results.filter((r) => r.status !== 'failed').length;
    const failedCount = results.filter((r) => r.status === 'failed').length;
    const refreshedAt = new Date().toISOString();

    // Send notification for cache invalidation
    const successfulViews = results
      .filter(r => r.status !== 'failed')
      .map(r => r.view);
    
    if (successfulViews.length > 0) {
      await notifyMetricsUpdate(successfulViews, {
        timestamp: refreshedAt,
        success: successCount,
        failed: failedCount,
      });
    }

    console.log(
      `[REFRESH] Complete: ${successCount}/${MATERIALIZED_VIEWS.length} success (${duration}ms)`
    );

    return NextResponse.json({
      message: 'Materialized views refresh completed',
      summary: {
        total: MATERIALIZED_VIEWS.length,
        success: successCount,
        failed: failedCount,
        duration: `${duration}ms`,
      },
      results,
      refreshedAt,
      refreshedBy: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    const duration = Date.now() - requestStartTime;
    console.error("[REFRESH] Error refreshing materialized views:", error);
    return NextResponse.json(
      { 
        message: "Internal server error", 
        error: String(error),
        duration: `${duration}ms`,
      },
      { status: 500 }
    );
  }
}

/**
 * Refresh materialized views (automated via Cloud Scheduler)
 * 
 * This version does NOT require user authentication - uses access key only
 * Designed to be called by Google Cloud Scheduler
 */
export async function refreshMaterializedViewsAutomated(req: NextRequest) {
  const requestStartTime = Date.now();
  
  try {
    // No user authentication - this is called by Cloud Scheduler with access key
    console.log('[REFRESH] Starting automated materialized view refresh');

    const results: RefreshResult[] = [];
    
    // Group views by level for better observability
    const viewsByLevel = MATERIALIZED_VIEWS.reduce((acc, view) => {
      if (!acc[view.level]) acc[view.level] = [];
      acc[view.level].push(view);
      return acc;
    }, {} as Record<number, typeof MATERIALIZED_VIEWS[number][]>);
    
    // Refresh each level in order
    for (const level of [1, 2, 3]) {
      const views = viewsByLevel[level] || [];
      if (views.length === 0) continue;
      
      console.log(`[REFRESH] Level ${level}: Refreshing ${views.length} views in parallel`);
      const levelStartTime = Date.now();
      
      // Refresh views at the same level in parallel
      const levelResults = await Promise.all(
        views.map(view => refreshView(view.name, view.level))
      );
      
      const levelDuration = Date.now() - levelStartTime;
      const levelSuccess = levelResults.filter(r => r.status !== 'failed').length;
      const levelFailed = levelResults.filter(r => r.status === 'failed').length;
      
      console.log(
        `[REFRESH] Level ${level} complete: ${levelSuccess} success, ${levelFailed} failed (${levelDuration}ms)`
      );
      
      results.push(...levelResults);
    }

    const duration = Date.now() - requestStartTime;
    const successCount = results.filter((r) => r.status !== 'failed').length;
    const failedCount = results.filter((r) => r.status === 'failed').length;
    const refreshedAt = new Date().toISOString();

    // Send notification for cache invalidation
    const successfulViews = results
      .filter(r => r.status !== 'failed')
      .map(r => r.view);
    
    if (successfulViews.length > 0) {
      await notifyMetricsUpdate(successfulViews, {
        timestamp: refreshedAt,
        success: successCount,
        failed: failedCount,
      });
    }

    console.log(
      `[REFRESH] Automated refresh complete: ${successCount}/${MATERIALIZED_VIEWS.length} success (${duration}ms)`
    );

    return NextResponse.json({
      message: 'Materialized views refresh completed (automated)',
      summary: {
        total: MATERIALIZED_VIEWS.length,
        success: successCount,
        failed: failedCount,
        duration: `${duration}ms`,
      },
      results,
      refreshedAt,
      refreshedBy: 'Cloud Scheduler',
    });
  } catch (error) {
    const duration = Date.now() - requestStartTime;
    console.error("[REFRESH] Error in automated refresh:", error);
    return NextResponse.json(
      { 
        message: "Internal server error", 
        error: String(error),
        duration: `${duration}ms`,
      },
      { status: 500 }
    );
  }
}

