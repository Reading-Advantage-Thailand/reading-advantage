import {
  AUDIO_WORDS_URL,
  AVAILABLE_VOICES,
  BASE_TEXT_TO_SPEECH_URL,
} from "../../constants";
import base64 from "base64-js";
import fs from "fs";
import uploadToBucket from "@/utils/uploadToBucket";
import db from "@/configs/firestore-config";
import axios from "axios";

export type WordListResponse = {
  vocabulary: string;
  definition: {
    en: string;
    th: string;
    cn: string;
    tw: string;
    vi: string;
  };
}
export type GenerateAudioParams = {
  wordList: WordListResponse;
  articleId: string;
}

interface TimePoint {
  timeSeconds: number;
  markName: string;
}

function contentToSSML(content: string[]): string {
  let ssml = "<speak>";
  content.forEach((sentence, i) => {
    ssml += `<s><mark name='word${i + 1}'/>${sentence}</s>`;
  });
  ssml += "</speak>";
  return ssml;
}

export async function generateAudioForWord({
  wordList,
  articleId,
}: GenerateAudioParams): Promise<void> {
  {
    try {     
      const voice = AVAILABLE_VOICES[Math.floor(Math.random() * AVAILABLE_VOICES.length)];
      const vocabulary: string[] = Array.isArray(wordList) ? wordList.map((item: any) => item?.vocabulary) : [];      
      let allTimePoints: TimePoint[] = [];

      const response = await axios.post(
        `${BASE_TEXT_TO_SPEECH_URL}/v1beta1/text:synthesize`,
        {
          input: { ssml: contentToSSML(vocabulary) },
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

      const audio = response?.data?.audioContent;
      const MP3 = base64.toByteArray(audio);      
      allTimePoints = response?.data?.timepoints;
      
      const localPath = `${process.cwd()}/data/audios-words/${articleId}.mp3`;

      fs.writeFileSync(localPath, MP3);

      await uploadToBucket(localPath, `${AUDIO_WORDS_URL}/${articleId}.mp3`);      
      
      await db.collection("word-list").doc(articleId).update({
        timepoints: allTimePoints,
        id: articleId,
      });

    } catch (error: any) {
      throw `failed to generate audio: ${error} \n\n axios error: ${JSON.stringify(
        error.response.data
      )}`;
    }
  }
}
