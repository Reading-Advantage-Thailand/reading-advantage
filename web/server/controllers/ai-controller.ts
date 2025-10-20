import { NextResponse } from "next/server";
import { ExtendedNextRequest } from "./auth-controller";
import { AISummaryResponse, AIInsight } from "@/types/dashboard";

/**
 * GET /api/v1/ai/summary
 * Generate AI-powered insights and recommendations
 */
export async function getAISummary(req: ExtendedNextRequest) {
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

    // TODO: Integrate with actual AI service from Phase 4.1
    // For now, return placeholder insights
    const insights: AIInsight[] = [
      {
        id: 'insight-1',
        type: 'trend',
        title: 'Reading Activity Increasing',
        description: 'Student reading activity has increased by 23% over the past week compared to the previous week.',
        confidence: 0.89,
        priority: 'medium',
        data: {
          percentageChange: 23,
          timeframe: '7d',
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: 'insight-2',
        type: 'recommendation',
        title: 'Assign More Advanced Materials',
        description: '5 students are consistently scoring above 90% on their current level. Consider assigning higher-level content.',
        confidence: 0.92,
        priority: 'high',
        data: {
          studentCount: 5,
          averageScore: 0.94,
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: 'insight-3',
        type: 'alert',
        title: 'Engagement Drop Detected',
        description: '3 students have not been active for more than 7 days. Early intervention recommended.',
        confidence: 1.0,
        priority: 'high',
        data: {
          studentCount: 3,
          daysSinceActivity: 7,
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: 'insight-4',
        type: 'achievement',
        title: 'Class Milestone Reached',
        description: 'The class has collectively read over 1,000 articles this month!',
        confidence: 1.0,
        priority: 'medium',
        data: {
          articlesRead: 1042,
          timeframe: '30d',
        },
        createdAt: new Date().toISOString(),
      },
    ];

    // Filter insights based on context if needed
    // (In production, this would be done by the AI service)

    const response: AISummaryResponse = {
      insights,
      summary: {
        totalInsights: insights.length,
        highPriority: insights.filter((i) => i.priority === 'high').length,
        lastGenerated: new Date().toISOString(),
      },
      status: 'ready', // Will be 'generating' or 'stale' when connected to real AI service
      cache: {
        cached: false,
        generatedAt: new Date().toISOString(),
      },
    };

    const duration = Date.now() - startTime;

    console.log(`[API] /api/ai/summary - ${duration}ms - ${insights.length} insights`);

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=600', // Longer cache for AI insights
        'X-Response-Time': `${duration}ms`,
      },
    });
  } catch (error) {
    console.error('[API] /api/ai/summary - Error:', error);

    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch AI summary',
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
