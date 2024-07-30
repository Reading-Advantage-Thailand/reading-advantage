import openai from "@/utils/openai";
import uploadToBucket from "@/utils/uploadToBucket";
import fs from "fs";
import { IMAGE_URL } from "../constants";
import axios from "axios";

interface GenerateImageParams {
    imageDesc: string;
    articleId: string;
}

export async function generateImage(params: GenerateImageParams): Promise<void> {
    try {
        const response = await openai.images.generate({
            model: "dall-e-3",
            n: 1,
            prompt: params.imageDesc,
            size: "1024x1024",
        });

        const image = await axios.get(response.data[0].url as string, {
            responseType: "arraybuffer",
        });

        const localPath = `${process.cwd()}/data/images/${params.articleId}.png`;
        fs.writeFileSync(localPath, image.data);

        await uploadToBucket(localPath, `${IMAGE_URL}/${params.articleId}.png`);
    } catch (error) {
        throw new Error(`failed to generate image: ${error}`);
    }
}
