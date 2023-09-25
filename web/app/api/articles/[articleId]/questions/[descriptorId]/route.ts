// check answer and update score
import db from "@configs/firebaseConfig";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest, { params }) => {
    const articleId = params.articleId;
    const descriptorId = params.descriptorId;
    console.log('articleId', articleId);
    console.log('descriptorId', descriptorId);

    // get article
    const articleRef = db.collection('articles').doc(articleId);
    const articleSnapshot = await articleRef.get();
    const article = articleSnapshot.data();

    console.log('descriptorId', descriptorId);
    // get question
    const question = article.questions.multiple_choice_questions.find(question => question.descriptor_id === descriptorId);

    console.log('question', question);

    // get correct answer
    const correctAnswer = question.answers.answer_a;

    // check answer
    const { answer } = await req.json();
    const isCorrect = answer === correctAnswer;
    console.log('answer', answer);
    console.log('correctAnswer', correctAnswer);

    return NextResponse.json({
        status: 'success',
        data: {

            isCorrect: isCorrect,
            correctAnswer: correctAnswer,
        }
    });
}