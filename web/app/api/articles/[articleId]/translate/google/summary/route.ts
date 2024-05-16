// route
// api/articles/[articleId]/translate/google
import db from "@/configs/firestore-config";
import * as z from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Translate } from "@google-cloud/translate/build/src/v2";

const routeContextSchema = z.object({
    params: z.object({
        articleId: z.string(),
    }),
});

enum LanguageType {
    TH = "th",
    EN = "en",
    CN = "zh-CN",
    TW = "zh-TW",
    VI = "vi",
}

const translateSchema = z.object({
    sentences: z.array(z.string()),
    // th or en
    language: z.nativeEnum(LanguageType),
});

export async function POST(
    req: Request,
    context: z.infer<typeof routeContextSchema>
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new Response(
                JSON.stringify({
                    message: "Unauthorized",
                }),
                { status: 403 }
            );
        }
        const json = await req.json();
        const { params } = routeContextSchema.parse(context);
        const articleId = params.articleId;
        const { sentences, language } = translateSchema.parse(json);

        // If the language is already English, return no translation
        if (language === LanguageType.EN) {
            return new Response(
                JSON.stringify({
                    translation: [],
                    articleId,
                }),
                { status: 200 }
            );
        }

        // First need to find the translation of the article in db
        const articleRef = db.collection(`summary-translations`).doc(articleId);
        const articleSnapshot = await articleRef.get();
        const article = articleSnapshot.data();

        // find local translation (th)
        // if not found, translate
        // if found, return translation
        // translated-articles
        // articleId: string
        // translation: {
        //     th: [translation],
        //     en: [translation],
        // }   ch: [translation],
        // }
        if (articleSnapshot.exists) {
            console.log(
                "==> article?.translation[language]",
                article?.summary[language]
            );
            if (article?.summary[language]) {
                return new Response(
                    JSON.stringify({
                        translation: article?.summary[language],
                        articleId: article?.articleId,
                    }),
                    { status: 200 }
                );
            } else {
                // translate from language
                const translate = new Translate({
                    projectId: process.env.GOOGLE_PROJECT_ID,
                    key: process.env.GOOGLE_TRANSLATE_API_KEY,
                });

                let [translations] = await translate.translate(sentences, language);
                translations = Array.isArray(translations)
                    ? translations
                    : [translations];

                // translations.forEach((translation, i) => {
                //     console.log(`${sentences[i]} => ${translation}`);
                // });
                // Translated sentences length should be the same as the original sentences
                if (translations.length !== sentences.length) {
                    return new Response(
                        JSON.stringify({
                            message: "Translation failed",
                        }),
                        { status: 500 }
                    );
                }

                // Save to db
                await articleRef.update({
                    // [`translation.${language}`]: translations,
                    [`summary.${language}`]: translations,
                });

                return new Response(
                    JSON.stringify({
                        translation: translations,
                        articleId,
                    }),
                    { status: 200 }
                );
            }
        } else {
            const translate = new Translate({
                projectId: process.env.GOOGLE_PROJECT_ID,
                key: process.env.GOOGLE_TRANSLATE_API_KEY,
            });
            let [translations] = await translate.translate(sentences, language);
            translations = Array.isArray(translations)
                ? translations
                : [translations];
            // translations.forEach((translation, i) => {
            //     console.log(`${sentences[i]} => ${translation}`);
            // });

            // Translated sentences length should be the same as the original sentences
            if (translations.length !== sentences.length) {
                console.log("==> translations", translations);
                return new Response(
                    JSON.stringify({
                        message: "Translation failed",
                    }),
                    { status: 500 }
                );
            }

            // Save to db
            await articleRef.set({
                // translation: {
                //     [language]: translations,
                // },
                summary: {
                    [language]: translations,
                },
                articleId,
            });
            return new Response(
                JSON.stringify({
                    translation: translations,
                    articleId,
                }),
                { status: 200 }
            );
        }

        // if (articleSnapshot.exists) {
        //     return new Response(JSON.stringify({
        //         translation: article?.translation,
        //         articleId: article?.articleId,
        //     }), { status: 200 })
        // } else {
        //     const translate = new Translate({
        //         projectId: process.env.GOOGLE_PROJECT_ID,
        //         key: process.env.GOOGLE_TRANSLATE_API_KEY,
        //     });
        //     let [translations] = await translate.translate(sentences, 'th');
        //     translations = Array.isArray(translations) ? translations : [translations];
        //     console.log('Translations:');
        //     // translations.forEach((translation, i) => {
        //     //     console.log(`${sentences[i]} => ${translation}`);
        //     // });

        //     // Translated sentences length should be the same as the original sentences
        //     if (translations.length !== sentences.length) {
        //         return new Response(JSON.stringify({
        //             message: 'Translation failed',
        //         }), { status: 500 })
        //     }
        //     // Save to db
        //     const translation = translations.join(' ');
        //     await articleRef.set({
        //         translation,
        //         articleId,
        //     });
        //     return new Response(JSON.stringify({
        //         translation,
        //         articleId,
        //     }), { status: 200 })
        // }
    } catch (error) {
        console.log(error);
        return new Response(
            JSON.stringify({
                message: "Internal server error",
            }),
            { status: 500 }
        );
    }
}