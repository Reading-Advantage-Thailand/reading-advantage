import {
  AnswerStatus,
  MCQRecord,
  QuestionState,
  QuizStatus,
  SARecord,
  LARecord,
} from "@/components/models/questions-model";
import db from "@/configs/firestore-config";
import { ExtendedNextRequest } from "@/utils/middleware";
import { NextResponse } from "next/server";
import { generateLA, getFeedbackWritter } from "./assistant-controller";
import { get } from "lodash";

interface RequestContext {
  params: {
    article_id: string;
  };
}

interface SubRequestContext {
  params: {
    article_id: string;
    question_id: string;
  };
}

interface Heatmap {
  [date: string]: {
    read: number;
    completed: number;
  };
}

interface Data {
  question: string;
}

export async function getMCQuestions(
  req: ExtendedNextRequest,
  { params: { article_id } }: RequestContext
) {
  try {
    const questions = await db
      .collection("new-articles")
      .doc(article_id)
      .collection("mc-questions")
      .get();

    // Get user record
    const userRecord = await db
      .collection("users")
      .doc(req.session?.user.id as string)
      .collection("article-records")
      .doc(article_id)
      .collection("mcq-records")
      .orderBy("created_at", "asc")
      .get();

    const progress = [] as AnswerStatus[];
    userRecord.docs.forEach((doc) => {
      const data = doc.data();
      progress.push(data.status);
    });
    for (let i = 0; i < 5 - userRecord.docs.length; i++) {
      progress.push(AnswerStatus.UNANSWERED);
    }
    const randomQuestions = questions.docs
      .filter((doc) => {
        return !userRecord.docs.some((userDoc) => userDoc.id === doc.id);
      })
      .sort(() => 0.5 - Math.random())
      .slice(0, 5 - userRecord.docs.length);

    let mcq = randomQuestions.map((doc) => {
      const data = doc.data() as MCQRecord;
      const options = [];
      options.push(data.distractor_1);
      options.push(data.distractor_2);
      options.push(data.distractor_3);
      options.push(data.correct_answer);
      return {
        id: doc.id,
        question: data.question,
        options: options.sort(() => 0.5 - Math.random()),
      };
    });
    console.log(mcq);
    return NextResponse.json(
      {
        state:
          mcq.length === 0 ? QuestionState.COMPLETED : QuestionState.INCOMPLETE,
        total: 5,
        progress,
        results: mcq,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function getSAQuestion(
  req: ExtendedNextRequest,
  { params: { article_id } }: RequestContext
) {
  try {
    // Check user already answered
    const record = await db
      .collection("users")
      .doc(req.session?.user.id as string)
      .collection("article-records")
      .doc(article_id)
      .collection("saq-records")
      .get();

    if (record.docs.length > 0) {
      const data = record.docs[0].data();
      return NextResponse.json(
        {
          message: "User already answered",
          result: {
            id: record.docs[0].id,
            question: data.question,
          },
          suggested_answer: data.suggested_answer,
          state: QuestionState.COMPLETED,
          answer: data.answer,
        },
        { status: 400 }
      );
    }

    const questions = await db
      .collection("new-articles")
      .doc(article_id)
      .collection("sa-questions")
      // Random select 1 question from 5
      .where("question_number", "==", Math.floor(Math.random() * 5))
      .get();

    const data = questions.docs[0].data() as SARecord;

    return NextResponse.json(
      {
        result: {
          id: questions.docs[0].id,
          question: data.question,
        },
        state: QuestionState.INCOMPLETE,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function answerSAQuestion(
  req: ExtendedNextRequest,
  { params: { article_id, question_id } }: SubRequestContext
) {
  const { answer, timeRecorded } = await req.json();

  const question = await db
    .collection("new-articles")
    .doc(article_id)
    .collection("sa-questions")
    .doc(question_id)
    .get();

  const data = question.data() as SARecord;
  console.log(data);

  // Update user record
  await db
    .collection("users")
    .doc(req.session?.user.id as string)
    .collection("article-records")
    .doc(article_id)
    .collection("saq-records")
    .doc(question_id)
    .set({
      id: question_id,
      time_recorded: timeRecorded,
      question: data.question,
      answer,
      suggested_answer: data.suggested_answer,
      created_at: new Date().toISOString(),
    });

  // Update records
  await db
    .collection("users")
    .doc(req.session?.user.id as string)
    .collection("article-records")
    .doc(article_id)
    .set(
      {
        status: QuizStatus.COMPLETED_SAQ,
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );

  return NextResponse.json(
    {
      state: QuestionState.COMPLETED,
      answer,
      suggested_answer: data.suggested_answer,
    },
    { status: 200 }
  );
}

export async function answerMCQuestion(
  req: ExtendedNextRequest,
  { params: { article_id, question_id } }: SubRequestContext
) {
  try {
    const { answer, timeRecorded } = await req.json();
    // Check user already answered
    const record = await db
      .collection("users")
      .doc(req.session?.user.id as string)
      .collection("article-records")
      .doc(article_id)
      .collection("mcq-records")
      .doc(question_id)
      .get();
    if (record.exists) {
      return NextResponse.json(
        { message: "User already answered", results: [] },
        { status: 400 }
      );
    }
    const question = await db
      .collection("new-articles")
      .doc(article_id)
      .collection("mc-questions")
      .doc(question_id)
      .get();

    const data = question.data() as MCQRecord;
    const correctAnswer = data.correct_answer;
    const isCorrect =
      answer === correctAnswer ? AnswerStatus.CORRECT : AnswerStatus.INCORRECT;

    // Update user record
    const userRecord = await db
      .collection("users")
      .doc(req.session?.user.id as string)
      .collection("article-records")
      .doc(article_id)
      .collection("mcq-records")
      .doc(question_id)
      .set({
        id: question_id,
        time_recorded: timeRecorded,
        status: isCorrect,
        created_at: new Date().toISOString(),
      });

    // Update user xp + 2 if correct
    if (isCorrect === AnswerStatus.CORRECT) {
      const user = await db
        .collection("users")
        .doc(req.session?.user.id as string)
        .get();
      const userXP = user.data()?.xp;
      await db
        .collection("users")
        .doc(req.session?.user.id as string)
        .update({
          xp: userXP + 2,
        });
    }

    const userRecordAll = await db
      .collection("users")
      .doc(req.session?.user.id as string)
      .collection("article-records")
      .doc(article_id)
      .collection("mcq-records")
      .orderBy("created_at", "asc")
      .get();

    const progress = [] as AnswerStatus[];
    userRecordAll.docs.forEach((doc) => {
      const data = doc.data();
      progress.push(data.status);
    });
    for (let i = 0; i < 5 - userRecordAll.docs.length; i++) {
      progress.push(AnswerStatus.UNANSWERED);
    }

    // ALl progress is not unanswered update the user activity
    if (!progress.some((status) => status === AnswerStatus.UNANSWERED)) {
      await db
        .collection("users")
        .doc(req.session?.user.id as string)
        .collection("article-records")
        .doc(article_id)
        .set(
          {
            status: QuizStatus.COMPLETED_MCQ,
            scores: progress.filter((status) => status === AnswerStatus.CORRECT)
              .length,
            rated: 0,
            level: req.session?.user.level,
            updated_at: new Date().toISOString(),
          },
          { merge: true }
        );
      // Update heatmap
      const date = new Date();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const year = date.getFullYear();
      const dateString = `${month}-${day}-${year}`;

      const userId = req.session?.user.id as string;
      const userHeatmapRef = db
        .collection("users")
        .doc(userId)
        .collection("heatmap")
        .doc("activity");
      const heatmapDoc = await userHeatmapRef.get();
      if (heatmapDoc.exists) {
        const data = heatmapDoc.data();
        if (data && data[dateString]) {
          await userHeatmapRef.update({
            [dateString]: {
              read: data[dateString].read + 1,
              completed: data[dateString].completed + 1,
            },
          });
        } else {
          await userHeatmapRef.set(
            {
              [dateString]: {
                read: 1,
                completed: 1,
              },
            },
            { merge: true }
          );
        }
      } else {
        await userHeatmapRef.set({
          [dateString]: {
            read: 1,
            completed: 1,
          },
        });
      }
    }

    return NextResponse.json(
      {
        progress,
        status: isCorrect,
        correct_answer: correctAnswer,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function rateArticle(
  req: ExtendedNextRequest,
  { params: { article_id } }: RequestContext
) {
  try {
    const { rating } = await req.json();
    const newXp = (req.session?.user.xp as number) + rating;

    await db
      .collection("users")
      .doc(req.session?.user.id as string)
      .update({
        xp: newXp,
      });

    // Update user record
    await db
      .collection("users")
      .doc(req.session?.user.id as string)
      .collection("article-records")
      .doc(article_id)
      .set(
        {
          rated: rating,
          updated_at: new Date().toISOString(),
        },
        { merge: true }
      );

    return NextResponse.json({ message: "Rated" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Review rated receive xp === rated star
// export async function xpAwardRated(
//     req: ExtendedNextRequest
// ){
//     try{
//         const { rating } = await req.json();
//         const newXp = req.session?.user.xp as number + rating

//         await db
//             .collection("users")
//             .doc(req.session?.user.id as string)
//             .update({
//                 xp: newXp
//             });
//         return NextResponse.json(
//             { message: "xpAward" },
//             { status: 200 }
//         );
//     }catch(error){
//         console.error(error);
//         return NextResponse.json(
//             { message: "Internal server error" },
//             { status: 500 }
//         );
//     }
// }

//Retake quiz
export async function retakeMCQuestion(
  req: ExtendedNextRequest,
  { params: { article_id } }: RequestContext
) {
  try {
    // Delete user record
    const userRecord = await db
      .collection("users")
      .doc(req.session?.user.id as string)
      .collection("article-records")
      .doc(article_id)
      .collection("mcq-records")
      .get();

    userRecord.docs.forEach(async (doc) => {
      await db
        .collection("users")
        .doc(req.session?.user.id as string)
        .collection("article-records")
        .doc(article_id)
        .collection("mcq-records")
        .doc(doc.id)
        .delete();
    });

    return NextResponse.json(
      {
        message: "Retake quiz",
        state: QuestionState.INCOMPLETE,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function getLAQuestion(
  req: ExtendedNextRequest,
  { params: { article_id } }: RequestContext
) {
  try {
    // Check user already answered
    const record = await db
      .collection("users")
      .doc(req.session?.user.id as string)
      .collection("article-records")
      .doc(article_id)
      .collection("laq-records")
      .get();

    if (record.docs.length > 0) {
      const data = record.docs[0].data();
      return NextResponse.json(
        {
          message: "User already answered",
          result: {
            id: record.docs[0].id,
            question: data.question,
          },
          suggested_answer: data.suggested_answer,
          state: QuestionState.COMPLETED,
          answer: data.answer,
        },
        { status: 400 }
      );
    }

    let data: Data = { question: "" };

    const questions = await db
      .collection("new-articles")
      .doc(article_id)
      .collection("la-questions")
      .get();

    //check laq have in db
    if (questions.docs.length === 0) {
      const getArticle = await db
        .collection("new-articles")
        .doc(article_id)
        .get();

      const getData = getArticle.data();

      const generateLAQ = await generateLA(
        getData?.cefr_level,
        getData?.type,
        getData?.genre,
        getData?.subgenre,
        getData?.passage,
        getData?.title,
        getData?.summary,
        getData?.imageDesc
      );

      await db
        .collection("new-articles")
        .doc(article_id)
        .collection("la-questions")
        .add(generateLAQ);

      data = generateLAQ;
      //if laq have in db
    } else {
      data = questions.docs[0].data() as LARecord;
    }

    return NextResponse.json(
      {
        result: {
          id: questions.docs[0].id,
          question: data.question,
        },
        state: QuestionState.INCOMPLETE,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function getFeedbackLAquestion(
  req: ExtendedNextRequest,
  { params: { article_id, question_id } }: SubRequestContext
) {
  const { answer, preferredLanguage } = await req.json();

  const getQuestion = await db
    .collection("new-articles")
    .doc(article_id)
    .collection("la-questions")
    .doc(question_id)
    .get();

  const getArticle = await db.collection("new-articles").doc(article_id).get();

  const getLaq = getQuestion.data() as LARecord;

  const article = getArticle.data();

  let cefrLevelReformatted = article?.cefr_level
    .replace("+", "")
    .replace("-", "");

  const getFeedback = await getFeedbackWritter({
    preferredLanguage,
    targetCEFRLevel: cefrLevelReformatted,
    readingPassage: article?.passage,
    writingPrompt: getLaq.question,
    studentResponse: answer,
  });

  const result = await getFeedback.json();

  return NextResponse.json(
    {
      state: QuestionState.INCOMPLETE,
      result,
    },
    { status: 200 }
  );
}

export async function answerLAQuestion(
  req: ExtendedNextRequest,
  { params: { article_id, question_id } }: SubRequestContext
) {
  const { answer, timeRecorded } = await req.json();

  const question = await db
    .collection("new-articles")
    .doc(article_id)
    .collection("la-questions")
    .doc(question_id)
    .get();

  const data = question.data() as LARecord;

  // Update user record
  // await db
  //   .collection("users")
  //   .doc(req.session?.user.id as string)
  //   .collection("article-records")
  //   .doc(article_id)
  //   .collection("laq-records")
  //   .doc(question_id)
  //   .set({
  //     id: question_id,
  //     time_recorded: timeRecorded,
  //     question: data.question,
  //     answer,
  //     suggested_answer: data.suggested_answer,
  //     created_at: new Date().toISOString(),
  //   });

  // Update records
  // await db
  //   .collection("users")
  //   .doc(req.session?.user.id as string)
  //   .collection("article-records")
  //   .doc(article_id)
  //   .set(
  //     {
  //       status: QuizStatus.COMPLETED_SAQ,
  //       updated_at: new Date().toISOString(),
  //     },
  //     { merge: true }
  //   );

  // return NextResponse.json(
  //   {
  //     state: QuestionState.COMPLETED,
  //     answer,
  //   },
  //   { status: 200 }
  // );
}
