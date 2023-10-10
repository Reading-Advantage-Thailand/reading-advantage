// route 
// api/article-records/[articleId]
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