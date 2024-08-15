import OpenAI from "openai";

interface GenerateWordListParams {
  passage: string;
}

interface WordListResponse {
  vocabulary: string;
  definition: {
    en: string;
    th: string;
    cn: string;
    tw: string;
    vi: string;
  };
}

export async function generateWordList(
  params: GenerateWordListParams
): Promise<WordListResponse> {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const userPrompt = `Extract the ten most difficult vocabulary words, phrases, or idioms from the following passage: ${params.passage}`;

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
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an article database assisstant.",
        },
        { role: "user", content: `${userPrompt}` },
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

    const resultWordList = await JSON.parse(
      response.choices[0].message.function_call?.arguments as string
    )?.word_list;

    return resultWordList;

  } catch (error) {
    console.log(error);
    throw `failed to generate audio: ${
      error as unknown
    } \n\n axios error: ${JSON.stringify((error as any).response.data)}`;
  }
}
