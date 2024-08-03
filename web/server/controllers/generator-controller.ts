import { NextRequest, NextResponse } from "next/server";
import { sendDiscordWebhook } from "../utils/send-discord-webhook";
import { ArticleBaseCefrLevel, ArticleType } from "../models/enum";
import { randomSelectGenre } from "../utils/generators/random-select-genre";
import { generateTopic } from "../utils/generators/topic-generator";
import { generateArticle } from "../utils/generators/article-generator";
import { evaluateRating } from "../utils/generators/evaluate-rating-generator";
import { generateMCQuestion } from "../utils/generators/mc-question-generator";
import { generateSAQuestion } from "../utils/generators/sa-question-generator";
import { generateLAQuestion } from "../utils/generators/la-question-generator";
import { calculateLevel } from "@/lib/calculateLevel";
import db from "@/configs/firestore-config";
import { generateAudio } from "../utils/generators/audio-generator";
import { generateImage } from "../utils/generators/image-generator";

async function generateByGenre(
    type: ArticleType,
    amountPerGenre: number
): Promise<unknown[]> {
    console.log(`starting generation for ${type}...`);
    const randomGenre = await randomSelectGenre({ type });

    const generatedTopic = await generateTopic({
        type: type,
        genre: randomGenre.genre,
        subgenre: randomGenre.subgenre,
        amountPerGenre: amountPerGenre,
    });

    // Process each topic and wait for all tasks to complete
    const queue = generatedTopic.topics.flatMap((topic) => [
        processQueue(
            type,
            randomGenre.genre,
            randomGenre.subgenre,
            topic,
            ArticleBaseCefrLevel.A1
        ),
        processQueue(
            type,
            randomGenre.genre,
            randomGenre.subgenre,
            topic,
            ArticleBaseCefrLevel.A2
        ),
        processQueue(
            type,
            randomGenre.genre,
            randomGenre.subgenre,
            topic,
            ArticleBaseCefrLevel.B1
        ),
        processQueue(
            type,
            randomGenre.genre,
            randomGenre.subgenre,
            topic,
            ArticleBaseCefrLevel.B2
        ),
        processQueue(
            type,
            randomGenre.genre,
            randomGenre.subgenre,
            topic,
            ArticleBaseCefrLevel.C1
        ),
        processQueue(
            type,
            randomGenre.genre,
            randomGenre.subgenre,
            topic,
            ArticleBaseCefrLevel.C2
        ),
    ]);

    return await Promise.allSettled(queue);
}

async function evaluateArticle(
    type: ArticleType,
    genre: string,
    subgenre: string,
    topic: string,
    cefrLevel: ArticleBaseCefrLevel,
    maxAttempts: number = 2
) {
    let attempts = 0;
    let generatedArticle;

    while (attempts < maxAttempts) {
        generatedArticle = await generateArticle({
            type,
            genre,
            subgenre,
            topic,
            cefrLevel,
        });

        const evaluatedRating = await evaluateRating({
            type,
            genre,
            subgenre,
            cefrLevel,
            title: generatedArticle.title,
            summary: generatedArticle.summary,
            passage: generatedArticle.passage,
            image_description: generatedArticle.imageDesc,
        });
        console.log(`${cefrLevel} evaluated rating: ${evaluatedRating.rating}`);

        if (evaluatedRating.rating > 2) {
            return { article: generatedArticle, rating: evaluatedRating.rating };
        }

        attempts++;
        console.log(`Failed to evaluate rating: ${evaluatedRating.rating}`);
        console.log(`Regenerating article... Attempt (${attempts}/${maxAttempts})`);
    }

    throw `failed to generate article after ${maxAttempts} attempts (low rating)`;
}

async function processQueue(
    type: ArticleType,
    genre: string,
    subgenre: string,
    topic: string,
    cefrLevel: ArticleBaseCefrLevel
): Promise<void> {
    const { article: generatedArticle, rating } = await evaluateArticle(
        type,
        genre,
        subgenre,
        topic,
        cefrLevel
    );

    const mcq = await generateMCQuestion({
        type,
        cefrlevel: cefrLevel,
        passage: generatedArticle.passage,
        title: generatedArticle.title,
        summary: generatedArticle.summary,
        imageDesc: generatedArticle.imageDesc,
    });
    const saq = await generateSAQuestion({
        type,
        cefrlevel: cefrLevel,
        passage: generatedArticle.passage,
        title: generatedArticle.title,
        summary: generatedArticle.summary,
        imageDesc: generatedArticle.imageDesc,
    });
    const laq = await generateLAQuestion({
        type,
        cefrlevel: cefrLevel,
        passage: generatedArticle.passage,
        title: generatedArticle.title,
        summary: generatedArticle.summary,
        imageDesc: generatedArticle.imageDesc,
    });

    const { cefrLevel: calculatedCefrLevel, raLevel } = calculateLevel(
        generatedArticle.passage
    );

    const articleRef = db.collection("new-articles").doc();
    const articleDoc = await articleRef.set({
        average_rating: rating,
        cefr_level: calculatedCefrLevel,
        created_at: new Date().toISOString(),
        genre,
        image_description: generatedArticle.imageDesc,
        passage: generatedArticle.passage,
        ra_level: raLevel,
        read_count: 0,
        subgenre,
        summary: generatedArticle.summary,
        title: generatedArticle.title,
        type,
        id: articleRef.id,
    });

    await Promise.allSettled([
        ...mcq.questions.map((question) =>
            db
                .collection("new-articles")
                .doc(articleRef.id)
                .collection("mc-questions")
                .add(question)
        ),
        ...saq.questions.map((question) =>
            db
                .collection("new-articles")
                .doc(articleRef.id)
                .collection("sa-questions")
                .add(question)
        ),
        db
            .collection("new-articles")
            .doc(articleRef.id)
            .collection("la-questions")
            .add(laq),
    ]);

    await generateAudio({
        passage: generatedArticle.passage,
        articleId: articleRef.id,
    });

    await generateImage({
        imageDesc: generatedArticle.imageDesc,
        articleId: articleRef.id,
    });
}

// Generate article queue
export async function generateArticleQueue(
    req: NextRequest,
    params: unknown,
    next: () => void
) {
    try {
        const { amountPerGenre } = await req.json();
        if (!amountPerGenre) {
            return NextResponse.json(
                { message: "Could not generate queue: amountPerGenre is required" },
                { status: 400 }
            );
        }

        const timeTaken = Date.now();
        const userAgent = req.headers.get("user-agent") || "";
        const reqUrl = req.url;
        const amount = parseInt(amountPerGenre);

        await sendDiscordWebhook({
            title: "Queue Generated",
            embeds: [
                {
                    description: {
                        "amount per genre": amountPerGenre,
                        total: `${amount * 6 * 2}`,
                    },
                    color: 0x00ff00,
                },
            ],
            reqUrl,
            userAgent,
        });

        const fictionQueue = await generateByGenre(ArticleType.FICTION, amount);
        const nonFictionQueue = await generateByGenre(
            ArticleType.NONFICTION,
            amount
        );

        const combinedQueue = [...fictionQueue, ...nonFictionQueue];

        const failedResults = combinedQueue.filter(
            (result: any) => result.status === "rejected"
        );
        const successResults = combinedQueue.filter(
            (result: any) => result.status === "fulfilled"
        );
        const failedReasons = failedResults.map((result: any) => result.reason);
        const failedCount = failedResults.length;

        const timeTakenMinutes = (Date.now() - timeTaken) / 1000 / 60;

        await sendDiscordWebhook({
            title: "Queue Generation Complete",
            embeds: [
                {
                    description: {
                        "amount per genre": amountPerGenre,
                        "total": `${amount * 6 * 2}`,
                        "failed count": `${failedCount}`,
                        "success count": `${successResults.length} articles`,
                        "time taken": `${timeTakenMinutes.toFixed(2)} minutes\n`,
                        "failed reasons": failedCount ? "\n" + failedReasons.join("\n") : "none",
                    },
                    color: 0xffff00,
                },
            ],
            reqUrl,
            userAgent,
        });

        return NextResponse.json({
            message: "Queue generation complete",
            total: amount * 6 * 2,
            failedCount,
            timeTaken: timeTakenMinutes,
            results: combinedQueue,
        });
    } catch (error) {
        await sendDiscordWebhook({
            title: "Queue Generation Failed",
            embeds: [
                {
                    description: {
                        error: `${error}`,
                    },
                    color: 0xff0000,
                },
            ],
            reqUrl: "unknown",
            userAgent: "unknown",
        });
        return NextResponse.json({ message: error }, { status: 500 });
    }
}
