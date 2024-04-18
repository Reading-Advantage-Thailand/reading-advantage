import db from "@/configs/firestore-config";
import { calculateLevel } from "@/lib/calculateLevel";
import { splitTextIntoSentences } from "@/lib/utils";
import openai from "@/utils/openai";
import uploadToBucket from "@/utils/uploadToBucket";
import axios from "axios";
import base64 from "base64-js";
import fs from "fs";
import OpenAI from "openai";

const assistantIds: { [key: string]: { id: string; name: string }[] } = {
    fiction: [
        {
            id: "asst_uWIsXVluIwJxmT3gEyhZe72Y",
            name: "A2",
        },
        {
            id: "asst_4i5fWky8QCELcw3Ec3ht6TwQ",
            name: "A1",
        },
        {
            id: "asst_5apPBs2xtlTo0qT223oWA6fD",
            name: "B2",
        },
        {
            id: "asst_crl0keDnvEMazaAvuprAtHaU",
            name: "B1",
        },
        {
            id: "asst_1WYbVAGBpOkgiBNvAEW58TtV",
            name: "C1-C2",
        },
    ],
    nonfiction: [
        {
            id: "asst_mhNwJm2FCZWJoeiXHEohmjtu",
            name: "C1-C2",
        },
        {
            id: "asst_JNr1HJOw6yMXCV1jVmAefW9T",
            name: "B2",
        },
        {
            id: "asst_MHlb5PjhFb0AxFCbvK3KjwiA",
            name: "B1",
        },
        {
            id: "asst_DR1DqEgss3Zl69ykEB6nIma4",
            name: "A1",
        },
        {
            id: "asst_upQr6f1fuOEX3ffqMPcp4wyT",
            name: "A2",
        },
    ],
};

const tasks = {
    fiction: [
        "get_about",
        "get_expo",
        "get_conflict",
        "get_rising",
        "get_climax",
        "get_falling",
        "get_resolution",
        "get_assets",
    ],
    nonfiction: [
        "get_about",
        "get_part1",
        "get_part2",
        "get_part3",
        "get_part4",
        "get_part5",
        "get_assets",
    ],
};

interface GenreType {
    subgenres: string[];
    name: string;
}

export async function POST(req: Request, res: Response) {
    try {
        // Randomly select a fiction genre
        const fictionGenres = await db.collection("genres-fiction").get();
        const fictionGenre = fictionGenres.docs[
            Math.floor(Math.random() * fictionGenres.docs.length)
        ].data() as GenreType;

        // Randomly select a nonfiction genre
        const nonfictionGenres = await db.collection("genres-nonfiction").get();
        const nonfictionGenre = nonfictionGenres.docs[
            Math.floor(Math.random() * nonfictionGenres.docs.length)
        ].data() as GenreType;

        console.log("Selected genres:", fictionGenre, nonfictionGenre);
        let fictionResults = [];
        let nonfictionResults = [];
        let index = 0;

        // for (const subgenre of fictionGenre.subgenres) {
        //     const response = await fictionArticleGenerator(fictionGenre.name, subgenre, assistantIds['fiction'][index++ % assistantIds['fiction'].length]);
        //     fictionResults.push(response);
        // }

        // for (const subgenre of nonfictionGenre.subgenres) {
        //     const response = await nonfictionArticleGenerator('nonfiction', nonfictionGenre.name, subgenre, nonfictionGenre.subgenres, assistantIds['nonfiction'][index++ % assistantIds['nonfiction'].length].id);
        //     nonfictionResults.push(response);
        // }

        // Run onlt 1 subgenre for each genre
        const response = await fictionArticleGenerator(fictionGenre.name, fictionGenre.subgenres[0], assistantIds['fiction'][index++ % assistantIds['fiction'].length]);
        fictionResults.push(response);

        const response2 = await nonfictionArticleGenerator('nonfiction', nonfictionGenre.name, nonfictionGenre.subgenres[0], nonfictionGenre.subgenres, assistantIds['nonfiction'][index++ % assistantIds['nonfiction'].length].id);
        nonfictionResults.push(response2);

        // // Remove subgenre in db if it's already generated (check the status)
        // const failedFiction = fictionResults.filter((result) => result.status === "failed");
        // const failedNonfiction = nonfictionResults.filter((result) => result?.status === "failed");

        // // Remove failed articles
        // for (const failed of failedFiction) {
        //     await db.collection("articles").doc(failed?.articleId).delete();
        // }

        const log = {
            selected: {
                fiction: fictionGenre,
                nonfiction: nonfictionGenre,
            },
            results: {
                fiction: fictionResults,
                nonfiction: nonfictionResults,
            },
            createdAt: Date.now(),
        }


        await db.collection('logs').add(log);

        return new Response(
            JSON.stringify({
                message: "Articles generated successfully",
                log,
            }),
            { status: 200 }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({
                message: `Error generating article: ${error}`,
            }),
            { status: 500 }
        );
    }
}

async function nonfictionArticleGenerator(
    type: string,
    genre: string,
    subgenre: string,
    subgenres: string[],
    assistantId: string
) {
    const commands = [
        `/about "type": "${type}", "genre": "${genre}", "subgenre": "${subgenre}"`,
        "/outline",
        "/passage",
        "/assets",
    ];
    let jsonResp = {};

    const thread = await openai.beta.threads.create();
    for (const command of commands) {
        try {
            const response = await assistant(command, assistantId, thread);
            // console.log('response:', response);
            console.log(
                "response:",
                JSON.stringify((response as any)[0].content[0].text.value)
            );

            if (command.startsWith("/about")) {
                // remmove ```json and ``` from the response
                const resp = (response as any)[0].content[0].text.value
                    .replace(/```json/g, "")
                    .replace(/```/g, "")
                    .replace(/(\d+)-(\d+)/g, "$1")
                    .replace(/[\u0000-\u001F]/g, "");
                // revent bad characters from the response
                console.log("resp /about:", resp);
                const json = JSON.parse(resp);
                if (json.wordcount) {
                    json["target-wordcount"] = json.wordcount;
                    delete json.wordcount;
                }
                jsonResp = {
                    threadId: response[0].thread_id,
                    type: json.type,
                    genre: genre,
                    subGenre: subgenre,
                    topic: json.topic,
                    targetWordcount: json["target-wordcount"],
                    targetWordsPerSentence: json["target-words-per-sentence"],
                };
            }

            if (command === "/passage") {
                const resp = (response as any)[0].content[0].text.value
                    .replace(/```json/g, "")
                    .replace(/```/g, "")
                    .replace(/[\u0000-\u001F]/g, "");
                console.log("resp /passage:", resp);
                const json = JSON.parse(resp);
                const level = calculateLevel(json.passage);
                jsonResp = {
                    ...jsonResp,
                    content: json.passage,
                    cefrLevel: level.cefrLevel,
                    raLevel: level.raLevel,
                };
            }

            if (command === "/assets") {
                const resp = (response as any)[0].content[0].text.value
                    .replace(/```json/g, "")
                    .replace(/```/g, "")
                    .replace(/[\u0000-\u001F]/g, "");
                console.log("resp /assets:", resp);
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

                const article = await db.collection("articles").add(jsonResp);

                // Generate image
                await imageGenerator(json.image, article.id, assistantId);

                // Generate voice
                await voiceGenerator(
                    (jsonResp as any).content,
                    article.id,
                    assistantId
                );

                return {
                    articleId: article.id,
                    message: "Article generated successfully",
                    status: "success",
                    assistantId: assistantId,
                    threadId: thread.id,
                };
            }
        } catch (error: any) {
            console.log("Error:", error);
            return {
                message: "Error generating article",
                status: "failed",
                error: error.message ? error.message : error,
                assistantId: assistantId,
                threadId: thread.id,
            };
        }
    }
}

async function assistant(
    endpoint: string,
    assistantId: string,
    thread: OpenAI.Beta.Threads.Thread
) {
    try {
        const message = await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: endpoint,
        });
        const run = await openai.beta.threads.runs.create(thread.id, {
            assistant_id: assistantId,
        });
        const retrieveRunStatus = async () => {
            let keepRetrieving;
            while (run.status !== "completed") {
                keepRetrieving = await openai.beta.threads.runs.retrieve(
                    thread.id,
                    run.id
                );
                if (keepRetrieving.status === "completed") {
                    break;
                }
            }
        };
        retrieveRunStatus();
        const retrieveMessages = async () => {
            await retrieveRunStatus();
            const messages = await openai.beta.threads.messages.list(run.thread_id);
            return messages.data;
        };
        const response = await retrieveMessages();
        return response;
    } catch (error) {
        console.log("ASSISTANT ERROR: ", error);
        throw error;
    }
}

async function fictionArticleGenerator(
    genre: string,
    subgenre: string,
    assistant: { id: string; name: string }
) {
    try {
        let article = {};
        // Add the content to the article + \n\n
        let content = "";
        // Step 1: Creating a thread
        const thread = await openai.beta.threads.create();

        // Step 2: Creating a message
        const message = await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: `get_about(${genre}, ${subgenre})`,
        });

        // Step 3: Create a run with custom instructions
        const run = await openai.beta.threads.runs.create(thread.id, {
            assistant_id: assistant.id,
        });

        // Function to check run status and print messages
        const checkStatusAndPrintMessages = async (threadId: any, runId: any) => {
            let runStatus;
            do {
                runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
                // console.log(runStatus)
                if (runStatus.status === "failed") {
                    console.log("Run failed");
                    throw "Run failed";
                }
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
                } else if (runStatus.status === "requires_action") {
                    console.log("Requires action");

                    const requiredActions =
                        runStatus.required_action?.submit_tool_outputs.tool_calls;
                    // console.log(requiredActions);

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
                                targetWordsPerSentence:
                                    functionArguments["target-words-per-sentence"],
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
                            };
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
                            };

                            console.log(article);
                            console.log("Article generated successfully");
                        } else {
                            console.log("Function not found");
                        }
                    }

                    // Submit the tool outputs to Assistant API
                    await openai.beta.threads.runs.submitToolOutputs(thread.id, run.id, {
                        tool_outputs: toolsOutput,
                    });
                } else {
                    console.log("Run is not completed yet.");
                    // Add a delay before checking the status again
                    await new Promise((resolve) => setTimeout(resolve, 10000)); // Delay for 10 seconds
                }
            } while (runStatus.status !== "completed");
        };

        // Call the function to continuously check the status until it's completed
        await checkStatusAndPrintMessages(thread.id, run.id);

        // add article to db
        const articleDoc = await db.collection("articles").add({
            ...article,
            threadId: thread.id,
            createdAt: new Date(),
        });

        // Generate voice and image
        await imageGenerator((article as any).image, articleDoc.id, assistant.id);

        // Generate voice
        await voiceGenerator((article as any).content, articleDoc.id, assistant.id);

        return {
            message: "Article generated successfully",
            status: "success",
            articleId: articleDoc.id,
            article: article,
            threadId: thread.id,
            assistant,
        };
    } catch (error) {
        console.log(error);
        return {
            message: `Error generating article: ${error}`,
            status: "failed",
            assistantId: assistant.id,
        };
        // return new Response(JSON.stringify({
        //     message: `Error generating article: ${error}`,
        // }), { status: 500 });
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
];

// Constants
const BASE_TEXT_TO_SPEECH_URL = "https://texttospeech.googleapis.com";
const AUDIO_URL = "audios";
const IMAGE_URL = "article-images";

// Helper functions
function contentToSSML(content: string[]): string {
    let ssml = "<speak>";
    content.forEach((sentence, i) => {
        ssml += `<s><mark name='sentence${i + 1}'/>${sentence}</s>`;
    });
    ssml += "</speak>";
    return ssml;
}

async function voiceGenerator(
    content: string,
    articleId: string,
    assistantId: string
) {
    try {
        const ssml = contentToSSML(splitTextIntoSentences(content));
        const voice = voices[Math.floor(Math.random() * voices.length)];
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

        const localPath = `${process.cwd()}/data/audios/${articleId}.mp3`;
        fs.writeFileSync(localPath, MP3);

        await db.collection("articles").doc(articleId).update({
            timepoints: response.data.timepoints,
        });

        await uploadToBucket(localPath, `${AUDIO_URL}/${articleId}.mp3`);
    } catch (error) {
        console.error("VOICE GENERATING ERROR: ", error);
        throw "Error generating voice: " + error;
    }
}

async function imageGenerator(
    description: string,
    articleId: string,
    assistantId: string
) {
    try {
        const response = await openai.images.generate({
            model: "dall-e-3",
            n: 1,
            prompt: description,
            size: "1024x1024",
        });

        const image = await axios.get(response.data[0].url as string, {
            responseType: "arraybuffer",
        });

        const localPath = `${process.cwd()}/data/images/${articleId}.png`;
        fs.writeFileSync(localPath, image.data);

        await uploadToBucket(localPath, `${IMAGE_URL}/${articleId}.png`);
    } catch (error) {
        console.log("IMAGE GENERATING ERROR: ", error);
        throw "Error generating image: " + error;
    }
}
