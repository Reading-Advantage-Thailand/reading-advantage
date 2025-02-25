import { NextRequest, NextResponse } from "next/server";
import db from "@/configs/firestore-config";

export async function getAllStories(req: NextRequest) {
    try {
      const users = await db.collection("stories").get();
      const results = users.docs.map((doc) => {
        return {
          id: doc.id,
          ...doc.data(),
        };
      });
  
      return NextResponse.json({
        results,
      });
    } catch (error) {
      console.error("Error getting documents", error);
      return NextResponse.json(
        { message: "Internal server error", results: [] },
        { status: 500 }
      );
    }
  }
  