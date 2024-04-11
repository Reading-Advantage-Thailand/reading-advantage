import db from "@/configs/firestore-config";
import { calculateLevel } from "@/lib/calculateLevel";
import { splitTextIntoSentences } from "@/lib/utils";
import openai from "@/utils/openai";
import uploadToBucket from "@/utils/uploadToBucket";
import axios from "axios";
import base64 from 'base64-js';
import fs from 'fs';
import { threadId } from "worker_threads";

export async function POST(req: Request, res: Response) {
    try {
        const { genre, type } = await req.json();
        const response = await articleGenerator('asst_uWIsXVluIwJxmT3gEyhZe72Y');
        return new Response(JSON.stringify({
            message: 'Articles generated successfully',
            genre: genre,
            type: type,
            response: response,
        }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({
            message: `Error generating article: ${error}`,
        }), { status: 500 });
    }
}

async function articleGenerator(assistantId: string) {
    try {
        let article = {};
        // Add the content to the article + \n\n
        let content = "";
        // Step 1: Creating a thread
        const thread = await openai.beta.threads.create();

        // Step 2: Creating a message
        const message = await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: 'get_about()'
        });

        // Step 3: Create a run with custom instructions
        const run = await openai.beta.threads.runs.create(thread.id, {
            assistant_id: assistantId,
        });

        // Function to check run status and print messages
        const checkStatusAndPrintMessages = async (threadId: any, runId: any) => {
            let runStatus;
            do {
                runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
                // console.log(runStatus)
                if (runStatus.status === "completed") {
                    let messages = await openai.beta.threads.messages.list(threadId);
                    messages.data.forEach((msg) => {
                        const role = msg.role;
                        const content = (msg as any).content[0].text.value;
                        console.log(
                            `${role.charAt(0).toUpperCase() + role.slice(1)}: ${content}`
                        );
                    });
                    console.log("Run is completed.");
                } else if (runStatus.status === 'requires_action') {
                    console.log("Requires action");

                    const requiredActions = runStatus.required_action?.submit_tool_outputs.tool_calls;
                    console.log(requiredActions);

                    let toolsOutput = [];

                    for (const action of requiredActions as any[]) {
                        const funcName = action.function.name;
                        const functionArguments = JSON.parse(action.function.arguments);

                        if (funcName === "get_about") {
                            console.log("running: get_about");
                            toolsOutput.push({
                                tool_call_id: action.id,
                                output: "get_expo()",
                            });
                            article = {
                                topic: functionArguments.topic,
                                genre: functionArguments.genre,
                                subgenre: functionArguments.subgenre,
                                targetWordCount: functionArguments["target-wordcount"],
                                targetWordsPerSentence: functionArguments["target-words-per-sentence"],
                            };
                        }
                        if (funcName === "get_expo") {
                            console.log("running: get_expo");
                            toolsOutput.push({
                                tool_call_id: action.id,
                                output: "get_conflict()",
                            });
                            article = {
                                ...article,
                                content: functionArguments.exposition,
                            }
                        }
                        if (funcName === "get_conflict") {
                            console.log("running: get_conflict");
                            toolsOutput.push({
                                tool_call_id: action.id,
                                output: "get_rising()",
                            });
                            content += functionArguments.conflict + "\n\n";
                        }
                        if (funcName === "get_rising") {
                            console.log("running: get_rising");
                            toolsOutput.push({
                                tool_call_id: action.id,
                                output: "get_climax()",
                            });
                            content += functionArguments.rising + "\n\n";
                        }
                        if (funcName === "get_climax") {
                            console.log("running: get_climax");
                            toolsOutput.push({
                                tool_call_id: action.id,
                                output: "get_falling()",
                            });
                            content += functionArguments.climax + "\n\n";
                        }
                        if (funcName === "get_falling") {
                            console.log("running: get_falling");
                            toolsOutput.push({
                                tool_call_id: action.id,
                                output: "get_resolution()",
                            });
                            content += functionArguments.falling + "\n\n";
                        }
                        if (funcName === "get_resolution") {
                            console.log("running: get_resolution");
                            toolsOutput.push({
                                tool_call_id: action.id,
                                output: "get_assets()",
                            });
                            content += functionArguments.resolution + "\n\n";
                        }
                        if (funcName === "get_assets") {
                            console.log("running: get_assets");
                            toolsOutput.push({
                                tool_call_id: action.id,
                                output: `true`,
                            });
                            const level = calculateLevel(content);
                            article = {
                                ...article,
                                content,
                                summary: functionArguments.summary,
                                image: functionArguments.image,
                                title: functionArguments.title,
                                readCount: 0,
                                averageRating: 0,
                                cefrLevel: level.cefrLevel,
                                raLevel: level.raLevel,
                            }

                            // calculate level
                            // Submit the tool outputs to Assistant API
                            // await openai.beta.threads.runs.submitToolOutputs(thread.id, run.id, {
                            //     tool_outputs: toolsOutput,
                            // });
                            console.log(article);
                            console.log("Article generated successfully")
                        } else {
                            console.log("Function not found");
                        }
                    }

                    // Submit the tool outputs to Assistant API
                    await openai.beta.threads.runs.submitToolOutputs(
                        thread.id,
                        run.id,
                        { tool_outputs: toolsOutput }
                    );
                } else {
                    console.log("Run is not completed yet.");
                    // Add a delay before checking the status again
                    await new Promise(resolve => setTimeout(resolve, 10000)); // Delay for 10 seconds
                }
            } while (runStatus.status !== "completed");
        };

        // Call the function to continuously check the status until it's completed
        await checkStatusAndPrintMessages(thread.id, run.id);


        // add article to db
        const articleDoc = await db.collection('articles')
            .add({
                ...article,
                threadId: thread.id,
                createdAt: new Date(),
            });

        // Generate voice and image
        await imageGenerator((article as any).image, articleDoc.id, assistantId);

        // Generate voice
        await voiceGenerator((article as any).content, articleDoc.id, assistantId);

        return {
            message: 'Article generated successfully',
            status: 'success',
            articleId: articleDoc.id,
            artidle: article,
            threadId: thread.id,
            assistantId: assistantId,
        }
    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify({
            message: `Error generating article: ${error}`,
        }), { status: 500 });
    }
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
            assistantIds: assistantId,
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