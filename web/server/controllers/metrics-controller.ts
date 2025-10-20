import { NextResponse } from "next/server";
import { ExtendedNextRequest } from "./auth-controller";
import { 
  MetricsActivityResponse, 
  ActivityDataPoint,
  MetricsAlignmentResponse,
  AlignmentData,
  MetricsAssignmentsResponse,
  AssignmentMetrics,
  MetricsGenresResponse,
  GenreMetrics,
  MetricsSRSResponse,
  SRSMetrics,
  MetricsVelocityResponse,
  VelocityDataPoint
} from "@/types/dashboard";
import { prisma } from "@/lib/prisma";
import { Role, Status } from "@prisma/client";

/**
 * Get activity metrics
 * @param req - Extended Next request with session
 * @returns Activity metrics response
 */
export async function getActivityMetrics(req: ExtendedNextRequest) {
  const startTime = Date.now();

  try {
    const session = req.session;
    if (!session) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get('timeframe') || '30d';
    const schoolId = searchParams.get('schoolId');
    const classId = searchParams.get('classId');

    // Calculate date range
    const now = new Date();
    const daysAgo = timeframe === '7d' ? 7 : timeframe === '90d' ? 90 : 30;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysAgo);

    // Build where clause based on filters
    const whereClause: any = {
      createdAt: {
        gte: startDate,
      },
    };

    if (schoolId) {
      whereClause.schoolId = schoolId;
    }

    // Get daily activity data
    const activities = await prisma.userActivity.findMany({
      where: whereClause,
      select: {
        userId: true,
        createdAt: true,
        timer: true,
        user: {
          select: {
            createdAt: true,
            studentClassrooms: classId
              ? {
                  where: {
                    classroomId: classId,
                  },
                  select: {
                    id: true,
                  },
                }
              : undefined,
          },
        },
      },
    }) as any;

    // Filter by class if specified
    const filteredActivities = classId
      ? activities.filter((a: any) => a.user.studentClassrooms?.length > 0)
      : activities;

    // Group by date
    const dateMap = new Map<string, {
      activeUsers: Set<string>;
      newUsers: Set<string>;
      sessions: number;
      totalTime: number;
    }>();

    // Initialize all dates in range
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      dateMap.set(dateKey, {
        activeUsers: new Set(),
        newUsers: new Set(),
        sessions: 0,
        totalTime: 0,
      });
    }

    // Process activities
    filteredActivities.forEach((activity: any) => {
      const dateKey = new Date(activity.createdAt).toISOString().split('T')[0];
      const data = dateMap.get(dateKey);

      if (data) {
        data.activeUsers.add(activity.userId);
        data.sessions += 1;
        if (activity.timer) {
          data.totalTime += activity.timer;
        }

        // Check if user is new (created on this day)
        const userCreatedDate = new Date(activity.user.createdAt).toISOString().split('T')[0];
        if (userCreatedDate === dateKey) {
          data.newUsers.add(activity.userId);
        }
      }
    });

    // Convert to response format
    const dataPoints: ActivityDataPoint[] = Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        activeUsers: data.activeUsers.size,
        newUsers: data.newUsers.size,
        readingSessions: data.sessions,
        averageSessionLength: data.sessions > 0
          ? Math.round((data.totalTime / data.sessions / 60) * 10) / 10
          : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate summary
    const totalActiveUsers = new Set(
      filteredActivities.map((a: any) => a.userId)
    ).size;

    const totalSessions = filteredActivities.length;

    const totalTime = filteredActivities
      .filter((a: any) => a.timer)
      .reduce((sum: number, a: any) => sum + a.timer, 0);

    const averageSessionLength = totalSessions > 0
      ? Math.round((totalTime / totalSessions / 60) * 10) / 10
      : 0;

    const peakDay = dataPoints.reduce((peak, current) =>
      current.activeUsers > peak.activeUsers ? current : peak
    , dataPoints[0] || { date: '', activeUsers: 0, newUsers: 0, readingSessions: 0, averageSessionLength: 0 }).date;

    const response: MetricsActivityResponse = {
      timeframe,
      dataPoints,
      summary: {
        totalActiveUsers,
        totalSessions,
        averageSessionLength,
        peakDay,
      },
      cache: {
        cached: false,
        generatedAt: new Date().toISOString(),
      },
    };

    const duration = Date.now() - startTime;

    console.log(`[Controller] getActivityMetrics - ${duration}ms - ${dataPoints.length} data points`);

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=240',
        'X-Response-Time': `${duration}ms`,
      },
    });
  } catch (error) {
    console.error('[Controller] getActivityMetrics - Error:', error);

    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch activity metrics',
        details: error instanceof Error ? { error: error.message } : {},
      },
      {
        status: 500,
        headers: {
          'X-Response-Time': `${Date.now() - startTime}ms`,
        },
      }
    );
  }
}

/**
 * Get alignment metrics
 * @param req - Extended Next request with session
 * @returns Alignment metrics response
 */
export async function getAlignmentMetrics(req: ExtendedNextRequest) {
  const startTime = Date.now();

  try {
    const session = req.session;
    if (!session) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get('schoolId');
    const classId = searchParams.get('classId');

    // Build where clause
    const whereClause: any = {
      role: Role.STUDENT,
    };

    if (classId) {
      whereClause.studentClassrooms = {
        some: {
          classroomId: classId,
        },
      };
    } else if (schoolId) {
      whereClause.schoolId = schoolId;
    }

    // Get all students
    const students = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        level: true,
        cefrLevel: true,
        lessonRecords: {
          select: {
            article: {
              select: {
                raLevel: true,
              },
            },
          },
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    // Calculate level distribution
    const levelDistribution: Record<string, number> = {};
    const cefrDistribution: Record<string, number> = {};

    students.forEach((student) => {
      const levelKey = `Level ${student.level}`;
      levelDistribution[levelKey] = (levelDistribution[levelKey] || 0) + 1;
      cefrDistribution[student.cefrLevel] = (cefrDistribution[student.cefrLevel] || 0) + 1;
    });

    // Calculate alignment
    let studentsAboveLevel = 0;
    let studentsBelowLevel = 0;
    let studentsOnLevel = 0;

    students.forEach((student) => {
      if (student.lessonRecords.length === 0) {
        studentsOnLevel++;
        return;
      }

      const readingLevels = student.lessonRecords
        .filter((lr: any) => lr.article?.raLevel)
        .map((lr: any) => lr.article.raLevel);

      if (readingLevels.length === 0) {
        studentsOnLevel++;
        return;
      }

      const avgReadingLevel = readingLevels.reduce((sum, level) => sum + level, 0) / readingLevels.length;

      if (avgReadingLevel > student.level + 0.5) {
        studentsAboveLevel++;
      } else if (avgReadingLevel < student.level - 0.5) {
        studentsBelowLevel++;
      } else {
        studentsOnLevel++;
      }
    });

    const alignment: AlignmentData = {
      levelDistribution,
      cefrDistribution,
      recommendations: {
        studentsAboveLevel,
        studentsBelowLevel,
        studentsOnLevel,
      },
    };

    const totalStudents = students.length;
    const averageLevel = totalStudents > 0
      ? students.reduce((sum, s) => sum + s.level, 0) / totalStudents
      : 0;

    const levelCounts = students.reduce((acc: Record<number, number>, s) => {
      acc[s.level] = (acc[s.level] || 0) + 1;
      return acc;
    }, {});

    const modalLevel = Object.entries(levelCounts).reduce(
      (max, [level, count]) => (count > max.count ? { level: parseInt(level), count } : max),
      { level: 1, count: 0 }
    ).level;

    const response: MetricsAlignmentResponse = {
      alignment,
      summary: {
        totalStudents,
        averageLevel: Math.round(averageLevel * 10) / 10,
        modalLevel,
      },
      cache: {
        cached: false,
        generatedAt: new Date().toISOString(),
      },
    };

    const duration = Date.now() - startTime;

    console.log(`[Controller] getAlignmentMetrics - ${duration}ms - ${totalStudents} students`);

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=240',
        'X-Response-Time': `${duration}ms`,
      },
    });
  } catch (error) {
    console.error('[Controller] getAlignmentMetrics - Error:', error);

    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch alignment metrics',
        details: error instanceof Error ? { error: error.message } : {},
      },
      {
        status: 500,
        headers: {
          'X-Response-Time': `${Date.now() - startTime}ms`,
        },
      }
    );
  }
}

/**
 * Get assignment metrics
 * @param req - Extended Next request with session
 * @returns Assignment metrics response
 */
export async function getAssignmentMetrics(req: ExtendedNextRequest) {
  const startTime = Date.now();

  try {
    const session = req.session;
    if (!session) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get('timeframe') || '30d';
    const schoolId = searchParams.get('schoolId');
    const classId = searchParams.get('classId');

    const now = new Date();
    const daysAgo = timeframe === '7d' ? 7 : timeframe === '90d' ? 90 : 30;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysAgo);

    const whereClause: any = {
      createdAt: {
        gte: startDate,
      },
    };

    if (classId) {
      whereClause.classroomId = classId;
    } else if (schoolId) {
      whereClause.classroom = {
        schoolId,
      };
    }

    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        dueDate: true,
        createdAt: true,
        studentAssignments: {
          select: {
            id: true,
            status: true,
            score: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const assignmentMetrics: AssignmentMetrics[] = assignments.map((assignment) => {
      const total = assignment.studentAssignments.length;
      const completed = assignment.studentAssignments.filter(
        (sa) => sa.status === Status.COMPLETED
      ).length;
      const inProgress = assignment.studentAssignments.filter(
        (sa) => sa.status === Status.IN_PROGRESS
      ).length;
      const notStarted = assignment.studentAssignments.filter(
        (sa) => sa.status === Status.NOT_STARTED
      ).length;

      const scores = assignment.studentAssignments
        .filter((sa) => sa.score !== null)
        .map((sa) => sa.score!);

      const averageScore = scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;

      const completionRate = total > 0 ? (completed / total) * 100 : 0;

      return {
        assignmentId: assignment.id,
        title: assignment.title || 'Untitled Assignment',
        dueDate: assignment.dueDate?.toISOString(),
        assigned: total,
        completed,
        inProgress,
        notStarted,
        averageScore: Math.round(averageScore * 100) / 100,
        completionRate: Math.round(completionRate * 10) / 10,
      };
    });

    const totalAssignments = assignmentMetrics.length;
    const averageCompletionRate = totalAssignments > 0
      ? assignmentMetrics.reduce((sum, a) => sum + a.completionRate, 0) / totalAssignments
      : 0;

    const allScores = assignmentMetrics
      .filter((a) => a.averageScore > 0)
      .map((a) => a.averageScore);

    const averageScore = allScores.length > 0
      ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length
      : 0;

    const response: MetricsAssignmentsResponse = {
      timeframe,
      assignments: assignmentMetrics,
      summary: {
        totalAssignments,
        averageCompletionRate: Math.round(averageCompletionRate * 10) / 10,
        averageScore: Math.round(averageScore * 100) / 100,
      },
      cache: {
        cached: false,
        generatedAt: new Date().toISOString(),
      },
    };

    const duration = Date.now() - startTime;

    console.log(`[Controller] getAssignmentMetrics - ${duration}ms - ${assignmentMetrics.length} assignments`);

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=240',
        'X-Response-Time': `${duration}ms`,
      },
    });
  } catch (error) {
    console.error('[Controller] getAssignmentMetrics - Error:', error);

    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch assignment metrics',
        details: error instanceof Error ? { error: error.message } : {},
      },
      {
        status: 500,
        headers: {
          'X-Response-Time': `${Date.now() - startTime}ms`,
        },
      }
    );
  }
}
