import db from "@/configs/firestore-config";
import * as z from "zod"

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const routeContextSchema = z.object({
    params: z.object({
        articleId: z.string(),
        descriptorId: z.string(),
    }),
})

const articleRecordSchema = z.object({
    answer: z.string(),
    timeRecorded: z.number(),
})

export async function POST(
    req: Request,
    context: z.infer<typeof routeContextSchema>
) {
    try {
        const { params } = routeContextSchema.parse(context)
        const articleId = params.articleId;
        const descriptorId = params.descriptorId;

        const session = await getServerSession(authOptions);
        if (!session) {
            return new Response(JSON.stringify({
                message: 'Unauthorized',
            }), { status: 403 })
        }
        const json = await req.json();
        const body = articleRecordSchema.parse(json);
        const answer = body.answer;
        const timeRecorded = body.timeRecorded;
        console.log('answer', answer);
        console.log('timeRecorded', timeRecorded);

        const userId = session.user.id;
        // get article
        const articleRef = db.collection('articles').doc(articleId);
        const articleSnapshot = await articleRef.get();
        const article = articleSnapshot.data();

        console.log('descriptorId', descriptorId);
        // get question
        const question = article?.questions.multiple_choice_questions.find((question: { descriptor_id: string; }) => question.descriptor_id === descriptorId);

        // get correct answer
        const correctAnswer = question.answers.answer_a;

        // check answer
        const isCorrect = answer === correctAnswer;
        console.log('answer', answer);
        console.log('correctAnswer', correctAnswer);

        // creaet new user-article-record 
        // if user-article-record exists, update it
        const userArticleRecordRef = db.collection('user-article-records').doc(`${userId}-${articleId}`);
        const userArticleRecordSnapshot = await userArticleRecordRef.get();

        const updateRecordData = {
            articleId: articleId,
            userId: userId,
            questions: [
                {
                    descriptorId: descriptorId,
                    isCorrect: isCorrect,
                }
            ],
            timeRecorded: timeRecorded,
            status: 'uncompleted', // uncompleted, completed
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        if (userArticleRecordSnapshot.exists) {
            // update user-article-record
            const userArticleRecord = userArticleRecordSnapshot.data();
            const questions = userArticleRecord?.questions;
            const question = questions.find((question: { descriptorId: string; }) => question.descriptorId === descriptorId);
            if (question) {
                question.isCorrect = isCorrect;
            } else {
                questions.push({
                    descriptorId: descriptorId,
                    isCorrect: isCorrect,
                })
            }
            await userArticleRecordRef.update({
                questions: questions,
                timeRecorded: timeRecorded,
                updatedAt: new Date(),
            });
        } else {
            // create new user-article-record
            await userArticleRecordRef.set(updateRecordData);
        }

        return new Response(JSON.stringify({
            data: {
                isCorrect: isCorrect,
                correctAnswer: correctAnswer,
            }
        }),
            { status: 200 })
    } catch (error) {
        console.log('error', error);
        return new Response(JSON.stringify({
            message: 'Internal server error',
            error: `errors: ${error}`
        }), { status: 500 })

    }
}