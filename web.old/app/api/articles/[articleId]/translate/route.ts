// route
// api/articles/translate
import db from "@/configs/firestore-config";
import axios from "axios";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import * as z from "zod"
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from "openai/resources/chat/completions.mjs";

const routeContextSchema = z.object({
    params: z.object({
        articleId: z.string(),
    }),
})

enum LanguageType {
    TH = 'th',
    EN = 'en',
}
const translateSchema = z.object({
    sentences: z.array(z.string()),
    // th or en
    language: z.nativeEnum(LanguageType),
})

export async function POST(
    req: Request,
    context: z.infer<typeof routeContextSchema>
) {

    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new Response(JSON.stringify({
                message: 'Unauthorized',
            }), { status: 403 })
        }
        const json = await req.json();
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const { params } = routeContextSchema.parse(context)
        const articleId = params.articleId;
        const { sentences, language } = translateSchema.parse(json);

        // First need to find the translation of the article in db
        // If not found, translate the article
        // If found, return the translation
        const articleRef = db.collection(`${language}-translation`).doc(articleId);
        const articleSnapshot = await articleRef.get();
        const article = articleSnapshot.data();

        // translated-articles
        // fields: articleId, translation, 
        if (articleSnapshot.exists) {
            return new Response(JSON.stringify({
                translation: article?.translation,
                articleId: article?.articleId,
            }), { status: 200 })
        } else {
            const functions: OpenAI.Chat.ChatCompletionCreateParams.Function[] = [{
                name: 'get_translation',
                description: 'Translate a sentences from English to Thai',
                parameters: {
                    type: 'object',
                    properties: {
                        translated_sentences: {
                            type: 'array',
                            description: 'The translated sentences from English to Thai',
                            items: {
                                type: 'string',
                            },
                        },
                    },
                    required: ['translated_sentences'],
                },
            }]
            const messages: ChatCompletionMessageParam[] = [
                {
                    role: 'system',
                    content: 'You are a Thai translator',
                },
                {
                    role: 'user',
                    content: "Please translate the following article sentence by sentence. Keep each sentence's translation as true to the context of the entire article as much as possible.: " + JSON.stringify(sentences),
                },
            ];
            const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: messages,
                functions: functions,
                function_call: {
                    name: 'get_translation',
                }
            });

            console.log('completion', completion);
            // update translated-articles collection
            const functionCall = completion.choices[0].message.function_call;
            // Check if functionCall is defined before accessing its properties
            const translatedSentences = functionCall?.arguments
                ? JSON.parse(functionCall.arguments)?.translated_sentences
                : undefined;

            if (!translatedSentences) {
                return new Response(JSON.stringify({
                    message: 'Error translating',
                }), { status: 500 })
            }
            //translatedSentences length should be the same as sentences length
            if (translatedSentences.length !== sentences.length) {
                console.log('translatedSentences length error');
                return new Response(JSON.stringify({
                    message: 'Error translating sentences',
                }), { status: 500 })
            }
            const articleSnapshot = await articleRef.set({
                translation: translatedSentences,
                articleId: articleId,
            });
            // const chatCompletion: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create(params);
            return new Response(JSON.stringify({
                // result: result,
                translation: translatedSentences,
            }), { status: 200 })
        }

    } catch (error) {
        console.log('error', (error as Error).message);
        return new Response(JSON.stringify({
            message: (error as Error).message,
        }))

    }
}