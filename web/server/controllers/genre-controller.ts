import { NextResponse } from "next/server";
import { ExtendedNextRequest } from "./auth-controller";
import { 
  MetricsGenresResponse,
  GenreMetrics,
} from "@/types/dashboard";
import { prisma } from "@/lib/prisma";

/**
 * Get genre metrics
 * @param req - Extended Next request with session
 * @returns Genre metrics response
 */
export async function getGenreMetrics(req: ExtendedNextRequest) {
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

    if (schoolId) {
      whereClause.user = {
        schoolId,
      };
    }

    const lessonRecords = await prisma.lessonRecord.findMany({
      where: whereClause,
      select: {
        id: true,
        userId: true,
        article: {
          select: {
            genre: true,
            raLevel: true,
          },
        },
        user: {
          select: {
            xp: true,
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

    const filteredRecords = classId
      ? lessonRecords.filter((lr: any) => lr.user.studentClassrooms?.length > 0)
      : lessonRecords;

    const genreMap = new Map<string, {
      count: number;
      totalLevel: number;
      totalXp: number;
      userSet: Set<string>;
    }>();

    filteredRecords.forEach((record: any) => {
      const genre = record.article?.genre || 'Unknown';
      
      if (!genreMap.has(genre)) {
        genreMap.set(genre, {
          count: 0,
          totalLevel: 0,
          totalXp: 0,
          userSet: new Set(),
        });
      }

      const data = genreMap.get(genre)!;
      data.count += 1;
      data.totalLevel += record.article?.raLevel || 0;
      data.totalXp += record.user?.xp || 0;
      data.userSet.add(record.userId);
    });

    const totalReads = filteredRecords.length;

    const genres: GenreMetrics[] = Array.from(genreMap.entries())
      .map(([genre, data]) => ({
        genre,
        count: data.count,
        percentage: totalReads > 0
          ? Math.round((data.count / totalReads) * 100 * 10) / 10
          : 0,
        averageLevel: data.count > 0
          ? Math.round((data.totalLevel / data.count) * 10) / 10
          : 0,
        totalXp: data.totalXp,
      }))
      .sort((a, b) => b.count - a.count);

    let diversity = 0;
    if (totalReads > 0) {
      genres.forEach((g) => {
        const p = g.count / totalReads;
        if (p > 0) {
          diversity -= p * Math.log2(p);
        }
      });
      const maxEntropy = Math.log2(Math.min(genres.length, 10));
      diversity = maxEntropy > 0 ? diversity / maxEntropy : 0;
    }

    const response: MetricsGenresResponse = {
      timeframe,
      genres,
      summary: {
        totalGenres: genres.length,
        mostPopular: genres.length > 0 ? genres[0].genre : 'N/A',
        diversity: Math.round(diversity * 100) / 100,
      },
      cache: {
        cached: false,
        generatedAt: new Date().toISOString(),
      },
    };

    const duration = Date.now() - startTime;

    console.log(`[Controller] getGenreMetrics - ${duration}ms - ${genres.length} genres`);

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=240',
        'X-Response-Time': `${duration}ms`,
      },
    });
  } catch (error) {
    console.error('[Controller] getGenreMetrics - Error:', error);

    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch genre metrics',
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