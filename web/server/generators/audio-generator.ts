import { splitTextIntoSentences } from "@/lib/utils";
import { AUDIO_URL, AVAILABLE_VOICES, BASE_TEXT_TO_SPEECH_URL } from "../constants";
import base64 from "base64-js";
import fs from "fs";
import uploadToBucket from "@/utils/uploadToBucket";
import db from "@/configs/firestore-config";
import axios from "axios";

interface GenerateAudioParams {
    passage: string;
    articleId: string;
}

function passageToSSML(content: string[]): string {
    let ssml = "<speak>";
    content.forEach((sentence, i) => {
        ssml += `<s><mark name='sentence${i + 1}'/>${sentence}</s>`;
    });
    ssml += "</speak>";
    return ssml;
}

function splitTextIntoChunks(content: string, maxBytes: number): string[] {
    const sentences = splitTextIntoSentences(content);
    const chunks: string[] = [];
    let currentChunk: string[] = [];

    sentences.forEach((sentence, index) => {
        currentChunk.push(sentence);
        const ssml = passageToSSML(currentChunk);

        if (new TextEncoder().encode(ssml).length > maxBytes) {
            currentChunk.pop();
            chunks.push(passageToSSML(currentChunk));
            currentChunk = [sentence];
        }

        if (index === sentences.length - 1 && currentChunk.length > 0) {
            chunks.push(passageToSSML(currentChunk));
        }
    });

    return chunks;
}

async function fetchAudio(ssml: string, index: number, articleId: string): Promise<string[]> {
    try {
        const voice = AVAILABLE_VOICES[Math.floor(Math.random() * AVAILABLE_VOICES.length)];
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
    } catch (error) {
        throw new Error(`fetch audio failed ${error}`);
    }
}
export async function generateAudio(params: GenerateAudioParams): Promise<void> {
    const voice = AVAILABLE_VOICES[Math.floor(Math.random() * AVAILABLE_VOICES.length)];

    try {
        const chunks = splitTextIntoChunks(params.passage, 5000);
        const allTimepoints: any[] = [];
        let index = 0;

        for (let i = 0; i < chunks.length; i++) {
            const timepoints = await fetchAudio(chunks[i], i, params.articleId);
            timepoints.forEach((tp: any) => {
                allTimepoints.push({
                    markName: `sentence${index}`,
                    timeSeconds: tp.timeSeconds,
                    index: index,
                    file: `${params.articleId}_${i}.mp3`,
                });
                index++;
            });
        }

        // Update the database with all timepoints
        await db.collection("new-articles").doc(params.articleId).update({
            timepoints: allTimepoints,
            id: params.articleId,
        });
    } catch (error) {
        console.log(error);
        throw new Error(`failed to generate audio: ${error}`);
    }
}