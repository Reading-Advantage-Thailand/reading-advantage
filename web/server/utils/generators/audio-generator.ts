import { splitTextIntoSentences } from "@/lib/utils";
import {
  AUDIO_URL,
  AVAILABLE_VOICES,
  BASE_TEXT_TO_SPEECH_URL,
  NEW_MODEL_VOICES,
} from "../../constants";
import base64 from "base64-js";
import fs from "fs";
import { execSync } from "child_process";
import uploadToBucket from "@/utils/uploadToBucket";
import db from "@/configs/firestore-config";
import { generateObject } from "ai";
import { openai, openaiModel } from "@/utils/openai";
import { google, googleModel } from "@/utils/google";
import z from "zod";

interface GenerateAudioParams {
  passage: string;
  articleId: string;
}

function contentToSSML(content: string[]): string {
  let ssml = "<speak>";
  content.forEach((sentence, i) => {
    ssml += `<mark name='sentence${i + 1}'/>${sentence}`;
  });
  ssml += "</speak>";
  return ssml;
}

const generateSSML = async (article: string) => {
  try {
    //const prompt = `You are an SSML processing engine. Given the following text, break it into sentences and wrap each sentence in SSML tags. Add a <mark> tag before each sentence using the format <mark name='sentenceX'/> where X is the sentence number.\n\nHere is the text:\n---\n${article}\n---\n\nReturn only the SSML output, without explanations.`;
    const systemPrompt = `You are a text processor. Given an article, split it into individual sentences.
    Return only an array of strings, where each string is a complete sentence from the article.
    Preserve the original punctuation and formatting within each sentence.`;
    const userPrompt = `Split the following text into sentences: ${article}`;

    //and Add a <speak> tag before and end article only.
    const { object: ssml } = await generateObject({
      model: google(googleModel),
      schema: z
        .array(
          z.string().describe("A single complete sentence from the article")
        )
        .describe("Array of sentences extracted from the input article"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.2,
    });

    return ssml;
  } catch (error: any) {
    throw `failed to generate ssml: ${error}`;
  }
};

async function splitTextIntoChunks(
  content: string,
  maxBytes: number
): Promise<string[]> {
  // const sentences = splitTextIntoSentences(content);
  const sentences = await generateSSML(content);
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

export async function generateAudio({
  passage,
  articleId,
}: GenerateAudioParams): Promise<void> {
  try {
    const voice =
      AVAILABLE_VOICES[Math.floor(Math.random() * AVAILABLE_VOICES.length)];
    const newVoice =
      NEW_MODEL_VOICES[Math.floor(Math.random() * NEW_MODEL_VOICES.length)];

    const chunks = await splitTextIntoChunks(passage, 5000);
    let currentIndex = 0;
    let cumulativeTime = 0;

    const result: Array<{
      markName: string;
      timeSeconds: number;
      index: number;
      file: string;
    }> = [];
    [];
    const audioPaths: string[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const ssml = chunks[i];
      const response = await fetch(
        `${BASE_TEXT_TO_SPEECH_URL}/v1beta1/text:synthesize?key=${process.env.GOOGLE_TEXT_TO_SPEECH_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: {
              ssml: ssml,
            },
            voice: {
              languageCode: "en-US",
              name: voice,
            },
            audioConfig: {
              audioEncoding: "MP3",
            },
            enableTimePointing: ["SSML_MARK"],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      const audio = data.audioContent;
      const MP3 = base64.toByteArray(audio);

      const localPath = `${process.cwd()}/data/audios/${articleId}_${i}.mp3`;
      fs.writeFileSync(localPath, MP3);
      audioPaths.push(localPath);

      // Process timepoints and build the result array
      data.timepoints.forEach((tp: any) => {
        result.push({
          markName: `sentence${currentIndex++}`,
          timeSeconds: (tp.timeSeconds || 0) + cumulativeTime,
          index: currentIndex - 1,
          file: `${articleId}.mp3`, // Final combined file name
        });
      });

      // Update the cumulative time with the duration of the current chunk
      const chunkDuration =
        data.timepoints[data.timepoints.length - 1]?.timeSeconds || 0;
      cumulativeTime += chunkDuration;
    }

    // Combine MP3 files using FFmpeg
    const combinedAudioPath = `${process.cwd()}/data/audios/${articleId}.mp3`;
    const fileListPath = `${process.cwd()}/data/audios/${articleId}.txt`;
    fs.writeFileSync(
      fileListPath,
      audioPaths.map((p) => `file '${p}'`).join("\n")
    );

    execSync(
      `ffmpeg -f concat -safe 0 -i ${fileListPath} -c copy ${combinedAudioPath}`
    );

    // Cleanup
    audioPaths.forEach((p) => fs.unlinkSync(p));
    fs.unlinkSync(fileListPath);

    await uploadToBucket(combinedAudioPath, `${AUDIO_URL}/${articleId}.mp3`);

    // Update the database with all timepoints

    await db.collection("new-articles").doc(articleId).update({
      timepoints: result,
      id: articleId,
    });
  } catch (error: any) {
    console.log(error);
    // throw `failed to generate audio: ${error} \n\n error: ${JSON.stringify(
    //   error.response.data
    // )}`;
  }
}
