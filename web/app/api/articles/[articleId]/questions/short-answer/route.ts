// route
// api/articles/[articleId]/questions/short-answer

import db from "@/configs/firestore-config";
import * as z from "zod"
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { RecordStatus } from "@/types/constants";

//update user-article-record
const routeContextSchema = z.object({
    params: z.object({
        articleId: z.string(),
    }),
})

const articleRecordSchema = z.object({
    answer: z.string(),
    timeRecorded: z.number(),
})

export async function PATCH(
    req: Request,
    context: z.infer<typeof routeContextSchema>
) {
    try {
        const { params } = routeContextSchema.parse(context)
        const articleId = params.articleId;

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
        const userId = session.user.id;
        console.log('time logged:', timeRecorded);
        console.log('answer:', answer);
        console.log('userId:', userId);
        console.log('articleId:', articleId);

        // update user-article-record
        const userArticleRecordRef = db
            .collection('user-article-records')
            .doc(`${userId}-${articleId}`)
            .update({
                short_answer: {
                    answer: answer,
                    timeLogged: timeRecorded,
                },
                status: RecordStatus.UNRATED,
                updatedAt: new Date(),
            });
        return new Response(JSON.stringify({
            message: 'Updated',
        }), { status: 200 })
    } catch (error) {
        return new Response(JSON.stringify({
            message: error,
        }), { status: 500 })
    }
};