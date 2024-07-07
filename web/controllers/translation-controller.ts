import db from "@/configs/firestore-config";
import { splitTextIntoSentences } from "@/lib/utils";
import { openai } from "@ai-sdk/openai";
import { Translate } from "@google-cloud/translate/build/src/v2";
import { generateObject } from "ai";
import { update } from "lodash";
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod";

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
}

export async function translate(request: NextRequest, ctx: RequestContext) {
    const { targetLanguage } = await request.json();

    if (!Object.values(LanguageType).includes(targetLanguage)) {
        return NextResponse.json({
            message: "Invalid target language",
        }, { status: 400 });
    }

    const articleSnapshot = await db.collection("new-articles").doc(ctx.params.article_id).get();
    const article = articleSnapshot.data();

    if (!article) {
        return NextResponse.json({
            message: "Article not found",
        }, { status: 404 });
    }

    // check that this language is not already translated
    // translation: {
    //     th: [translation],
    //     en: [translation],
    //     ch: [translation],
    // }
    const translationSnapshot = await db.collection("content-translations").doc(ctx.params.article_id).get();
    const translation = translationSnapshot.data();

    if (translation && translation.translation[targetLanguage]) {
        return NextResponse.json({
            message: "article already translated",
            translated_sentences: translation.translation[targetLanguage],
        });
    }

    const sentences = splitTextIntoSentences(article.passage);
    let translatedSentences: string[] = [];
    try {
        if (targetLanguage === LanguageType.EN) {
            translatedSentences = await translatePassageWithGPT(sentences);
        } else {
            translatedSentences = await translatePassageWithGoogle(sentences, targetLanguage);
        }
        // save translation to db
        await db.collection("content-translations").doc(ctx.params.article_id).set({
            id: ctx.params.article_id,
            updated_at: new Date().toISOString(),
            // [targetLanguage]: translatedSentences,
            translation: {
                [targetLanguage]: translatedSentences,
            }
        }, { merge: true });
        return NextResponse.json({
            message: "translation successful",
            translated_sentences: translatedSentences,
        });
    } catch (error) {
        return NextResponse.json({
            message: error,
        }, { status: 500 });
    }
}



async function translatePassageWithGoogle(sentences: string[], targetLanguage: string): Promise<string[]> {
    const translate = new Translate({
        projectId: process.env.GOOGLE_PROJECT_ID,
        key: process.env.GOOGLE_TRANSLATE_API_KEY,
    });

    const [translations] = await translate.translate(sentences, targetLanguage);
    if (!translations) {
        throw new Error("error translating passage with Google");
    }
    // check length of translated sentences
    if (translations.length !== sentences.length) {
        throw new Error("translated sentences length does not match original sentences length");
    }
    return translations;
}

async function translatePassageWithGPT(sentences: string[]): Promise<string[]> {

    const schema = z.object({
        translated_sentences: z.array(
            z.object({
                index: z.number(),
                original_sentence: z.string(),
                translated_sentence: z.string(),
            })
        ).length(sentences.length).describe("The translated passages"),
    });

    const prompt = "Please rephrase the following reading passage in the simplest language possible. Use multiple very simple sentences if necessary. number the original sentences, then provide the (multi-sentence) rephrasing for that sentence. Please output as strict JSON"
    const mapJSON = sentences.map((sentence, i) => {
        return {
            index: i,
            original_sentence: sentence,
            translated_sentence: ""
        }
    });

    const generate = async () => {
        const { object } = await generateObject({
            model: openai("gpt-3.5-turbo"),
            schema: schema,
            prompt: prompt + "\n\n" + JSON.stringify(mapJSON),
        });

        return object;
    };

    try {
        const response = await generate();
        // check length of translated sentences
        if (response.translated_sentences.length !== sentences.length) {
            throw new Error("translated sentences length does not match original sentences length");
        }
        return response.translated_sentences.map(({ translated_sentence }) => translated_sentence);
    } catch (error) {
        throw new Error("error translating passage with GPT: " + error);
    }
}