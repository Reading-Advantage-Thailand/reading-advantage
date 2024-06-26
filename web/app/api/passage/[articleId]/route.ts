import db from "@/configs/firestore-config";
import { authOptions } from "@/lib/auth";
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import * as z from "zod"

const routeContextSchema = z.object({
    params: z.object({
        articleId: z.string(),
    }),
})

export async function DELETE(req: Request, context: z.infer<typeof routeContextSchema>) {    
console.log('DELETE article');

const { params } = routeContextSchema.parse(context);
const articleId = params.articleId;
    console.log('articleId', articleId);
    
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
        
        const userId = session.user.id;
        const userRole = session.user.role;
       const articlesRef = db.collection('new-articles');
       const articleToDelete = await articlesRef.doc(articleId).get();
       console.log('articleToDelete', articleToDelete);
       // const snapshot = await articlesRef.get();
       // const articles = snapshot.docs.map(doc => doc.data());
       
       if (userId && userRole.includes("SYSTEM")) {
        if (!articleToDelete.exists) {
return new Response(JSON.stringify({ message: "No such article found" }), { status: 404 })
        }else {
await articlesRef.doc(articleId).delete();
console.log('Document successfully deleted');
return new Response(JSON.stringify({ message: "Article deleted" }), { status: 200 })
        }
       
    }
            

        if (!userRole.includes("SYSTEM")) {
        return new Response(
            JSON.stringify({
            message: "Unauthorized",
            }),
            { status: 403 }
        );
        }

        return new Response(
        JSON.stringify({
            message: "Article deleted",
        }),
        { status: 200 }
        );
    } catch (error) {
        return new Response(
        JSON.stringify({
            message: error,
        }),
        { status: 500 }
        );
    }
}