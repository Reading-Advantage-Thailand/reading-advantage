import { prisma } from "@/lib/prisma";
import { splitTextIntoSentences } from "@/lib/utils";
import { Translate } from "@google-cloud/translate/build/src/v2";
import { generateObject } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { openai, openaiModel } from "@/utils/openai";
import db from "@/configs/firestore-config";

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
    const existingTranslations = article.translatedSummary as Record<string, string[]> | null;
    
    if (existingTranslations && existingTranslations[targetLanguage]) {
      return NextResponse.json({
        message: "article already translated",
        translated_sentences: existingTranslations[targetLanguage],
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

    let translatedSentences: string[] = [];
    try {
      if (targetLanguage === LanguageType.EN) {
        translatedSentences = await translatePassageWithGPT(sentences);
      } else {
        translatedSentences = await translatePassageWithGoogle(
          sentences,
          targetLanguage
        );
      }
      
      const updatedTranslations = {
        ...(existingTranslations || {}),
        [targetLanguage]: translatedSentences,
      };

      await prisma.article.update({
        where: { id: article_id },
        data: {
          translatedSummary: updatedTranslations,
        },
      });
      
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
  if (type === "passage") {
    const existingTranslations = article.translatedPassage as Record<string, string[]> | null;
    
    if (existingTranslations && existingTranslations[targetLanguage]) {
      return NextResponse.json({
        message: "article already translated",
        translated_sentences: existingTranslations[targetLanguage],
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

    const sentences = splitTextIntoSentences(article.passage);

    let translatedSentences: string[] = [];
    try {
      if (targetLanguage === LanguageType.EN) {
        translatedSentences = await translatePassageWithGPT(sentences);
      } else {
        translatedSentences = await translatePassageWithGoogle(
          sentences,
          targetLanguage
        );
      }
      
      const updatedTranslations = {
        ...(existingTranslations || {}),
        [targetLanguage]: translatedSentences,
      };

      await prisma.article.update({
        where: { id: article_id },
        data: {
          translatedPassage: updatedTranslations,
        },
      });
      
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

  return NextResponse.json(
    { message: "Invalid type parameter" },
    { status: 400 }
  );
}

export async function translateForPrint(request: NextRequest) {
  const { passage, targetLanguage } = await request.json();

  const paragraphs = passage.split("\n\n");

  if (!Object.values(LanguageType).includes(targetLanguage)) {
    return NextResponse.json(
      {
        message: "Invalid target language",
      },
      { status: 400 }
    );
  }

  let translatedSentences: string[] = [];
  try {
    if (targetLanguage === LanguageType.EN) {
      translatedSentences = await translatePassageWithGPT(paragraphs);
    } else {
      translatedSentences = await translatePassageWithGoogle(
        paragraphs,
        targetLanguage
      );
    }

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
): Promise<string[]> {
  const translate = new Translate({
    projectId: process.env.GOOGLE_PROJECT_ID,
    key: process.env.GOOGLE_TEXT_TO_SPEECH_API_KEY,
  });

  const [translations] = await translate.translate(sentences, targetLanguage);
  if (!translations) {
    throw new Error("error translating passage with Google");
  }
  // check length of translated sentences
  if (translations.length !== sentences.length) {
    throw new Error(
      "translated sentences length does not match original sentences length"
    );
  }
  return translations;
}

async function translatePassageWithGPT(sentences: string[]): Promise<string[]> {
  const schema = z.object({
    translated_sentences: z
      .array(
        z.object({
          index: z.number(),
          original_sentence: z.string(),
          translated_sentence: z.string(),
        })
      )
      .length(sentences.length)
      .describe("The translated passages"),
  });

  const prompt =
    "Please rephrase the following reading passage in the simplest language possible. Use multiple very simple sentences if necessary. number the original sentences, then provide the (multi-sentence) rephrasing for that sentence. Please output as strict JSON";
  const mapJSON = sentences.map((sentence, i) => {
    return {
      index: i,
      original_sentence: sentence,
      translated_sentence: "",
    };
  });

  const generate = async () => {
    const { object } = await generateObject({
      model: openai(openaiModel),
      schema: schema,
      prompt: prompt + "\n\n" + JSON.stringify(mapJSON),
    });

    return object;
  };

  try {
    const response = await generate();
    // check length of translated sentences
    if (response.translated_sentences.length !== sentences.length) {
      throw new Error(
        "translated sentences length does not match original sentences length"
      );
    }
    return response.translated_sentences.map(
      ({ translated_sentence }) => translated_sentence
    );
  } catch (error) {
    throw new Error("error translating passage with GPT: " + error);
  }
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

  const storyRef = db.collection("stories").doc(storyId);
  const storySnap = await storyRef.get();

  if (!storySnap.exists) {
    return NextResponse.json({ message: "Story not found" }, { status: 404 });
  }

  const storyData = storySnap.data();
  if (!storyData || !storyData.chapters) {
    return NextResponse.json({ message: "No chapters found" }, { status: 404 });
  }

  const chapterIndex = parseInt(chapterNumber, 10) - 1;
  if (chapterIndex < 0 || chapterIndex >= storyData.chapters.length) {
    return NextResponse.json(
      { message: "Invalid chapter number" },
      { status: 400 }
    );
  }

  const chapter = storyData.chapters[chapterIndex];
  if (!chapter.questions || chapter.questions.length === 0) {
    return NextResponse.json(
      { message: "No questions found" },
      { status: 404 }
    );
  }

  if (type === "summary") {
    const translationSnapshot = await db
      .collection(`chapter-translations`)
      .doc(storyId)
      .collection(chapterNumber)
      .doc(`summary-translation`)
      .get();

    const translation = translationSnapshot.data();

    if (translation && translation.summary[targetLanguage]) {
      return NextResponse.json({
        message: "Article already translated",
        translated_sentences: translation.summary[targetLanguage],
      });
    }

    const sentences = splitTextIntoSentences(chapter.summary);
    let translatedSentences: string[] = [];
    try {
      if (targetLanguage === LanguageType.EN) {
        translatedSentences = await translatePassageWithGPT(sentences);
      } else {
        translatedSentences = await translatePassageWithGoogle(
          sentences,
          targetLanguage
        );
      }

      await db
        .collection(`chapter-summary-translations`)
        .doc(storyId)
        .collection(chapterNumber)
        .doc(`summary-translation`)
        .set(
          {
            id: storyId,
            updated_at: new Date().toISOString(),
            summary: { [targetLanguage]: translatedSentences },
          },
          { merge: true }
        );

      return NextResponse.json({
        message: "Translation successful",
        translated_sentences: translatedSentences,
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
    const translationSnapshot = await db
      .collection("chapter-translations")
      .doc(storyId)
      .collection(chapterNumber)
      .doc(`content-translation`)
      .get();
    const translation = translationSnapshot.data();

    if (translation && translation.translation[targetLanguage]) {
      return NextResponse.json({
        message: "Article already translated",
        translated_sentences: translation.translation[targetLanguage],
      });
    }

    const sentences = splitTextIntoSentences(chapter.content);
    let translatedSentences: string[] = [];
    try {
      if (targetLanguage === LanguageType.EN) {
        translatedSentences = await translatePassageWithGPT(sentences);
      } else {
        translatedSentences = await translatePassageWithGoogle(
          sentences,
          targetLanguage
        );
      }

      await db
        .collection("chapter-translations")
        .doc(storyId)
        .collection(chapterNumber)
        .doc(`content-translation`)
        .set(
          {
            id: storyId,
            updated_at: new Date().toISOString(),
            translation: { [targetLanguage]: translatedSentences },
          },
          { merge: true }
        );

      return NextResponse.json({
        message: "Translation successful",
        translated_sentences: translatedSentences,
      });
    } catch (error) {
      console.error("Translation error:", error);
      return NextResponse.json(
        { message: "Translation failed" },
        { status: 500 }
      );
    }
  }

  // ถ้า type ไม่ใช่ "summary" หรือ "content" ให้ return error
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

  const storyRef = db.collection("stories").doc(storyId);
  const storySnap = await storyRef.get();

  if (!storySnap.exists) {
    // console.log("Story not found!");
    return NextResponse.json({ message: "Story not found" }, { status: 404 });
  }

  const storyData = storySnap.data();
  if (!storyData || !storyData.storyBible) {
    // console.log("No summary found!");
    return NextResponse.json({ message: "No summary found" }, { status: 404 });
  }

  if (type === "summary") {
    // console.log("Translating story summary...");
    const translationSnapshot = await db
      .collection(`stories-summary-translations`)
      .doc(storyId)
      .get();

    const translation = translationSnapshot.data();

    if (translation && translation.summary[targetLanguage]) {
      // console.log("Article already translated");
      return NextResponse.json({
        message: "article already translated",
        translated_sentences: translation.summary[targetLanguage],
      });
    }

    const sentences = splitTextIntoSentences(storyData.storyBible.summary);
    let translatedSentences: string[] = [];
    try {
      if (targetLanguage === LanguageType.EN) {
        translatedSentences = await translatePassageWithGPT(sentences);
      } else {
        translatedSentences = await translatePassageWithGoogle(
          sentences,
          targetLanguage
        );
      }
      await db
        .collection(`stories-summary-translations`)
        .doc(storyId)
        .set(
          {
            id: storyId,
            updated_at: new Date().toISOString(),
            summary: {
              [targetLanguage]: translatedSentences,
            },
          },
          { merge: true }
        );
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
    const translationSnapshot = await db
      .collection(`stories-chapter-summary-translations`)
      .doc(storyId)
      .get();

    const translation = translationSnapshot.data();

    let allTranslatedSentences: { [key: string]: string[] } = {};
    let allTranslationsExist = true;

    storyData.chapters.forEach((chapter: any, index: number) => {
      if (
        !translation ||
        !translation.summary[targetLanguage] ||
        !translation.summary[targetLanguage][index]
      ) {
        allTranslationsExist = false;
      } else {
        allTranslatedSentences[index] =
          translation.summary[targetLanguage][index];
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
        let translatedSentences: string[] = [];

        if (targetLanguage === LanguageType.EN) {
          translatedSentences = await translatePassageWithGPT([
            chapter.summary,
          ]);
        } else {
          translatedSentences = await translatePassageWithGoogle(
            [chapter.summary],
            targetLanguage
          );
        }

        allTranslatedSentences[index] = translatedSentences;
      }

      await db
        .collection(`stories-chapter-summary-translations`)
        .doc(storyId)
        .set(
          {
            id: storyId,
            updated_at: new Date().toISOString(),
            summary: {
              [targetLanguage]: allTranslatedSentences,
            },
          },
          { merge: true }
        );

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
