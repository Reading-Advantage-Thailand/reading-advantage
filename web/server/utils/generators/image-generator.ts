import { experimental_generateImage as generateImages } from "ai";
import { GoogleGenAI } from "@google/genai";
import uploadToBucket from "@/utils/uploadToBucket";
import fs from "fs";
import { IMAGE_URL } from "../../constants";
import { openai, openaiImages } from "@/utils/openai";
import { google, googleImages } from "@/utils/google";
import { json } from "stream/consumers";

interface GenerateImageParams {
  imageDesc: string;
  articleId: string;
}

export async function generateImage(
  params: GenerateImageParams,
  maxRetries = 5
): Promise<void> {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      //console.log(`Generating image (Attempt ${attempts + 1}/${maxRetries})`);

      const { image } = await generateImages({
        model: openai.image(openaiImages),
        n: 1,
        prompt: params.imageDesc,
        size: "1024x1024",
      });

      // const { image } = await generateImages({
      //   model: google.image(googleImages),
      //   prompt: params.imageDesc,
      //   providerOptions: {
      //     vertex: {
      //       aspectRatio: "1:1",
      //       safetySetting: "block_some",
      //       personGeneration: "allow_all",
      //     },
      //   },
      // });

      const base64 = image.base64;
      const base64Image: Buffer = Buffer.from(base64, "base64");

      const localPath = `${process.cwd()}/data/images/${params.articleId}.png`;
      fs.writeFileSync(localPath, base64Image as Uint8Array);

      await uploadToBucket(localPath, `${IMAGE_URL}/${params.articleId}.png`);

      //console.log("Image generation successful!");
      return;
    } catch (error) {
      console.error(
        `Failed to generate image (Attempt ${attempts + 1}):`,
        error
      );
      attempts++;

      if (attempts >= maxRetries) {
        throw new Error(
          `Failed to generate image after ${maxRetries} attempts: ${error}`
        );
      }

      const delay = Math.pow(2, attempts) * 1000;
      //console.log(`Retrying in ${delay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function generateImageFlash(
  params: GenerateImageParams,
  maxRetries = 5
): Promise<void> {
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      const result = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp-image-generation",
        contents: params.imageDesc,
        config: {
          responseModalities: ["Text", "Image"],
        },
      });

      const parts = result.candidates?.[0]?.content?.parts || [];

      const imagePart = parts.find((part) =>
        part.inlineData?.mimeType?.startsWith("image")
      );
      if (!imagePart?.inlineData?.data) {
        throw new Error(
          "Image generation succeeded but no base64 data was returned."
        );
      }

      const base64 = imagePart.inlineData.data;
      const base64Image: Buffer = Buffer.from(base64, "base64");

      const localPath = `${process.cwd()}/data/images/${params.articleId}.png`;
      fs.writeFileSync(localPath, base64Image as Uint8Array);

      await uploadToBucket(localPath, `${IMAGE_URL}/${params.articleId}.png`);
      return;
    } catch (error) {
      console.error(
        `Failed to generate image (Attempt ${attempts + 1}):`,
        error
      );
      attempts++;

      if (attempts >= maxRetries) {
        throw new Error(
          `Failed to generate image after ${maxRetries} attempts: ${error}`
        );
      }

      const delay = Math.pow(2, attempts) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
