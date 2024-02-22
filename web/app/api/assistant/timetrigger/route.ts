// route: /api/assistant
import db from "@/configs/firestore-config";
import { Storage } from '@google-cloud/storage';
import OpenAI from "openai";
import fs from 'fs';
import axios from "axios";

// Store threads 
const threads: { [key: string]: any } = {};

// OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// bucket
const serviceAcoountKeyJSON = JSON.parse(process.env.SERVICE_ACCOUNT_KEY as string);
const storage = new Storage({
    projectId: 'reading-advantage',
    credentials: serviceAcoountKeyJSON,
})

export async function POST(req: Request, res: Response) {
    try {
        const { userId, assistantId } = await req.json();
        const assetRes: any = await generateAssets(userId, assistantId)
        await generateImage(
            assetRes.image,
            assetRes.docId,
        );

        return new Response(JSON.stringify({
            messages: 'success',
            userId: userId,
            assistantId: assistantId,
        }), { status: 200 });

    } catch (error) {
        return new Response(JSON.stringify({
            message: `Error sending command: ${error}`,
        }), { status: 500 });
    }

}

async function uploadImage(save_path: string, docId: string) {
    // upload image to firebase bucket
    await storage.bucket('artifacts.reading-advantage.appspot.com')
        .upload(save_path, {
            destination: `article-images/${docId}`,
        });

    // make the image public
    await storage.bucket('artifacts.reading-advantage.appspot.com')
        .file(`article-images/${docId}`)
        .makePublic();

    // delete the image from the local storage
    fs.unlinkSync(save_path);
}

async function downloadImage(image_url: string, save_path: string) {
    const response = await axios.get(image_url, {
        responseType: 'arraybuffer',
    });
    // save the image to the path
    fs.writeFileSync(save_path, response.data);
    return;
}


async function generateImage(imageDescription: string, docId: string) {
    const response = await openai.images.generate({
        model: "dall-e-3",
        n: 1,
        prompt: 'A panoramic view of a tranquil, picturesque village at dawn, with the silhouette of a teenage figure standing on a hill overlooking the scene, holding a notebook and pen, with the faint outline of an open book and quill symbolizing poetry in the sky above.',
        size: "1024x1024",
    });

    // save image to firebase bucket
    let image_url = response.data[0].url;
    console.log('Image URL:', image_url);

    const save_path = `${process.cwd()}/data/tmp/${docId}.jpg`

    // download image
    await downloadImage(image_url!, save_path);

    // upload image to firebase bucket
    await uploadImage(save_path, docId);

}

async function generateAssets(userID: string, assistantID: string) {
    try {
        const genresData = JSON.parse(fs.readFileSync('../data/genres-fiction.json', 'utf8'));
        const selectedGenre = genresData.Genres[Math.floor(Math.random() * genresData.Genres.length)];
        console.log('Selected genre:', selectedGenre);

        const existingArticles = await db.collection('articles').where('genre', '==', selectedGenre.Name).get();

        // if no articles exist for the genre, generate articles else select new random genre
        if (existingArticles.empty) {
            console.log('No matching documents.');

            for (const subgenre of selectedGenre.Subgenres) {
                console.log('Subgenre:', subgenre);
                console.log('Genre name:', selectedGenre.Name);
                const command = `/about "type": "fiction", "genre": "${selectedGenre.Name}", "subgenre": "${subgenre}"`;
                const about = await assistant(command, assistantID, userID);
                const outline = await assistant('/outline', assistantID, userID);
                const passage = await assistant('/passage', assistantID, userID);
                const revise = await assistant('/revise', assistantID, userID);
                const assets = await assistant('/assets', assistantID, userID);
                let jsonResponse;
                try {
                    jsonResponse = await assistant('/json', assistantID, userID);
                    console.log('JSON response:', jsonResponse);
                    console.log('JSON response 2:', (jsonResponse as any)[0].content[0].text);
                    const parsedJson = JSON.parse((jsonResponse as any)[0].content[0].text.value);
                    console.log('Parsed JSON:', parsedJson);
                    const articleData = {
                        type: parsedJson.type,
                        genre: selectedGenre.Name,
                        subgenre: subgenre,
                        topic: parsedJson.topic,
                        targetWordcount: parsedJson['target-wordcount'],
                        targetWordsPerSentence: parsedJson['target-words-per-sentence'],
                        outline: parsedJson.outline,
                        content: parsedJson.passage,
                        summary: parsedJson.summary,
                        title: parsedJson.title,
                        image: parsedJson.image,
                        createdAt: new Date(),
                    };
                    // console.log('Article data:', articleData);
                    const docRef = await db.collection('assistant-articles').add(articleData);

                    // generate image
                    await generateImage(articleData.image, docRef.id);

                } catch (error) {
                    console.log(error);
                    continue;
                }
            }
            return;
        }
    } catch (error) {
        console.log('Error reading genre data or querying database:', error);
    }
}

async function assistant(command: string, assistantID: string, userID: string) {
    if (!threads[userID]) {
        try {
            const newThread = await openai.beta.threads.create();
            threads[userID] = newThread.id;
        } catch (error) {
            console.log('error', error);
            return 'error';
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
        console.log('error', error);
        return error;
    }
}