import OpenAI from "openai";
import db from "@/configs/firestore-config";

export async function POST(req: Request, res: Response) {
  try {
    const param = await req.json();

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt_user = `Extract the ten most difficult vocabulary words, phrases, or idioms from the following passage: ${param.article.passage}`;

    const schema = {
      type: "object",
      properties: {
        word_list: {
          type: "array",
          items: {
            type: "object",
            properties: {
              vocabulary: {
                type: "string",
                description: "A difficult vocabulary word, phrase, or idiom.",
              },
              definition: {
                type: "object",
                properties: {
                  en: {
                    type: "string",
                    description:
                      "The English definition of the vocabulary in simple language.",
                  },
                  th: {
                    type: "string",
                    description: "The Thai translation of the vocabulary.",
                  },
                  cn: {
                    type: "string",
                    description:
                      "The Simplified Chinese translation of the vocabulary.",
                  },
                  tw: {
                    type: "string",
                    description:
                      "The Traditional Chinese translation of the vocabulary.",
                  },
                  vi: {
                    type: "string",
                    description:
                      "The Vietnamese translation of the vocabulary.",
                  },
                },
              },
            },
          },
        },
      },
      required: ["word_list"],
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an article database assisstant." },
        { role: "user", content: `${prompt_user}` },
      ],
      functions: [
        {
          name: "extract_difficult_vocabulary",
          description:
            "Extracts the ten most difficult vocabulary words, phrases, or idioms from a given passage and provides their definitions or translations in multiple languages.",
          parameters: schema,
        },
      ],
      function_call: {
        name: "extract_difficult_vocabulary",
      },
      temperature: 0.7,
    });

    return new Response(
      JSON.stringify({
        messages: "success",
        word_list: JSON.parse(
          response.choices[0].message.function_call?.arguments as string
        )?.word_list,
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
