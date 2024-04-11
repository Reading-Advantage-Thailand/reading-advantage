import db from '@/configs/firestore-config';
import { splitTextIntoSentences } from '@/lib/utils';
import axios from 'axios';
import OpenAI from 'openai';
import base64 from 'base64-js';
import fs from 'fs';
import uploadToBucket from '@/utils/uploadToBucket';
import { calculateLevel } from '@/lib/calculateLevel';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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

interface Genre {
    subgenres: string[];
    name: string;
}
interface Article {
    type: string,
    genre: string,
    subGenre: string,
    topic: string,
    content: string,
    summary: string,
    title: string,
    cefrLevel: string,
    raLevel: number,
    threadId: string,
    averageRating: number,
    readCount: number,
    targetWordcount: number,
    targetWordsPerSentence: number,
    timepoints?: string[],
    createdAt: Date,
}

export async function POST(req: Request, res: Response) {
    try {
        // Randomly select a fiction genre
        const fictionGenres = await db.collection('genres-fiction').get();
        const fictionGenre = fictionGenres.docs[Math.floor(Math.random() * fictionGenres.docs.length)];
        const fictionGenreData = fictionGenre.data() as Genre;

        // Randomly select a nonfiction genre
        const nonfictionGenres = await db.collection('genres-nonfiction').get();
        const nonfictionGenre = nonfictionGenres.docs[Math.floor(Math.random() * nonfictionGenres.docs.length)];
        const nonfictionGenreData = nonfictionGenre.data() as Genre;

        let index = 0;

        let fictionResults: any[] = [];
        let nonfictionResults: any[] = [];

        // Run fiction genre
        for (const subgenre of fictionGenreData.subgenres) {
            const fictionResp = await articleGenerator('fiction', fictionGenreData.name, subgenre, assistantIds.fiction[index++ % assistantIds.fiction.length]);
            fictionResults.push(fictionResp);
        }

        // Run nonfiction genre
        index = 0;
        for (const subgenre of nonfictionGenreData.subgenres) {
            const nonfictionResp = await articleGenerator('nonfiction', nonfictionGenreData.name, subgenre, assistantIds.nonfiction[index++ % assistantIds.nonfiction.length]);
            nonfictionResults.push(nonfictionResp);
        }

        const successFictionPercentage = fictionResults.filter((result: any) => result.status === 'success').length / fictionResults.length * 100;
        const successNonfictionPercentage = nonfictionResults.filter((result: any) => result.status === 'success').length / nonfictionResults.length * 100;

        // Update db for log
        const log = {
            genre: fictionGenreData.name,
            subgenres: fictionGenreData.subgenres,
            fiction: fictionResults,
            nonfiction: nonfictionResults,
            successFictionPercentage,
            successNonfictionPercentage,
            createdAt: Date.now(),
        }

        await db.collection('logs').add(log);

        return Response.json({
            message: 'Articles generated successfully',
            genre: fictionGenreData,
            successFictionPercentage,
            successNonfictionPercentage,
            results: {
                fiction: fictionResults,
                nonfiction: nonfictionResults,
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            message: `Error generating article: ${error}`,
        }), { status: 500 });
    }
}

// Helper functions
function contentToSSML(content: string[]): string {
    let ssml = "<speak>";
    content.forEach((sentence, i) => {
        ssml += `<s><mark name='sentence${i + 1}'/>${sentence}</s>`;
    });
    ssml += "</speak>";
    return ssml;
}

async function voiceGenerator(content: string, articleId: string, assistantId: string) {
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

        await uploadToBucket(localPath, `${AUDIO_URL}/${articleId}.mp3`);

    } catch (error) {
        console.error('VOICE GENERATING ERROR: ', error);
        return {
            message: 'Error generating voice',
            status: 'failed',
            assistantIds: assistantIds,
        }
    }
}

async function imageGenerator(description: string, articleId: string, assistantId: string) {
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

        const localPath = `${process.cwd()}/data/images/${articleId}.png`;
        fs.writeFileSync(localPath, image.data);

        await uploadToBucket(
            localPath,
            `${IMAGE_URL}/${articleId}.png`,
        );
    } catch (error) {
        console.log('IMAGE GENERATING ERROR: ', error);
        return {
            message: 'Error generating image',
            status: 'failed',
            assistantId: assistantId,
        }
    }
}

async function articleGenerator(type: string, genre: string, subgenre: string, assistantId: string) {

    const commands = [
        `/about "type": "${type}", "genre": "${genre}", "subgenre": "${subgenre}"`,
        '/outline',
        '/passage',
        '/assets',
    ];
    let jsonResp = {};

    const thread = await openai.beta.threads.create();
    for (const command of commands) {
        try {
            const response = await assistant(command, assistantId, thread);
            // console.log('response:', response);
            console.log('response:', JSON.stringify((response as any)[0].content[0].text.value));

            if (command.startsWith('/about')) {
                // remmove ```json and ``` from the response
                const resp = (response as any)[0].content[0].text.value.replace(/```json/g, '').replace(/```/g, '').replace(/(\d+)-(\d+)/g, '$1').replace(/[\u0000-\u001F]/g, '');
                // revent bad characters from the response
                console.log('resp /about:', resp);
                const json = JSON.parse(resp);
                if (json.wordcount) {
                    json['target-wordcount'] = json.wordcount;
                    delete json.wordcount;
                }
                jsonResp = {
                    threadId: response[0].thread_id,
                    type: json.type,
                    genre: genre,
                    subGenre: subgenre,
                    topic: json.topic,
                    targetWordcount: json['target-wordcount'],
                    targetWordsPerSentence: json['target-words-per-sentence'],
                };
            }

            if (command === '/passage') {
                const resp = (response as any)[0].content[0].text.value.replace(/```json/g, '').replace(/```/g, '').replace(/[\u0000-\u001F]/g, '');
                console.log('resp /passage:', resp);
                const json = JSON.parse(resp);
                const level = calculateLevel(json.passage);
                jsonResp = {
                    ...jsonResp,
                    content: json.passage,
                    cefrLevel: level.cefrLevel,
                    raLevel: level.raLevel,
                };
            }

            if (command === '/assets') {
                const resp = (response as any)[0].content[0].text.value.replace(/```json/g, '').replace(/```/g, '').replace(/[\u0000-\u001F]/g, '');
                console.log('resp /assets:', resp);
                const json = JSON.parse(resp);

                if (json.image && json.image.description) {
                    json.image = json.image.description;
                }

                jsonResp = {
                    ...jsonResp,
                    image: json.image,
                    summary: json.summary,
                    title: json.title,
                    readCount: 0,
                    averageRating: 0,
                    createdAt: Date.now(),
                };

                const article = await db.collection('articles').add(jsonResp);

                // Generate image
                await imageGenerator(json.image, article.id, assistantId);

                // Generate voice
                await voiceGenerator((jsonResp as any).content, article.id, assistantId);

                return {
                    articleId: article.id,
                    message: 'Article generated successfully',
                    status: 'success',
                    assistantId: assistantId,
                    threadId: thread.id,
                }
            }
        } catch (error: any) {
            console.log('Error:', error);
            return {
                message: 'Error generating article',
                status: 'failed',
                error: error.message ? error.message : error,
                assistantId: assistantId,
                threadId: thread.id,
            }
        }
    }
}
async function assistant(endpoint: string, assistantId: string, thread: OpenAI.Beta.Threads.Thread) {
    try {
        const message = await openai.beta.threads.messages.create(thread.id, {
            role: 'user',
            content: endpoint,
        });
        const run = await openai.beta.threads.runs.create(thread.id, {
            assistant_id: assistantId,
        });
        const retrieveRunStatus = async () => {
            let keepRetrieving;
            while (run.status !== 'completed') {
                keepRetrieving = await openai.beta.threads.runs.retrieve(
                    thread.id,
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
            const messages = await openai.beta.threads.messages.list(run.thread_id);
            return messages.data;
        }
        const response = await retrieveMessages();
        return response;
    } catch (error) {
        console.log('ASSISTANT ERROR: ', error);
        throw error;
    }
}
