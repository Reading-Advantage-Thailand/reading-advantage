// api/articles/levels/[level]/types/[type]/genres/[genre]

import db from "@configs/firebaseConfig";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
    const level = parseInt(params.level);
    const type = params.type;
    const genre = params.genre.replace(/-/g, ' ');
    console.log('genre', genre);
    console.log('type', type);
    console.log('level', level);

    try {
        const data: FirebaseFirestore.DocumentData[] = [];
        //find level +/- 2 from article level
        const typesSnapshot = await db.collection('articles')
            .where('raLevel', '>=', level - 2)
            .where('raLevel', '<=', level + 2)
            .where('type', '==', type)
            .where('genre', '==', genre)
            .get();
        // Iterate through the snapshot and add unique genres to the data array
        typesSnapshot.forEach((doc) => {
            const subGenre = doc.data().subGenre;
            if (!data.includes(subGenre)) {
                data.push(subGenre);
            }
        });

        return NextResponse.json({
            status: 'success',
            result: data.length,
            data: {
                subGenres: data,
            }
        });

    } catch (error) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
        });
    }
};