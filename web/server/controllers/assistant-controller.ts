import { NextResponse, NextRequest } from "next/server";
import { generateObject, streamText } from "ai";
import fs, { stat } from "fs";
import path from "path";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
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

const createLessonChatbotQuestionSchema = z.object({
  messages: z.array(
    z.object({
      text: z.string(),
      sender: z.enum(["user", "bot"]),
    })
  ),
  title: z.string(),
  passage: z.string(),
  summary: z.string(),
  image_description: z.string(),
  blacklistedQuestions: z.array(z.string()).optional().default([]),
  isInitial: z.boolean().optional().default(false),
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
      exampleRevisions: z.array(z.string()).optional(),
      nextSteps: z.array(z.string()).min(2).max(3).optional(),
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
    
    Important: For exampleRevisions, if the writing is very good and needs minimal improvements, you may provide an empty array []. If revisions are needed, provide 1-3 specific examples.
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

  const articleData = await prisma.article.findUnique({
    where: { id: articleId },
    select: { words: true },
  });

  const fileExtension = ".mp3";

  const fileExists = await storage
    .bucket("artifacts.reading-advantage.appspot.com")
    .file(`${AUDIO_WORDS_URL}/${articleId}${fileExtension}`)
    .exists();

  if (articleData?.words && fileExists[0]) {
    const wordlistData = articleData.words as any;

    let wordList = [];

    if (Array.isArray(wordlistData)) {
      wordList = wordlistData;
    } else if (wordlistData?.wordlist && Array.isArray(wordlistData.wordlist)) {
      wordList = wordlistData.wordlist;
    }

    if (wordList.length > 0 && !wordList[0].markName) {
      wordList = wordList.map((word: any, index: number) => ({
        ...word,
        markName: `word${index + 1}`,
        timeSeconds: index * 2,
      }));
    }

    return NextResponse.json(wordList, { status: 200 });
  } else {
    const wordList = await generateWordList({
      passage: article.passage,
    });

    const enhancedWordList = wordList.word_list.map(
      (word: any, index: number) => ({
        ...word,
        markName: `word${index + 1}`,
        timeSeconds: index * 2,
      })
    );

    await prisma.article.update({
      where: { id: articleId },
      data: {
        words: {
          wordlist: enhancedWordList,
        },
      },
    });

    await generateAudioForWord({
      wordList: wordList.word_list,
      articleId: articleId,
    });

    console.log("result:", enhancedWordList);

    return NextResponse.json(enhancedWordList, { status: 200 });
  }
}

export async function postFlashCard(
  req: ExtendedNextRequest,
  { params: { id } }: RequestContext
) {
  try {
    const json = await req.json();

    if (json.page === "vocabulary") {
      // Exclude fields that are not updatable or should be handled as relations
      const { 
        id: jsonId, 
        userId, 
        articleId, 
        user, 
        article, 
        createdAt, 
        updatedAt, 
        last_review,  // This field doesn't exist in schema, exclude it
        elapsed_days,
        scheduled_days,
        page,
        ...updateData 
      } = json;
      
      // Map the field names correctly for Prisma
      const cleanUpdateData = {
        ...updateData,
        elapsedDays: json.elapsed_days,
        scheduledDays: json.scheduled_days,
      };
      
      console.log("Updating UserWordRecord with data:", cleanUpdateData);
      
      await prisma.userWordRecord.update({
        where: { id },
        data: cleanUpdateData,
      });
    } else {
      // Exclude fields that are not updatable or should be handled as relations
      const { 
        id: jsonId, 
        userId, 
        articleId, 
        user, 
        article, 
        createdAt, 
        updatedAt, 
        last_review,
        elapsed_days,
        scheduled_days,
        page,
        ...updateData 
      } = json;
      
      // Map the field names correctly for Prisma
      const cleanUpdateData = {
        ...updateData,
        elapsedDays: json.elapsed_days,
        scheduledDays: json.scheduled_days,
      };
      
      console.log("Updating UserSentenceRecord with data:", cleanUpdateData);
      
      await prisma.userSentenceRecord.update({
        where: { id },
        data: cleanUpdateData,
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

export async function lessonChatBotQuestion(req: ExtendedNextRequest) {
  try {
    const param = await req.json();
    //console.log("Received Params:", param);
    const validatedData = createLessonChatbotQuestionSchema.parse(param);
    //console.log("Validated Data:", validatedData);

    const { messages, title, passage, summary, image_description, blacklistedQuestions, isInitial } =
      validatedData;

    // เตรียม system prompt ตามว่าเริ่มบทสนทนาใหม่หรือไม่
    const blacklistedQuestionsText = blacklistedQuestions && blacklistedQuestions.length > 0 
      ? `\n\nBlacklisted Questions (DO NOT answer these):\n${blacklistedQuestions.map((q, index) => `${index + 1}. ${q}`).join('\n')}`
      : '';

    const systemMessage = {
      role: "system" as const,
      content: isInitial
        ? `You are a helpful and friendly AI language tutor. Start the conversation by asking the user one engaging, open-ended question related to the following article to encourage reflection or discussion. Do not answer anything yet.

**IMPORTANT RULES:**
- You will only answer questions about the article, its language, exploration of the article's language, and exploration of the topic of the article.
- Do not respond to inquiries about comprehension questions from the lesson.
- For any questions outside the scope of the article, respond with: "I am sorry, but I can only discuss the current article. Let me ask you something related to the content instead."
- Always respond in the language of the user's question.
- Always recommend a next step or question in the conversation after answering.

Article:
Title: "${title}"
Summary: "${summary}"
Passage: "${passage}"
Image Description: "${image_description}"${blacklistedQuestionsText}`
        : `You are an AI English tutor helping with conversation practice about a specific article. The user is practicing their English conversation skills.

**IMPORTANT RULES:**
- You will ONLY answer questions about the article passage, its language, vocabulary, grammar from the passage, and exploration of the article's topic.
- Do NOT respond to inquiries about comprehension questions from the lesson - instead respond with: "That is one of our article's comprehension questions that you must answer on your own, so I can't help you with that. Sorry."
- If the user asks any of the blacklisted questions, respond with: "That is one of our article's comprehension questions that you must answer on your own, so I can't help you with that. Sorry."
- For any questions outside the scope of the article (personal questions, general knowledge, other topics), respond with: "I am sorry, but I can only discuss the current article. Let me redirect our conversation back to the content."
- Always respond in the language of the user's question.
- After filtering inappropriate questions, provide helpful feedback and ask a related follow-up question.

When the user asks appropriate questions about the article, you should:
1. Correct any grammar or sentence structure errors in their question.
2. Answer their question about the article content, vocabulary, or topic.
3. Provide constructive feedback and encouragement.
4. Ask a related follow-up question to continue the conversation about the article.

Use clear, friendly, and helpful language. Do not just say "Good job" — be specific about what they did well or how they can improve.

Article:
Title: "${title}"
Summary: "${summary}"
Passage: "${passage}"
Image Description: "${image_description}"${blacklistedQuestionsText}`,
    };

    //console.log("System Message:", systemMessage);

    // แปลงข้อความทั้งหมดจาก frontend เป็น messages สำหรับ OpenAI
    const chatMessages = messages.map((msg) => ({
      role: msg.sender === "user" ? ("user" as const) : ("assistant" as const),
      content: msg.text,
    }));

    //console.log("Chat Messages:", chatMessages);

    // ส่ง prompt เข้า OpenAI พร้อมประวัติ
    const { textStream } = await streamText({
      model: openai(openaiModel),
      messages: [systemMessage, ...chatMessages],
    });

    const streamChunks: string[] = [];

    for await (const chunk of textStream) {
      if (chunk && chunk !== "{" && chunk !== "}") {
        streamChunks.push(chunk);
      }
    }

    const fullMessage = streamChunks.join("").trim();

    //console.log("Stream Chunks:", streamChunks);
    //console.log("Full Message:", fullMessage);

    return NextResponse.json(
      {
        messages: "success",
        sender: "bot",
        text: fullMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation Error:", error.errors);
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }

    console.error("ChatBot API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
