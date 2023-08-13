import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import db from "@configs/firebaseConfig";

// record-article route
export async function POST(req: NextRequest) {
    try {
        // Extract token from cookies
        const token = req.cookies.get("token")?.value || "";
        // Verify the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
        // Access user data from decoded token
        const { id, username, email } = decodedToken;
        console.log('decodedToken', decodedToken);
        // Access request body
        const { articleId, newLevel } = await req.json();

        // Create user article record
        const userArticleRecordRef = await db.collection("user-article-records").add({
            userId: id,
            articleId,
            level: newLevel,
            createdAt: new Date(),
        });

        // Update user level
        const userRef = db.collection("users").doc(id);
        const userSnapshot = await userRef.get();
        const user = userSnapshot.data();
        const userLevel = user?.level || 0;
        await userRef.update({
            level: newLevel
        });

        // Create response
        const response = NextResponse.json({
            message: "User article record created",
            success: true,
            record: {
                id: userArticleRecordRef.id,
                userId: id,
                articleId,
                level: userLevel, // oldLevel
                newLevel, // newLevel
                createdAt: new Date(),
            },
        });

        response.cookies.set('level', newLevel, {
            secure: true,
            httpOnly: true,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiry
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