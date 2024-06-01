import OpenAI from "openai";
import { Article } from "../types";
import dotenv from "dotenv";
import axios from "axios";
import storage from "../configs/bucket";
import fs from "fs";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function image_generator(
    image_description: string,
    article_id: string,
    local_path: string
) {
    try {
        console.time("Image Generation Time");
        const resp = await openai.images.generate({
            model: "dall-e-3",
            n: 1,
            prompt: image_description,
            size: "1024x1024",
        });

        const image = await axios.get(resp.data[0].url as string, {
            responseType: "arraybuffer",
        });

        fs.writeFileSync(local_path, image.data);

        await storage.bucket('artifacts.reading-advantage.appspot.com')
            .upload(local_path, {
                destination: `images/${article_id}.png`,
            });

        // make the file public
        await storage.bucket('artifacts.reading-advantage.appspot.com')
            .file(`images/${article_id}.png`)
            .makePublic();

        // Delete the file from the local file system
        fs.unlinkSync(local_path);
    } catch (error) {
        console.log("ERROR GENERATING IMAGE: ", error);
        throw error;
    } finally {
        console.timeEnd("Image Generation Time");
    }

}

