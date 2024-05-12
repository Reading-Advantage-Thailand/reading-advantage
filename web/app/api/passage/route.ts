import { NextRequest, NextResponse } from "next/server";
import db from "@/configs/firestore-config";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

// GET /api/v1/articles?level=10&type=fiction&genre=Fantasy
export async function getSearchArticles(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        // if (session.user.role.includes("TEACHER")) {
        //     const articles = await db.collection("articles_new").get();
        //     console.log('articles', articles.docs.map(doc => doc.data()));
        //        return NextResponse.json({
        //            articles: articles.docs.map(doc => doc.data()),
        //        });
        //    }
        
 
        const level = session.user.level.toString();
        const type = req.nextUrl.searchParams.get("type");
        const genre = req.nextUrl.searchParams.get("genre");
        const subgenre = req.nextUrl.searchParams.get("subgenre");

        if (!level) {
            return NextResponse.json(
                { message: "Level is required" },
                { status: 400 }
            );
        }
    
        let data = db.collection("levels-test").doc(level);
    
        if (type) {
            data = data.collection("types").doc(type);
        }
        if (genre) {
            data = data.collection("genres").doc(genre);
        }
    
        let results: any[] = [];
        if (subgenre) {
            const snapshot = await data
                .collection("subgenres")
                .doc(subgenre)
                .collection("articles")
                .get();
            snapshot.forEach((doc) => {
                results.push(doc.data());
            });
    
            // Check if user has read the article
            for (let i = 0; i < results.length; i++) {
                const articleRecord = await db
                    .collection("user-article-records")
                    .doc(`${session.user.id}-${results[i].id}`)
                    .get();
                results[i].is_read = articleRecord.exists;
            }
        } else {
            const snapshot = await data.get();
            results = Object.entries(snapshot.data() as any).map(
                ([key, value]) => key
            );
        }
    
        return NextResponse.json({
            params: {
                level,
                type,
                genre,
                subgenre,
            },
            results,
        });
    } catch (err) {
        console.log("Error getting documents", err);
        return NextResponse.json(
            { message: `Error getting documents: ${err}`, results: [] },
            { status: 500 }
        );
    }
}
