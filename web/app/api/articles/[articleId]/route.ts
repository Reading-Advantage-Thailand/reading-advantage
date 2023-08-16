import db from "@configs/firebaseConfig";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
    const articleId = params.articleId;

    try {
        // Use the articleId as the document ID to fetch the article
        const articleSnapshot = await db.collection('articles').doc(articleId).get();

        // Check if the article exists
        if (!articleSnapshot.exists) {
            return NextResponse.json({
                status: 'error',
                message: 'Article not found',
            });
        }

        const article = articleSnapshot.data();
        console.log('article', article);

        return NextResponse.json({
            status: 'success',
            data: {
                article,
            },
        });
    } catch (error) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
        });
    }
}
