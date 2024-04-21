// route: /api/assistant
import db from "@/configs/firestore-config";
import { Storage } from '@google-cloud/storage';
import OpenAI from "openai";
import fs from 'fs';
import axios from "axios";

// Store threads 
const threads: { [key: string]: any } = {};

// OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// bucket
const serviceAcoountKeyJSON = JSON.parse(process.env.SERVICE_ACCOUNT_KEY as string);
const storage = new Storage({
    projectId: 'reading-advantage',
    credentials: serviceAcoountKeyJSON,
})

export async function POST(req: Request, res: Response) {
    try {
        // console.log(process.cwd()'/data');
        // display all files in the data directory
        const files = fs.readdirSync(process.cwd() + '/data');
        console.log(files);

        const filesAudio = fs.readdirSync(process.cwd() + '/data/audios');
        console.log(filesAudio);
        const filesImage = fs.readdirSync(process.cwd() + '/data/images');

        return new Response(JSON.stringify({
            messages: 'success',
            files: files,
            filesAudio: filesAudio,
            filesImage: filesImage,
        }), { status: 200 });

    } catch (error) {
        return new Response(JSON.stringify({
            message: `Error sending command: ${error}`,
        }), { status: 500 });
    }

}

