import { NextRequest, NextResponse } from "next/server";
import db from "@/configs/firestore-config";

export async function getAllStories(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const genre = searchParams.get("genre") || null;
    const subgenre = searchParams.get("subgenre") || null;

    console.log("Received Params:", { page, limit, genre, subgenre });

    if (page < 1 || limit < 1) {
      return NextResponse.json(
        { message: "Invalid pagination parameters", results: [] },
        { status: 400 }
      );
    }

    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection("stories");

    if (genre) {
      console.log(`Filtering by genre: ${genre}`);
      query = query.where("genre", "==", genre);
    }
    if (subgenre) {
      console.log(`Filtering by subgenre: ${subgenre}`);
      query = query.where("subgenre", "==", subgenre);
    }

    if (!genre && !subgenre) {
      query = query.orderBy("createdAt", "desc");
    }

    // 🎯 Fetch genres จาก Firestore
    const fetchGenres = async () => {
      const collectionRef = db.collection("genres-fiction");
      const querySnapshot = await collectionRef.get();
      return querySnapshot.docs.map((doc) => doc.data().name);
    };

    const selectionGenres = await fetchGenres();

    const totalSnapshot = await query.get();
    const total = totalSnapshot.docs.length;

    let snapshot;
    if (page === 1) {
      snapshot = await query.limit(limit).get();
    } else {
      const previousSnapshot = await query.limit((page - 1) * limit).get();
      const lastVisible = previousSnapshot.docs[previousSnapshot.docs.length - 1];

      if (lastVisible) {
        snapshot = await query.startAfter(lastVisible).limit(limit).get();
      } else {
        snapshot = await query.limit(limit).get();
      }
    }

    const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    console.log(`Returning ${results.length} stories`);

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
      { message: "Internal server error", results: [], error },
      { status: 500 }
    );
  }
}
