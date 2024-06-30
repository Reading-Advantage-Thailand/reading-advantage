import db from "@/configs/firestore-config";
import { retry } from "./retry";
import { generateMC, generateSA, generateLA, generateImage, generateAudio, test } from "@/controllers/assistant-controller";
import storage from "./storage";

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
    created_at?: string;
    id?: string;
}

interface MediaGenerateFunction {
    (articleId: string): Promise<void>;
}

// Helper function to regenerate questions
async function regenerateQuestions(
    articleId: string,
    collectionName: string,
    generateFunction: any,
    articleData: ArticleData
): Promise<string> {
    try {
        const questionsSnapshot = await db.collection("new-articles").doc(articleId).collection(collectionName).get();
        // console.log(`Checking: ${collectionName} for article ${articleId}`);
        // console.log(`Questions exist: ${questionsSnapshot.size}`);
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
            return `${collectionName}: regenerated`;
        }
        return `${collectionName}: pass`
    } catch (error) {
        console.log(`Error regenerating ${collectionName} for article ${articleId}:`, error);
        throw error;
    }

}

// Helper function to check and regenerate media
async function regenerateMedia(
    articleId: string,
    url: string,
    generateFunction: MediaGenerateFunction,
    description: string
): Promise<string> {
    try {
        const fileExtention = description === "image" ? ".png" : ".mp3";
        if (description == "audio") {
            const fileExists1 = await storage.bucket('artifacts.reading-advantage.appspot.com').file(`${url}/${articleId}${fileExtention}`).exists();
            const fileExists2 = await storage.bucket('artifacts.reading-advantage.appspot.com').file(`${url}/${articleId}_0${fileExtention}`).exists();

            if (!fileExists2[0]) {
                if (!fileExists1[0]) {
                    console.log(`Regenerating ${description} for article`, articleId);
                    await generateFunction(articleId);
                    return `${description}: regenerated`;
                }
                else {
                    return `${description}: pass`;
                }
            } else {
                return `${description}: pass`;
            }

        } else {
            const fileExists = await storage.bucket('artifacts.reading-advantage.appspot.com').file(`${url}/${articleId}${fileExtention}`).exists();
            if (!fileExists[0]) {
                console.log(`Regenerating ${description} for article`, articleId);
                await generateFunction(articleId);
                return `${description}: regenerated`;
            }
        }
        return `${description}: pass`;
    } catch (error) {
        console.log(`Error regenerating ${description} for article ${articleId}:`, error);
        throw error;
    }
}

// Function to validate the article
async function validator(articleId: string): Promise<{ id: string, created_at: string, validation: string[] }> {
    try {
        const articleDoc = await db.collection("new-articles").doc(articleId).get();
        if (!articleDoc.exists) {
            throw new Error(`Article ${articleId} not found in Firestore`);
        }

        const articleData = articleDoc.data() as ArticleData;

        if (!articleData.id) {
            // Set article id
            console.log(`Setting article id for article ${articleId}`);
            db.collection("new-articles").doc(articleId).set({ id: articleId }, { merge: true });
        }

        const resp = Promise.all([
            regenerateQuestions(articleId, "mc-questions", generateMC, articleData),
            regenerateQuestions(articleId, "sa-questions", generateSA, articleData),
            regenerateQuestions(articleId, "la-questions", generateLA, articleData),
            regenerateMedia(`${articleId}`, IMAGE_URL, (id) => generateImage(articleData.image_description!, id), "image"),
            regenerateMedia(`${articleId}`, AUDIO_URL, (id) => generateAudio(articleData.passage!, id), "audio")
        ]);

        // // run only first 1
        // const resp = Promise.all([
        //     regenerateMedia(`${articleId}`, AUDIO_URL, (id) => generateAudio(articleData.passage!, id), "audio")
        // ]);

        return {
            id: articleId,
            created_at: articleData.created_at!,
            validation: await resp,
        }
    } catch (error) {
        console.error(`Validation failed for article ${articleId}:`, error);
        throw error;
    }
}

export default validator;