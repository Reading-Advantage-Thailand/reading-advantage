import { prisma } from "@/lib/prisma";
import { splitTextIntoSentences } from "@/lib/utils";
import { Translate } from "@google-cloud/translate/build/src/v2";
import { generateObject } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { openai, openaiModel } from "@/utils/openai";
import { google, googleModel } from "@/utils/google";

interface RequestContext {
  params: {
    article_id: string;
  };
}

export enum LanguageType {
  TH = "th",
  EN = "en",
  CN = "zh-CN",
  TW = "zh-TW",
  VI = "vi",
}

export type TranslateResponse = {
  translated_sentences: string[];
};

export async function translate(
  request: NextRequest,
  { params: { article_id } }: RequestContext
) {
  const { type, targetLanguage } = await request.json();

  if (!Object.values(LanguageType).includes(targetLanguage)) {
    return NextResponse.json(
      {
        message: "Invalid target language",
      },
      { status: 400 }
    );
  }

  const article = await prisma.article.findUnique({
    where: { id: article_id },
    select: {
      id: true,
      summary: true,
      translatedSummary: true,
      passage: true,
      translatedPassage: true,
      sentences: true,
    },
  });

  if (!article) {
    return NextResponse.json(
      {
        message: "Article not found",
      },
      { status: 404 }
    );
  }

  if (type === "summary") {
    const existingTranslations = article.translatedSummary as Record<
      string,
      string[]
    > | null;
    if (
      existingTranslations &&
      existingTranslations[targetLanguage]?.length > 0
    ) {
      return NextResponse.json({
        message: "Translation already exists",
        translated_sentences: existingTranslations[targetLanguage],
      });
    }
    const content = article.summary;
    if (!content) {
      return NextResponse.json(
        { message: "Summary not found" },
        { status: 404 }
      );
    }
    const sentences = splitTextIntoSentences(content);
    try {
      const temp = await translatePassageWithGoogle(sentences, targetLanguage);
      const translatedSentences =
        temp[targetLanguage as keyof typeof temp] || [];
      const updatedTranslations = {
        ...(existingTranslations || {}),
        [targetLanguage]: translatedSentences,
      };
      await prisma.article.update({
        where: { id: article_id },
        data: { translatedSummary: updatedTranslations },
      });
      return NextResponse.json({
        message: "Translation successful",
        translated_sentences: translatedSentences,
      });
    } catch (error) {
      return NextResponse.json({ message: error }, { status: 500 });
    }
  } else if (type === "passage") {
    const existingTranslations = article.translatedPassage as Record<
      string,
      string[]
    > | null;
    if (
      existingTranslations &&
      existingTranslations[targetLanguage]?.length > 0
    ) {
      return NextResponse.json({
        message: "Translation already exists",
        translated_sentences: existingTranslations[targetLanguage],
      });
    }
    if (!article.sentences) {
      return NextResponse.json(
        { message: "Sentences not found" },
        { status: 404 }
      );
    }
    let sentences: string[] = [];
    if (Array.isArray(article.sentences)) {
      sentences = (article.sentences as any[]).flatMap((s: any) => {
        if (typeof s === "string") return [s];
        if (Array.isArray(s)) return s;
        if (s && typeof s === "object" && s.sentences) {
          return Array.isArray(s.sentences) ? s.sentences : [s.sentences];
        }
        return [];
      });
    } else {
      sentences = [];
    }
    try {
      const temp = await translatePassageWithGPT(sentences, targetLanguage);
      const translatedSentences =
        temp[targetLanguage as keyof typeof temp] || [];
      const updatedTranslations = {
        ...(existingTranslations || {}),
        [targetLanguage]: translatedSentences,
      };
      await prisma.article.update({
        where: { id: article_id },
        data: { translatedPassage: updatedTranslations },
      });
      return NextResponse.json({
        message: "Translation successful",
        translated_sentences: translatedSentences,
      });
    } catch (error) {
      return NextResponse.json({ message: error }, { status: 500 });
    }
  } else {
    return NextResponse.json({ message: "Invalid type" }, { status: 400 });
  }
}

export async function translateForPrint(request: NextRequest) {
  const { passage, targetLanguage } = await request.json();

  let paragraphs: string[];
  try {
    const parsed = JSON.parse(passage);
    if (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      typeof parsed[0] === "object" &&
      "sentences" in parsed[0]
    ) {
      paragraphs = parsed.map((s: any) => s.sentences);
    } else {
      paragraphs = passage.split("\n\n");
    }
  } catch {
    paragraphs = passage.split("\n\n");
  }

  if (!Object.values(LanguageType).includes(targetLanguage)) {
    return NextResponse.json(
      {
        message: "Invalid target language",
      },
      { status: 400 }
    );
  }

  let translated: {
    cn: string[];
    en: string[];
    th: string[];
    tw: string[];
    vi: string[];
  };
  try {
    const temp = await translatePassageWithGoogle(paragraphs, targetLanguage);
    const translatedSentences = temp[targetLanguage as keyof typeof temp] || [];
    return NextResponse.json({
      message: "translation successful",
      translated_sentences: translatedSentences,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error,
      },
      { status: 500 }
    );
  }
}

async function translatePassageWithGoogle(
  sentences: string[],
  targetLanguage: string
): Promise<Record<string, string[]>> {
  const translate = new Translate({
    projectId: process.env.GOOGLE_PROJECT_ID,
    key: process.env.GOOGLE_TEXT_TO_SPEECH_API_KEY,
  });

  const result: Record<string, string[]> = {
    en: sentences,
  };

  if (targetLanguage !== "en") {
    const [translations] = await translate.translate(sentences, targetLanguage);
    if (!translations) {
      throw new Error("error translating passage with Google");
    }
    if (translations.length !== sentences.length) {
      throw new Error(
        "translated sentences length does not match original sentences length"
      );
    }
    result[targetLanguage] = translations;
  }

  return result;
}

async function translatePassageWithGPT(
  sentences: string[],
  targetLanguage: LanguageType,
  maxRetries: number = 3
): Promise<Record<string, string[]>> {
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const passageText = sentences.join(" ");

      const userPrompt = `Translate the following passage into ${targetLanguage}. The passage has been pre-split into ${sentences.length} sentences. Return each sentence as a separate array element. Passage: ${passageText}`;

      const schema = z.object({
        translations: z
          .array(z.string())
          .describe(`${targetLanguage} translation of each sentence`),
      });

      const { object: response } = await generateObject({
        model: google(googleModel),
        schema,
        system: `You are a professional translator. Translate the given passage sentence by sentence accurately while maintaining the original meaning and tone. The passage has been pre-split into exactly ${sentences.length} sentences. Return exactly ${sentences.length} translated sentences in the specified language array, maintaining the same sentence structure as the original.`,
        prompt: userPrompt,
      });

      // Ensure the response array matches the input sentence count
      const expectedLength = sentences.length;
      if (response.translations.length !== expectedLength) {
        throw new Error("Mismatch in translated sentences length");
      }

      const translations = response.translations;

      const result: Record<string, string[]> = {
        en: sentences,
      };

      result[targetLanguage] = translations;

      return result;
    } catch (error) {
      lastError = error;
      console.error(
        `Error generating translated passage (attempt ${attempt}/${maxRetries}):`,
        error
      );

      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s...
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  // If all retries failed, throw the error to be handled by calling function
  throw new Error(
    `Failed to generate translated passage after ${maxRetries} attempts: ${lastError?.message || "Unknown error"}`
  );
}

export async function translateChapterContent(
  request: NextRequest,
  {
    params: { storyId, chapterNumber },
  }: { params: { storyId: string; chapterNumber: string } }
) {
  const { type, targetLanguage } = await request.json();

  if (!Object.values(LanguageType).includes(targetLanguage)) {
    return NextResponse.json(
      { message: "Invalid target language" },
      { status: 400 }
    );
  }

  if (!storyId || typeof storyId !== "string") {
    return NextResponse.json({ message: "Invalid storyId" }, { status: 400 });
  }

  const chapterNum = parseInt(chapterNumber, 10);
  if (isNaN(chapterNum)) {
    return NextResponse.json(
      { message: "Invalid chapter number" },
      { status: 400 }
    );
  }

  const chapter = await prisma.chapter.findUnique({
    where: {
      storyId_chapterNumber: {
        storyId,
        chapterNumber: chapterNum,
      },
    },
  });

  if (!chapter) {
    return NextResponse.json({ message: "Chapter not found" }, { status: 404 });
  }

  if (type === "summary") {
    const existingTranslations = chapter.translatedSummary as Record<
      string,
      string[]
    > | null;

    if (
      existingTranslations &&
      existingTranslations[targetLanguage] &&
      existingTranslations[targetLanguage].length > 0
    ) {
      return NextResponse.json({
        message: "Chapter summary already translated",
        translated_sentences: existingTranslations[targetLanguage],
      });
    }

    if (!chapter.summary) {
      return NextResponse.json(
        { message: "Chapter summary not found" },
        { status: 404 }
      );
    }

    const sentences = splitTextIntoSentences(chapter.summary);
    let translated: Record<string, string[]>;
    try {
      translated = await translatePassageWithGPT(sentences, targetLanguage);

      const updatedTranslations = {
        ...(existingTranslations || {}),
        ...translated,
      };

      await prisma.chapter.update({
        where: {
          storyId_chapterNumber: {
            storyId,
            chapterNumber: chapterNum,
          },
        },
        data: {
          translatedSummary: updatedTranslations,
        },
      });

      return NextResponse.json({
        message: "Translation successful",
        translated_sentences: translated[targetLanguage] || [],
      });
    } catch (error) {
      console.error("Translation error:", error);
      return NextResponse.json(
        { message: "Translation failed" },
        { status: 500 }
      );
    }
  }

  if (type === "content") {
    const existingTranslations = chapter.translatedPassage as Record<
      string,
      string[]
    > | null;

    const translationsForTarget =
      existingTranslations?.[targetLanguage as string] ?? [];

    if (translationsForTarget.length > 0) {
      return NextResponse.json({
        message: "Chapter content already translated",
        translated_sentences: translationsForTarget,
      });
    }

    if (!chapter.passage) {
      return NextResponse.json(
        { message: "Chapter passage not found" },
        { status: 404 }
      );
    }

    let sentences: string[] = [];

    if (Array.isArray(chapter.sentences)) {
      // Normalize possible shapes into a flat string[] for translation
      sentences = (chapter.sentences as any[]).flatMap((s: any) => {
        if (typeof s === "string") return [s];
        if (Array.isArray(s)) return s;
        if (s && typeof s === "object" && s.sentences) {
          return Array.isArray(s.sentences) ? s.sentences : [s.sentences];
        }
        return [];
      });
    } else {
      sentences = [];
    }

    try {
      const temp = await translatePassageWithGPT(sentences, targetLanguage);

      const translatedSentences =
        temp[targetLanguage as keyof typeof temp] || [];

      const updatedTranslations = {
        ...(existingTranslations || {}),
        [targetLanguage]: translatedSentences,
      };

      const updated = await prisma.chapter.update({
        where: {
          storyId_chapterNumber: {
            storyId,
            chapterNumber: chapterNum,
          },
        },
        data: {
          translatedPassage: updatedTranslations,
        },
      });

      return NextResponse.json({
        message: "Translation successful",
        translated_sentences: translatedSentences,
      });
    } catch (error) {
      console.error("[translateChapterContent] Translation error:", error);
      return NextResponse.json(
        { message: "Translation failed" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { message: "Invalid type parameter" },
    { status: 400 }
  );
}

export async function translateStorySummary(
  request: NextRequest,
  { params: { storyId } }: { params: { storyId: string } }
) {
  const { type, targetLanguage } = await request.json();
  // console.log(`Received request to translate story summary with type: ${type} and targetLanguage: ${targetLanguage}`);

  if (!Object.values(LanguageType).includes(targetLanguage)) {
    // console.log("Invalid target language");
    return NextResponse.json(
      {
        message: "Invalid target language",
      },
      { status: 400 }
    );
  }

  if (!storyId || typeof storyId !== "string") {
    // console.log("Invalid storyId!");
    return NextResponse.json({ message: "Invalid storyId" }, { status: 400 });
  }

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: { chapters: true },
  });

  if (!story) {
    // console.log("Story not found!");
    return NextResponse.json({ message: "Story not found" }, { status: 404 });
  }

  const storyData = story;
  if (!storyData.storyBible || !(storyData.storyBible as any).summary) {
    // console.log("No summary found!");
    return NextResponse.json({ message: "No summary found" }, { status: 404 });
  }

  if (type === "summary") {
    // console.log("Translating story summary...");
    const existingTranslations = storyData.translatedSummary as Record<
      string,
      string[]
    > | null;

    if (existingTranslations && existingTranslations[targetLanguage]) {
      // console.log("Article already translated");
      return NextResponse.json({
        message: "article already translated",
        translated_sentences: existingTranslations[targetLanguage],
      });
    }

    const sentences = splitTextIntoSentences(
      (storyData.storyBible as any).summary
    );
    let translated: Record<string, string[]>;
    let translatedSentences: string[];
    try {
      translated = await translatePassageWithGoogle(sentences, targetLanguage);
      translatedSentences = translated[targetLanguage] || [];
      const updatedTranslations = {
        ...(existingTranslations || {}),
        [targetLanguage]: translatedSentences,
      };

      await prisma.story.update({
        where: { id: storyId },
        data: {
          translatedSummary: updatedTranslations,
        },
      });
      // console.log("Translation successful");
      return NextResponse.json({
        message: "translation successful",
        translated_sentences: translatedSentences,
      });
    } catch (error) {
      console.error("Translation error:", error);
      return NextResponse.json(
        {
          message: error,
        },
        { status: 500 }
      );
    }
  }

  if (type === "chapter") {
    // console.log("Translating chapter summaries...");
    let allTranslatedSentences: { [key: string]: string[] } = {};
    let allTranslationsExist = true;

    storyData.chapters.forEach((chapter: any, index: number) => {
      if (!chapter.summary) {
        allTranslationsExist = false;
        return;
      }
      const existingTranslations = chapter.translatedSummary as Record<
        string,
        string[]
      > | null;
      if (!existingTranslations || !existingTranslations[targetLanguage]) {
        allTranslationsExist = false;
      } else {
        allTranslatedSentences[index] = existingTranslations[targetLanguage];
      }
    });

    if (allTranslationsExist) {
      // console.log("Chapter summary already translated ", allTranslatedSentences);
      return NextResponse.json({
        message: "chapter summary already translated",
        translated_sentences: allTranslatedSentences,
      });
    }

    try {
      for (let index = 0; index < storyData.chapters.length; index++) {
        const chapter = storyData.chapters[index];
        if (!chapter.summary) {
          continue;
        }
        let translated: Record<string, string[]>;
        let translatedSentences: string[];

        translated = await translatePassageWithGoogle(
          [chapter.summary],
          targetLanguage
        );
        translatedSentences = translated[targetLanguage] || [];

        allTranslatedSentences[index] = translatedSentences;

        const existingTranslations = chapter.translatedSummary as Record<
          string,
          string[]
        > | null;
        const updatedTranslations = {
          ...(existingTranslations || {}),
          [targetLanguage]: translatedSentences,
        };

        await prisma.chapter.update({
          where: { id: chapter.id },
          data: {
            translatedSummary: updatedTranslations,
          },
        });
      }

      // console.log("Translation successful", allTranslatedSentences);

      return NextResponse.json({
        message: "translation successful",
        translated_sentences: allTranslatedSentences,
      });
    } catch (error) {
      console.error("Translation error:", error);
      return NextResponse.json(
        {
          message: error,
        },
        { status: 500 }
      );
    }
  }
}
