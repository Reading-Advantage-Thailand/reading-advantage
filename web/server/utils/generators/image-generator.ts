import fs from "fs";
import { generateText } from "ai";
import { IMAGE_URL } from "../../constants";
import uploadToBucket from "@/utils/uploadToBucket";
import { openai, openaiImages } from "@/utils/openai";
import { google, googleImages, googleFlashImage } from "@/utils/google";
import { experimental_generateImage as generateImages } from "ai";
import { GeneratedFile } from "ai";

interface FileWithBase64 extends GeneratedFile {
  base64Data: string;
  mimeType: string;
}

interface GenerateImageParams {
  prevImageDesc?: string;
  imageDesc: string;
  articleId: string;
  provider?: "openai" | "google";
}

export async function generateImage(
  params: GenerateImageParams,
  maxRetries = 5
): Promise<void> {
  let attempts = 0;
  const provider = params.provider || "openai";

  const prompt = params.prevImageDesc
    ? `You are generating a highly detailed illustration that continues from a previous scene.
Previous scene description: "${params.prevImageDesc}"
Now create the next scene with the following details:
Scene description: "${params.imageDesc}"
Make sure to preserve the continuity in character appearance, clothing, setting, and mood.
Include rich details, dramatic lighting, and a dynamic camera angle.
Style: cinematic, hyper-realistic, concept art quality.`
    : `Create a highly detailed illustration with the following description:
Scene description: "${params.imageDesc}"
Use dramatic lighting, rich textures, and a dynamic composition.
Style: cinematic, hyper-realistic, concept art quality.`;

  while (attempts < maxRetries) {
    try {
      let base64: string | undefined;

      if (provider === "openai") {
        const { image } = await generateImages({
          model: openai.image(openaiImages),
          prompt: prompt,
          n: 1,
          size: "1024x1024",
        });

        base64 = image.base64;
      } else if (provider === "google") {
        //const { image } = await generateImages({
        //  model: google.image(googleImages),
        //  prompt: params.imageDesc,
        //  providerOptions: {
        //   vertex: {
        //      aspectRatio: "1:1",
        //      safetySetting: "block_some",
        //      personGeneration: "allow_all",
        //    },
        //  },
        //});

        //base64 = image.base64;

        const result = await generateText({
          model: google(googleFlashImage),
          providerOptions: {
            google: { responseModalities: ["TEXT", "IMAGE"] },
          },
          prompt: prompt,
        });

        const file = result.files[0] as FileWithBase64;
        base64 = file.base64Data;
      }

      if (!base64) {
        throw new Error("Image base64 is undefined");
      }

      const buffer = Buffer.from(base64, "base64");
      const localPath = `${process.cwd()}/data/images/${params.articleId}.png`;
      fs.writeFileSync(localPath, buffer);

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
