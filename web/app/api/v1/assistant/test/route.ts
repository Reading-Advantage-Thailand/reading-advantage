import { logRequest, protect, restrictAccess } from "@/utils/middleware";
import uploadToBucket from "@/utils/uploadToBucket";
import axios from "axios";
import { createEdgeRouter } from "next-connect";
import { NextResponse, type NextRequest } from "next/server";
import fs from "fs";
import openaiUtils from "@/utils/openai";
import db from "@/configs/firestore-config";
import storage from "@/utils/storage";
import { retry } from "@/utils/retry";
import { generateMC, generateSA, generateLA, generateImage, generateAudio, test } from "@/controllers/assistant-controller";
import { run } from "node:test";

// Constants
const AUDIO_URL = "tts";
const IMAGE_URL = "images";

// Type definitions
interface ArticleData {
    cefr_level?: string;
    type?: string;
    genre?: string;
    subgenre?: string;
    passage?: string;
    title?: string;
    summary?: string;
    image_description?: string;
    id?: string;
}

interface MediaGenerateFunction {
    (articleId: string): Promise<void>;
}

export interface ValidationResponse {
    id: string;
    task: string;
    status: string;
    errorMessage?: string;
}

interface RequestContext {
    params: {
        article_id: string;
    };
}

const router = createEdgeRouter<NextRequest, RequestContext>();

router.use(logRequest);
router.use(restrictAccess);

router.post(async (req: NextRequest, context: RequestContext) => {
    let { ids, filterDate, runToday, }: {
        ids: string[];
        filterDate: string;
        runToday: boolean;
    } = await req.json();

    if (!filterDate && runToday) {
        const today = new Date();
        filterDate = today.toISOString().split('T')[0];
    }

    if (!filterDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return NextResponse.json(
            { error: "Invalid date format (YYYY-MM-DD)" },
            { status: 400 }
        );
    }

    const payload1 = {
        embeds: [
            {
                title: "Validation (beta mode)",
                description: `**status**: starting validation\n**triggered at**: <t:${Math.floor(Date.now() / 1000)}:R>\n**url**: ${req.url}\n**date**: ${filterDate}`,
                color: 16711680,
            },
        ],
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL || '';

    await axios.post(webhookUrl, payload1);

    if (!ids && filterDate) {
        const startDate = new Date(filterDate);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);

        const isoStartDate = startDate.toISOString();
        const isoEndDate = endDate.toISOString();

        // Query database for articles within date range
        const query = db
            .collection("new-articles")
            .where("created_at", ">=", isoStartDate)
            .where("created_at", "<", isoEndDate);
        const snapshot = await query.get();
        console.log("total article: ", snapshot.docs.length);

        // Validate articles
        const validators = snapshot.docs.map((doc) => validator(doc.id));
        const results = await Promise.all(validators);

        // count successful results
        const passedResults = results.filter((result) => result.validation.every((validation) => validation.status === "pass"));
        const regeneratedResults = results.filter((result) => result.validation.some((validation) => validation.status === "regenerated"));
        const failedResults = results.filter((result) => result.validation.some((validation) => validation.status === "failed"));

        const userAgents = req.headers.get("user-agent") || '';

        let embeds = {
            "status": "completed validation",
            "triggered at": `<t:${Math.floor(Date.now() / 1000)}:R>`,
            "user-agent": userAgents,
            "url": req.url,
            "date": filterDate,
            "total": snapshot.docs.length,
            "passed": passedResults.length,
            "regenerated": regeneratedResults.length,
            "failed": failedResults.length + "\n",
        } as any;

        if (regeneratedResults.length > 0) {
            embeds = {
                ...embeds,
                "regenerated details": "\n" + regeneratedResults.flatMap((result) =>
                    result.validation.filter((validation) => validation.status === "regenerated").map((validation) =>
                        `**id**: *${validation.id}*, **task**: *${validation.task}*, **status**: *${validation.status}*`
                    )
                ).join("\n")
            };
        }

        if (failedResults.length > 0) {
            embeds = {
                ...embeds,
                "failed details": "\n" + failedResults.flatMap((result) =>
                    result.validation.map((validation) =>
                        `**id**: *${validation.id}*, **task**: *${validation.task}*, **code**: *${validation.errorMessage}*`
                    )
                ).join("\n")
            };
        }

        const embedsText = Object.entries(embeds).map(([key, value]) => `**${key}**: ${value}`).join('\n');
        const payload = {
            embeds: [
                {
                    title: "Validation Results (beta mode)",
                    description: embedsText,
                    color: 16711680,
                },
            ],
        };

        await axios.post(webhookUrl, payload);

        return NextResponse.json({
            total: snapshot.docs.length,
            success: passedResults.length,
            failed: failedResults.length,
            details: results
        }, { status: 200 });
    } else if (ids) {
        // Validate articles by ids
        const validate = await Promise.all(ids.map((id) => validator(id)));

        // Count validation results
        const countAllPass = validate.filter((val) =>
            val.validation.every((v: ValidationResponse) => v.status === "pass")
        ).length;
        const countAllFail = validate.filter((val) =>
            val.validation.some((v: ValidationResponse) => v.status === "regenerated")
        ).length;

        return NextResponse.json(
            {
                length: ids.length,
                count_all_pass: countAllPass,
                count_all_fail: countAllFail,
                validate,
            },
            { status: 200 }
        );
    } else {
        return NextResponse.json(
            { error: "No valid input provided" },
            { status: 400 }
        );
    }
});

async function regenerateImage(imageDesc: string, articleId: string): Promise<{ id: string, task: string, status: string }> {
    try {
        const generate = async () => {
            const response = await openaiUtils.images.generate({
                model: "dall-e-3",
                n: 1,
                prompt: imageDesc,
                size: "1024x1024",
            });

            const image = await axios.get(response.data[0].url as string, {
                responseType: "arraybuffer",
            });

            const localPath = `${process.cwd()}/data/images/${articleId}.png`;
            fs.writeFileSync(localPath, image.data);

            await uploadToBucket(localPath, `${IMAGE_URL}/${articleId}.png`);
        };

        const fileExtension = ".png";
        const bucket = storage.bucket('artifacts.reading-advantage.appspot.com');

        const fileExists = await bucket.file(`${IMAGE_URL}/${articleId}${fileExtension}`).exists();
        if (!fileExists[0]) {
            await generate();
            return { id: articleId, task: "image", status: "regenerated" };
        } else {
            return { id: articleId, task: "image", status: "pass" };
        }
    } catch (error: any) {
        error.id = articleId;
        error.message = error.code;
        error.task = "image";
        throw error;
    }
}

async function validator(articleId: string): Promise<{ id: string, validation: ValidationResponse[] }> {
    const articleDoc = await db.collection("new-articles").doc(articleId).get();
    if (!articleDoc.exists) {
        throw new Error(`article ${articleId} not found in Firestore`);
    }

    const articleData = articleDoc.data() as ArticleData;

    if (!articleData.id) {
        // Set article id
        console.log(`Setting article id for article ${articleId}`);
        db.collection("new-articles").doc(articleId).set({ id: articleId }, { merge: true });
    }

    try {
        const resp = await Promise.all([
            regenerateQuestions(articleId, "mc-questions", generateMC, articleData),
            regenerateQuestions(articleId, "sa-questions", generateSA, articleData),
            regenerateQuestions(articleId, "la-questions", generateLA, articleData),
            regenerateImage(articleData.image_description!, articleId),
            regenerateAudio(articleData.passage!, articleId),
        ]);

        return {
            id: articleId,
            validation: resp,
        };
    } catch (error: any) {
        return { id: articleId, validation: [{ id: articleId, task: error.task, status: "failed", errorMessage: error.message }] };
    }
}

async function regenerateAudio(passage: string, articleId: string): Promise<{ id: string, task: string, status: string }> {
    try {
        const fileExtention = ".mp3";
        const fileExists1 = await storage.bucket('artifacts.reading-advantage.appspot.com').file(`${AUDIO_URL}/${articleId}${fileExtention}`).exists();
        const fileExists2 = await storage.bucket('artifacts.reading-advantage.appspot.com').file(`${AUDIO_URL}/${articleId}_0${fileExtention}`).exists();

        if (!fileExists2[0]) {
            if (!fileExists1[0]) {
                await generateAudio(passage, articleId);
                return { id: articleId, task: "audio", status: "regenerated" };
            }
            else {
                return { id: articleId, task: "audio", status: "pass" };
            }
        } else {
            return { id: articleId, task: "audio", status: "pass" };
        }
    } catch (error: any) {
        error.id = articleId;
        error.message = error.message;
        error.task = "audio";
        throw error;
    }
}
// Helper function to regenerate questions
async function regenerateQuestions(
    articleId: string,
    collectionName: string,
    generateFunction: any,
    articleData: ArticleData
): Promise<ValidationResponse> {
    try {
        const questionsSnapshot = await db.collection("new-articles").doc(articleId).collection(collectionName).get();
        if (questionsSnapshot.empty) {
            console.log(`Regenerating ${collectionName.toUpperCase()} for article`, articleId);
            const articleResp = await retry(() =>
                generateFunction(
                    articleData.cefr_level,
                    articleData.type,
                    articleData.genre,
                    articleData.subgenre,
                    articleData.passage,
                    articleData.title,
                    articleData.summary,
                    articleData.image_description
                )
            ) as any;
            console.log(`Questions generated: ${JSON.stringify(articleResp)}`);

            if (collectionName === "la-questions") {
                await db.collection("new-articles").doc(articleId).collection(collectionName).add(articleResp);
            } else {
                for (let i = 0; i < articleResp.questions.length; i++) {
                    await db.collection("new-articles").doc(articleId).collection(collectionName).add(articleResp.questions[i]);
                }
            }
            return { id: articleId, task: collectionName, status: "regenerated" };
        }
        return { id: articleId, task: collectionName, status: "pass" };
    } catch (error: any) {
        error.id = articleId;
        error.message = error.code;
        error.task = collectionName;
        throw error;
    }
}

export async function POST(request: NextRequest, ctx: RequestContext) {
    const result = await router.run(request, ctx);
    if (result instanceof NextResponse) {
        return result;
    }
    throw new Error("Expected a NextResponse from router.run");
}
