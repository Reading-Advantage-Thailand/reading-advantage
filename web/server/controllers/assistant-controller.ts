import { NextResponse, NextRequest } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import fs, { stat } from "fs";
import path from "path";
import { z } from "zod";
import db from "@/configs/firestore-config";
import storage from "@/utils/storage";
import OpenAI from "openai";
import { AUDIO_WORDS_URL } from "@/server/constants";
import { generateAudioForWord } from "@/server/utils/generators/audio-words-generator";
import { ExtendedNextRequest } from "./auth-controller";

interface RequestContext {
  params: {
    article_id: string;
    id: string;
  };
}

export async function getFeedbackWritter(res: object) {
  const systemPrompt = fs.readFileSync(
    path.join(process.cwd(), "data", "writing-feedback.md"),
    "utf-8"
  );

  // Input Schema
  const inputSchema = z.object({
    preferredLanguage: z.string(),
    targetCEFRLevel: z.enum(["A0", "A1", "A2", "B1", "B2", "C1", "C2"]),
    readingPassage: z.string(),
    writingPrompt: z.string(),
    studentResponse: z.string(),
  });

  // Output Schema
  const outputSchema = z.object({
    feedback: z.object({
      scores: z.object({
        vocabularyUse: z.number().int().min(1).max(5),
        grammarAccuracy: z.number().int().min(1).max(5),
        clarityAndCoherence: z.number().int().min(1).max(5),
        complexityAndStructure: z.number().int().min(1).max(5),
        contentAndDevelopment: z.number().int().min(1).max(5),
      }),
      overallImpression: z.string(),
      detailedFeedback: z.object({
        vocabularyUse: z.object({
          strengths: z.string(),
          areasForImprovement: z.string(),
          examples: z.string(),
          suggestions: z.string(),
        }),
        grammarAccuracy: z.object({
          strengths: z.string(),
          areasForImprovement: z.string(),
          examples: z.string(),
          suggestions: z.string(),
        }),
        clarityAndCoherence: z.object({
          strengths: z.string(),
          areasForImprovement: z.string(),
          examples: z.string(),
          suggestions: z.string(),
        }),
        complexityAndStructure: z.object({
          strengths: z.string(),
          areasForImprovement: z.string(),
          examples: z.string(),
          suggestions: z.string(),
        }),
        contentAndDevelopment: z.object({
          strengths: z.string(),
          areasForImprovement: z.string(),
          examples: z.string(),
          suggestions: z.string(),
        }),
      }),
      exampleRevisions: z.array(z.string()).min(2).max(3),
      nextSteps: z.array(z.string()).min(2).max(3),
    }),
  });

  try {
    const validatedInput = inputSchema.parse(res);

    const prompt = `
    User: Provide feedback for the following writing:

    Preferred Language: ${validatedInput.preferredLanguage}
    Target CEFR Level: ${validatedInput.targetCEFRLevel}
    Reading Passage: ${validatedInput.readingPassage}
    Writing Prompt: ${validatedInput.writingPrompt}
    Student Response: ${validatedInput.studentResponse}

    Please provide detailed feedback based on the CEFR criteria and Preferred Language.
    `;

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: outputSchema,
      system: systemPrompt,
      prompt,
    });

    if (!object.feedback) {
      return NextResponse.json({ error: "An error occurred" }, { status: 500 });
    } else {
      return NextResponse.json(object.feedback, { status: 200 });
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function getWordlist(req: ExtendedNextRequest) {
  const { articleId, article } = await req.json();

  // First need to find the word list of the article in db
  const wordListRef = db.collection(`word-list`).doc(articleId);
  const wordListSnapshot = await wordListRef.get();

  const fileExtension = ".mp3";

  const fileExists = await storage
    .bucket("artifacts.reading-advantage.appspot.com")
    .file(`${AUDIO_WORDS_URL}/${articleId}${fileExtension}`)
    .exists();

  if (wordListSnapshot?.exists && fileExists[0]) {
    const dataList = wordListSnapshot.data();
    return NextResponse.json(
      {
        messeges: "success",
        word_list: dataList?.word_list,
        timepoints: dataList?.timepoints,
      },
      { status: 200 }
    );
  } else {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt_user = `Extract the ten most difficult vocabulary words, phrases, or idioms from the following passage: ${article.passage}`;

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

    // Save to db
    const resultWordList = JSON.parse(
      response.choices[0].message.function_call?.arguments as string
    )?.word_list;

    await wordListRef.set({
      word_list: resultWordList,
      articleId: articleId,
    });

    await generateAudioForWord({
      wordList: resultWordList,
      articleId: articleId,
    });

    return NextResponse.json(
      {
        messeges: "success",
        word_list: resultWordList,
      },
      { status: 200 }
    );
  }
}

export async function postFlashCard(
  req: ExtendedNextRequest,
  { params: { id } }: RequestContext
) {
  try {
    const json = await req.json();
    console.log(json);

    if (json.page === "vocabulary") {
      await db
        .collection("user-word-records")
        .doc(id)
        .update({
          ...json,
        });
    } else {
      await db
        .collection("user-sentence-records")
        .doc(id)
        .update({
          ...json,
        });
    }

    return NextResponse.json({
      messeges: "success",
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({
      message: "Internal server error",
      status: 500,
    });
  }
}
