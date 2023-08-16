import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import db from "@configs/firebaseConfig";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest, res: NextResponse) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        const { id, username, email } = token;

        // Get articles
        const articlesRef = db.collection("user-article-records")
            .where("userId", "==", id)
            .orderBy("createdAt", "desc")
            .limit(10);
        const articlesSnapshot = await articlesRef.get();
        const articles = articlesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        const response = NextResponse.json({
            message: "User articles retrieved",
            success: true,
            articles,
        });

        // Create response
        return response;

    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({
            status: "error",
            message: "Something went wrong",
        }, { status: 500 });
    }
}