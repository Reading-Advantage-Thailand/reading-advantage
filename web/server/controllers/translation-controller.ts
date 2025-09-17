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
    const existingTranslations = article.translatedSummary as {
      cn: string[];
      en: string[];
      th: string[];
      tw: string[];
      vi: string[];
    } | null;

    if (
      existingTranslations &&
      existingTranslations[
        targetLanguage as keyof typeof existingTranslations
      ] &&
      existingTranslations[targetLanguage as keyof typeof existingTranslations]
        .length > 0
    ) {
      return NextResponse.json({
        message: "article already translated",
        translated_sentences:
          existingTranslations[
            targetLanguage as keyof typeof existingTranslations
          ],
      });
    }

    if (!article.summary) {
      return NextResponse.json(
        {
          message: "Article summary not found",
        },
        { status: 404 }
      );
    }

    const sentences = splitTextIntoSentences(article.summary);

    let translated: {
      cn: string[];
      en: string[];
      th: string[];
      tw: string[];
      vi: string[];
    };
    try {
      translated = await translatePassageWithGPT(sentences);

      const updatedTranslations = {
        ...(existingTranslations || { cn: [], en: [], th: [], tw: [], vi: [] }),
        ...translated,
      };

      await prisma.article.update({
        where: { id: article_id },
        data: {
          translatedSummary: updatedTranslations,
        },
      });

      return NextResponse.json({
        message: "translation successful",
        translated_sentences:
          translated[targetLanguage as keyof typeof translated] || [],
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
  if (type === "passage") {
    const existingTranslations = article.translatedPassage as {
      cn: string[];
      en: string[];
      th: string[];
      tw: string[];
      vi: string[];
    } | null;

    if (
      existingTranslations &&
      existingTranslations[
        targetLanguage as keyof typeof existingTranslations
      ] &&
      existingTranslations[targetLanguage as keyof typeof existingTranslations]
        .length > 0
    ) {
      return NextResponse.json({
        message: "article already translated",
        translated_sentences:
          existingTranslations[
            targetLanguage as keyof typeof existingTranslations
          ],
      });
    }

    if (!article.passage) {
      return NextResponse.json(
        {
          message: "Article passage not found",
        },
        { status: 404 }
      );
    }

    let sentences: string[];
    try {
      const parsed = JSON.parse(article.passage);
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        typeof parsed[0] === "object" &&
        "sentences" in parsed[0]
      ) {
        sentences = parsed.map((s: any) => s.sentences);
      } else {
        sentences = splitTextIntoSentences(article.passage);
      }
    } catch {
      sentences = splitTextIntoSentences(article.passage);
    }

    let translated: {
      cn: string[];
      en: string[];
      th: string[];
      tw: string[];
      vi: string[];
    };
    try {
      translated = await translatePassageWithGPT(sentences);

      const updatedTranslations = {
        ...(existingTranslations || { cn: [], en: [], th: [], tw: [], vi: [] }),
        ...translated,
      };

      await prisma.article.update({
        where: { id: article_id },
        data: {
          translatedPassage: updatedTranslations,
        },
      });

      return NextResponse.json({
        message: "translation successful",
        translated_sentences:
          translated[targetLanguage as keyof typeof translated] || [],
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

  return NextResponse.json(
    { message: "Invalid type parameter" },
    { status: 400 }
  );
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
    translated = await translatePassageWithGPT(paragraphs);

    return NextResponse.json({
      message: "translation successful",
      translated_sentences:
        translated[targetLanguage as keyof typeof translated] || [],
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
): Promise<{
  cn: string[];
  en: string[];
  th: string[];
  tw: string[];
  vi: string[];
}> {
  const translate = new Translate({
    projectId: process.env.GOOGLE_PROJECT_ID,
    key: process.env.GOOGLE_TEXT_TO_SPEECH_API_KEY,
  });

  const result = {
    cn: [] as string[],
    en: sentences,
    th: [] as string[],
    tw: [] as string[],
    vi: [] as string[],
  };

  const langMap: Record<string, keyof typeof result> = {
    [LanguageType.CN]: "cn",
    [LanguageType.TH]: "th",
    [LanguageType.TW]: "tw",
    [LanguageType.VI]: "vi",
  };

  const key = langMap[targetLanguage];

  if (key) {
    const [translations] = await translate.translate(sentences, targetLanguage);
    console.log(
      "Google Translate response for",
      targetLanguage,
      ":",
      translations
    );
    if (!translations) {
      throw new Error("error translating passage with Google");
    }
    if (translations.length !== sentences.length) {
      throw new Error(
        "translated sentences length does not match original sentences length"
      );
    }
    result[key] = translations;
  }

  console.log("Google Translate result:", result);
  return result;
}

async function translatePassageWithGPT(
  sentences: string[],
  maxRetries: number = 3
): Promise<{
  cn: string[];
  en: string[];
  th: string[];
  tw: string[];
  vi: string[];
}> {
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const passageText = sentences.join(' ');

      const userPrompt = `Translate the following passage into Simplified Chinese (cn), Traditional Chinese (tw), Thai (th), and Vietnamese (vi). Keep the English version (en) as is. The passage has been pre-split into ${sentences.length} sentences. Return each sentence as a separate array element. Passage: ${passageText}`;

      const schema = z.object({
        cn: z.array(z.string()).describe("Simplified Chinese translation of each sentence"),
        en: z.array(z.string()).describe("English version of each sentence (original)"),
        th: z.array(z.string()).describe("Thai translation of each sentence"),
        tw: z.array(z.string()).describe("Traditional Chinese translation of each sentence"),
        vi: z.array(z.string()).describe("Vietnamese translation of each sentence"),
      });

      const { object: response } = await generateObject({
        model: google(googleModel),
        schema,
        system: `You are a professional translator. Translate the given passage sentence by sentence accurately while maintaining the original meaning and tone. The passage has been pre-split into exactly ${sentences.length} sentences. Return exactly ${sentences.length} translated sentences in each language array, maintaining the same sentence structure as the original.`,
        prompt: userPrompt,
      });

      // Ensure the response arrays match the input sentence count
      const expectedLength = sentences.length;
      if (response.en.length !== expectedLength) {
        response.en = sentences; // Use the original sentences for English
      }

      return response;
    } catch (error) {
      lastError = error;
      console.error(`Error generating translated passage (attempt ${attempt}/${maxRetries}):`, error);

      if (attempt < maxRetries) {
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s...
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  // If all retries failed, throw the error to be handled by calling function
  throw new Error(`Failed to generate translated passage after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
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
    const existingTranslations = chapter.translatedSummary as {
      cn: string[];
      en: string[];
      th: string[];
      tw: string[];
      vi: string[];
    } | null;

    if (
      existingTranslations &&
      existingTranslations[
        targetLanguage as keyof typeof existingTranslations
      ] &&
      existingTranslations[targetLanguage as keyof typeof existingTranslations]
        .length > 0
    ) {
      return NextResponse.json({
        message: "Chapter summary already translated",
        translated_sentences:
          existingTranslations[
            targetLanguage as keyof typeof existingTranslations
          ],
      });
    }

    if (!chapter.summary) {
      return NextResponse.json(
        { message: "Chapter summary not found" },
        { status: 404 }
      );
    }

    const sentences = splitTextIntoSentences(chapter.summary);
    let translated: {
      cn: string[];
      en: string[];
      th: string[];
      tw: string[];
      vi: string[];
    };
    try {
      translated = await translatePassageWithGPT(sentences);

      const updatedTranslations = {
        ...(existingTranslations || { cn: [], en: [], th: [], tw: [], vi: [] }),
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
        translated_sentences:
          translated[targetLanguage as keyof typeof translated] || [],
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
    const existingTranslations = chapter.translatedPassage as {
      cn: string[];
      en: string[];
      th: string[];
      tw: string[];
      vi: string[];
    } | null;

    if (
      existingTranslations &&
      existingTranslations[
        targetLanguage as keyof typeof existingTranslations
      ] &&
      existingTranslations[targetLanguage as keyof typeof existingTranslations]
        .length > 0
    ) {
      return NextResponse.json({
        message: "Chapter content already translated",
        translated_sentences:
          existingTranslations[
            targetLanguage as keyof typeof existingTranslations
          ],
      });
    }

    if (!chapter.passage) {
      return NextResponse.json(
        { message: "Chapter passage not found" },
        { status: 404 }
      );
    }

    let sentences: string[];
    try {
      const parsed = JSON.parse(chapter.passage);
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        typeof parsed[0] === "object" &&
        "sentences" in parsed[0]
      ) {
        sentences = parsed.map((s: any) => s.sentences);
      } else {
        sentences = splitTextIntoSentences(chapter.passage);
      }
    } catch {
      sentences = splitTextIntoSentences(chapter.passage);
    }

    let translated: {
      cn: string[];
      en: string[];
      th: string[];
      tw: string[];
      vi: string[];
    };
    try {
      translated = await translatePassageWithGPT(sentences);

      const updatedTranslations = {
        ...(existingTranslations || { cn: [], en: [], th: [], tw: [], vi: [] }),
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
          translatedPassage: updatedTranslations,
        },
      });

      return NextResponse.json({
        message: "Translation successful",
        translated_sentences:
          translated[targetLanguage as keyof typeof translated] || [],
      });
    } catch (error) {
      console.error("Translation error:", error);
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
      string
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
    let translated: {
      cn: string[];
      en: string[];
      th: string[];
      tw: string[];
      vi: string[];
    };
    let translatedSentences: string[];
    try {
      translated = await translatePassageWithGPT(sentences);
      translatedSentences =
        translated[targetLanguage as keyof typeof translated] || [];
      const updatedTranslations = {
        ...(existingTranslations || {}),
        [targetLanguage]: translatedSentences.join(" "),
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
        let translated: {
          cn: string[];
          en: string[];
          th: string[];
          tw: string[];
          vi: string[];
        };
        let translatedSentences: string[];

        translated = await translatePassageWithGPT([chapter.summary]);
        translatedSentences =
          translated[targetLanguage as keyof typeof translated] || [];

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
