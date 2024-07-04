import OpenAI from "openai";
import { promptChatBot } from "@/data/prompt-chatbot";

export async function POST(req: Request, res: Response) {
  try {
    const param = await req.json();
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const stream = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `${promptChatBot}
          {
          "title": ${param?.article?.title},
          "passage": ${param?.article?.passage},
          "summary": ${param?.article?.summary},
          "image-description": ${param?.article?.image_description},
          }`,
        },
        { role: "user", content: param?.newMessage?.text },
      ],
      stream: true,
    });

    const messages = [];

    for await (const chunk of stream) {
      messages.push(chunk.choices[0]?.delta?.content);
    }

    const filteredMessages = messages.filter(
      (item) => item !== undefined && item !== ""
    );
    const fullMessage = filteredMessages.join("");

    return new Response(
      JSON.stringify({
        messages: "success",
        sender: "bot",
        text: fullMessage,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Internal server error",
      }),
      { status: 500 }
    );
  }
}
