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

export async function generateAudio({
  passage,
  articleId,
}: GenerateAudioParams): Promise<void> {
  try {
    const voice =
      AVAILABLE_VOICES[Math.floor(Math.random() * AVAILABLE_VOICES.length)];
    const newVoice =
      NEW_MODEL_VOICES[Math.floor(Math.random() * NEW_MODEL_VOICES.length)];

    const chunks = splitTextIntoChunks(passage, 5000);
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

    // const generate = async (ssml: string, index: number) => {
    //   const response = await fetch(
    //     `${BASE_TEXT_TO_SPEECH_URL}/v1beta1/text:synthesize?key=${process.env.GOOGLE_TEXT_TO_SPEECH_API_KEY}`,
    //     {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify({
    //         input: {
    //           ssml: ssml,
    //         },
    //         voice: {
    //           languageCode: "en-US",
    //           name: voice,
    //         },
    //         audioConfig: {
    //           audioEncoding: "MP3",
    //         },
    //         enableTimePointing: ["SSML_MARK"],
    //       }),
    //     }
    //   );

    //   if (!response.ok) {
    //     throw new Error(`Error: ${response.statusText}`);
    //   }

    //   const data = await response.json();
    //   const audio = data.audioContent;
    //   const MP3 = base64.toByteArray(audio);

    //   const localPath = `${process.cwd()}/data/audios/${articleId}_${index}.mp3`;
    //   fs.writeFileSync(localPath, MP3);

    //   await uploadToBucket(localPath, `${AUDIO_URL}/${articleId}_${index}.mp3`);

    //   return data.timepoints;
    // };

    //Generate all timepoints in parallel for efficiency
    // const allTimepoints = (
    //   await Promise.all(
    //     chunks.map(async (chunk, i) => {
    //       const chunkTimepoints = await generate(chunk, i);
    //       return chunkTimepoints.map((tp: { timeSeconds: number }) => ({
    //         markName: `sentence${currentIndex++}`,
    //         timeSeconds: tp.timeSeconds,
    //         index: currentIndex - 1,
    //         file: `${articleId}_${i}.mp3`,
    //       }));
    //     })
    //   )
    // ).flat();

    // Update the database with all timepoints

    await db.collection("new-articles").doc(articleId).update({
      timepoints: result,
      id: articleId,
    });
  } catch (error: any) {
    throw `failed to generate audio: ${error} \n\n error: ${JSON.stringify(
      error.response.data
    )}`;
  }
}
