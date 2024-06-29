import db from "@/configs/firestore-config";
import { ExtendedNextRequest } from "@/utils/middleware";
import { NextResponse } from "next/server";
import { generateText, generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import openaiUtils from "@/utils/openai";
import uploadToBucket from "@/utils/uploadToBucket";
import axios from "axios";
import { splitTextIntoSentences } from "@/lib/utils";
import base64 from "base64-js";
import { calculateLevel } from "@/lib/calculateLevel";
import { retry } from "@/utils/retry";

interface GenreType {
    id: string;
    subgenres: string[];
    name: string;
}

type RandomGenreOutput = {
    genre: string;
    subgenre: string;
}

type GenerateTopicOutput = {
    type: Type;
    genre: string;
    subgenre: string;
    topics: string[];
}

type GenerateArticleOutput = {
    cefrLevel: string;
    topic: string;
    type: Type;
    genre: string;
    subgenre: string;
    passage: string;
    title: string;
    summary: string;
    imageDesc: string;
}

type Type = "fiction" | "nonfiction";
type LevelType = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
// Constants
const BASE_TEXT_TO_SPEECH_URL = "https://texttospeech.googleapis.com";
const AUDIO_URL = "tts";
const IMAGE_URL = "images";

type CefrLevelPromptType = {
    type: Type,
    levels: CefrLevelType[],
}

type CefrLevelType = {
    level: string,
    systemPrompt: string,
    modelId: string,
    userPromptTemplate: string,
}

export async function generateQueue(req: ExtendedNextRequest) {
    try {
        // Function to generate queue for a given genre
        const generateForGenre = async (genre: Type) => {
            const randomResp = await retry(() => randomGenre(genre));
            const topicResp = await retry(() => generateTopic(genre, randomResp.genre, randomResp.subgenre));

            // Process each topic concurrently
            const results = await Promise.all(topicResp.topics.map(async (topic) => {
                const topicResults = [];
                topicResults.push(await queue(genre, topicResp.genre, topicResp.subgenre, topic, "A1"));
                topicResults.push(await queue(genre, topicResp.genre, topicResp.subgenre, topic, "A2"));
                topicResults.push(await queue(genre, topicResp.genre, topicResp.subgenre, topic, "B1"));
                topicResults.push(await queue(genre, topicResp.genre, topicResp.subgenre, topic, "B2"));
                topicResults.push(await queue(genre, topicResp.genre, topicResp.subgenre, topic, "C1"));
                topicResults.push(await queue(genre, topicResp.genre, topicResp.subgenre, topic, "C2"));
                return topicResults;
            }));

            return results.flat();
        };
        // Run fiction generation first, then nonfiction
        const fictionResults = await generateForGenre("fiction");
        const nonfictionResults = await generateForGenre("nonfiction");

        // Combine results from both genres
        const combinedResults = [...fictionResults, ...nonfictionResults];

        return NextResponse.json({
            message: "Successfully generated queue",
            length: combinedResults.length,
            nonfictionResults: nonfictionResults.length,
            fictionResults: fictionResults.length,
            result: combinedResults,
        });
    } catch (error) {
        return NextResponse.json({
            message: `Failed to generate queue: ${error}`
        }, { status: 500 });
    }
}

async function queue(type: Type, genre: string, subgenre: string, topic: string, level: LevelType) {
    console.log("TYPE:", type, "GENRE:", genre, "SUBGENRE:", subgenre, "TOPIC:", topic, "LEVEL:", level)
    const articleResp = await retry(() => generateArticle(type, genre, subgenre, topic, level));
    console.log("GENERATED ARTICLE");
    const mcResp = await retry(() => generateMC(articleResp.cefrLevel, articleResp.type, articleResp.genre, articleResp.subgenre, articleResp.passage, articleResp.title, articleResp.summary, articleResp.imageDesc));
    console.log("GENERATED MC");
    const saResp = await retry(() => generateSA(articleResp.cefrLevel, articleResp.type, articleResp.genre, articleResp.subgenre, articleResp.passage, articleResp.title, articleResp.summary, articleResp.imageDesc));
    console.log("GENERATED SA");
    const laResp = await retry(() => generateLA(articleResp.cefrLevel, articleResp.type, articleResp.genre, articleResp.subgenre, articleResp.passage, articleResp.title, articleResp.summary, articleResp.imageDesc));
    console.log("GENERATED LA");

    const { cefrLevel, raLevel } = calculateLevel(articleResp.passage);
    // save to db
    const articleDoc = await db.collection("new-articles").add({
        average_rating: 0,
        cefr_level: cefrLevel,
        created_at: new Date().toISOString(),
        genre,
        image_description: articleResp.imageDesc,
        passage: articleResp.passage,
        ra_level: raLevel,
        read_count: 0,
        subgenre,
        summary: articleResp.summary,
        thread_id: "",
        title: articleResp.title,
        type,
    });

    // update mcq
    for (let i = 0; i < mcResp.questions.length; i++) {
        db.collection("new-articles").doc(articleDoc.id).collection("mc-questions").add(mcResp.questions[i]);
    }

    // update saq
    for (let i = 0; i < saResp.questions.length; i++) {
        db.collection("new-articles").doc(articleDoc.id).collection("sa-questions").add(saResp.questions[i]);
    }

    // update laq
    db.collection("new-articles").doc(articleDoc.id).collection("la-questions").add(laResp);

    const audioResp = await retry(() => generateAudio(articleResp.passage, articleDoc.id));
    console.log("GENERATED AUDIO");
    const imageResp = await retry(() => generateImage(articleResp.imageDesc, articleDoc.id));
    console.log("GENERATED IMAGE");

    return {
        articleResp,
        mcResp,
        saResp,
        laResp,
        imageResp,
        audioResp,
    };
}

// random select 1 genre and 1 subgenre
async function randomGenre(type: Type): Promise<RandomGenreOutput> {
    const fetchGenres = async (collection: string) => {
        const genres = await db.collection(collection).get();
        const genre = genres.docs[
            Math.floor(Math.random() * genres.docs.length)
        ].data() as GenreType;
        genre.id = genres.docs[0].id;
        return {
            subgenre: genre.subgenres[
                Math.floor(Math.random() * genre.subgenres.length)
            ],
            genre: genre.name,
        }
    };

    try {
        const resp = await fetchGenres(`genres-${type}`);
        return resp;
    } catch (error) {
        throw `Failed to fetch genres: ${error}`
    }
}

async function generateTopic(type: Type, genre: string, subgenre: string): Promise<GenerateTopicOutput> {
    const prompts = {
        fiction: `Please provide ten reading passage topics in the ${type} ${genre} genre and ${subgenre} subgenre. Output as a JSON array.`,
        nonfiction: `Please provide ten reading passage topics in the ${type} ${genre} genre and ${subgenre} subgenre. Output as a JSON array.`,
    };

    const generate = async () => {
        const response = await generateText({
            model: openai('gpt-3.5-turbo'),
            prompt: prompts[type],
        });
        return JSON.parse(response.text);
    };

    try {
        const topics = await generate();
        return {
            type,
            genre,
            subgenre,
            topics,
        };
    } catch (error) {
        throw `Failed to generate topic: ${error}`
    }
}

export async function generateArticle(type: Type, genre: string, subgenre: string, topic: string, level: LevelType): Promise<GenerateArticleOutput> {
    const cefrLevelPrompts: CefrLevelPromptType[] = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), 'data', 'cefr-level-prompts.json'), 'utf-8')
    );

    const levelConfig = cefrLevelPrompts
        .find((item) => item.levels.some((lvl) => lvl.level === level))?.levels
        .find((lvl) => lvl.level === level);

    if (!levelConfig) {
        throw new Error(`Failed to generate article: Invalid level ${level}`);
    }

    const userPrompt = levelConfig.userPromptTemplate
        .replace("{genre}", genre)
        .replace("{subgenre}", subgenre)
        .replace("{topic}", topic);

    const generate = async () => {
        const { object: generatedContent } = await generateObject({
            model: openai(levelConfig.modelId),
            schema: z.object({
                title: z.string().describe("An interesting title for the article"),
                passage: z.string().describe("The main content of the article"),
                summary: z.string().describe("A one-sentence summary of the article"),
                imageDesc: z.string().describe("A detailed description of an image to go along with the passage"),
            }),
            system: levelConfig.systemPrompt,
            prompt: userPrompt,
        });
        return generatedContent;
    }

    try {
        const resp = await generate();
        return {
            cefrLevel: level,
            topic,
            type,
            genre,
            subgenre,
            ...resp,
        };
    } catch (error) {
        throw `Failed to generate article: ${error}`
    }
}
export async function generateMC(
    cefrlevel: string,
    type: Type,
    genre: string,
    subgenre: string,
    passage: string,
    title: string,
    summary: string,
    imageDesc: string
) {
    const schema = z.object({
        questions: z.array(z.object({
            correct_answer: z.string().describe("The correct answer"),
            distractor_1: z.string().describe("An incorrect but plausible answer that is approximately the same length as the correct answer."),
            distractor_2: z.string().describe("An incorrect but plausible answer that is approximately the same length as the correct answer."),
            distractor_3: z.string().describe("An incorrect but plausible answer that is approximately the same length as the correct answer."),
            question: z.string().describe("The question"),
            question_number: z.number(),
        }))
    });
    return generateContent(
        cefrlevel,
        type,
        genre,
        subgenre,
        passage,
        title,
        summary,
        imageDesc,
        'prompts-combined-MC.json',
        'gpt-4o',
        schema
    );
}

export async function generateSA(
    cefrlevel: string,
    type: Type,
    genre: string,
    subgenre: string,
    passage: string,
    title: string,
    summary: string,
    imageDesc: string
) {
    const schema = z.object({
        questions: z.array(z.object({
            question_number: z.number(),
            question: z.string(),
            suggested_answer: z.string(),
        })).length(5)
    });


    return generateContent(
        cefrlevel,
        type,
        genre,
        subgenre,
        passage,
        title,
        summary,
        imageDesc,
        'prompts-combined-SA.json',
        'gpt-4o',
        schema
    );
}

export async function generateLA(
    cefrlevel: string,
    type: Type,
    genre: string,
    subgenre: string,
    passage: string,
    title: string,
    summary: string,
    imageDesc: string
) {
    const schema = z.object({
        question: z.string()
    });
    return generateContent(
        cefrlevel,
        type,
        genre,
        subgenre,
        passage,
        title,
        summary,
        imageDesc,
        'prompts-combined-LA.json',
        'gpt-4o',
        schema
    );
}

async function generateContent<T>(
    cefrlevel: string,
    type: Type,
    genre: string,
    subgenre: string,
    passage: string,
    title: string,
    summary: string,
    imageDesc: string,
    promptFile: string,
    modelId: string,
    schema: z.ZodType<T>
): Promise<T> {
    let cefrLevelReformatted = cefrlevel.replace("+", "").replace("-", "");
    if (cefrLevelReformatted === "A0") {
        cefrLevelReformatted = "A1";
    }
    const cefrLevelPrompts = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', promptFile), 'utf-8'));
    const { system_prompt: systemPrompt, user_prompt: baseUserPrompt } = cefrLevelPrompts[type][cefrLevelReformatted];

    const userPrompt = `${baseUserPrompt}\n\nPassage: ${passage}\nTitle: ${title}\nSummary: ${summary}\nImage Description: ${imageDesc}`;

    const generate = async () => {
        const { object: generatedContent } = await generateObject({
            model: openai(modelId),
            schema: schema,
            system: systemPrompt,
            prompt: userPrompt,
            maxTokens: 4000,
        });
        return generatedContent;
    };

    try {
        return await retry(generate);
    } catch (error) {
        throw new Error(`Failed to generate content step: ${promptFile}, ${error},`);
    }
}

export async function generateImage(imageDesc: string, articleId: string) {
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

    try {
        return await generate();
    } catch (error) {
        throw new Error(`Failed to generate image: ${error}`);
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
];

const LONG_AUDIO_URL = `${BASE_TEXT_TO_SPEECH_URL}/v1beta1/projects/reading-advantage/locations/global:synthesizeLongAudio`;

export async function test(passage: string, articleId: string) {
    const synthesizeLongAudio = async (text: string) => {
        const voice = voices[Math.floor(Math.random() * voices.length)];
        const outputUri = `gs://audios-test/${articleId}.wav`;

        const response = await axios.post(
            LONG_AUDIO_URL,
            {
                parent: "projects/reading-advantage/locations/global",
                input: { text: text },
                voice: {
                    languageCode: "en-US",
                    name: voice,
                },
                audioConfig: {
                    audioEncoding: "LINEAR16",
                },
                output_gcs_uri: outputUri,
            },
            {
                params: { key: process.env.GOOGLE_TEXT_TO_SPEECH_API_KEY },
                // params: { key: "ya29.a0AXooCgsgPXjerNss4R4PnFs7qNn-dv414C6LCVKATf1DdQfKJk0j8ZCSnCcK3IUgQbnbWYBmsEZvQ_ryz64tytwdCu9guD85cUnOsIuP_CDOW_U83N67mSRfAP1ShH-J3vsT2FOjwD9KHpXayjDhs7eJh7YpzUB-byMo68xUlBBcWOdQUgXxjcu5mv1Dazc7XNXjRlyU6T7Iil50x93CcymCZZwHoqV9Eekq5ZG4wTeMx9fxNXJA9oarxx_REcp-g-62iPCQ8QxoU9EWjW5RmqG1ysSLxoKvooGntjoNMvfR08oItsal3oCKph_yruRGPB730FmK1bwmwZuRwQ4D1_BeITNpufMGAQAFT_xzekEcwI0OraogWf4aePuxOrULRtBro9k5b0FtTnJOIAo9XBQjrK1XO_4aCgYKAecSARASFQHGX2Miogrc-OOJh8If55-uIg00XA0422" },
            }
            // {
            //     headers: {
            //         Authorization: `Bearer ${await getAccessToken()}`,
            //     },
            // }
        );

        console.log(JSON.stringify(response));
    };

    const sentences = splitTextIntoSentences(passage);
    const ssml = contentToSSML(sentences);

    try {
        if (Buffer.byteLength(ssml, 'utf-8') > 5000) {
            await synthesizeLongAudio(passage);
        } else {
        }
    } catch (error: any) {
        throw new Error(`Failed to generate audio: ${error} \n\n axios error: ${JSON.stringify(error.response.data)}`);
    }
}

function splitTextIntoChunks(content: string, maxBytes: number): string[] {
    const sentences = splitTextIntoSentences(content);
    const chunks: string[] = [];
    let currentChunk: string[] = [];

    sentences.forEach((sentence, index) => {
        currentChunk.push(sentence);
        const ssml = contentToSSML(currentChunk);

        if (new TextEncoder().encode(ssml).length > maxBytes) {
            currentChunk.pop();
            chunks.push(contentToSSML(currentChunk));
            currentChunk = [sentence];
        }

        if (index === sentences.length - 1 && currentChunk.length > 0) {
            chunks.push(contentToSSML(currentChunk));
        }
    });

    return chunks;
}

export async function generateAudio(passage: string, articleId: string) {
    const voice = voices[Math.floor(Math.random() * voices.length)];
    const generate = async (ssml: string, index: number) => {
        const response = await axios.post(
            `${BASE_TEXT_TO_SPEECH_URL}/v1beta1/text:synthesize`,
            {
                input: { ssml: ssml },
                voice: {
                    languageCode: "en-US",
                    name: voice,
                },
                audioConfig: {
                    audioEncoding: "MP3",
                    pitch: 0,
                    speakingRate: 1,
                },
                enableTimePointing: ["SSML_MARK"],
            },
            {
                params: { key: process.env.GOOGLE_TEXT_TO_SPEECH_API_KEY },
            }
        );
        const audio = response.data.audioContent;
        const MP3 = base64.toByteArray(audio);

        const localPath = `${process.cwd()}/data/audios/${articleId}_${index}.mp3`;
        fs.writeFileSync(localPath, MP3);

        await uploadToBucket(localPath, `${AUDIO_URL}/${articleId}_${index}.mp3`);

        return response.data.timepoints;
    };

    try {
        const chunks = splitTextIntoChunks(passage, 5000);
        const allTimepoints: any[] = [];
        let index = 0;

        for (let i = 0; i < chunks.length; i++) {
            const timepoints = await generate(chunks[i], i);

            timepoints.forEach((tp: any) => {
                allTimepoints.push({
                    markName: `sentence${index}`,
                    timeSeconds: tp.timeSeconds,
                    index: index,
                    file: `${articleId}_${i}.mp3`
                });
                index++;
            });
        }

        // Update the database with all timepoints
        await db.collection("new-articles").doc(articleId).update({
            timepoints: allTimepoints,
            id: articleId,
        });

    } catch (error: any) {
        throw new Error(`Failed to generate audio: ${error} \n\n axios error: ${JSON.stringify(error.response.data)}`);
    }
}

// export async function generateAudio(passage: string, articleId: string) {
//     const generate = async (ssml: string, id: string) => {
//         const voice = voices[Math.floor(Math.random() * voices.length)];
//         const response = await axios.post(
//             `${BASE_TEXT_TO_SPEECH_URL}/v1beta1/text:synthesize`,
//             {
//                 input: { ssml: ssml },
//                 voice: {
//                     languageCode: "en-US",
//                     name: voice,
//                 },
//                 audioConfig: {
//                     audioEncoding: "MP3",
//                     pitch: 0,
//                     speakingRate: 1,
//                 },
//                 enableTimePointing: ["SSML_MARK"],
//             },
//             {
//                 params: { key: process.env.GOOGLE_TEXT_TO_SPEECH_API_KEY },
//             }
//         );
//         const audio = response.data.audioContent;
//         const MP3 = base64.toByteArray(audio);

//         const localPath = `${process.cwd()}/data/audios/${id}.mp3`;
//         fs.writeFileSync(localPath, MP3);

//         return response.data.timepoints;
//     };

//     const splitSSML = (ssml: string, maxBytes: number) => {
//         const parts: string[] = [];
//         let startIndex = 0;

//         while (startIndex < ssml.length) {
//             let endIndex = startIndex + maxBytes;
//             if (endIndex >= ssml.length) {
//                 endIndex = ssml.length;
//             } else {
//                 const lastSpace = ssml.lastIndexOf(' ', endIndex);
//                 if (lastSpace > startIndex) {
//                     endIndex = lastSpace;
//                 }
//             }
//             parts.push(ssml.substring(startIndex, endIndex).trim());
//             startIndex = endIndex;
//         }

//         return parts;
//     };

//     try {
//         const ssml = contentToSSML(splitTextIntoSentences(passage));
//         const aggregatedTimepoints = [];

//         if (Buffer.byteLength(ssml, 'utf-8') > 5000) {
//             const ssmlParts = splitSSML(ssml, 5000);
//             for (const [index, part] of ssmlParts.entries()) {
//                 const partId = `${articleId}-${index}`;
//                 const timepoints = await generate(part, partId);
//                 aggregatedTimepoints.push(...timepoints.map((tp: any) => ({
//                     markName: tp.markName,
//                     timeSeconds: tp.timeSeconds + (index * 300) // Assuming each part is 5 minutes (300 seconds), adjust if necessary
//                 })));
//             }
//         } else {
//             const timepoints = await generate(ssml, articleId);
//             aggregatedTimepoints.push(...timepoints);
//         }

//         await db.collection("new-articles").doc(articleId).update({
//             timepoints: aggregatedTimepoints,
//             id: articleId,
//         });

//     } catch (error: any) {
//         throw new Error(`Failed to generate audio: ${error} \n\n axios error: ${JSON.stringify(error.response.data)}`);
//     }
// }



// const getHighlightedClass = (startTime: number, endTime: number) => {
//   if (!isPlaying) {
//     return "";
//   }
//   return currentTime >= startTime && currentTime < endTime ? "bg-yellow-700" : "";
// };