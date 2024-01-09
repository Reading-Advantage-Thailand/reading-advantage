// route: /api/assistant/timetrigger
import cron from 'node-cron';
import OpenAI from "openai";
import fs from 'fs';

// Store threads
const threads: { [key: string]: any } = {};
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const task = () => {
    console.log('task');
}
// run every 1 minute
cron.schedule('*/1 * * * *', task);