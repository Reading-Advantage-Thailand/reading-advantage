import OpenAI from "openai";
import db from "@/configs/firestore-config";

export async function POST(req: Request, res: Response) {
  try {
    const param = await req.json();

    console.log("param", param);

    const messages = [];

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt_user = `Extract the ten most difficult vocabulary words, phrases, or idioms from the following passage: ${param.article.passage} }`;
    const schema = {
      type: "object",
      properties: {
        passage: {
          type: "string",
          description:
            "The passage text from which difficult vocabulary will be extracted.",
        },
        responses: {
          "200": {
            description:
              "A list of the ten most difficult vocabulary words, phrases, or idioms with their definitions or translations in multiple languages.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      vocabulary: {
                        type: "string",
                        description:
                          "A difficult vocabulary word, phrase, or idiom.",
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
                            description:
                              "The Thai translation of the vocabulary.",
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
                        required: ["en", "th", "cn", "tw", "vi"],
                      },
                    },
                    required: ["vocabulary", "definition"],
                  },
                },
              },
            },
          },
        },
        "400": {
          description: "Invalid input, please provide a valid passage.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: {
                    type: "string",
                    description:
                      "Error message describing why the input was invalid.",
                  },
                },
                required: ["error"],
              },
            },
          },
        },
      },
      required: ["passage", "responses","400"],
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

    console.log(
      "reponse.choices[0].message.function_call?.arguments as string",
       JSON.parse(response.choices[0].message.function_call?.arguments as string)
    );

   
    return new Response(
      JSON.stringify({
        messages: "success",
        // sender: "bot",
        wordList: JSON.parse(
          response.choices[0].message.function_call?.arguments as string
        ),
      }),
      { status: 200 }
    );
  } catch (error) {
    console.log("error", error);
    return new Response(
      JSON.stringify({
        message: "Internal server error",
      }),
      { status: 500 }
    );
  }
}
