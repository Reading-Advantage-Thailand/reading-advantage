import db from "@/configs/firestore-config";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

// Save sentence to user for review and flashcard creation
// Let's start with sentence review. 
// We will already have the SSML and translation.
// Save the selected sentence, translation, 
// and audio to the flashcard section.Create a flashcard review area.

export async function POST(req: Request, res: Response) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new Response(JSON.stringify({
                message: 'Unauthorized',
            }), { status: 403 });
        }
        const { articleId, sentence, translation, sn, timepoint, endTimepoint } = await req.json();
        console.log('translation', translation);
        // Get user id from token
        const sub = session.user.id;
        const username = session.user.name;
        const email = session.user.email;
        // const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        // const { sub, username, email } = token;

        // Check if user has already saved this sentence
        const userSentenceRecord = await db.collection("user-sentence-records")
            .where("userId", "==", sub)
            .where("articleId", "==", articleId)
            .where("sn", "==", sn)
            .limit(1)
            .get();

        if (!userSentenceRecord.empty) {
            return new Response(JSON.stringify({
                message: "Sentence already saved",
            }), { status: 400 });
        }
        // Create user article record
        const userSentenceRecordRef = await db.collection("user-sentence-records").add({
            userId: sub,
            articleId,
            sentence,
            translation,
            sn,
            timepoint,
            endTimepoint,
            createdAt: new Date(),
        });

        // Create response
        return new Response(JSON.stringify({
            message: "Sentence saved",
        }), { status: 200 });
    } catch (error) {
        console.log('error', error);
        return new Response(JSON.stringify({
            message: 'Internal server error'
        }), { status: 500 });
    }
}

// get all sentences for a user
export async function GET(req: Request, res: Response) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new Response(JSON.stringify({
                message: 'Unauthorized',
            }), { status: 403 });
        }
        // Get user id from token
        const sub = session.user.id;
        const username = session.user.name;
        const email = session.user.email;
        // Get sentences
        const sentencesRef = db.collection("user-sentence-records")
            .where("userId", "==", sub)
            .orderBy("createdAt", "desc")
        const sentencesSnapshot = await sentencesRef.get();
        const sentences = sentencesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        return new Response(JSON.stringify({
            message: "User sentences retrieved",
            sentences,
        }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({
            message: 'Internal server error'
        }), { status: 500 });
    }
}

// delete a sentence
export async function DELETE(req: Request, res: Response) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return new Response(JSON.stringify({
                message: 'Unauthorized',
            }), { status: 403 });
        }
        // Get user id from token
        const sub = session.user.id;
        const username = session.user.name;
        const email = session.user.email;
        // Access request body
        const { sentenceId } = await req.json();

        // Delete sentence
        const sentenceRef = db.collection("user-sentence-records").doc(sentenceId);
        await sentenceRef.delete();

        // Create response
        return new Response(JSON.stringify({
            message: "Sentence deleted",
        }), { status: 200 });

    } catch (error) {
        return new Response(JSON.stringify({
            message: 'Internal server error'
        }), { status: 500 });
    }
}