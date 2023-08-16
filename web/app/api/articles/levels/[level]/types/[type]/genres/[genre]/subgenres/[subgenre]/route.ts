// api/articles/levels/[level]/types/[type]/genres/[genre]/subgenres/[subgenre]

import db from "@configs/firebaseConfig";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
    const level = parseInt(params.level);
    const type = params.type;
    const genre = params.genre.replace(/-/g, ' ');
    const subgenre = params.subgenre.replace(/-/g, ' ');

    try {
        const data: FirebaseFirestore.DocumentData[] = [];

        //find level +/- 2 from article level
        const articlesSnapshot = await db.collection('articles')
            .where('raLevel', '>=', level - 2)
            .where('raLevel', '<=', level + 2)
            .where('type', '==', type)
            .where('genre', '==', genre)
            .where('subGenre', '==', subgenre)
            .get();

        //random article from snapshot and get only 1 article
        const randomArticle = Math.floor(Math.random() * articlesSnapshot.size);
        const article = articlesSnapshot.docs[randomArticle].data();


        return NextResponse.json({
            status: 'success',
            result: data.length,
            data: {
                article: {
                    id: articlesSnapshot.docs[randomArticle].id,
                    ...article,
                },
            }
        });

    } catch (error) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
        });
    }
};