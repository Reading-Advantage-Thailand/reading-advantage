//route: /api/assistant
import OpenAI from "openai";

// Store threads 
const threads: { [key: string]: any } = {};
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request, res: Response) {
    const { assistantId, command } = await req.json();
    console.log('assistantId', assistantId);
    console.log('command', command);
    const assistantID = process.env[assistantId];
    console.log('assistantID', assistantID);
    // Format: /about type='fiction' genre='fantasy' subgenre='urban fantasy' topic='werewolves' wc=500 twps=15
    if (!assistantID) {
        return new Response(JSON.stringify({
            message: 'Invalid assistant ID',
        }), { status: 400 });
    }
    const commandRegex = /^\/(about|outline|passage|revise|assets|json)/;

    if (!command || !commandRegex.test(command)) {
        return new Response(JSON.stringify({
            message: 'Invalid command',
        }), { status: 400 });
    }
    // /about genre='education' subgenre='basic English language' topic='Daily Activities'
    // to /about "genre": "education", "subgenre": "basic English language", "topic": "Daily Activities"

    // or /about type='fiction' genre='fantasy' subgenre='urban fantasy' topic='werewolves' wc=500 twps=15
    // to /about "type": "fiction", "genre": "fantasy", "subgenre": "urban fantasy", "topic": "werewolves", "wc": 500, "twps": 15
    const rewriteCommand = (command: string) => {
        const commandRegex = /^\/about type='(.*?)' genre='(.*?)' subgenre='(.*?)' topic='(.*?)' wc=(.*?) twps=(.*?)$/;
        const match = command.match(commandRegex);
        if (match) {
            const type = match[1];
            const genre = match[2];
            const subgenre = match[3];
            const topic = match[4];
            const wc = match[5];
            const twps = match[6];
            return `/about "type": "${type}", "genre": "${genre}", "subgenre": "${subgenre}", "topic": "${topic}", "wc": ${wc}, "twps": ${twps}`;
        }
        return command;
    }
    const rewrittenCommand = rewriteCommand(command);
    console.log('rewrittenCommand', rewrittenCommand);
    const userID = 'user_1';

    // const assistant = await openai.beta.assistants.retrieve(assistantID);
    // Create thread if it doesn't exist
    if (!threads[userID]) {
        try {
            const newThread = await openai.beta.threads.create();
            // console.log('newThread', newThread);
            threads[userID] = newThread.id;
        } catch (error) {
            console.log('error', error);
            return new Response(JSON.stringify({
                message: `Error creating thread: ${error}`,
            }), { status: 500 });
        }
    }

    // Send command to assistant
    try {
        // Create message
        const message = await openai.beta.threads.messages.create(threads[userID], {
            role: 'user',
            content: rewrittenCommand,
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
                // console.log('keepRetrieving', keepRetrieving);

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
            console.log('messages', messages);

            return new Response(JSON.stringify({
                messages: messages.data,
            }), { status: 200 });
        }

        // Wait for retrieveMessages to complete and send the response
        const response = await retrieveMessages();
        return response;
    } catch (error) {
        console.log('error', error);
        return new Response(JSON.stringify({
            message: `Error sending command: ${error}`,
        }), { status: 500 });
    }
}

