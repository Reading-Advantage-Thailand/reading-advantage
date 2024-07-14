import OpenAI from "openai";
import { z } from 'zod';
import { NextResponse } from "next/server";
import { promptChatBot } from "@/data/prompt-chatbot";

// Define the schema for the request body
const createChatbotSchema = z.object({
  title: z.string(),
  passage: z.string(),
  summary: z.string(),
  image_description: z.string(),
  blacklistedQuestions: z.array(z.string()),
  newMessage: z.object({
    text: z.string(),
    sender: z.string(),
  })
});

export async function POST(req: Request, res: Response) {
  try {
    const param = await req.json();
    const validatedData = createChatbotSchema.parse(param);
    console.log({validatedData});   

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
          "title": ${validatedData?.title},
          "passage": ${validatedData?.passage},
          "summary": ${validatedData?.summary},
          "image-description": ${validatedData?.image_description},   
          "blacklisted-questions": ${validatedData?.blacklistedQuestions}
          }`,
        },
        { role: "user", content: validatedData?.newMessage?.text },
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

     return NextResponse.json(
       { messages: "success", sender: "bot", text: fullMessage },
       { status: 201 }
     );
  } catch (error) {
     if (error instanceof z.ZodError) {
       return NextResponse.json({ errors: error.errors }, { status: 400 });
     }
     return NextResponse.json(
       { error: "Internal Server Error" },
       { status: 500 }
     );
  }
}
