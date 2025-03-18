import { NextRequest, NextResponse } from "next/server";
import db from "@/configs/firestore-config";
import { ExtendedNextRequest } from "./auth-controller";
import { deleteStoryAndImages } from "@/utils/deleteStories";

interface RequestContext {
  params: {
    storyId: string;
    chapterNumber: number;
  };
}

export async function getAllStories(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storyId = searchParams.get("storyId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const genre = searchParams.get("genre") || null;
    const subgenre = searchParams.get("subgenre") || null;

    const fetchGenres = async () => {
      const collectionRef = db.collection("genres-fiction");
      const querySnapshot = await collectionRef.get();
      return querySnapshot.docs.map((doc) => doc.data().name);
    };

    const selectionGenres = await fetchGenres();

    if (storyId) {
      const storyDoc = await db.collection("stories").doc(storyId).get();
      if (!storyDoc.exists) {
        return NextResponse.json(
          { message: "Story not found", result: null },
          { status: 404 }
        );
      }
      return NextResponse.json({
        result: { id: storyDoc.id, ...storyDoc.data() },
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

    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> =
      db.collection("stories");

    if (genre) query = query.where("genre", "==", genre);
    if (subgenre) query = query.where("subgenre", "==", subgenre);
    if (!genre && !subgenre) query = query.orderBy("createdAt", "desc");

    const totalSnapshot = await query.get();
    const total = totalSnapshot.docs.length;

    let snapshot;
    if (page === 1) {
      snapshot = await query.limit(limit).get();
    } else {
      const previousSnapshot = await query.limit((page - 1) * limit).get();
      const lastVisible =
        previousSnapshot.docs[previousSnapshot.docs.length - 1];
      snapshot = lastVisible
        ? await query.startAfter(lastVisible).limit(limit).get()
        : await query.limit(limit).get();
    }

    const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({
      params: { genre, subgenre, page, limit },
      results,
      selectionGenres,
      total,
      totalPages: Math.ceil(total / limit),
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
  req: NextRequest,
  { params }: { params: { storyId: string } }
) {
  const storyId = params.storyId;

  if (!storyId) {
    return NextResponse.json(
      { message: "Missing storyId", result: null },
      { status: 400 }
    );
  }

  try {
    const storyDoc = await db.collection("stories").doc(storyId).get();

    if (!storyDoc.exists) {
      return NextResponse.json(
        { message: "Story not found", result: null },
        { status: 404 }
      );
    }

    return NextResponse.json({
      result: { id: storyDoc.id, ...storyDoc.data() },
    });
  } catch (error) {
    console.error("Error getting story", error);
    return NextResponse.json(
      { message: "Internal server error", error },
      { status: 500 }
    );
  }
}

export async function getChapter(req: NextRequest, ctx: RequestContext) {
  const { storyId, chapterNumber } = ctx.params;

  if (!storyId || chapterNumber === undefined) {
    return NextResponse.json(
      { message: "Missing storyId or chapterNumber", result: null },
      { status: 400 }
    );
  }

  try {
    const storyDoc = await db.collection("stories").doc(storyId).get();

    if (!storyDoc.exists || !storyDoc.data()) {
      return NextResponse.json(
        { message: "Story not found", result: null },
        { status: 404 }
      );
    }

    const timepointsDoc = await db
      .collection("stories")
      .doc(storyId)
      .collection("timepoints")
      .doc(`${chapterNumber}`)
      .get();

    if (!timepointsDoc.exists || !timepointsDoc.data()) {
      return NextResponse.json(
        { message: "Story not found", result: null },
        { status: 404 }
      );
    }

    const storyData = storyDoc.data() as FirebaseFirestore.DocumentData;
    const timepointsData =
      timepointsDoc.data() as FirebaseFirestore.DocumentData;

    if (!storyData.chapters || !Array.isArray(storyData.chapters)) {
      return NextResponse.json(
        { message: "No chapters found for this story", result: null },
        { status: 404 }
      );
    }

    const chapterIndex = chapterNumber - 1;
    if (chapterIndex < 0 || chapterIndex >= storyData.chapters.length) {
      return NextResponse.json(
        { message: `Chapter ${chapterNumber} not found`, result: null },
        { status: 404 }
      );
    }

    const chapter = storyData.chapters[chapterIndex];
    const ra_Level = storyData.ra_level;
    const cefr_level = storyData.cefr_level;
    const totalChapters = storyData.chapters.length;

    return NextResponse.json({
      storyId,
      chapterNumber,
      ra_Level,
      cefr_level,
      totalChapters,
      chapter: chapter,
      timepoints: timepointsData.timepoints,
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
