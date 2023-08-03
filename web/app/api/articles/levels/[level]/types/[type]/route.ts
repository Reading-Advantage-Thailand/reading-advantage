// api/articles/levels/[level]/types/[type]

import db from "@configs/firebaseConfig";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
    const level = parseInt(params.level);
    const type = params.type;
    try {
        const data: FirebaseFirestore.DocumentData[] = [];
        //find level +/- 2 from article level
        const typesSnapshot = await db.collection('articles')
            .where('raLevel', '>=', level - 2)
            .where('raLevel', '<=', level + 2)
            .where('type', '==', type)
            .get();
        // Iterate through the snapshot and add unique genres to the data array
        typesSnapshot.forEach((doc) => {
            const genre = doc.data().genre;
            if (!data.includes(genre)) {
                data.push(genre);
            }
        });

        return NextResponse.json({
            status: 'success',
            result: data.length,
            data: {
                genres: data,
            }
        });

    } catch (error) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
        });
    }
};