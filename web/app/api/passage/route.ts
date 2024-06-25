import { NextRequest, NextResponse } from "next/server";
import db from "@/configs/firestore-config";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";


export async function GET(req: Request, res: Response) {
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
        let results: any[] = [];
        
        const userId = session.user.id;
        const articlesRef = db.collection('new-articles');
        const snapshot = await articlesRef.get();
        const articles = snapshot.docs.map(doc => doc.data());


        for (const article of articles) {
            if (typeof article.id === 'string' && article.id.trim() !== '' && article.id !== undefined) {

            const articleRecord = await db
                .collection("users")
                .doc(userId)
                .collection("article-records")
                .doc(article.id)
                .get();

                if (articleRecord.data() !== undefined && articleRecord.data()?.id === article.id && !results.includes(articleRecord.data())) {

                    // console.log('articleRecord', articleRecord.data());
                    // results.push(articleRecord.data());
                    
                    // console.log('results', results);
                    
                    // If the article record exists and is the same as the article, add is_approved field to the article
                    // if (articleRecord.data() !== undefined){
                            results.push({ ...article, is_approved: true });
                        } else {
                                // results.push(article);
                                results.push(article);
                            }
            }
        }

        
    
        return new Response(
        JSON.stringify({
            // passages: articles,
            passages: results,
        }),
        { status: 200 }
        );
    } catch (error: any) {
        return new Response(
        JSON.stringify({
            message: "Internal server error",
            error: error.message || error.toString(),
        }),
        { status: 500 }
        );
    }
    }
