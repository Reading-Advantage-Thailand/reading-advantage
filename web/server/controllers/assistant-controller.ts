import { NextResponse, NextRequest } from "next/server";
import { generateObject, streamText } from "ai";
import fs, { stat } from "fs";
import path from "path";
import { z } from "zod";
import db from "@/configs/firestore-config";
import storage from "@/utils/storage";
import { AUDIO_WORDS_URL } from "@/server/constants";
import { generateAudioForWord } from "@/server/utils/generators/audio-words-generator";
import { ExtendedNextRequest } from "./auth-controller";
import { promptChatBot } from "@/data/prompt-chatbot";
import { openai, openaiModel } from "@/utils/openai";
import { generateWordList } from "../utils/generators/word-list-generator";

interface RequestContext {
  params: {
    article_id: string;
    id: string;
  };
}

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
  }),
});

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
      model: openai(openaiModel),
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
    const wordList = await generateWordList({
      passage: article.passage,
    });
    await wordListRef.set({
      word_list: wordList.word_list,
      articleId: articleId,
    });

    await generateAudioForWord({
      wordList: wordList.word_list,
      articleId: articleId,
    });

    return NextResponse.json(
      {
        messeges: "success",
        word_list: wordList.word_list,
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

    return NextResponse.json(
      {
        messeges: "success",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function chatBot(req: ExtendedNextRequest) {
  try {
    const param = await req.json();
    const validatedData = createChatbotSchema.parse(param);
    const { textStream } = streamText({
      model: openai(openaiModel),
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
    });

    const messages = [];
    for await (const textPart of textStream) {
      messages.push(textPart);
    }

    const filteredMessages = messages.filter(
      (item) =>
        item !== undefined && item !== "" && item !== "}" && item !== "{"
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
