// api/articles/levels/[level]/types/[type]/genres/[genre]/subgenres/[subgenre]

import db from "@configs/firebaseConfig";
import { NextResponse } from "next/server";

export const GET = async (req, { params }) => {
    const level = parseInt(params.level);
    const type = params.type;
    const genre = params.genre.replace(/-/g, ' ');
    const subgenre = params.subgenre.replace(/-/g, ' ');

    try {
        const data: FirebaseFirestore.DocumentData[] = [];

        //find level +/- 2 from article level
        const articlesSnapshot = await db.collection('articles')
            .where('raLevel', '>=', level - 2)
            .where('raLevel', '<=', level + 2)
            .where('type', '==', type)
            .where('genre', '==', genre)
            .where('subGenre', '==', subgenre)
            .get();

        //random article from snapshot and get only 1 article
        const randomArticle = Math.floor(Math.random() * articlesSnapshot.size);
        const article = articlesSnapshot.docs[randomArticle].data();

        // remove suggested_answer from answers of all questions
        article.questions.multiple_choice_questions.forEach(question => {
            delete question.answers.suggested_answer;
        });
        console.log('multiple_choice_questions', article.questions.multiple_choice_questions);
        // switch answer choices in each question 
        const switchChoices = (choices) => {
            let currentIndex = choices.length, randomIndex;
            while (0 !== currentIndex) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                // switch choices
                currentIndex--;
                [choices[currentIndex], choices[randomIndex]] = [
                    choices[randomIndex], choices[currentIndex]];
            }
            return choices;
        }
        const switchedChoices = switchChoices(Object.values(article.questions.multiple_choice_questions[0].answers));
        console.log('switchedChoices', switchedChoices);


        //get questions
        return NextResponse.json({
            status: 'success',
            result: data.length,
            data: {
                article: {
                    id: articlesSnapshot.docs[randomArticle].id,
                    ...article,
                    // swich choices for all questions
                    questions: {
                        multiple_choice_questions: article.questions.multiple_choice_questions.map(question => {
                            return {
                                ...question,
                                answers: switchChoices(Object.values(question.answers))
                            }
                        })
                    }
                },
            }
        });

    } catch (error) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
        });
    }
};