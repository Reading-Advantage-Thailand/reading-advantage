import db from "@/configs/firestore-config";
import fs from 'fs';
import axios from "axios";
import base64 from 'base64-js';
import { calculateLevel } from "@/lib/calculateLevel";
import { splitTextIntoSentences } from "@/lib/utils";
import uploadToBucket from "@/utils/uploadToBucket";
import openai from "@/utils/openai";

const threads: { [key: string]: string } = {};

// Types
interface Genre {
    Name: string;
    Subgenres: string[];
}

// Data
const voices: string[] = [
    "en-US-Neural2-A",
    "en-US-Neural2-C",
    "en-US-Neural2-D",
    "en-US-Neural2-E",
    "en-US-Neural2-F",
    "en-US-Neural2-G",
    "en-US-Neural2-H",
    "en-US-Neural2-I",
    "en-US-Neural2-J",
]
const assistantIds = {
    fiction: [
        "asst_cmS72OcbZsNT20ndfjhBgQgx", // C1-C2
        "asst_Da4Ztw4h6QFx8xvKYGtqspW3", // B2
        "asst_2CveglB6r9VIZbrCTm8wz4AK", // B1
        "asst_Y69eAT8aiJXb12k0Yxia6Ccx", // A1
        "asst_8qrqCQ80oe5rMf5gLAKNsJa0", // A2
    ],
    nonfiction: [
        "asst_mhNwJm2FCZWJoeiXHEohmjtu", // C1-C2
        "asst_JNr1HJOw6yMXCV1jVmAefW9T", // B2
        "asst_MHlb5PjhFb0AxFCbvK3KjwiA", // B1
        "asst_DR1DqEgss3Zl69ykEB6nIma4", // A1
        "asst_upQr6f1fuOEX3ffqMPcp4wyT", // A2
    ],
}

// Constants
const BASE_TEXT_TO_SPEECH_URL = 'https://texttospeech.googleapis.com';
const AUDIO_URL = 'audios';
const IMAGE_URL = 'article-images';

// Helper functions
function contentToSSML(content: string[]): string {
    let ssml = "<speak>";
    content.forEach((sentence, i) => {
        ssml += `<s><mark name='sentence${i + 1}'/>${sentence}</s>`;
    });
    ssml += "</speak>";
    return ssml;
}

async function voiceGenerator(content: string, articleId: string) {
    try {
        const ssml = contentToSSML(splitTextIntoSentences(content));
        const voice = voices[Math.floor(Math.random() * voices.length)];
        const response = await axios.post(`${BASE_TEXT_TO_SPEECH_URL}/v1beta1/text:synthesize`, {
            input: { ssml: ssml },
            voice: {
                languageCode: "en-US",
                name: voice,
            },
            "audioConfig": {
                "audioEncoding": "MP3",
                "pitch": 0,
                "speakingRate": 1
            },
            "enableTimePointing": ["SSML_MARK"],
        }, {
            params: { key: process.env.GOOGLE_TEXT_TO_SPEECH_API_KEY },
        });
        const audio = response.data.audioContent;
        const MP3 = base64.toByteArray(audio);

        const localPath = `${process.cwd()}/data/audios/${articleId}.mp3`;
        fs.writeFileSync(localPath, MP3);

        await db.collection('articles')
            .doc(articleId)
            .update({
                timepoints: response.data.timepoints,
            });

        await uploadToBucket(localPath, `${AUDIO_URL}${articleId}.mp3`);

    } catch (error) {
        console.error('VOICE GENERATING ERROR: ', error);
        throw error;
    }
}

async function imageGenerator(description: string, articleId: string) {
    try {
        const response = await openai.images.generate({
            model: "dall-e-3",
            n: 1,
            prompt: description,
            size: "1024x1024",
        });

        const image = await axios.get(response.data[0].url as string, {
            responseType: 'arraybuffer',
        });

        const localPath = `${process.cwd()}/data/images/${articleId}.jpg`;
        fs.writeFileSync(localPath, image.data);

        await uploadToBucket(
            localPath,
            `${IMAGE_URL}/${articleId}.jpg`,
        );
    } catch (error) {
        console.log('IMAGE GENERATING ERROR: ', error);
        throw error;
    }
}

async function assistant(endpoint: string, assistantId: string, userId: string) {
    if (!threads[userId]) {
        try {
            const newThread = await openai.beta.threads.create();
            threads[userId] = newThread.id;
        } catch (error) {
            console.error('THREAD CREATION ERROR: ', error);
            throw error;
        }
    }

    try {
        const message = await openai.beta.threads.messages.create(threads[userId], {
            role: 'user',
            content: endpoint,
        });
        const run = await openai.beta.threads.runs.create(threads[userId], {
            assistant_id: assistantId,
        });
        const retrieveRunStatus = async () => {
            let keepRetrieving;
            while (run.status !== 'completed') {
                keepRetrieving = await openai.beta.threads.runs.retrieve(
                    threads[userId],
                    run.id
                );
                if (keepRetrieving.status === 'completed') {
                    break;
                }
            }
        }
        retrieveRunStatus();
        const retrieveMessages = async () => {
            await retrieveRunStatus();
            const messages = await openai.beta.threads.messages.list(threads[userId]);
            return messages.data;
        }
        const response = await retrieveMessages();
        return response;
    } catch (error) {
        console.log('ASSISTANT ERROR: ', error);
        throw error;
    }
}

async function jsonGenerator(assistantId: string, userId: string, type: string, genre: Genre, subgenre: string) {
    console.log('Commnad: /json')
    const json = await assistant('/json', assistantId, userId);
    console.log('json: ', (json as any)[0].content[0].text.value);
    // remove number length from the string 15-20 to 15 only in "target-words-per-sentence": "15-20", field
    // if it have - in 15-20
    // not remove - in passage
    let newJsonStr = (json as any)[0].content[0].text.value.replace(/(\d+)-(\d+)/g, '$1');
    newJsonStr = newJsonStr.replace(/(\d+)-(\d+)/g, '$1');
    const parsed = JSON.parse(newJsonStr);

    // convert image.description to just image
    if (parsed.image && parsed.image.description) {
        console.log('parsed.image.description', parsed.image.description);
        console.log('parsed.image', parsed.image);
        parsed.image = parsed.image.description;
    }

    // calculate the readability score
    const level = calculateLevel(parsed.passage);

    const article = {
        type: type,
        genre: genre.Name,
        subGenre: subgenre,
        topic: parsed.topic || '',
        content: parsed.passage || '',
        summary: parsed.summary || '',
        title: parsed.title || '',
        cefrLevel: level.cefrLevel,
        raLevel: level.raLevel,
        threadId: threads[userId],
        averageRating: 3,
        readCount: 0,
        targetWordcount: parsed['target-wordcount'] || 0,
        targetWordsPerSentence: parsed['target-words-per-sentence'] || 0,
        createdAt: new Date(),
    }

    if (!parsed.image && !article.content) {
        console.error("NO IMAGE OR CONTENT FOUND");
        throw new Error("NO IMAGE OR CONTENT FOUND");
    }

    const doc = await db.collection('articles').add(article);

    await imageGenerator(parsed.image, doc.id);
    await voiceGenerator(article.content, doc.id);

    return {
        docId: doc.id,
        thraedId: threads[userId],
        json: json,
    }

}

let subgenreTmp: string;
let data: { docId: string, thraedId: string, json: any }[] = [];
export async function articleGenerator(userId: string) {
    const fiction: Genre[] = JSON.parse(fs.readFileSync(`${process.cwd()}/data/genres-fiction.json`, 'utf-8')).Genres;
    const nonFiction: Genre[] = JSON.parse(fs.readFileSync(`${process.cwd()}/data/genres-nonfiction.json`, 'utf-8')).Genres;

    const commands = ['/outline', '/passage', '/revise', '/assets']
    for (let i = 0; i < 2; i++) {
        const genre = i === 0 ? fiction[Math.floor(Math.random() * fiction.length)] : nonFiction[Math.floor(Math.random() * nonFiction.length)];
        // Randomly select a genre from the genres
        // And its should not be the same in assistant-articles
        const assistantArticles = await db.collection('assistant-articles').where('genre', '==', genre.Name).get();
        if (!assistantArticles.empty) {
            const assistantArticle = assistantArticles.docs[0].data();
            if (assistantArticle.subGenre === subgenreTmp) {
                i--;
                continue;
            }
        }
        const type = i === 0 ? 'fiction' : 'nonfiction';
        for (const assistantId of assistantIds[type]) {
            try {
                for (const subgenre of genre.Subgenres) {
                    subgenreTmp = subgenre;
                    await assistant(`/about "type": "${type}", "genre": "${genre.Name}", "subgenre": "${subgenre}"`, assistantId, userId);
                    for (const command of commands) {
                        await assistant(`${command}`, assistantId, userId);
                    }
                    const response = await jsonGenerator(assistantId, userId, type, genre, subgenre);
                    // update the genere and subgenre of the article
                    await db.collection('assistant-articles').doc(response.docId).update({
                        genre: genre.Name,
                        subGenre: subgenre,
                    });
                    data.push(response);
                }
            } catch (error: any) {
                console.error('ARTICLE GENERATING ERROR: ', error);
                throw error;
            }
        }
    }
    return data;
}