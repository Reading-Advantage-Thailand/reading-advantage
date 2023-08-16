import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import db from "@configs/firebaseConfig";
import { getToken } from "next-auth/jwt"
import { get } from "http";

// record-article route
export async function POST(req: NextRequest) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        const { id, username, email } = token;
        // Access request body
        const { articleId, newLevel } = await req.json();
        console.log('articleId', articleId);

        // Create user article record
        const userArticleRecordRef = await db.collection("user-article-records").add({
            userId: id,
            articleId,
            level: newLevel,
            createdAt: new Date(),
        });

        // Update user level
        const userRef = db.collection("users").doc(id as string);

        await userRef.update({
            level: newLevel
        });

        // Create response
        const response = NextResponse.json({
            message: "User article record created",
            success: true,
        });

        return response;

    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({
            status: "error",
            message: "Something went wrong",
        }, { status: 500 });
    }
}