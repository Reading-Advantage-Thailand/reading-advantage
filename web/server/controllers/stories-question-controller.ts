import {
  AnswerStatus,
  QuestionState,
  QuizStatus,
  LARecord,
} from "@/components/models/questions-model";
import db from "@/configs/firestore-config";
import { NextResponse } from "next/server";
import { getFeedbackWritter } from "./assistant-controller";
import { generateLAQuestion } from "../utils/generators/la-question-generator";
import { ExtendedNextRequest } from "./auth-controller";

interface RequestContext {
  params: {
    storyId: string;
    chapterNumber: string;
    questionNumber?: string;
  };
}

interface SubRequestContext {
  params: {
    storyId: string;
    chapterNumber: string;
    questionNumber: string;
  };
}

interface Heatmap {
  [date: string]: {
    read: number;
    completed: number;
  };
}

interface MCQRecord {
  question_number: number;
  question: string;
  type: "MCQ";
  options: string[];
  answer: string;
  textual_evidence: string;
  correct_answer: string;
  chapter_number: string;
  id: string;
}

interface SARecord {
  id: string;
  chapter_number: string;
  question_number: number;
  question: string;
  type: "SAQ";
  suggested_answer: string;
}

interface Data {
  question: string;
}

export async function getStoryMCQuestions(
  req: ExtendedNextRequest,
  { params: { storyId, chapterNumber } }: RequestContext
) {
  try {
    if (!storyId || typeof storyId !== "string") {
      //console.log("Invalid storyId!");
      return NextResponse.json({ message: "Invalid storyId" }, { status: 400 });
    }

    if (!req.session?.user?.id || typeof req.session.user.id !== "string") {
      //console.log("User not authenticated!");
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    const userId = req.session.user.id;
    const storyRef = db.collection("stories").doc(storyId);
    const storySnap = await storyRef.get();

    if (!storySnap.exists) {
      //console.log("Story not found!");
      return NextResponse.json({ message: "Story not found" }, { status: 404 });
    }

    const storyData = storySnap.data();
    if (!storyData || !storyData.chapters) {
      //console.log("No chapters found!");
      return NextResponse.json(
        { message: "No chapters found" },
        { status: 404 }
      );
    }

    const chapterIndex = parseInt(chapterNumber, 10) - 1;
    if (chapterIndex < 0 || chapterIndex >= storyData.chapters.length) {
      //console.log("Invalid chapter number!");
      return NextResponse.json(
        { message: "Invalid chapter number" },
        { status: 400 }
      );
    }

    const chapter = storyData.chapters[chapterIndex];

    if (!chapter.questions || chapter.questions.length === 0) {
      //console.log("No questions found in this chapter!");
      return NextResponse.json(
        { message: "No questions found" },
        { status: 404 }
      );
    }

    const questions: MCQRecord[] = chapter.questions
      .filter((q: MCQRecord) => q.type === "MCQ")
      .map((q: MCQRecord, index: number) => ({
        ...q,
        chapter_number: chapterNumber,
        question_number: index + 1,
        id: `${chapterNumber}-${index + 1}`,
      }));

    const userRecordRefs = questions.map((q) =>
      db
        .collection("users")
        .doc(userId)
        .collection("stories-records")
        .doc(storyId)
        .collection("mcq-records")
        .doc(q.id)
    );

    const userRecordsSnap = await Promise.all(
      userRecordRefs.map((ref) => ref.get())
    );

    const userRecords = new Map<string, any>();
    userRecordsSnap.forEach((doc, index) => {
      if (doc.exists) {
        userRecords.set(questions[index].id, doc.data());
      }
    });

    //console.log(
    //  "User Records from Firestore:",
    //  userRecordsSnap.map((doc) => (doc.exists ? doc.data() : null))
    //);

    const progress: AnswerStatus[] = Array(questions.length).fill(
      AnswerStatus.UNANSWERED
    );

    userRecordsSnap.forEach((doc, index) => {
      if (doc.exists) {
        const userData = doc.exists ? doc.data() : undefined;
        if (userData) {
          const questionIndex = questions.findIndex(
            (q) => q.id === userRecordRefs[index].id
          );
          if (questionIndex !== -1) {
            progress[questionIndex] =
              userData.status ?? AnswerStatus.UNANSWERED;
          }
        }
      }
    });

    //console.log("Corrected Progress Before Sending:", progress);

    const unansweredQuestions = questions.filter(
      (q) =>
        !userRecords.has(q.id) ||
        userRecords.get(q.id)?.status === AnswerStatus.UNANSWERED
    );

    const selectedQuestions = unansweredQuestions
      .sort((a, b) => a.question_number - b.question_number)
      .slice(0, 5);

    const mcq = selectedQuestions.map((data: MCQRecord) => {
      const options: string[] = [
        data.answer,
        ...data.options.filter((o: string) => o !== data.answer),
      ];

      return {
        id: data.id,
        chapter_number: data.chapter_number,
        question_number: data.question_number,
        question: data.question,
        options: options.sort(() => Math.random() - 0.5),
        textual_evidence: data.textual_evidence,
        status: userRecords.get(data.id)?.status || AnswerStatus.UNANSWERED,
        time_recorded: userRecords.get(data.id)?.time_recorded || null,
        created_at: userRecords.get(data.id)?.created_at || null,
      };
    });

    //console.log(" Final API Response Before Sending:", {
    //  state:
    //    mcq.length === 0 ? QuestionState.COMPLETED : QuestionState.INCOMPLETE,
    //  total: 5,
    //  progress,
    //  results: mcq,
    //});

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

export async function getStorySAQuestion(
  req: ExtendedNextRequest,
  { params: { storyId, chapterNumber } }: RequestContext
) {
  try {
    if (!storyId || typeof storyId !== "string") {
      console.log("Invalid storyId!");
      return NextResponse.json({ message: "Invalid storyId" }, { status: 400 });
    }

    if (!req.session?.user?.id || typeof req.session.user.id !== "string") {
      console.log("User not authenticated!");
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    const userId = req.session.user.id;
    const storyRef = db.collection("stories").doc(storyId);
    const storySnap = await storyRef.get();

    if (!storySnap.exists) {
      console.log("Story not found!");
      return NextResponse.json({ message: "Story not found" }, { status: 404 });
    }

    const storyData = storySnap.data();
    if (!storyData || !storyData.chapters) {
      console.log("No chapters found!");
      return NextResponse.json(
        { message: "No chapters found" },
        { status: 404 }
      );
    }

    const chapterIndex = parseInt(chapterNumber, 10) - 1;
    if (chapterIndex < 0 || chapterIndex >= storyData.chapters.length) {
      console.log("Invalid chapter number!");
      return NextResponse.json(
        { message: "Invalid chapter number" },
        { status: 400 }
      );
    }

    const chapter = storyData.chapters[chapterIndex];
    if (!chapter.questions || chapter.questions.length === 0) {
      console.log("No questions found in this chapter!");
      return NextResponse.json(
        { message: "No questions found" },
        { status: 404 }
      );
    }

    // 🔹 ค้นหา SAQ แค่ข้อเดียว
    const question: SARecord | undefined = chapter.questions.find(
      (q: SARecord) => q.type === "SAQ"
    );

    if (!question) {
      return NextResponse.json(
        { message: "No SAQ question found" },
        { status: 404 }
      );
    }

    const formattedQuestion: SARecord = {
      ...question,
      chapter_number: chapterNumber,
      question_number: 1,
      id: `${chapterNumber}-1`,
    };

    console.log(formattedQuestion);

    // 🔹 ดึงข้อมูล `saq-records` ของผู้ใช้จาก Firestore
    const userRecordRef = db
      .collection("users")
      .doc(userId)
      .collection("stories-records")
      .doc(storyId)
      .collection("saq-records")
      .doc(formattedQuestion.id);

    const userRecordSnap = await userRecordRef.get();
    const userRecord = userRecordSnap.exists ? userRecordSnap.data() : null;

    if (userRecord && userRecord.status !== AnswerStatus.UNANSWERED) {
      return NextResponse.json(
        {
          message: "User already answered",
          result: {
            id: formattedQuestion.id,
            question: formattedQuestion.question,
          },
          suggested_answer: userRecord.suggested_answer ?? "",
          state: QuestionState.COMPLETED,
          answer: userRecord.answer ?? "",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        state: QuestionState.INCOMPLETE,
        progress: AnswerStatus.UNANSWERED,
        result: {
          id: formattedQuestion.id,
          question: formattedQuestion.question,
        },
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

export async function answerStorySAQuestion(
  req: ExtendedNextRequest,
  {
    params: { storyId, chapterNumber, questionNumber },
  }: {
    params: { storyId: string; chapterNumber: string; questionNumber: string };
  }
) {
  try {
    const { answer, timeRecorded } = await req.json();
    const userId = req.session?.user.id as string;

    if (!userId) {
      console.log("User not authenticated!");
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    if (!storyId || !chapterNumber || !questionNumber) {
      console.log("Invalid parameters!");
      return NextResponse.json(
        { message: "Invalid parameters" },
        { status: 400 }
      );
    }

    const storyRef = db.collection("stories").doc(storyId);
    const storySnap = await storyRef.get();

    if (!storySnap.exists) {
      console.log("Story not found!");
      return NextResponse.json({ message: "Story not found" }, { status: 404 });
    }

    const storyData = storySnap.data();
    if (!storyData || !storyData.chapters) {
      console.log("No chapters found!");
      return NextResponse.json(
        { message: "No chapters found" },
        { status: 404 }
      );
    }

    const chapterIndex = parseInt(chapterNumber, 10) - 1;
    if (chapterIndex < 0 || chapterIndex >= storyData.chapters.length) {
      console.log("Invalid chapter number!");
      return NextResponse.json(
        { message: "Invalid chapter number" },
        { status: 400 }
      );
    }

    const chapter = storyData.chapters[chapterIndex];
    if (!chapter.questions || chapter.questions.length === 0) {
      console.log("No questions found in this chapter!");
      return NextResponse.json(
        { message: "No questions found" },
        { status: 404 }
      );
    }

    const questionData: SARecord | undefined = chapter.questions.find(
      (q: SARecord) => q.type === "SAQ"
    );

    if (!questionData) {
      console.log("No SAQ question found!");
    } else {
      console.log("SAQ question found:", questionData);
    }

    console.log("questionData", questionData);

    if (!questionData) {
      console.log("Question not found!");
      return NextResponse.json(
        { message: "Question not found" },
        { status: 404 }
      );
    }

    const recordRef = db
      .collection("users")
      .doc(userId)
      .collection("stories-records")
      .doc(storyId)
      .collection("saq-records")
      .doc(`${questionNumber}`);

    const record = await recordRef.get();
    if (record.exists) {
      return NextResponse.json(
        { message: "User already answered", results: [] },
        { status: 400 }
      );
    }

    console.log("suggested_answer", questionData.suggested_answer);

    await recordRef.set({
      chapter_number: chapterNumber,
      question_number: questionNumber,
      time_recorded: timeRecorded,
      question: questionData.question,
      answer,
      suggested_answer: questionData.suggested_answer,
      created_at: new Date().toISOString(),
    });

    console.log("Firestore Updated:", {
      chapter_number: chapterNumber,
      question_number: questionNumber,
    });

    await new Promise((resolve) => setTimeout(resolve, 500));

    const userRecordAll = await db
      .collection("users")
      .doc(userId)
      .collection("stories-records")
      .doc(storyId)
      .collection("saq-records")
      .orderBy("created_at", "asc")
      .get();

    const progress = userRecordAll.docs.map(
      (doc) => doc.data().status || AnswerStatus.UNANSWERED
    );
    for (let i = 0; i < 5 - userRecordAll.docs.length; i++) {
      progress.push(AnswerStatus.UNANSWERED);
    }

    console.log("Final Progress:", progress);

    if (!progress.includes(AnswerStatus.UNANSWERED)) {
      await db
        .collection("users")
        .doc(userId)
        .collection("stories-records")
        .doc(storyId)
        .set(
          {
            status: QuizStatus.COMPLETED_SAQ,
            scores: progress.filter((status) => status === AnswerStatus.CORRECT)
              .length,
            rated: 0,
            level: req.session?.user.level,
            updated_at: new Date().toISOString(),
          },
          { merge: true }
        );
    }

    return NextResponse.json(
      {
        chapter_number: chapterNumber,
        question_number: questionNumber,
        progress,
        answer,
        suggested_answer: questionData.suggested_answer,
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

export async function answerStoryMCQuestion(
  req: ExtendedNextRequest,
  ctx: {
    params: { storyId: string; chapterNumber: string; questionNumber: string };
  }
) {
  try {
    const { answer, timeRecorded } = await req.json();
    const { storyId, chapterNumber, questionNumber } = ctx.params;
    const userId = req.session?.user.id as string;

    if (!userId) {
      //console.log("User not authenticated!");
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    if (!storyId || !chapterNumber || !questionNumber) {
      //console.log("Invalid parameters!");
      return NextResponse.json(
        { message: "Invalid parameters" },
        { status: 400 }
      );
    }

    const storyRef = db.collection("stories").doc(storyId);
    const storySnap = await storyRef.get();

    if (!storySnap.exists) {
      //console.log("Story not found!");
      return NextResponse.json({ message: "Story not found" }, { status: 404 });
    }

    const storyData = storySnap.data();
    if (!storyData || !storyData.chapters) {
      //console.log("No chapters found!");
      return NextResponse.json(
        { message: "No chapters found" },
        { status: 404 }
      );
    }

    const chapterIndex = parseInt(chapterNumber, 10) - 1;
    if (chapterIndex < 0 || chapterIndex >= storyData.chapters.length) {
      //console.log("Invalid chapter number!");
      return NextResponse.json(
        { message: "Invalid chapter number" },
        { status: 400 }
      );
    }

    const chapter = storyData.chapters[chapterIndex];

    if (!chapter.questions || chapter.questions.length === 0) {
      //console.log("No questions found in this chapter!");
      return NextResponse.json(
        { message: "No questions found" },
        { status: 404 }
      );
    }

    const questions: MCQRecord[] = chapter.questions
      .filter((q: MCQRecord) => q.type === "MCQ")
      .map((q: MCQRecord, index: number) => ({
        ...q,
        chapter_number: chapterNumber,
        question_number: index + 1,
      }));

    const questionData = questions.find(
      (q) => q.question_number === parseInt(questionNumber, 10)
    );

    if (!questionData) {
      //console.log("Question not found!");
      return NextResponse.json(
        { message: "Question not found" },
        { status: 404 }
      );
    }

    const correctAnswer = questionData?.answer;
    const isCorrect =
      answer === correctAnswer ? AnswerStatus.CORRECT : AnswerStatus.INCORRECT;

    const recordRef = db
      .collection("users")
      .doc(userId)
      .collection("stories-records")
      .doc(storyId)
      .collection("mcq-records")
      .doc(`${chapterNumber}-${questionNumber}`);

    const record = await recordRef.get();

    if (record.exists) {
      return NextResponse.json(
        { message: "User already answered", results: [] },
        { status: 400 }
      );
    }

    await recordRef.set({
      chapter_number: chapterNumber,
      question_number: questionNumber,
      time_recorded: timeRecorded,
      status: isCorrect,
      created_at: new Date().toISOString(),
    });

    //console.log("Firestore Updated:", {
    //  chapter_number: chapterNumber,
    //  question_number: questionNumber,
    //  status: isCorrect,
    //});

    await new Promise((resolve) => setTimeout(resolve, 500));

    const userRecordAll = await db
      .collection("users")
      .doc(userId)
      .collection("stories-records")
      .doc(storyId)
      .collection("mcq-records")
      .orderBy("created_at", "asc")
      .get();

    //console.log(
    //  "Retrieved User Records:",
    //  userRecordAll.docs.map((doc) => doc.data())
    //);

    const progress: AnswerStatus[] = [];
    userRecordAll.docs.forEach((doc) => {
      const data = doc.data();
      progress.push(data.status);
    });

    for (let i = 0; i < 5 - userRecordAll.docs.length; i++) {
      progress.push(AnswerStatus.UNANSWERED);
    }

    //console.log("Final Progress:", progress);

    if (!progress.includes(AnswerStatus.UNANSWERED)) {
      await db
        .collection("users")
        .doc(userId)
        .collection("stories-records")
        .doc(storyId)
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

      const date = new Date();
      const dateString = `${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date
        .getDate()
        .toString()
        .padStart(2, "0")}-${date.getFullYear()}`;

      const userHeatmapRef = db
        .collection("users")
        .doc(userId)
        .collection("heatmap")
        .doc("activity");

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

    //console.log("Final API Response:", {
    //  chapter_number: chapterNumber,
    //  question_number: questionNumber,
    // progress,
    //  status: isCorrect,
    //  correct_answer: correctAnswer,
    //});

    return NextResponse.json(
      {
        chapter_number: chapterNumber,
        question_number: questionNumber,
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

export async function rateStory(
  req: ExtendedNextRequest,
  {
    params: { storyId, chapterNumber, questionNumber },
  }: {
    params: { storyId: string; chapterNumber: string; questionNumber: string };
  }
) {
  try {
    const { rating } = await req.json();

    // const newXp = (req.session?.user.xp as number) + rating;

    // await db
    //   .collection("users")
    //   .doc(req.session?.user.id as string)
    //   .update({
    //     xp: newXp,
    //   });

    // Update user record
    await db
      .collection("users")
      .doc(req.session?.user.id as string)
      .collection("stories-records")
      .doc(storyId)
      .collection(`rate-chapter-${chapterNumber}`)
      .doc(`${questionNumber}`)
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
export async function retakeStoryMCQuestion(
  req: ExtendedNextRequest,
  { params: { storyId, chapterNumber } }: RequestContext
) {
  try {
    const userId = req.session?.user.id as string;

    if (!userId) {
      console.log("User not authenticated!");
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    if (!storyId || !chapterNumber) {
      console.log("Invalid parameters!");
      return NextResponse.json(
        { message: "Invalid parameters" },
        { status: 400 }
      );
    }

    // 🔹 ดึง MCQ Records ทั้งหมดของผู้ใช้สำหรับ story นี้
    const userRecordSnap = await db
      .collection("users")
      .doc(userId)
      .collection("stories-records")
      .doc(storyId)
      .collection("mcq-records")
      .get();

    // 🔹 คัดกรองเฉพาะคำถามที่เริ่มต้นด้วย `chapterNumber-`
    const recordsToDelete = userRecordSnap.docs.filter((doc) =>
      doc.id.startsWith(`${chapterNumber}-`)
    );

    if (recordsToDelete.length === 0) {
      console.log(`✅ No MCQ records found for chapter ${chapterNumber}`);
      return NextResponse.json(
        { message: `No records found for chapter ${chapterNumber}` },
        { status: 404 }
      );
    }

    // 🔹 ใช้ batch delete เพื่อลบทั้งหมดในครั้งเดียว
    const batch = db.batch();
    recordsToDelete.forEach((doc) => batch.delete(doc.ref));

    await batch.commit(); // ✅ ลบทั้งหมดในครั้งเดียว

    console.log(
      `✅ Deleted ${recordsToDelete.length} MCQ records from chapter ${chapterNumber}`
    );

    return NextResponse.json(
      {
        message: `Retake quiz for chapter ${chapterNumber}`,
        state: QuestionState.INCOMPLETE,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error in retakeStoryMCQuestion:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function getStoryLAQuestion(
  req: ExtendedNextRequest,
  { params: { storyId } }: RequestContext
) {
  try {
    // Check user already answered
    const record = await db
      .collection("users")
      .doc(req.session?.user.id as string)
      .collection("article-records")
      .doc(storyId)
      .collection("laq-records")
      .get();

    if (record.docs.length > 0) {
      const data = record.docs[0].data();
      return NextResponse.json(
        {
          message: "User already answered",
          result: {
            id: record.docs[0]?.id,
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
      .doc(storyId)
      .collection("la-questions")
      .get();

    //check laq have no in db
    if (questions.docs.length === 0) {
      const getArticle = await db.collection("new-articles").doc(storyId).get();

      const getData = getArticle.data();

      let cefrlevel = getData?.cefr_level.replace(/[+-]/g, "");

      if (cefrlevel === "A0") {
        cefrlevel = "A1";
      }

      const generateLAQ = await generateLAQuestion({
        cefrlevel: cefrlevel,
        type: getData?.type,
        passage: getData?.passage,
        title: getData?.title,
        summary: getData?.summary,
        imageDesc: getData?.image_description,
      });

      await db
        .collection("new-articles")
        .doc(storyId)
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
          id: questions.docs[0]?.id,
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

export async function getStoryFeedbackLAquestion(
  req: ExtendedNextRequest,
  { params: { storyId, questionNumber } }: SubRequestContext
) {
  const { answer, preferredLanguage } = await req.json();

  const getQuestion = await db
    .collection("new-articles")
    .doc(storyId)
    .collection("la-questions")
    .doc(questionNumber)
    .get();

  const getArticle = await db.collection("new-articles").doc(storyId).get();

  const getLaq = getQuestion.data() as LARecord;

  const article = getArticle.data();

  let cefrLevelReformatted = article?.cefr_level.replace(/[+-]/g, "");

  const getFeedback = await getFeedbackWritter({
    preferredLanguage,
    targetCEFRLevel: cefrLevelReformatted,
    readingPassage: article?.passage,
    writingPrompt: getLaq.question,
    studentResponse: answer,
  });

  const getData = await getFeedback.json();

  const randomExamples =
    getData.exampleRevisions[
      Math.floor(Math.random() * getData.exampleRevisions.length)
    ];

  const result = { ...getData, exampleRevisions: randomExamples };

  return NextResponse.json(
    {
      state: QuestionState.INCOMPLETE,
      result,
    },
    { status: 200 }
  );
}

export async function answerStoryLAQuestion(
  req: ExtendedNextRequest,
  { params: { storyId, questionNumber } }: SubRequestContext
) {
  const { answer, feedback, timeRecorded } = await req.json();

  const question = await db
    .collection("new-articles")
    .doc(storyId)
    .collection("la-questions")
    .doc(questionNumber)
    .get();

  const data = question.data() as LARecord;

  //Update user record
  await db
    .collection("users")
    .doc(req.session?.user.id as string)
    .collection("article-records")
    .doc(storyId)
    .collection("laq-records")
    .doc(questionNumber)
    .set({
      id: questionNumber,
      time_recorded: timeRecorded,
      question: data.question,
      answer,
      feedback,
      created_at: new Date().toISOString(),
    });

  // Update records
  await db
    .collection("users")
    .doc(req.session?.user.id as string)
    .collection("article-records")
    .doc(storyId)
    .set(
      {
        status: QuizStatus.COMPLETED_LAQ,
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );

  const scores: number[] = Object.values(feedback.scores);

  const sumScores = scores.reduce<number>((a, b) => a + b, 0);

  return NextResponse.json(
    {
      state: QuestionState.COMPLETED,
      answer,
      result: feedback,
      sumScores,
    },
    { status: 200 }
  );
}
