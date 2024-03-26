// route
// api/articles/[articleId]
import db from "@/configs/firestore-config";
import * as z from "zod"
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const routeContextSchema = z.object({
    params: z.object({
        articleId: z.string(),
    }),
})
export async function GET(
    req: Request,
    context: z.infer<typeof routeContextSchema>
) {
    try {
        // Validate the route params.
        const { params } = routeContextSchema.parse(context)
        const articleId = params.articleId;

        const session = await getServerSession(authOptions);
        if (!session) {
            return new Response(JSON.stringify({
                message: 'Unauthorized',
            }), { status: 403 })
        }
        const userLevel = session.user.level;

        // Use the articleId as the document ID to fetch the article
        const articleSnapshot = await db.collection('articles').doc(articleId).get();

        if (!articleSnapshot.exists) {
            return new Response(JSON.stringify({
                message: 'Article not found',
            }), { status: 404 })
        }

        const article = articleSnapshot.data();
        console.log('article', article);

        // If the article does not have questions, return the article as is
        if (!article?.questions) {
            return new Response(JSON.stringify({
                article: {
                    id: article?.id,
                    ...article,
                },
            }), { status: 200 });
        }

        // remove suggested_answer from answers of all questions
        article?.questions.multiple_choice_questions.forEach((question: { answers: { suggested_answer: any; }; }) => {
            delete question.answers.suggested_answer;
        });

        // switch answer choices in each question 
        const switchChoices = (choices: any) => {
            let currentIndex = choices.length, randomIndex;
            while (0 !== currentIndex) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                // switch choices
                currentIndex--;
                [choices[currentIndex], choices[randomIndex]] = [
                    choices[randomIndex], choices[currentIndex]];
            }
            return choices;
        }

        // If shortAnser is array of questions random select one question
        if (Array.isArray(article?.questions.short_answer_question)) {
            article.questions.short_answer_question = article.questions.short_answer_question[Math.floor(Math.random() * article.questions.short_answer_question.length)];
        }

        // If mcq have more than 5 questions random select 5 questions
        if (article?.questions.multiple_choice_questions.length > 5) {
            article.questions.multiple_choice_questions = article.questions.multiple_choice_questions.sort(() => 0.5 - Math.random()).slice(0, 5);
        }

        return new Response(JSON.stringify({
            article: {
                id: article?.id,
                ...article,
                // swich choices for all questions

                questions: {
                    mcqs: article?.questions.multiple_choice_questions.map((question: { answers: { [s: string]: unknown; } | ArrayLike<unknown>; }) => {
                        return {
                            ...question,
                            answers: switchChoices(Object.values(question.answers))
                        }
                    }),
                    shortAnswer: {
                        question: article?.questions.short_answer_question.question,
                        suggestedAnswer: article?.questions.short_answer_question.suggested_answer,
                    }
                },
            },
            // article: null,
        }), { status: 200 });
    } catch (error) {
        console.log('error', error);
        return new Response(JSON.stringify({
            message: 'Internal server error',
        }), { status: 500 })
    }
}
