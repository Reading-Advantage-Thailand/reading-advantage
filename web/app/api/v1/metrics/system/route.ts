import { NextRequest, NextResponse } from "next/server";
import { createEdgeRouter } from "next-connect";
import { logRequest } from "@/server/middleware";
import { protect } from "@/server/controllers/auth-controller";
import { requireRole } from "@/server/middleware/guards";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getActivityMetrics, getAssignmentMetrics } from "@/server/controllers/metrics-controller";

interface RequestContext {
  params?: unknown;
}

const router = createEdgeRouter<NextRequest, RequestContext>();

// Middleware
router.use(logRequest);
router.use(protect);

// GET /api/v1/metrics/system - System-wide metrics for dashboard
router.get(async (req: NextRequest) => {
  try {
    // Require SYSTEM or ADMIN role
    const authResult = await requireRole([Role.SYSTEM, Role.ADMIN])(req);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const url = new URL(req.url);
    const dateRange = url.searchParams.get("dateRange") || "30d";
    
    const [activityMetricsResponse, assignmentMetricsResponse] = await Promise.all([
      getActivityMetrics(req),
      getAssignmentMetrics(req)
    ]);

    const activityMetrics = await activityMetricsResponse.json();
    const assignmentMetrics = await assignmentMetricsResponse.json();

    const totalSchools = await prisma.school.count();
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
    const totalTeachers = await prisma.user.count({ where: { role: 'TEACHER' } });
    const totalArticles = await prisma.article.count();

    const databaseHealth = await prisma.$queryRaw<{ status: string }[]>`SELECT 'Good' as status`; // Replace with actual query
    const apiResponseStatus = "Good"; // Replace with actual logic to check API response
    const errorRate = "Low"; // Replace with actual error rate calculation
    const uptime = "99.9%"; // Replace with actual uptime calculation

    const metrics = {
      overview: {
        totalSchools,
        totalStudents,
        totalTeachers,
        totalArticles,
      },
      activity: {
        readingSessions: activityMetrics.summary.totalSessions,
        completionRate: `${assignmentMetrics.summary.averageCompletionRate}%`,
      },
      health: {
        database: databaseHealth[0]?.status || "Unknown",
        apiResponse: apiResponseStatus,
        errorRate,
        uptime
      },
      dateRange,
      generatedAt: new Date().toISOString(),
      status: "Data fetched from APIs"
    };

    return NextResponse.json(metrics);
    
  } catch (error) {
    console.error("Error fetching system metrics:", error);
    return NextResponse.json(
      { message: "Internal server error", error: String(error) },
      { status: 500 }
    );
  }
});

export async function GET(request: NextRequest, ctx: RequestContext) {
  const result = await router.run(request, ctx);
  if (result instanceof NextResponse) {
    return result;
  }
  throw new Error("Expected a NextResponse from router.run");
}