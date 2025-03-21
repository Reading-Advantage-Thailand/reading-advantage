import { NextRequest, NextResponse } from "next/server";
import db from "@/configs/firestore-config";
import { ExtendedNextRequest } from "./auth-controller";
import { deleteStoryAndImages } from "@/utils/deleteStories";
import { QuizStatus } from "@/components/models/questions-model";

interface RequestContext {
  params: {
    storyId: string;
    chapterNumber: number;
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

    //console.log("Request params:", {
    //  page,
    //  limit,
    //  genre,
    //  subgenre,
    //  userId,
    //  userLevel,
    //});

    const fetchGenres = async () => {
      const collectionRef = db.collection("genres-fiction");
      const querySnapshot = await collectionRef.get();
      return querySnapshot.docs.map((doc) => doc.data().name);
    };

    const selectionGenres = await fetchGenres();
    //console.log("Available genres:", selectionGenres);

    if (storyId) {
      const storyDoc = await db.collection("stories").doc(storyId).get();
      if (!storyDoc.exists) {
        return NextResponse.json(
          { message: "Story not found", result: null },
          { status: 404 }
        );
      }
      const storyData = storyDoc.data();
      if (storyData?.ra_level > userLevel) {
        return NextResponse.json(
          { message: "Story level too high for user", result: null },
          { status: 403 }
        );
      }
      return NextResponse.json({
        result: { id: storyDoc.id, ...storyData },
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

    if (genre) {
      //console.log("Filtering by genre:", genre);
      query = query.where("genre", "==", genre);
    }
    if (subgenre) query = query.where("subgenre", "==", subgenre);
    if (!genre && !subgenre) query = query.orderBy("createdAt", "desc");

    const totalSnapshot = await query.get();
    //console.log("Total stories found before filtering:", totalSnapshot.size);
    //console.log(
    //  "Stories found:",
    //  totalSnapshot.docs.map((doc) => ({
    //    id: doc.id,
    //    genre: doc.data().genre,
    //    ra_level: doc.data().ra_level,
    //  }))
    //);

    const availableStories = totalSnapshot.docs.filter(
      (doc) => doc.data().ra_level <= userLevel
    );

    const totalAvailableStories = availableStories.length;
    //console.log("Total available stories:", totalAvailableStories);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDocs = availableStories.slice(startIndex, endIndex);
    //console.log("Pagination range:", {
    //  startIndex,
    //  endIndex,
    //  paginatedDocsLength: paginatedDocs.length,
    //});

    const results = await Promise.all(
      paginatedDocs.map(async (doc) => {
        const storyData = doc.data();
        //console.log("Story data:", {
        //  id: doc.id,
        //  title: storyData.title,
        //  ra_level: storyData.ra_level,
        //  userLevel,
        //});

        const articleRecord = await db
          .collection("users")
          .doc(userId)
          .collection("stories-records")
          .doc(doc.id)
          .get();

        return {
          id: doc.id,
          ...storyData,
          is_read: articleRecord.exists,
        };
      })
    );

    //console.log("Final results:", {
    //  params: { genre, subgenre, page, limit },
    //  results,
    //  selectionGenres,
    //  total: totalAvailableStories,
    //  totalPages: Math.ceil(totalAvailableStories / limit),
    //});

    return NextResponse.json({
      params: { genre, subgenre, page, limit },
      results,
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
    console.log("Missing storyId");
    return NextResponse.json(
      { message: "Missing storyId", result: null },
      { status: 400 }
    );
  }

  try {
    //console.log(`Fetching story with ID: ${storyId}`);
    const storyDoc = await db.collection("stories").doc(storyId).get();

    if (!storyDoc.exists) {
      //console.log("Story not found");
      return NextResponse.json(
        { message: "Story not found", result: null },
        { status: 404 }
      );
    }

    //console.log(`Checking user record for story ID: ${storyId}`);
    const record = await db
      .collection("users")
      .doc(userId)
      .collection("stories-records")
      .doc(storyId)
      .get();

    if (!record.exists) {
      //console.log("No existing record found, creating new record");
      await db
        .collection("users")
        .doc(req.session?.user.id as string)
        .collection("stories-records")
        .doc(storyId)
        .set({
          id: storyId,
          rated: 0,
          scores: 0,
          title: storyDoc.data()?.title,
          status: QuizStatus.READ,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          level: req.session?.user.level,
        });
    }

    //console.log("Fetching chapter tracking data");
    const chapterTrackingRef = await db
      .collection("users")
      .doc(userId)
      .collection("stories-records")
      .doc(storyId)
      .collection("chapter-tracking")
      .get();

    const storyData = storyDoc.data();
    if (!storyData) {
      console.log("Story data not found");
      return NextResponse.json(
        { message: "Story data not found", result: null },
        { status: 404 }
      );
    }

    const chapters = storyData.chapters || [];
    //console.log(`Processing ${chapters.length} chapters`);

    for (let i = 0; i < chapters.length; i++) {
      const chapterNumber = i + 1;
      const doc = chapterTrackingRef.docs.find(
        (doc) => doc.id === chapterNumber.toString()
      );
      if (doc) {
        chapters[i].is_read = true;
        //console.log(`Chapter ${chapterNumber} marked as read`);
      }
    }

    storyData.chapters = chapters;

    //console.log("Returning story data");
    return NextResponse.json({
      result: {
        id: storyDoc.id,
        ...storyData,
      },
    });
  } catch (error) {
    console.error("Error getting story", error);
    return NextResponse.json(
      { message: "Internal server error", error },
      { status: 500 }
    );
  }
}

export async function getChapter(
  req: ExtendedNextRequest,
  ctx: RequestContext
) {
  const { storyId, chapterNumber } = ctx.params;
  const userId = req.session?.user.id as string;

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

    const record = await db
      .collection("users")
      .doc(userId)
      .collection("stories-records")
      .doc(storyId)
      .collection(`chapter-tracking`)
      .doc(`${chapterNumber}`)
      .get();

    if (!record.exists) {
      await db
        .collection("users")
        .doc(req.session?.user.id as string)
        .collection("stories-records")
        .doc(storyId)
        .collection(`chapter-tracking`)
        .doc(`${chapterNumber}`)
        .set({
          id: storyId,
          rated: 0,
          scores: 0,
          title: storyDoc.data()?.title,
          status: QuizStatus.READ,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          level: req.session?.user.level,
        });
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
