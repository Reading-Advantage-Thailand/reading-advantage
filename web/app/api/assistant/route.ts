// route: /api/assistant
import db from "@/configs/firestore-config";
import { Storage } from '@google-cloud/storage';
import OpenAI from "openai";
import fs from 'fs';
import axios from "axios";
import base64 from 'base64-js';
import { calculateLevel } from "@/lib/calculateLevel";

// OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Bucket Storage
const serviceAcoountKeyJSON = JSON.parse(process.env.SERVICE_ACCOUNT_KEY as string);
const storage = new Storage({
    projectId: 'reading-advantage',
    credentials: serviceAcoountKeyJSON,
});

// types
interface Genre {
    Name: string;
    Subgenres: string[];
}
enum uploadType {
    IMAGE = 'image',
    AUDIO = 'audio',
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
]
const baseVoiceApiUrl = "https://texttospeech.googleapis.com";


// Threads (Storing the thread for temporary use)
const threads: { [key: string]: any } = {};

export async function POST(req: Request, res: Response) {
    try {


        const { assistantId, type } = await req.json();
        console.log('assistantId', assistantId);
        console.log('type', type);

        // If the assistantId is not provided, return an error
        if (!assistantId) {
            return new Response(JSON.stringify({
                error: 'Assistant ID is required'
            }), { status: 400 });
        }
        if (!type) {
            return new Response(JSON.stringify({
                error: 'Article type is required'
            }), { status: 400 });
        }
        if (type !== 'fiction' && type !== 'nonfiction') {
            return new Response(JSON.stringify({
                error: 'Article type must be either fiction or nonfiction'
            }), { status: 400 });
        }

        const userId = 'assistantId';

        // Generate the article
        const response = await generate(assistantId, type, userId) as any;


        return new Response(JSON.stringify({
            messages: 'success',
            docId: response.docId,
            threads: threads[userId],
            json: response.json,
        }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({
            message: 'Error generating article',
            error: error,
        }), { status: 500 });

    }
}

let subgenreTmp: string;
async function generate(assistantId: string, type: string, userId: string) {
    const genres: Genre[] = type === 'fiction' ?
        JSON.parse(fs.readFileSync(`${process.cwd()}/data/genres-fiction.json`, 'utf-8')).Genres :
        JSON.parse(fs.readFileSync(`${process.cwd()}/data/genres-nonfiction.json`, 'utf-8')).Genres;

    // randomly select a genre
    const genre = genres[Math.floor(Math.random() * genres.length)];

    // commands
    const commands = ['/outline', '/passage', '/revise', '/assets']

    try {
        // queue the assistant to generate all subgenres
        for (const subgenre of genre.Subgenres) {
            subgenreTmp = subgenre;
            console.log(`Commnad: /about "type": "${type}", "genre": "${genre.Name}", "subgenre": "${subgenre}"`)
            const about = await assistant(`/about "type": "${type}", "genre": "${genre.Name}", "subgenre": "${subgenre}"`, assistantId, userId);
            console.log('about: ', about);

            for (const command of commands) {
                console.log(`Commnad: ${command}`)
                const commandRes = await assistant(`${command}`, assistantId, userId);
                console.log(`${command}: `, commandRes);
            }

            const response = await generateJson(assistantId, userId, type, genre, subgenre);
            return response;
            // generate just one subgenre for now
            break;
        }
    } catch (error: any) {
        // if error, regenerate the assistant
        console.log('Error generating assistant:', error);
        return new Response(JSON.stringify({
            message: 'Error generating assistant',
            error: error
        }), { status: 500 });

        // SyntaxError: Bad control character in string literal in JSON at position 2801
        // Re run /json
        // if (error.startsWith("SyntaxError")) {
        //     await generateJson(assistantId, userId, type, genre, subgenreTmp);
        // }
        // if (error.startsWith("Message creation error")) {
        //     return new Response(JSON.stringify({
        //         error: 'Message creation error'
        //     }), { status: 500 });
        // }
        // await generate(assistantId, type);
    }
}

async function generateJson(assistantId: string, userId: string, type: string, genre: Genre, subgenre: string) {
    console.log('Commnad: /json')
    const json = await assistant('/json', assistantId, userId);
    console.log('json: ', (json as any)[0].content[0].text.value);
    // remove number length from the string 15-20 to 15 only in "target-words-per-sentence": "15-20", field
    // if it have - in 15-20
    // not remove - in passage
    let newJsonStr = (json as any)[0].content[0].text.value.replace(/(\d+)-(\d+)/g, '$1');
    newJsonStr = newJsonStr.replace(/(\d+)-(\d+)/g, '$1');
    console.log('newJsonStr: ', newJsonStr);
    const parsed = JSON.parse(newJsonStr);
    console.log('parsed: ', parsed);


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
        console.log('No content or image. Regenerating...');
        throw new Error('No content or image');
    }

    // save the article to the database
    const doc = await db.collection('articles').add(article);
    console.log('Article saved to the database');

    // if environment is development,
    // save the article to the local file system
    // and assistant-articles collection
    // if (process.env.NODE_ENV === 'development') {
    fs.writeFileSync(`${process.cwd()}/data/${subgenre}.json`, JSON.stringify(article, null, 2));
    await db.collection('assistant-articles').doc(doc.id).set(article);
    console.log('Article saved to the local file system and database');
    // }

    await generateImage(parsed.image, doc.id);
    console.log('Image generated');

    await generateVoice(article.content, doc.id);
    console.log('Voice generated');

    return {
        docId: doc.id,
        thraedId: threads[userId],
        json: json,
    }

}

const splitToSentences = (content: string) => {
    // remove \n\n, \n, \\n\\n, \\n and all other break lines with .
    const regex = /(\n\n|\n|\\n\\n|\\n)/g;
    content = content.replace(regex, '');
    // split . but except for Mr. Mrs. Dr. Ms. and other abbreviations
    const sentences = content.split(/(?<!\b(?:Mr|Mrs|Dr|Ms|St|Ave|Rd|Blvd|Ph|D|Jr|Sr|Co|Inc|Ltd|Corp|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.)(?<!\b(?:Mr|Mrs|Dr|Ms|St|Ave|Rd|Blvd|Ph|D|Jr|Sr|Co|Inc|Ltd|Corp|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec))\./).filter((sentence) => sentence.length > 0);
    let ssml = "<speak>";
    sentences.forEach((sentence, i) => {
        ssml += `<s><mark name='sentence${i + 1}'/>${sentence}</s>`;
    });
    ssml += "</speak>";
    return ssml;
};

async function generateVoice(content: string, id: string) {
    const ssml = splitToSentences(content);
    const voice = voices[Math.floor(Math.random() * voices.length)];
    try {
        const response = await axios.post(`${baseVoiceApiUrl}/v1beta1/text:synthesize`, {
            input: {
                ssml: ssml
            },
            voice: {
                languageCode: "en-US",
                name: voice,
            },
            "audioConfig": {
                "audioEncoding": "MP3",
                "pitch": 0,
                "speakingRate": 1
            },
            "enableTimePointing": [
                "SSML_MARK"
            ],
        }, {
            params: {
                key: process.env.GOOGLE_TEXT_TO_SPEECH_API_KEY,
            },
        });
        const json = response.data.audioContent;
        const mp3 = base64.toByteArray(json);
        fs.writeFileSync(`${process.cwd()}/data/audios/${id}.mp3`, mp3);

        // upload timepoints
        await db.collection('articles').doc(id).update({
            timepoints: response.data.timepoints,
        });

        // if environment is development,
        // also update timepoints to assistant-articles collection
        // if (process.env.NODE_ENV === 'development') {
        await db.collection('assistant-articles').doc(id).update({
            timepoints: response.data.timepoints,
        });
        // }

        // upload the audio to the bucket
        await uploadToBucket(
            `${process.cwd()}/data/audios/${id}.mp3`,
            id,
            uploadType.AUDIO
        );
    } catch (error) {
        console.log((error as any).data.error);
        console.log('Error generating voice:', error);
        return new Response(JSON.stringify({
            message: 'Error generating voice',
            error: error
        }), { status: 500 });
        // throw error;
    }
}

async function uploadToBucket(localPath: string, docId: string, type: uploadType) {
    let destination: string;
    if (type === uploadType.IMAGE) {
        destination = `article-images/${docId}.png`;
    }
    else if (type === uploadType.AUDIO) {
        destination = `audios/${docId}.mp3`;
    } else {
        throw new Error('Invalid upload type');
    }
    try {
        // upload the file to the bucket
        await storage.bucket('artifacts.reading-advantage.appspot.com')
            .upload(localPath, {
                destination: destination,
            });

        // make the file public
        await storage.bucket('artifacts.reading-advantage.appspot.com')
            .file(destination)
            .makePublic();

        // delete the file from the local file system
        fs.unlinkSync(localPath);
    } catch (error) {
        console.log('Error uploading to the bucket:', error);
        // throw error;
        return new Response(JSON.stringify({
            message: 'Error uploading to the bucket',
            error: error
        }), { status: 500 });
    }
}

async function generateImage(description: string, id: string) {
    try {
        const response = await openai.images.generate({
            model: "dall-e-3",
            n: 1,
            prompt: description,
            size: "1024x1024",
        });

        // download the image
        const image = await axios.get(response.data[0].url as string, {
            responseType: 'arraybuffer',
        });

        // save image to the local file system
        fs.writeFileSync(`${process.cwd()}/data/tmp/${id}.jpg`, image.data);

        // upload the image to the bucket
        await uploadToBucket(
            `${process.cwd()}/data/tmp/${id}.jpg`,
            id,
            uploadType.IMAGE
        );
    } catch (error) {
        // if error, regenerate the image
        console.log('Error generating image:', error);
        await generateImage(description, id);
    }
}

async function assistant(command: string, assistantID: string, userID: string) {
    if (!threads[userID]) {
        try {
            const newThread = await openai.beta.threads.create();
            threads[userID] = newThread.id;
        } catch (error) {
            console.log("Thread creation error", error);
            // throw error;
            return new Response(JSON.stringify({
                message: 'Thread creation error',
                error: error
            }), { status: 500 });
        }
    }

    try {
        // Create message
        const message = await openai.beta.threads.messages.create(threads[userID], {
            role: 'user',
            content: command,
        });

        // Run the assistant
        const run = await openai.beta.threads.runs.create(threads[userID], {
            assistant_id: assistantID,
        });

        // Preiodically check for completion
        const retrieveRunStatus = async () => {
            let keepRetrieving;
            while (run.status !== 'completed') {
                keepRetrieving = await openai.beta.threads.runs.retrieve(
                    threads[userID],
                    run.id
                );
                if (keepRetrieving.status === 'completed') {
                    break;
                }
            }
        }
        retrieveRunStatus();

        // Retrieve the messages from the assistant
        const retrieveMessages = async () => {
            await retrieveRunStatus();
            const messages = await openai.beta.threads.messages.list(threads[userID]);
            // console.log('messages', messages);
            return messages.data;
        }

        // Wait for retrieveMessages to complete and send the response
        const response = await retrieveMessages();
        return response;
    } catch (error) {
        console.log('Message creation error', error);
        // throw error;
        return new Response(JSON.stringify({
            message: 'Message creation error',
            error: error,
        }), { status: 500 });
    }
}