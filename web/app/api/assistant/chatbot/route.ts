import OpenAI from "openai";
import { fetch } from "openai/_shims/index.mjs";

export async function POST(req: Request, res: Response) {
  try {
    const param = await req.json();
    console.log("newMessage: ", param?.newMessage);
    const response = await fetch(
      "https://api.openai.com/v1/engines/davinci-codex/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          prompt: param?.newMessage.text,
          max_tokens: 150,
        }),
      }
    );

    console.log("response data", response?.data);

    return new Response(
      JSON.stringify({
        messages: "success",
        sender: "bot",
        text: "text",
      }),
      { status: 200 }
    );

    /*
      const param = await req.json();
      let threadId = null
      console.log("newMessage: ", param?.newMessage);

      // OpenAI
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      // Check if a new conversation thread needs to be started
      if (threadId == null) {
        const thread = await openai.beta.threads.create();
        console.log("thread: ", thread);
        threadId = thread.id;
      }

      console.log("threadId: ", threadId);

      // add new message to thread
      await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: param?.newMessage.text,
      });

      // create a run
      const stream = await openai.beta.threads.runs.create(
        threadId,
        { assistant_id: '', stream: true }
      );

      console.log("stream", stream);
      console.log("stream.toReadableStream()", stream.toReadableStream());

      return new Response(
        JSON.stringify({
          messages: "success",
          sender: "bot",
          text: "text",
        }),
        { status: 200 }
      );
      */
  } catch (error) {
    console.log("error", error);
    return error;
  }
}
