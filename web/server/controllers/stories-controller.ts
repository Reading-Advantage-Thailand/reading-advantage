import { NextRequest, NextResponse } from "next/server";
import db from "@/configs/firestore-config";

export async function getAllStories(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const type = searchParams.get("type") || null;
    const genre = searchParams.get("genre") || null;
    const subgenre = searchParams.get("subgenre") || null;
    let selectionType: any[] = ["fiction", "nonfiction"];

    if (page < 1 || limit < 1) {
      return NextResponse.json(
        { message: "Invalid pagination parameters", results: [] },
        { status: 400 }
      );
    }

    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db
      .collection("stories")
      .orderBy("createdAt", "desc");

    if (type) {
      query = query.where("type", "==", type);
    }
    if (genre) {
      query = query.where("genre", "==", genre);
    }
    if (subgenre) {
      query = query.where("subgenre", "==", subgenre);
    }

    const fetchGenres = async (type: string, genre?: string | null) => {
      const collectionName =
        type === "fiction" ? "genres-fiction" : "genres-nonfiction";
      const collectionRef = db.collection(collectionName);

      const querySnapshot = await collectionRef.get();
      const allGenres = querySnapshot.docs.map((doc) => doc.data());

      if (genre) {
        const genreData = allGenres.find((data) => data.name === genre);
        if (genreData) {
          return genreData.subgenres;
        }
      }

      return allGenres.map((data) => data.name);
    };

    if (!type) {
      selectionType = ["fiction", "nonfiction"];
    } else if (type && !genre) {
      selectionType = await fetchGenres(type);
    } else if (type && genre) {
      selectionType = await fetchGenres(type, genre);
    }

    const totalSnapshot = await db.collection("stories").get();
    const total = totalSnapshot.docs.length;

    let snapshot;
    if (page === 1) {
      snapshot = await query.limit(limit).get();
    } else {
      const previousSnapshot = await query.limit((page - 1) * limit).get();
      const lastVisible =
        previousSnapshot.docs[previousSnapshot.docs.length - 1];

      if (lastVisible) {
        snapshot = await query.startAfter(lastVisible).limit(limit).get();
      } else {
        snapshot = await query.limit(limit).get();
      }
    }

    const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({
      params: { type, genre, subgenre, page, limit },
      results,
      selectionType,
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
