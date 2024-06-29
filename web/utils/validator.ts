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

const exceptedAudios = [
    "DGcEJslkjRF82yVYwFp4",
    "hBlWSWPcwuahuz4z6Vch",
    "qHFtDdqTgrswF9eYXHS7",
    "kMD8hSjTpEKdN1tLHCgI",
    "JCphbxfV9EO4YUtFDaVK",
    "LVWhFjrGj2pikslWRJ9s",
    "6r7ndhElwL0B1JoCcD9t",
    "4mz9gqDSznq6l4FbFh2h",
    "356A5ZUXdYsmOXPpPuan",
    "hBlWSWPcwuahuz4z6Vch",
    "4mz9gqDSznq6l4FbFh2h",
    "zp5zWVseAnZuN2el5NGV",
    "t4rY7CvxpSNTRpeDCM7O",
    "g89jOyI1zaWIYYJav1QX",
    "356A5ZUXdYsmOXPpPuan",
    "k8IjxJCYGJEZ9MGDYDVu",
    "1An1bByQJn2gmV25TfNc",
    "KGGGIeai280uDfxCHdIg",
    "JCphbxfV9EO4YUtFDaVK",
    "JVwdXuDXSzWVA3Q156BN",
    "zp5zWVseAnZuN2el5NGV",
    "biTHkACftqFcCiUtQRq0",
    "pJh3Y3kaA2w2GyN6FyWu",
    "1NOjQlZJVujGdo8JGPz4",
    "LVWhFjrGj2pikslWRJ9s",
    "o9B8mYIcYTG1LRe5y2If",
    "KSKPQcEoI0vefEuWfrMq",
    "LbsVG3luYtCZqdhlB4Md",
    "KFFsqivkYXC8ecgHFN2o",
    "1An1bByQJn2gmV25TfNc",
    "o9B8mYIcYTG1LRe5y2If",
    "t4rY7CvxpSNTRpeDCM7O",
    "qGi4Byp2zZzT0M28irfl",
    "JVwdXuDXSzWVA3Q156BN",
    "2up9sbHpnS4zIrF9j5qq",
    "k8IjxJCYGJEZ9MGDYDVu",
    "KFFsqivkYXC8ecgHFN2o",
    "8th0ZCwDYTU1rhTwwS9k",
    "jWZ6jWcn4iUdKp924mvP",
    "biTHkACftqFcCiUtQRq0",
    "g89jOyI1zaWIYYJav1QX",
    "KGGGIeai280uDfxCHdIg",
    "KSKPQcEoI0vefEuWfrMq",
    "pJh3Y3kaA2w2GyN6FyWu",
    "qGi4Byp2zZzT0M28irfl",
    "2up9sbHpnS4zIrF9j5qq",
    "Xrp6JskNfJJaFYNvzjhg",
    "jWZ6jWcn4iUdKp924mvP",
    "8th0ZCwDYTU1rhTwwS9k",
    "Xrp6JskNfJJaFYNvzjhg",
    "wdGr9LIEMv6jksjnvt5K",
    "Rzb4cUde6CqPrA5IjJEO",
    "Rzb4cUde6CqPrA5IjJEO",
    "KaN09T7u8TKKB6PFoxNs",
    "aJsMGzoQPuwF8pQRkVyC",
    "HmJoIYwhrh0D5XNDfsgC",
    "aJsMGzoQPuwF8pQRkVyC",
    "hpF4d8AwNvgATMriuSmE",
    "ZdGMJt9r8ppiGMKsn9P5",
    "dBzvTecCfjyBx03f863G",
    "uoKwkTWhFvL6FJv26LbF",
    "KaN09T7u8TKKB6PFoxNs",
    "8dWvqbtv20L83RXijH0t",
    "vfyDGsOR1fJHbnOxN7HE",
    "FoNZYzWUdEkKSikXsq6a",
    "dYNoQy5Hlv0PHPuNCCLs",
    "BabCJlWa4QXH3c25uJpm",
    "FoNZYzWUdEkKSikXsq6a",
    "xCjw4ESaQensSFMTXRC1",
    "iDhTvf0UYiPdKx5GRmWc",
    "hpF4d8AwNvgATMriuSmE",
    "9fgwbVYjZsbVWMNC5EoI",
    "izyjPs6n7Q26N4UNlq7o",
    "dYNoQy5Hlv0PHPuNCCLs",
    "dBzvTecCfjyBx03f863G",
    "xCjw4ESaQensSFMTXRC1",
    "WtwjVYMCLK6XPByG4S4A",
    "9SvkRQi9huUjahv9vK6d",
    "vfyDGsOR1fJHbnOxN7HE",
    "9SvkRQi9huUjahv9vK6d",
    "WtwjVYMCLK6XPByG4S4A",
    "No2OAye7JYPlmtLVvujA",
    "BabCJlWa4QXH3c25uJpm",
    "0v6dgvfSO1VSQmzsyk31",
    "6ynl60h2jdHsBHiToVvu",
    "izyjPs6n7Q26N4UNlq7o",
    "6HMuOkJmC947a3lUPY2Y",
    "iDhTvf0UYiPdKx5GRmWc",
    "lIvseIHvBOOw41dGOUTt",
    "v2nRxPw8UPL4gjUrnGyo",
    "6HMuOkJmC947a3lUPY2Y",
    "No2OAye7JYPlmtLVvujA",
    "OX08OXia2Dcjq3aEu3ud",
    "ZdIV1Eot3IiUsFqBubTo",
    "owKqRFqajCL53naUACV9",
    "6ynl60h2jdHsBHiToVvu",
    "owKqRFqajCL53naUACV9",
    "v2nRxPw8UPL4gjUrnGyo",
    "lIvseIHvBOOw41dGOUTt",
    "iOljyCpZogqAH1wxlG9b",
    "iOljyCpZogqAH1wxlG9b",
    "4cdbszYWJskf3oqffowY",
    "4cdbszYWJskf3oqffowY",

]
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
            // const fileExists1 = await storage.bucket('artifacts.reading-advantage.appspot.com').file(`${url}/${articleId}${fileExtention}`).exists();
            // const fileExists2 = await storage.bucket('artifacts.reading-advantage.appspot.com').file(`${url}/${articleId}_0${fileExtention}`).exists();

            // if (!fileExists2[0]) {
            //     if (!fileExists1[0]) {
            //         console.log(`Regenerating ${description} for article`, articleId);
            //         await generateFunction(articleId);
            //         return `${description}: regenerated`;
            //     }
            //     else {
            //         return `${description}: pass`;
            //     }
            // } else {
            //     return `${description}: pass`;
            // }
            if (!exceptedAudios.includes(articleId)) {
                console.log(`Regenerating ${description} for article`, articleId);
                await generateFunction(articleId);
                return `${description}: regenerated`;
            } else {
                return `${description}: pass`;
            }
        } else {
            const fileExists = await storage.bucket('artifacts.reading-advantage.appspot.com').file(`${url}/${articleId}${fileExtention}`).exists();
            // console.log(`Checking: ${url}/${articleId}${fileExtention}`);
            // console.log(`File exists: ${fileExists}`);
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

        // const resp = Promise.all([
        //     regenerateQuestions(articleId, "mc-questions", generateMC, articleData),
        //     regenerateQuestions(articleId, "sa-questions", generateSA, articleData),
        //     regenerateQuestions(articleId, "la-questions", generateLA, articleData),
        //     regenerateMedia(`${articleId}`, IMAGE_URL, (id) => generateImage(articleData.image_description!, id), "image"),
        //     regenerateMedia(`${articleId}`, AUDIO_URL, (id) => generateAudio(articleData.passage!, id), "audio")
        // ]);

        // run only first 1
        const resp = Promise.all([
            regenerateMedia(`${articleId}`, AUDIO_URL, (id) => generateAudio(articleData.passage!, id), "audio")
        ]);

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