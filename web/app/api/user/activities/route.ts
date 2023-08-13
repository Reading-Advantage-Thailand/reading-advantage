import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import db from "@configs/firebaseConfig";

export async function GET(req: NextRequest, res: NextResponse) {
    try {
        const token = req.cookies.get("token")?.value || "";
        // Verify the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
        if (!decodedToken) {
            return NextResponse.redirect(new URL("/auth", req.nextUrl));
        }
        // Access user data from decoded token
        const { id, username, email, level } = decodedToken;

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

        response.cookies.set('level', level, {
            secure: true,
            httpOnly: true,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiry
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