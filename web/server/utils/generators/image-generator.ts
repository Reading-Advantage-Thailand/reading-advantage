import openai from "@/utils/openai";
import { experimental_generateImage as generateImages } from "ai";
import uploadToBucket from "@/utils/uploadToBucket";
import fs from "fs";
import { IMAGE_URL } from "../../constants";

interface GenerateImageParams {
  imageDesc: string;
  articleId: string;
}

export async function generateImage(
  params: GenerateImageParams
): Promise<void> {
  try {
    const { image } = await generateImages({
      model: openai.image("dall-e-3"),
      n: 1,
      prompt: params.imageDesc,
      size: "1024x1024",
    });

    const base64 = image.base64;

    const base64Image: Buffer = Buffer.from(base64, "base64");

    const localPath = `${process.cwd()}/data/images/${params.articleId}.png`;
    fs.writeFileSync(localPath, base64Image);

    await uploadToBucket(localPath, `${IMAGE_URL}/${params.articleId}.png`);
  } catch (error) {
    throw `failed to generate image: ${error}`;
  }
}
