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

        const articleLevel = articleSnapshot.data()?.raLevel;

        const articleRecord = db.collection('user-article-records').doc(`${session.user.id}-${articleId}`);
        const articleRecordSnapshot = await articleRecord.get();
        // Check if the article exists
        // If exists, return user unable to reread the article and insufficient level
        // example
        // user level = 51
        // article level = 53
        // This article can read only user level 51 - 55
        console.log('userLevel', userLevel);
        console.log('articleLevel', articleLevel);
        // const isUserAbleToRead = userLevel >= articleLevel - 1 && userLevel <= articleLevel + 1;
        // console.log('isUserAbleToRead', isUserAbleToRead);
        console.log('articleRecordSnapshot.exists', articleRecordSnapshot.exists);
        if (!articleSnapshot.exists) {
            return new Response(JSON.stringify({
                message: 'Article not found',
            }), { status: 404 })
        }
        // if (!articleRecordSnapshot.exists && !isUserAbleToRead) {
        //     return new Response(JSON.stringify({
        //         message: 'Insufficient level'
        //     }), { status: 403 })
        // }
        // Check if the article exists
        const article = articleSnapshot.data();
        // remove suggested_answer from answers of all questions
        article?.questions.multiple_choice_questions.forEach((question: { answers: { suggested_answer: any; }; }) => {
            delete question.answers.suggested_answer;
        });
        // console.log('multiple_choice_questions', article?.questions.multiple_choice_questions);
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
