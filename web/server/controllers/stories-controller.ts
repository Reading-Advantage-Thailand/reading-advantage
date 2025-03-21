import { NextRequest, NextResponse } from "next/server";
import db from "@/configs/firestore-config";

export async function getAllStories(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storyId = searchParams.get("storyId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const genre = searchParams.get("genre") || null;
    const subgenre = searchParams.get("subgenre") || null;

    console.log("Received Params:", { storyId, page, limit, genre, subgenre });

    if (storyId) {
      // ดึงข้อมูลตาม storyId
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
        { message: "Invalid pagination parameters", results: [] },
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

    console.log(`Returning ${results.length} stories`);

    return NextResponse.json({
      params: { genre, subgenre, page, limit },
      results,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error getting stories", error);
    return NextResponse.json(
      { message: "Internal server error", results: [], error },
      { status: 500 }
    );
  }
}
