import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ExtendedNextRequest } from "./auth-controller";
import { deleteStoryAndImages } from "@/utils/deleteStories";
import { QuizStatus } from "@prisma/client";

interface RequestContext {
  params: {
    storyId: string;
    chapterNumber: string;
  };
}

export async function getAllStories(req: ExtendedNextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storyId = searchParams.get("storyId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "8", 10);
    const genre = searchParams.get("genre") || null;
    const subgenre = searchParams.get("subgenre") || null;
    const userId = req.session?.user.id as string;
    const userLevel = req.session?.user.level as number;

    // Get available genres (you might want to create a genres table later)
    const selectionGenres = [
      "Adventure", "Fantasy", "Mystery", "Science Fiction", 
      "Romance", "Horror", "Comedy", "Drama"
    ]; // Placeholder - you can implement dynamic genre fetching

    if (storyId) {
      const story = await prisma.story.findUnique({
        where: { id: storyId },
        include: {
          chapters: true,
        },
      });

      if (!story) {
        return NextResponse.json(
          { message: "Story not found", result: null },
          { status: 404 }
        );
      }

      if (story.raLevel && story.raLevel > userLevel) {
        return NextResponse.json(
          { message: "Story level too high for user", result: null },
          { status: 403 }
        );
      }

      return NextResponse.json({
        result: story,
      });
    }

    if (page < 1 || limit < 1) {
      return NextResponse.json(
        {
          message: "Invalid pagination parameters",
          results: [],
          selectionGenres,
        },
        { status: 400 }
      );
    }

    // Build where clause
    const whereClause: any = {};
    if (genre) whereClause.genre = genre;
    if (subgenre) whereClause.subgenre = subgenre;

    // Get total count
    const totalCount = await prisma.story.count({ where: whereClause });

    // Get stories with pagination
    const stories = await prisma.story.findMany({
      where: whereClause,
      include: {
        chapters: true,
        storyRecords: {
          where: { userId },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Filter by user level and add completion status
    const availableStories = await Promise.all(
      stories
        .filter((story) => (story.raLevel ?? 0) <= 3 || (story.raLevel ?? 0) <= userLevel)
        .map(async (story) => {
          const chapterCount = story.chapters.length;

          // Check completion status for each chapter
          const completedChapters = await Promise.all(
            story.chapters.map(async (chapter) => {
              const mcqCount = await prisma.userActivity.count({
                where: {
                  userId,
                  activityType: 'MC_QUESTION',
                  targetId: `${story.id}_${chapter.chapterNumber}`,
                  completed: true,
                },
              });

              const saqCount = await prisma.userActivity.count({
                where: {
                  userId,
                  activityType: 'SA_QUESTION',
                  targetId: `${story.id}_${chapter.chapterNumber}`,
                  completed: true,
                },
              });

              const laqCount = await prisma.userActivity.count({
                where: {
                  userId,
                  activityType: 'LA_QUESTION',
                  targetId: `${story.id}_${chapter.chapterNumber}`,
                  completed: true,
                },
              });

              return mcqCount >= 5 && saqCount >= 1 && laqCount >= 1;
            })
          );

          const isComplete = completedChapters.filter(Boolean).length === chapterCount;
          const isRead = story.storyRecords.length > 0;

          return {
            ...story,
            is_read: isRead,
            is_completed: isComplete,
          };
        })
    );

    const totalAvailableStories = availableStories.length;

    return NextResponse.json({
      params: { genre, subgenre, page, limit },
      results: availableStories,
      selectionGenres,
      total: totalAvailableStories,
      totalPages: Math.ceil(totalAvailableStories / limit),
    });
  } catch (error) {
    console.error("Error getting stories", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        results: [],
        selectionGenres: [],
        error,
      },
      { status: 500 }
    );
  }
}

export async function getStoryById(
  req: ExtendedNextRequest,
  { params }: { params: { storyId: string } }
) {
  const storyId = params.storyId;
  const userId = req.session?.user.id as string;

  if (!storyId) {
    return NextResponse.json(
      { message: "Missing storyId", result: null },
      { status: 400 }
    );
  }

  try {
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        chapters: {
          orderBy: { chapterNumber: "asc" },
        },
      },
    });

    if (!story) {
      return NextResponse.json(
        { message: "Story not found", result: null },
        { status: 404 }
      );
    }

    // Check if story record exists, create if not
    let storyRecord = await prisma.storyRecord.findUnique({
      where: {
        userId_storyId: {
          userId,
          storyId,
        },
      },
    });

    if (!storyRecord) {
      storyRecord = await prisma.storyRecord.create({
        data: {
          userId,
          storyId,
          title: story.title,
          level: req.session?.user.level || 1,
          status: "READ",
        },
      });
    }

    // Get chapter tracking data
    const chapterTrackings = await prisma.chapterTracking.findMany({
      where: {
        userId,
        storyId,
      },
    });

    // Get completion status for each chapter
    const chaptersWithCompletion = await Promise.all(
      story.chapters.map(async (chapter) => {
        const chapterTracking = chapterTrackings.find(
          (ct) => ct.chapterNumber === chapter.chapterNumber
        );

        const mcqCount = await prisma.userActivity.count({
          where: {
            userId,
            activityType: 'MC_QUESTION',
            targetId: `${storyId}_${chapter.chapterNumber}`,
            completed: true,
          },
        });

        const saqExists = await prisma.userActivity.findFirst({
          where: {
            userId,
            activityType: 'SA_QUESTION',
            targetId: `${storyId}_${chapter.chapterNumber}`,
            completed: true,
          },
        });

        const laqExists = await prisma.userActivity.findFirst({
          where: {
            userId,
            activityType: 'LA_QUESTION',
            targetId: `${storyId}_${chapter.chapterNumber}`,
            completed: true,
          },
        });

        const isCompleted = mcqCount === 5 && saqExists && laqExists;

        return {
          ...chapter,
          is_read: !!chapterTracking,
          is_completed: isCompleted,
        };
      })
    );

    const storyWithCompletion = {
      ...story,
      chapters: chaptersWithCompletion,
      is_read: true, // Since we have a record
    };

    return NextResponse.json({
      result: storyWithCompletion,
    });
  } catch (error) {
    console.error("Error getting story", error);
    return NextResponse.json(
      { message: "Internal server error", error },
      { status: 500 }
    );
  }
}

export async function updateAverageRating(
  req: ExtendedNextRequest,
  ctx: RequestContext
) {
  const { storyId, chapterNumber: chapterNumberStr } = ctx.params;
  const chapterNumber = parseInt(chapterNumberStr, 10);
  
  if (!storyId || isNaN(chapterNumber)) {
    return NextResponse.json(
      { message: "Missing storyId or invalid chapterNumber", result: null },
      { status: 400 }
    );
  }
  
  try {
    const data = await req.json();
    const rating = Math.round((data.rating as number) * 4) / 4; // Round to nearest 0.25

    // Update the specific chapter's rating
    const chapter = await prisma.chapter.findUnique({
      where: {
        storyId_chapterNumber: {
          storyId,
          chapterNumber,
        },
      },
    });

    if (!chapter) {
      return NextResponse.json(
        { message: "Chapter not found", results: [] },
        { status: 404 }
      );
    }

    // Update chapter rating
    const updatedChapter = await prisma.chapter.update({
      where: {
        storyId_chapterNumber: {
          storyId,
          chapterNumber,
        },
      },
      data: {
        rating,
        userRatingCount: (chapter.userRatingCount || 0) + 1,
      },
    });

    // Calculate story average rating
    const allChapters = await prisma.chapter.findMany({
      where: { storyId },
      select: {
        rating: true,
        userRatingCount: true,
      },
    });

    let totalRating = 0;
    let totalUserCount = 0;

    allChapters.forEach((chapter) => {
      if (chapter.rating && chapter.userRatingCount) {
        totalRating += chapter.rating * chapter.userRatingCount;
        totalUserCount += chapter.userRatingCount;
      }
    });

    const averageRating = totalUserCount > 0 
      ? Math.round((totalRating / totalUserCount) * 4) / 4 
      : 0;

    // Update story average rating
    await prisma.story.update({
      where: { id: storyId },
      data: { averageRating },
    });

    return NextResponse.json(
      { message: "Update average rating successfully", averageRating },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating average rating", error);
    return NextResponse.json(
      { message: "Internal server error", results: [] },
      { status: 500 }
    );
  }
}

export async function getChapter(
  req: ExtendedNextRequest,
  ctx: RequestContext
) {
  const { storyId, chapterNumber: chapterNumberStr } = ctx.params;
  const chapterNumber = parseInt(chapterNumberStr, 10);
  const userId = req.session?.user.id as string;

  if (!storyId || isNaN(chapterNumber)) {
    return NextResponse.json(
      { message: "Missing storyId or invalid chapterNumber", result: null },
      { status: 400 }
    );
  }

  try {
    const story = await prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      return NextResponse.json(
        { message: "Story not found", result: null },
        { status: 404 }
      );
    }

    const chapter = await prisma.chapter.findUnique({
      where: {
        storyId_chapterNumber: {
          storyId,
          chapterNumber,
        },
      },
    });

    if (!chapter) {
      return NextResponse.json(
        { message: `Chapter ${chapterNumber} not found`, result: null },
        { status: 404 }
      );
    }

    const timepoints = chapter.sentences || [];

    // Check if chapter tracking record exists, create if not
    let chapterTracking = await prisma.chapterTracking.findUnique({
      where: {
        userId_storyId_chapterNumber: {
          userId,
          storyId,
          chapterNumber,
        },
      },
    });

    if (!chapterTracking) {
      chapterTracking = await prisma.chapterTracking.create({
        data: {
          userId,
          storyId,
          chapterNumber,
          title: story.title,
          level: req.session?.user.level || 1,
          status: "READ",
        },
      });
    }

    const totalChapters = await prisma.chapter.count({
      where: { storyId },
    });

    return NextResponse.json({
      storyId,
      chapterNumber,
      ra_Level: story.raLevel,
      type: story.type,
      genre: story.genre,
      subgenre: story.subgenre,
      cefr_level: story.cefrLevel,
      totalChapters,
      chapter: chapter,
      timepoints: timepoints,
    });
  } catch (error) {
    console.error("Error getting chapter", error);
    return NextResponse.json(
      { message: "Internal server error", error },
      { status: 500 }
    );
  }
}

export async function deleteStories(
  req: ExtendedNextRequest,
  { params: { storyId } }: { params: { storyId: string } }
) {
  try {
    // Delete from database first
    await prisma.story.delete({
      where: { id: storyId },
    });

    // Delete associated images and files
    await deleteStoryAndImages(storyId);

    return NextResponse.json(
      {
        message: "Stories Deleted",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error", error },
      { status: 500 }
    );
  }
}
