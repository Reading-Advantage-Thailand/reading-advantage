import OpenAI from "openai";
import { promptChatBot } from "@/data/prompt-chatbot";

export async function POST(req: Request, res: Response) {
  try {
    const param = await req.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

   console.log("param?.questionAll : ", param?.questionAll);
   console.log("param?.JSON : ", JSON.stringify(param?.questionAll.join(", ")));

  /*
   param?.questionAll :  [
  'What does Tom pack in his bag?',
  'What is inside the door Tom finds?',
  'What does Tom find at the top of the hill?',
  'What does Tom do with the water?',
  'What does Tom find at the bottom of the stairs?',
  'Where does Tom live?',
  "Write about Tom's journey to find water. What did he see? What did he do? How did he feel? Do you like adventures? Why or why not?"
]
   */

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
          "blacklisted-questions": ${param?.questionAll}
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
