// route: /api/assistant/questions

import db from "@/configs/firestore-config";
import { Storage } from '@google-cloud/storage';
import OpenAI from "openai";
import fs from 'fs';
import axios from "axios";

// OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// This route is used to generate questions for an article from assistant
// /mcquestions command
// /saquestions command
// /laquestions command
// required threadId
export async function POST(req: Request, res: Response) {
  try {
    const { threadId, articleId, assistantId } = await req.json();

    const mcq = await assistant('/mcquestions', assistantId, threadId);

    console.log('mcq', mcq);
    console.log('mcq', (mcq as any)[0].content[0].text.value);

    // const saq = await assistant('/saquestions', assistantId, threadId);
    // console.log('saq: ', saq);
    // console.log('saq: ', (mcq as any)[0].content[0].text.value);
    // const tfq = await assistant('/laquestions', assistantId, threadId);
    // console.log('tfq: ', tfq);
    return new Response(JSON.stringify({
      messages: 'success',
      assistantId: assistantId,
      mcq: mcq,
    }), { status: 200 });

  } catch (error) {
    console.error(error);
  }
}

async function assistant(command: string, assistantID: string, threadId: string) {
  try {

    const thread = await openai.beta.threads.retrieve(threadId);
    console.log('thread', thread);
    // Create message
    const message = await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: command,
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantID,
    });

    // Preiodically check for completion
    const retrieveRunStatus = async () => {
      let keepRetrieving;
      while (run.status !== 'completed') {
        keepRetrieving = await openai.beta.threads.runs.retrieve(
          thread.id,
          run.id
        );
        if (keepRetrieving.status === 'completed') {
          break;
        }
      }
    }
    retrieveRunStatus();

    // Retrieve the messages from the assistant
    const retrieveMessages = async () => {
      await retrieveRunStatus();
      const messages = await openai.beta.threads.messages.list(thread.id);
      // console.log('messages', messages);
      return messages.data;
    }

    // Wait for retrieveMessages to complete and send the response
    const response = await retrieveMessages();
    return response;
  } catch (error) {
    console.log('error', error);
    return error;
  }
}