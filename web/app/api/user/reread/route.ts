// After student reads five articles, 
// some low - rated articles are offered on the Article choice page.
// "You might want to try reading one of these articles again to see if you've improved."

import db from "@configs/firebaseConfig";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { sub, username, email } = token;
    const userArticleRecordsSnapshot = await db.collection('user-article-records')
        .where('userId', '==', sub)
        .where('rating', '<=', 2)
        .get();

    const userArticleRecords = userArticleRecordsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));

    console.log('userArticleRecords', userArticleRecords);
    return NextResponse.json({
        status: 'success',
        result: userArticleRecords.length,
        data: {
            userArticleRecords,
        }
    });
}
