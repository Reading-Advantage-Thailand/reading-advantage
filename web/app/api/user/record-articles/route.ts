import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import db from "@configs/firebaseConfig";
import { getToken } from "next-auth/jwt"
import { get } from "http";

// record-article route
export async function POST(req: NextRequest) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        const { sub, username, email } = token;
        // Access request body
        const { articleId, newLevel, rating, title } = await req.json();
        console.log('articleId', articleId);

        // Create user article record
        const userArticleRecordRef = await db.collection("user-article-records").add({
            userId: sub,
            articleId,
            level: newLevel,
            rating,
            title,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Update user level
        const userRef = db.collection("users").doc(sub as string);

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

// update reread 
export async function PUT(req: NextRequest) {
    try {
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        const { sub, username, email } = token;
        // Access request body
        const { articleId, newLevel, rating, title } = await req.json();
        console.log('articleId', articleId);

        // Update rating
        const userArticleRecordRef = db.collection("user-article-records")
            .where("userId", "==", sub)
            .where("articleId", "==", articleId)
            .limit(1);

        const userArticleRecordSnapshot = await userArticleRecordRef.get();

        if (userArticleRecordSnapshot.empty) {
            return NextResponse.json({
                message: "Article record not found",
                success: false,
            }, { status: 400 });
        }

        const userArticleRecord = userArticleRecordSnapshot.docs[0];
        const userArticleRecordId = userArticleRecord.id;

        await userArticleRecord.ref.update({
            level: newLevel,
            rating,
            updatedAt: new Date(),
        });

        // Update user level
        const userRef = db.collection("users").doc(sub as string);

        await userRef.update({
            level: newLevel
        });

        // Create response
        const response = NextResponse.json({
            message: "User article record updated",
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