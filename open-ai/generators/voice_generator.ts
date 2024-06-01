import OpenAI from "openai";
import { Article } from "../types";
import dotenv from "dotenv";
import axios from "axios";
import storage from "../configs/bucket";
import fs from "fs";
import Tokenizer from "sentence-tokenizer";
import base64 from "base64-js";

dotenv.config();

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

const BASE_TEXT_TO_SPEECH_URL = "https://texttospeech.googleapis.com";

function splitTextIntoSentences(content: string): string[] {
    // If content contains \n 
    const regex = /(\n\n|\n|\\n\\n|\\n)/g;
    if (content.match(regex)) {
        const replaced = content.replace(regex, '')
        const sentences = replaced.split(/(?<!\b(?:Mr|Mrs|Dr|Ms|St|Ave|Rd|Blvd|Ph|D|Jr|Sr|Co|Inc|Ltd|Corp|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.)(?<!\b(?:Mr|Mrs|Dr|Ms|St|Ave|Rd|Blvd|Ph|D|Jr|Sr|Co|Inc|Ltd|Corp|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec))\./).filter((sentence) => sentence.length > 0);
        return sentences;
    } else {
        const tokenizer = new Tokenizer();
        tokenizer.setEntry(content);
        const sentences = tokenizer.getSentences();
        return sentences;
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
export async function voice_generator(
    passage: string,
    article_id: string,
    local_path: string
) {
    try {
        console.time("Audio Generation Time");
        const ssml = contentToSSML(splitTextIntoSentences(passage));
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

        fs.writeFileSync(local_path, MP3);

        await storage.bucket('artifacts.reading-advantage.appspot.com')
            .upload(local_path, {
                destination: `tts/${article_id}.mp3`,
            });

        // make the file public
        await storage.bucket('artifacts.reading-advantage.appspot.com')
            .file(`tts/${article_id}.mp3`)
            .makePublic();

        fs.unlinkSync(local_path);

        return response.data.timepoints;
    } catch (error) {
        console.log("ERROR GENERATING AUDIO: ", error);
        throw error;
    } finally {
        console.timeEnd("Audio Generation Time");
    }
}