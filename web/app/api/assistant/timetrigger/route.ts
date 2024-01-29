// route: /api/assistant
import db from "@/configs/firestore-config";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import OpenAI from "openai";
import fs from 'fs';

// Store threads 
const threads: { [key: string]: any } = {};
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request, res: Response) {
    try {
        const { userId, assistantId } = await req.json();
        await generateArticle(userId, assistantId)
        return new Response(JSON.stringify({
            messages: 'success',
        }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({
            message: `Error sending command: ${error}`,
        }), { status: 500 });
    }

}

async function generateArticle(userID: string, assistantID: string) {
    try {
        const genres = JSON.parse(fs.readFileSync('../data/genres-fiction.json', 'utf8'));
        const genre = genres.Genres[Math.floor(Math.random() * genres.Genres.length)];
        console.log('genre', genre);

        const genresData = await db.collection('assistant-articles').where('name', '==', genre.Name).get();

        // if no matching generated genre and then add to firestore
        if (genresData.empty) {
            console.log('No matching documents.');

            // start generate all subgenres
            for (const subgenre of genre.Subgenres) {
                console.log('subgenre', subgenre);
                console.log('genre.Name', genre.Name);
                const command = `/about "type": "fiction", "genre": "${genre.Name}", "subgenre": "${subgenre}"`;
                const about = await assistant(command, assistantID, userID);
                const outline = await assistant('/outline', assistantID, userID);
                const passage = await assistant('/passage', assistantID, userID);
                const revise = await assistant('/revise', assistantID, userID);
                const assets = await assistant('/assets', assistantID, userID);
                const json = await assistant('/json', assistantID, userID);
                console.log('json', json);

                // add to firestore
                const data = {
                    genre: genre.Name,
                    subgenre: subgenre,
                    logs: json,
                    createdAt: new Date(),
                };
                const docRef = await db.collection('assistant-articles').add(data);
                console.log('Document written with ID: ', docRef.id);
            }
            return;
        }
    } catch (error) {
        console.log('error', error);
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