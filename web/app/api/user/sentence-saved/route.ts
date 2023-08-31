import db from "@configs/firebaseConfig";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

// Save sentence to user for review and flashcard creation
// Let's start with sentence review. 
// We will already have the SSML and translation.
// Save the selected sentence, translation, 
// and audio to the flashcard section.Create a flashcard review area.

export async function POST(req: NextRequest) {
    try {
        // Access request body
        const { articleId, sentence, translation, sn, timepoint, endTimepoint } = await req.json();
        // sn is the sentence number in the article

        // Get user id from token
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        const { sub, username, email } = token;

        // Check if user has already saved this sentence
        const userSentenceRecord = await db.collection("user-sentence-records")
            .where("userId", "==", sub)
            .where("articleId", "==", articleId)
            .where("sn", "==", sn)
            .limit(1)
            .get();

        if (!userSentenceRecord.empty) {
            return NextResponse.json({
                message: "Sentence already saved",
                success: false,
            }, { status: 400 });
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
        const response = NextResponse.json({
            message: "Sentence saved",
            success: true,
        });

        return response;

    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({
            status: "error",
            message: "Something went wrong",
        }, { status: 500 });
    }
}

// get all sentences for a user
export async function GET(req: NextRequest) {
    try {
        // Get user id from token
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        const { sub, username, email } = token;

        // Get sentences
        const sentencesRef = db.collection("user-sentence-records")
            .where("userId", "==", sub)
            .orderBy("createdAt", "desc")
        const sentencesSnapshot = await sentencesRef.get();
        const sentences = sentencesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        // console.log(sentences);

        const response = NextResponse.json({
            message: "User sentences retrieved",
            success: true,
            sentences,
        });

        // Create response
        return response;

    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({
            status: "error",
            message: "Something went wrong",
        }, { status: 500 });
    }
}

// delete a sentence
export async function DELETE(req: NextRequest) {
    try {
        // Get user id from token
        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
        const { sub, username, email } = token;

        // Access request body
        const { sentenceId } = await req.json();

        // Delete sentence
        const sentenceRef = db.collection("user-sentence-records").doc(sentenceId);
        await sentenceRef.delete();

        // Create response
        const response = NextResponse.json({
            message: "Sentence deleted",
            success: true,
        });

        return response;

    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({
            status: "error",
            message: "Something went wrong",
        }, { status: 500 });
    }
}