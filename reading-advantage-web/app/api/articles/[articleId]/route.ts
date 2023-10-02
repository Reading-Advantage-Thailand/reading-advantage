// route
// api/articles/[articleId]
import { db } from "@/configs/firestore-config";

import { authOptions } from "@/lib/nextauth";
import { getServerSession } from "next-auth";

export const GET = async (req: Request, { params }: any) => {
    const articleId = params.articleId;

    try {
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

        // example 
        // user level = 51
        // article level = 53
        // This article can read only user level 51 - 55
        if (userLevel < articleLevel - 2 || userLevel > articleLevel + 2) {
            return new Response(JSON.stringify({
                message: 'Insufficient level'
            }), { status: 403 })
        }
        // Check if the article exists
        if (!articleSnapshot.exists) {
            return new Response(JSON.stringify({
                message: 'Article not found',
            }), { status: 404 })
        }
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
            data: null,
            article: {
                id: article?.id,
                ...article,
                // swich choices for all questions
                questions: {
                    multiple_choice_questions: article?.questions.multiple_choice_questions.map((question: { answers: { [s: string]: unknown; } | ArrayLike<unknown>; }) => {
                        return {
                            ...question,
                            answers: switchChoices(Object.values(question.answers))
                        }
                    })
                },
            },
            // article: null,
        }), { status: 200 });
    } catch (error) {
        if (process.env.NODE_ENV === 'development') console.error(error);
        return new Response(null, { status: 500 })
    }
}

