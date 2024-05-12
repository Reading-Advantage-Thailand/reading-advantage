import db from "@/configs/firestore-config";
import { ExtendedNextRequest } from "@/utils/middleware";
import { NextResponse } from "next/server";
import { query, orderBy, startAt, getDocs, where, limit } from "firebase/firestore";
import { parse } from "path";

interface RequestContext {
    params: {
        user_id: string;
    };
}

export async function getUserRecords(
    req: ExtendedNextRequest,
    { params: { user_id } }: RequestContext
) {
    try {
        const limit = req.nextUrl.searchParams.get("limit") || 10;
        const nextPage = req.nextUrl.searchParams.get("nextPage");

        const records = await db
            .collection("users")
            .doc(user_id)
            .collection("article-records")
            .orderBy("created_at", "desc")
            .get();

        const results = records.docs.map((doc) => {
            return {
                id: doc.id,
                ...doc.data(),
            };
        });

        return NextResponse.json({
            results,
        });
    } catch (error) {
        console.log("Error getting documents", error);
        return NextResponse.json(
            { message: "Internal server error", results: [] },
            { status: 500 }
        );
    }
}

export async function getUserHeatmap(
    req: ExtendedNextRequest,
    { params: { user_id } }: RequestContext
) {
    try {
        const records = await db
            .collection("users")
            .doc(user_id)
            .collection("article-records")
            .doc('heatmap')
            .get();

        const results = records.data();

        return NextResponse.json({
            results,
        });
    } catch (error) {
        console.log("Error getting documents", error);
        return NextResponse.json(
            { message: "Internal server error", results: [] },
            { status: 500 }
        );
    }
}