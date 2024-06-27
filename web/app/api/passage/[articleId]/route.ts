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
    //    const articlesRef = db.collection('test-collection');
       const articleToDelete = await articlesRef.doc(articleId).get();

       const mcSubcollection = await articleToDelete.ref.collection('mc-questions').get();
       mcSubcollection.docs.forEach(doc => {
        doc.ref.delete().then(() => console.log(`Deleted doc: ${doc.id} from mc-questions`));
    });
       
       const saSubcollection = await articleToDelete.ref.collection('sa-questions').get();
       saSubcollection.docs.forEach(doc => {
        doc.ref.delete().then(() => console.log(`Deleted doc: ${doc.id} from sa-questions`));
    });

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