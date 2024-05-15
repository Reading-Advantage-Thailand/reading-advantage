import { NextRequest, NextResponse } from "next/server";
import db from "@/configs/firestore-config";
import { ExtendedNextRequest } from "@/utils/middleware";
import { Article } from "@/components/models/article-model";
import { QuizStatus } from "@/components/models/questions-model";

// GET search articles
// GET /api/v1/articles?level=10&type=fiction&genre=Fantasy
export async function getSearchArticles(req: ExtendedNextRequest) {
    try {
        const userId = req.session?.user.id;
        const level = req.session?.user.level.toString();
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
            const userId = req.session?.user.id as string;
            const snapshot = await data
                .collection("subgenres")
                .doc(subgenre)
                .collection("articles")
                .get();

            for (const doc of snapshot.docs) {
                const articleRecord = await db
                    .collection("users")
                    .doc(userId)
                    .collection("article-records")
                    .doc(doc.id)
                    .get();
                // If already read, add is_read field to the article
                if (articleRecord.exists) {
                    results.push({ ...doc.data(), is_read: true });
                } else {
                    results.push(doc.data());
                }
            }

            // Check 
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
            { message: "Internal server error", results: [] },
            { status: 500 }
        );
    }
}

// GET article by id
// GET /api/v1/articles/[id]
interface RequestContext {
    params: {
        article_id: string;
    };
}
export async function getArticle(
    req: ExtendedNextRequest,
    { params: { article_id } }: RequestContext
) {
    try {
        const resp = await db.collection("new-articles").doc(article_id).get();

        // Check if user has read the article
        if (!resp.exists) {
            return NextResponse.json(
                { message: "Article not found" },
                { status: 404 }
            );
        }

        // Check if user has read the article
        const record = await db
            .collection("users")
            .doc(req.session?.user.id as string)
            .collection("article-records")
            .doc(article_id)
            .get()

        if (!record.exists) {
            await db
                .collection("users")
                .doc(req.session?.user.id as string)
                .collection("article-records")
                .doc(article_id)
                .set({
                    id: article_id,
                    rated: 0,
                    scores: 0,
                    title: resp.data()?.title,
                    status: QuizStatus.READED,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                });
        }

        const article = resp.data() as Article;

        if (
            !article ||
            !article.summary ||
            !article.image_description ||
            !article.passage ||
            !article.created_at ||
            (article.average_rating !== 0 && !article.average_rating) ||
            !article.timepoints ||
            !article.type ||
            !article.title ||
            !article.cefr_level ||
            (article.thread_id !== "" && !article.thread_id) ||
            !article.ra_level ||
            !article.subgenre ||
            !article.genre ||
            !article.id ||
            (article.read_count !== 0 && !article.read_count)
        ) {
            return NextResponse.json(
                {
                    message: "Article fields are not correct",
                    invalids: {
                        summary: !article.summary,
                        image_description: !article.image_description,
                        passage: !article.passage,
                        created_at: !article.created_at,
                        average_rating: !article.average_rating,
                        timepoints: !article.timepoints,
                        type: !article.type,
                        title: !article.title,
                        cefr_level: !article.cefr_level,
                        thread_id: article.thread_id !== "" && !article.thread_id,
                        ra_level: !article.ra_level,
                        subgenre: !article.subgenre,
                        genre: !article.genre,
                        id: !article.id,
                        read_count: article.read_count !== 0 && !article.read_count,
                    },
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            article,
        });
    } catch (err) {
        console.log("Error getting documents", err);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
