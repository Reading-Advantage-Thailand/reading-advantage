// route 
// api/article-records/[articleId]
import db from "@/configs/firestore-config";
import * as z from "zod"
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { RecordStatus } from "@/types/constants";

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
        const session = await getServerSession(authOptions);
        if (!session) {
            return new Response(JSON.stringify({
                message: 'Unauthorized',
            }), { status: 403 })
        }
        const userId = session.user.id;
        const { params } = routeContextSchema.parse(context);
        const articleId = params.articleId;
        const userArticleRecordRef = db.collection('user-article-records').doc(`${userId}-${articleId}`);
        const userArticleRecordSnapshot = await userArticleRecordRef.get();
        const userArticleRecord = userArticleRecordSnapshot.data();
        // Check if the article exists
        // If exists, return user unable to reread the article
        if (!userArticleRecordSnapshot.exists) {
            return new Response(JSON.stringify({
                message: 'Record not found',
            }), { status: 404 })
        }
        return new Response(JSON.stringify({
            userArticleRecord,
        }), { status: 200 })
    } catch (error) {
        return new Response(JSON.stringify({
            message: error,
        }), { status: 500 })
    }
}

const articleRecordSchema = z.object({
    articleTitle: z.string(),
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
        const userId = session.user.id;
        const json = await req.json();
        const body = articleRecordSchema.parse(json);
        console.log('userId:', userId);
        console.log('articleId:', articleId);

        // update user-article-record
        const userArticleRecordRef = db
            .collection('user-article-records')
            .doc(`${userId}-${articleId}`)
            .update({
                title: body.articleTitle,
                status: RecordStatus.UNCOMPLETED_SHORT_ANSWER,
                updatedAt: new Date(),
            });
        return new Response(JSON.stringify({
            message: 'Updated',
        }), { status: 200 })
    } catch (error) {
        console.log('error', error);
        return new Response(JSON.stringify({
            message: error,
        }), { status: 500 })
    }
}