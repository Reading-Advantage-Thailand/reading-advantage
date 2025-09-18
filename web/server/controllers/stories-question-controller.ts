import {
  AnswerStatus,
  QuestionState,
} from "@/components/models/questions-model";
import { UserXpEarned } from "@/components/models/user-activity-log-model";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getFeedbackWritter } from "./assistant-controller";
import { generateMCQuestion } from "../utils/generators/mc-question-generator";
import { ExtendedNextRequest } from "./auth-controller";
import { ActivityType, QuizStatus } from "@prisma/client";
import { generateSAQuestion } from "../utils/generators/sa-question-generator";
import { generateLAQuestion } from "../utils/generators/la-question-generator";
import { ArticleBaseCefrLevel, ArticleType } from "../models/enum";

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

export interface LARecord {
  id: string;
  question: string;
  chapter_number: string;
  question_number: number;
  chapterNumber: string;
  type: "LAQ";
}

export async function getStoryMCQuestions(
  req: ExtendedNextRequest,
  { params: { storyId, chapterNumber } }: RequestContext
) {
  try {
    if (!storyId || typeof storyId !== "string") {
      return NextResponse.json({ message: "Invalid storyId" }, { status: 400 });
    }

    if (!req.session?.user?.id || typeof req.session.user.id !== "string") {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    const userId = req.session.user.id;

    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        chapters: {
          where: { chapterNumber: parseInt(chapterNumber, 10) },
        },
      },
    });

    if (!story) {
      return NextResponse.json({ message: "Story not found" }, { status: 404 });
    }
    const chapter = story.chapters[0];
    if (!chapter) {
      return NextResponse.json(
        { message: "Chapter not found" },
        { status: 404 }
      );
    }

    let questions = await prisma.multipleChoiceQuestion.findMany({
      where: { chapterId: chapter.id },
    });

    if (questions.length === 0) {
      // Generate questions as fallback
      const cefrlevel = story.cefrLevel?.replace(/[+-]/g, "") as any;
      const generateMCQ = await generateMCQuestion({
        cefrlevel: cefrlevel,
        type: story.type as any,
        passage: chapter.passage || "",
        title: story.title || "",
        summary: story.summary || "",
        imageDesc: story.imageDescription || "",
      });

      const questionsToCreate = generateMCQ.questions.slice(0, 5);

      for (const question of questionsToCreate) {
        await prisma.multipleChoiceQuestion.create({
          data: {
            chapterId: chapter.id,
            question: question.question,
            options: [
              question.correct_answer,
              question.distractor_1,
              question.distractor_2,
              question.distractor_3,
            ],
            answer: question.correct_answer || "",
            textualEvidence: question.textual_evidence || "",
          },
        });
      }

      questions = await prisma.multipleChoiceQuestion.findMany({
        where: { chapterId: chapter.id },
      });
    }

    const questionsMapped = questions.map((q, index) => ({
      ...q,
      chapter_number: chapterNumber,
      question_number: index + 1,
      id: q.id,
      textual_evidence: q.textualEvidence,
    }));

    // Get user activities for MC questions (filter by story & chapter)
    const userActivities = await prisma.userActivity.findMany({
      where: {
        userId,
        activityType: ActivityType.MC_QUESTION,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Keep only activities for this story chapter (details.storyId + details.chapterNumber)
    const chapterActivities = userActivities.filter((activity) => {
      const details = activity.details as any;
      return (
        details?.storyId === storyId &&
        String(details?.chapterNumber) === String(chapterNumber)
      );
    });

    // Get XP logs for these chapter activities
    const activityIds = chapterActivities.map((activity) => activity.id);
    const xpLogs = await prisma.xPLog.findMany({
      where: {
        activityId: { in: activityIds },
        activityType: ActivityType.MC_QUESTION,
      },
    });

    const xpLogMap = new Map(xpLogs.map((log) => [log.activityId, log]));

    const progress: AnswerStatus[] = [];
    const answeredQuestionIds = new Set();
    const questionAnswers = new Map();
    const questionData = new Map();

    const sortedActivities = chapterActivities.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    sortedActivities.forEach((activity) => {
      const details = activity.details as any;
      // Activities created by answerStoryMCQuestion include questionId and isCorrect
      if (details?.questionId) {
        answeredQuestionIds.add(details.questionId);
        questionAnswers.set(details.questionId, details.isCorrect);

        const xpLog = xpLogMap.get(activity.id);
        questionData.set(details.questionId, {
          timer: activity.timer,
          xpEarned: xpLog?.xpEarned || 0,
          selectedAnswer: details.selectedAnswer,
          correctAnswer: details.correctAnswer,
          textualEvidence: details.textualEvidence,
          createdAt: activity.createdAt,
        });

        progress.push(
          details.isCorrect ? AnswerStatus.CORRECT : AnswerStatus.INCORRECT
        );
      }
    });

    // Fill remaining slots with UNANSWERED
    while (progress.length < 5) {
      progress.push(AnswerStatus.UNANSWERED);
    }

    const currentQuestionIndex = progress.findIndex(
      (p) => p === AnswerStatus.UNANSWERED
    );

    // If there are no UNANSWERED slots, the quiz is completed
    if (currentQuestionIndex === -1) {
      const totalXpEarned = Array.from(questionData.values()).reduce(
        (total, data) => total + (data.xpEarned || 0),
        0
      );
      const totalTimer = Array.from(questionData.values()).reduce(
        (total, data) => total + (data.timer || 0),
        0
      );

      const responseData = {
        state: QuestionState.COMPLETED,
        total: 5,
        progress,
        results: [],
        summary: {
          totalXpEarned,
          totalTimer,
          correctAnswers: progress.filter((p) => p === AnswerStatus.CORRECT)
            .length,
          incorrectAnswers: progress.filter((p) => p === AnswerStatus.INCORRECT)
            .length,
        },
      };

      return new NextResponse(JSON.stringify(responseData), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Only consider the first 5 questions for the quiz flow (same as articles)
    const questionsForThisChapter = questions.slice(0, 5);

    if (questionsForThisChapter.length === 0) {
      return NextResponse.json(
        { message: "No questions found" },
        { status: 404 }
      );
    }

    const unansweredQuestions = questionsForThisChapter.filter(
      (q) => !answeredQuestionIds.has(q.id)
    );

    if (unansweredQuestions.length === 0) {
      const responseData = {
        state: QuestionState.INCOMPLETE,
        total: 5,
        progress,
        results: [],
      };

      return new NextResponse(JSON.stringify(responseData), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const nextQuestion = unansweredQuestions[0];
    const options = [...nextQuestion.options];
    const currentQuestionData = questionData.get(nextQuestion.id) || {};

    const mcq = [
      {
        id: nextQuestion.id,
        chapter_number: chapterNumber,
        question_number:
          questions.findIndex((q) => q.id === nextQuestion.id) + 1,
        question: nextQuestion.question,
        options: options.sort(() => 0.5 - Math.random()),
        textual_evidence: nextQuestion.textualEvidence,
        timer: currentQuestionData.timer || null,
        xpEarned: currentQuestionData.xpEarned || 0,
        selectedAnswer: currentQuestionData.selectedAnswer || null,
        correctAnswer: currentQuestionData.correctAnswer || null,
      },
    ];

    const answeredQuestionData = Array.from(questionData.values());

    const totalXpEarned = answeredQuestionData.reduce(
      (total, data) => total + (data.xpEarned || 0),
      0
    );

    const totalTimer = answeredQuestionData.reduce(
      (total, data) => total + (data.timer || 0),
      0
    );

    const responseData = {
      state: QuestionState.INCOMPLETE,
      total: 5,
      progress,
      results: mcq,
      summary: {
        totalXpEarned,
        totalTimer,
        correctAnswers: progress.filter((p) => p === AnswerStatus.CORRECT)
          .length,
        incorrectAnswers: progress.filter((p) => p === AnswerStatus.INCORRECT)
          .length,
        currentQuestion:
          progress.filter((p) => p !== AnswerStatus.UNANSWERED).length + 1,
      },
    };

    return new NextResponse(JSON.stringify(responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in getStoryMCQuestions:", error);
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
      return NextResponse.json({ message: "Invalid storyId" }, { status: 400 });
    }

    if (!req.session?.user?.id || typeof req.session.user.id !== "string") {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    const userId = req.session.user.id;

    // Get story with chapter
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        chapters: {
          where: { chapterNumber: parseInt(chapterNumber, 10) },
        },
      },
    });

    if (!story) {
      return NextResponse.json({ message: "Story not found" }, { status: 404 });
    }

    const chapter = story.chapters[0];
    if (!chapter) {
      return NextResponse.json(
        { message: "Chapter not found" },
        { status: 404 }
      );
    }

    let shortAnswerQuestions = await prisma.shortAnswerQuestion.findMany({
      where: { chapterId: chapter.id },
    });

    if (!shortAnswerQuestions || shortAnswerQuestions.length === 0) {
      const generateSAQ = await generateSAQuestion({
        cefrlevel:
          (story.cefrLevel?.replace(/[+-]/g, "") as ArticleBaseCefrLevel) ||
          ArticleBaseCefrLevel.A1,
        type: (story.type as ArticleType) || ArticleType.NONFICTION,
        passage: chapter.passage || "",
        title: story.title || "",
        summary: story.summary || "",
        imageDesc: story.imageDescription || "",
      });

      for (const question of generateSAQ.questions) {
        await prisma.shortAnswerQuestion.create({
          data: {
            chapterId: chapter.id,
            question: question.question,
            answer: question.suggested_answer || "",
          },
        });
      }

      shortAnswerQuestions = await prisma.shortAnswerQuestion.findMany({
        where: { chapterId: chapter.id },
      });

      if (!shortAnswerQuestions || shortAnswerQuestions.length === 0) {
        return NextResponse.json(
          { message: "No questions found" },
          { status: 404 }
        );
      }
    }

    const question = (shortAnswerQuestions as any[]).find(
      (q: any) => q.chapterId === chapter.id
    );

    if (!question) {
      return NextResponse.json(
        { message: "No SAQ question found" },
        { status: 404 }
      );
    }

    // Return the DB question id so front-end can post with questionId
    const formattedQuestion = {
      question: question.question,
      suggested_answer: (question as any).answer,
      chapter_number: chapterNumber,
      questionId: question.id,
      id: question.id,
    };

    // Get user activity for this question (article flow):
    // 1) try details.storyId equality,
    // 2) then try details.questionId equality (new guard),
    // 3) then fallback to targetId
    let userActivity = await prisma.userActivity.findFirst({
      where: {
        userId,
        activityType: ActivityType.SA_QUESTION,
        completed: true,
        details: {
          path: ["storyId"],
          equals: storyId,
        },
      },
    });
    console.info("[getStorySAQuestion] lookup by details.storyId result:", userActivity?.id);

    if (!userActivity) {
      // Try matching by details.questionId (we store questionId in details)
      userActivity = await prisma.userActivity.findFirst({
        where: {
          userId,
          activityType: ActivityType.SA_QUESTION,
          completed: true,
          details: {
            path: ["questionId"],
            equals: question.id,
          },
        },
      });
      console.info("[getStorySAQuestion] lookup by details.questionId result:", userActivity?.id);
    }

    if (!userActivity) {
      // Fallback to activity keyed by targetId
      userActivity = await prisma.userActivity.findUnique({
        where: {
          userId_activityType_targetId: {
            userId,
            activityType: ActivityType.SA_QUESTION,
            targetId: `${storyId}-${chapterNumber}-${question.id}`,
          },
        },
      });
      console.info("[getStorySAQuestion] lookup by targetId result:", userActivity?.id);
    }

    const userRecord = userActivity?.details as any;
    if (userActivity) {
      console.info("[getStorySAQuestion] matched activity details:", {
        activityId: userActivity.id,
        details: userActivity.details,
      });
    }

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
          questionId: formattedQuestion.questionId,
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
  const body = await req.json();
  const { answer, timeRecorded, createActivity = false } = body;
  console.info('[answerStorySAQuestion] createActivity flag:', createActivity);

    const userId = req.session?.user.id as string;
    if (!userId) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    if (!storyId || !chapterNumber || !questionNumber) {
      return NextResponse.json(
        { message: "Invalid parameters" },
        { status: 400 }
      );
    }

    // Load story and chapter
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        chapters: { where: { chapterNumber: parseInt(chapterNumber, 10) } },
      },
    });
    if (!story) {
      return NextResponse.json({ message: "Story not found" }, { status: 404 });
    }
    const chapter = story.chapters[0];
    if (!chapter) {
      return NextResponse.json(
        { message: "Chapter not found" },
        { status: 404 }
      );
    }

    // Treat incoming questionNumber as the DB question id
    const questionId = questionNumber;

    // Try to find the specific question by id first
    let questionData = await prisma.shortAnswerQuestion.findUnique({
      where: { id: questionId },
    });

    // Fallback: load questions for chapter and pick first if id not found
    if (!questionData) {
      let shortAnswerQuestions = await prisma.shortAnswerQuestion.findMany({
        where: { chapterId: chapter.id },
      });
      if (!shortAnswerQuestions || shortAnswerQuestions.length === 0) {
        // generate if missing
        const generateSAQ = await generateSAQuestion({
          cefrlevel:
            (story.cefrLevel?.replace(/[+-]/g, "") as ArticleBaseCefrLevel) ||
            ArticleBaseCefrLevel.A1,
          type: (story.type as ArticleType) || ArticleType.NONFICTION,
          passage: chapter.passage || "",
          title: story.title || "",
          summary: story.summary || "",
          imageDesc: story.imageDescription || "",
        });

        for (const q of generateSAQ.questions) {
          await prisma.shortAnswerQuestion.create({
            data: {
              chapterId: chapter.id,
              question: q.question,
              answer: q.suggested_answer || "",
            },
          });
        }

        shortAnswerQuestions = await prisma.shortAnswerQuestion.findMany({
          where: { chapterId: chapter.id },
        });
      }

      questionData = (shortAnswerQuestions as any[])[0];
    }

    if (!questionData) {
      return NextResponse.json(
        { message: "No questions found" },
        { status: 404 }
      );
    }

  // Use composite targetId so it matches the lookup in getStorySAQuestion
  const targetId = `${questionData.id}`;

    if (createActivity !== false) {
      // Check if user already answered (unique composite)
      const existingActivity = await prisma.userActivity.findUnique({
        where: {
          userId_activityType_targetId: {
            userId,
            activityType: ActivityType.SA_QUESTION,
            targetId,
          },
        },
      });

      if (existingActivity) {
        return NextResponse.json(
          { message: "User already answered", results: [] },
          { status: 400 }
        );
      }

      // Upsert user activity so updates are possible
      const activity = await prisma.userActivity.upsert({
        where: {
          userId_activityType_targetId: {
            userId,
            activityType: ActivityType.SA_QUESTION,
            targetId,
          },
        },
        update: {
          completed: true,
          timer: timeRecorded,
          details: {
            storyId,
            chapter_number: chapterNumber,
            questionId: questionData.id,
            question: questionData.question,
            answer,
            suggested_answer: questionData.answer,
            created_at: new Date().toISOString(),
          },
          updatedAt: new Date(),
        },
        create: {
          userId,
          activityType: ActivityType.SA_QUESTION,
          targetId,
          timer: timeRecorded,
          completed: true,
          details: {
            storyId,
            chapter_number: chapterNumber,
            questionId: questionData.id,
            question: questionData.question,
            answer,
            suggested_answer: questionData.answer,
            created_at: new Date().toISOString(),
          },
        },
      });

      // Debug logging: show created/updated activity for tracing
      try {
        console.info("[answerStorySAQuestion] upserted activity", {
          activityId: activity.id,
          userId,
          targetId,
          details: activity.details,
        });
      } catch (e) {
        console.error("[answerStorySAQuestion] logging failed", e);
      }

      // Award XP once (guard against duplicate xPLog)
      const existingXpLog = await prisma.xPLog.findFirst({
        where: {
          activityId: activity.id,
          activityType: ActivityType.SA_QUESTION,
        },
      });
      if (!existingXpLog) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user) {
          const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { xp: user.xp + 3 },
          });
          await prisma.xPLog.create({
            data: {
              userId,
              xpEarned: 3,
              activityId: activity.id,
              activityType: ActivityType.SA_QUESTION,
            },
          });
          if (req.session?.user) req.session.user.xp = updatedUser.xp;
        }
      }
    } else {
      console.info('[answerStorySAQuestion] createActivity=false, skipping activity upsert/xp award');
    }

    // Build progress for SA questions in this story
    const userActivities = await prisma.userActivity.findMany({
      where: {
        userId,
        activityType: ActivityType.SA_QUESTION,
        targetId: { startsWith: `${storyId}-` },
      },
      orderBy: { createdAt: "asc" },
    });

    const progress = userActivities.map(
      (a) => (a.details as any)?.status || AnswerStatus.UNANSWERED
    );
    for (let i = 0; i < 5 - userActivities.length; i++)
      progress.push(AnswerStatus.UNANSWERED);

    if (!progress.includes(AnswerStatus.UNANSWERED)) {
      await prisma.storyRecord.upsert({
        where: { userId_storyId: { userId, storyId } },
        update: {
          status: QuizStatus.COMPLETED_SAQ,
          score: progress.filter((s) => s === AnswerStatus.CORRECT).length,
          rated: 0,
          level: req.session?.user.level,
          updatedAt: new Date(),
        },
        create: {
          userId,
          storyId,
          status: QuizStatus.COMPLETED_SAQ,
          score: progress.filter((s) => s === AnswerStatus.CORRECT).length,
          rated: 0,
          level: req.session?.user.level,
        },
      });
    }

    return NextResponse.json(
      {
        chapter_number: chapterNumber,
        questionId: questionData.id,
        progress,
        answer,
        suggested_answer: questionData.answer,
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
    const { selectedAnswer, timeRecorded } = await req.json();
    const { storyId, chapterNumber, questionNumber } = ctx.params;
    const userId = req.session?.user.id as string;

    if (!userId) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    if (!storyId || !chapterNumber || !questionNumber) {
      return NextResponse.json(
        { message: "Invalid parameters" },
        { status: 400 }
      );
    }

    // Get story with chapter
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        chapters: {
          where: { chapterNumber: parseInt(chapterNumber, 10) },
        },
      },
    });

    if (!story) {
      return NextResponse.json({ message: "Story not found" }, { status: 404 });
    }

    const chapter = story.chapters[0];
    if (!chapter) {
      return NextResponse.json(
        { message: "Chapter not found" },
        { status: 404 }
      );
    }

    let questions = await prisma.multipleChoiceQuestion.findMany({
      where: { chapterId: chapter.id },
    });

    if (questions.length === 0) {
      const cefrlevel = story.cefrLevel?.replace(/[+-]/g, "") as any;
      const generateMCQ = await generateMCQuestion({
        cefrlevel: cefrlevel,
        type: story.type as any,
        passage: chapter.passage || "",
        title: story.title || "",
        summary: story.summary || "",
        imageDesc: story.imageDescription || "",
      });

      const questionsToCreate = generateMCQ.questions.slice(0, 5);

      for (const question of questionsToCreate) {
        await prisma.multipleChoiceQuestion.create({
          data: {
            chapterId: chapter.id,
            question: question.question,
            options: [
              question.correct_answer,
              question.distractor_1,
              question.distractor_2,
              question.distractor_3,
            ],
            answer: question.correct_answer || "",
            textualEvidence: question.textual_evidence || "",
          },
        });
      }

      questions = await prisma.multipleChoiceQuestion.findMany({
        where: { chapterId: chapter.id },
      });
    }

    const questionsMapped = questions.map((q, index) => ({
      ...q,
      question_number: index + 1,
    }));

    const questionData = questionsMapped.find(
      (q) => q.question_number === parseInt(questionNumber, 10)
    );

    if (!questionData) {
      return NextResponse.json(
        { message: "Question not found" },
        { status: 404 }
      );
    }

    const correctAnswer = questionData?.answer;
    const isCorrect = selectedAnswer === correctAnswer;

    const targetId = questionData.id;

    // Check if user already answered -> create or update (upsert) so answers can be updated like `answerMCQuestion`
    const activity = await prisma.userActivity.upsert({
      where: {
        userId_activityType_targetId: {
          userId,
          activityType: ActivityType.MC_QUESTION,
          targetId,
        },
      },
      update: {
        completed: true,
        timer: timeRecorded,
        details: {
          storyId: storyId,
          chapterNumber: chapterNumber,
          questionNumber: questionNumber,
          questionId: questionData.id,
          question: questionData.question,
          selectedAnswer: selectedAnswer,
          correctAnswer: correctAnswer,
          textualEvidence: questionData.textualEvidence,
          isCorrect: isCorrect,
        },
        updatedAt: new Date(),
      },
      create: {
        userId,
        activityType: ActivityType.MC_QUESTION,
        targetId,
        timer: timeRecorded,
        completed: true,
        details: {
          storyId: storyId,
          chapterNumber: chapterNumber,
          questionNumber: questionNumber,
          questionId: questionData.id,
          question: questionData.question,
          selectedAnswer: selectedAnswer,
          correctAnswer: correctAnswer,
          textualEvidence: questionData.textualEvidence,
          isCorrect: isCorrect,
        },
      },
    });

    if (isCorrect) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user) {
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { xp: user.xp + UserXpEarned.MC_Question },
        });

        await prisma.xPLog.create({
          data: {
            userId: userId,
            xpEarned: UserXpEarned.MC_Question,
            activityId: activity.id,
            activityType: ActivityType.MC_QUESTION,
          },
        });

        if (req.session?.user) {
          req.session.user.xp = updatedUser.xp;
        }
      }
    }

    // Get all user activities for this chapter
    const userActivities = await prisma.userActivity.findMany({
      where: {
        userId,
        activityType: ActivityType.MC_QUESTION,
        targetId: {
          startsWith: `${storyId}-${chapterNumber}-`,
        },
      },
    });

    let progress: AnswerStatus[] = new Array(5).fill(AnswerStatus.UNANSWERED);

    userActivities.forEach((activity) => {
      const questionIndex = parseInt(activity.targetId.split("-")[2], 10) - 1;
      if (questionIndex >= 0 && questionIndex < 5 && activity.details) {
        progress[questionIndex] = (activity.details as any).status;
      }
    });

    if (!progress.includes(AnswerStatus.UNANSWERED)) {
      // Update story record status
      await prisma.storyRecord.upsert({
        where: {
          userId_storyId: {
            userId,
            storyId,
          },
        },
        update: {
          status: QuizStatus.COMPLETED_MCQ,
          score: progress.filter((status) => status === AnswerStatus.CORRECT)
            .length,
          rated: 0,
          level: req.session?.user.level,
          updatedAt: new Date(),
        },
        create: {
          userId,
          storyId,
          status: QuizStatus.COMPLETED_MCQ,
          score: progress.filter((status) => status === AnswerStatus.CORRECT)
            .length,
          rated: 0,
          level: req.session?.user.level,
        },
      });

      // Update heatmap
      const date = new Date();
      const dateString = `${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date
        .getDate()
        .toString()
        .padStart(2, "0")}-${date.getFullYear()}`;

      await prisma.userActivity.upsert({
        where: {
          userId_activityType_targetId: {
            userId,
            activityType: ActivityType.STORIES_READ,
            targetId: `heatmap-${dateString}`,
          },
        },
        update: {
          details: {
            read: 1,
            completed: 1,
          },
        },
        create: {
          userId,
          activityType: ActivityType.STORIES_READ,
          targetId: `heatmap-${dateString}`,
          completed: true,
          details: {
            read: 1,
            completed: 1,
          },
        },
      });
    }

    const responseData = {
      correct: isCorrect,
      correctAnswer: correctAnswer,
      textualEvidence: questionData.textualEvidence,
      xpEarned: isCorrect ? UserXpEarned.MC_Question : 0,
      userXp: req.session?.user.xp,
    };

    return NextResponse.json(responseData, { status: 200 });
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
    const userId = req.session?.user.id as string;

    if (!userId) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    // Update story record rating
    await prisma.storyRecord.upsert({
      where: {
        userId_storyId: {
          userId,
          storyId,
        },
      },
      update: {
        rated: rating,
        updatedAt: new Date(),
      },
      create: {
        userId,
        storyId,
        rated: rating,
      },
    });

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

export async function retakeStoryMCQuestion(
  req: ExtendedNextRequest,
  { params: { storyId, chapterNumber } }: RequestContext
) {
  try {
    const userId = req.session?.user.id as string;

    if (!userId) {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    if (!storyId || !chapterNumber) {
      return NextResponse.json(
        { message: "Invalid parameters" },
        { status: 400 }
      );
    }

    // Find all MCQ userActivity entries for this user
    const activitiesToDelete = await prisma.userActivity.findMany({
      where: {
        userId,
        activityType: ActivityType.MC_QUESTION,
      },
    });

    // Filter to only those that are for this story chapter (details.storyId + details.chapterNumber)
    const storyActivityIds = activitiesToDelete
      .filter((activity) => {
        const details = activity.details as any;
        return (
          details?.storyId === storyId &&
          String(details?.chapterNumber) === String(chapterNumber)
        );
      })
      .map((a) => a.id);

    if (storyActivityIds.length === 0) {
      return NextResponse.json(
        { message: `No records found for chapter ${chapterNumber}` },
        { status: 404 }
      );
    }

    // Delete XP logs for those activities
    await prisma.xPLog.deleteMany({
      where: {
        userId,
        activityType: ActivityType.MC_QUESTION,
        activityId: {
          in: storyActivityIds,
        },
      },
    });

    // Recalculate total XP from remaining xp logs and update user xp/session
    const remainingXpLogs = await prisma.xPLog.findMany({ where: { userId } });
    const totalXp = remainingXpLogs.reduce((sum, log) => sum + log.xpEarned, 0);

    await prisma.user.update({ where: { id: userId }, data: { xp: totalXp } });
    if (req.session?.user) {
      req.session.user.xp = totalXp;
    }

    // Delete the userActivity records by id
    await prisma.userActivity.deleteMany({
      where: { id: { in: storyActivityIds } },
    });

    return NextResponse.json(
      {
        message: `MCQ progress reset for chapter ${chapterNumber}`,
        state: QuestionState.INCOMPLETE,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in retakeStoryMCQuestion:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function getStoryLAQuestion(
  req: ExtendedNextRequest,
  { params: { storyId, chapterNumber } }: RequestContext
) {
  try {
    if (!storyId || typeof storyId !== "string") {
      return NextResponse.json({ message: "Invalid storyId" }, { status: 400 });
    }

    if (!req.session?.user?.id || typeof req.session.user.id !== "string") {
      return NextResponse.json(
        { message: "User not authenticated" },
        { status: 401 }
      );
    }

    const userId = req.session.user.id;

    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        chapters: {
          where: { chapterNumber: parseInt(chapterNumber, 10) },
        },
      },
    });

    if (!story) {
      return NextResponse.json({ message: "Story not found" }, { status: 404 });
    }

    const chapter = story.chapters[0];
    if (!chapter) {
      return NextResponse.json(
        { message: "Chapter not found" },
        { status: 404 }
      );
    }

    let laQuestion = await prisma.longAnswerQuestion.findFirst({
      where: { chapterId: chapter.id },
    });

    if (!laQuestion) {
      const generatedQuestion = await generateLAQuestion({
        cefrlevel: story.cefrLevel?.replace(
          /[+-]/g,
          ""
        ) as ArticleBaseCefrLevel,
        type: story.type as ArticleType,
        passage: chapter.passage || "",
        title: story.title || "",
        summary: story.summary || "",
        imageDesc: story.imageDescription || "",
      });

      laQuestion = await prisma.longAnswerQuestion.create({
        data: {
          chapterId: chapter.id,
          question: generatedQuestion.question,
        },
      });
    }

    const existingActivity = await prisma.userActivity.findFirst({
      where: {
        userId: userId,
        activityType: ActivityType.LA_QUESTION,
        targetId: `${storyId}-${chapterNumber}-${laQuestion.id}`,
        completed: true,
      },
    });

    if (existingActivity) {
      const details = existingActivity.details as any;
      return NextResponse.json(
        {
          message: "User already answered",
          result: {
            id: details?.questionId,
            question: details?.question,
          },
          state: QuestionState.COMPLETED,
          answer: details?.answer,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        state: QuestionState.INCOMPLETE,
        result: {
          id: laQuestion.id,
          question: laQuestion.question,
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

export async function getStoryFeedbackLAquestion(
  req: ExtendedNextRequest,
  { params: { storyId, chapterNumber, questionNumber } }: SubRequestContext
) {
  try {
    if (!storyId || typeof storyId !== "string" || storyId.trim() === "") {
      console.error("Invalid or empty storyId!", { storyId });
      return NextResponse.json({ message: "Invalid storyId" }, { status: 400 });
    }

    if (!questionNumber || typeof questionNumber !== "string") {
      console.error("Invalid questionNumber!", { questionNumber });
      return NextResponse.json(
        { message: "Invalid questionNumber" },
        { status: 400 }
      );
    }

    const { answer, preferredLanguage } = await req.json();

    if (!answer || !preferredLanguage) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get story with chapter
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      include: {
        chapters: {
          where: { chapterNumber: parseInt(chapterNumber, 10) },
        },
      },
    });

    if (!story) {
      console.error("Story not found:", storyId);
      return NextResponse.json({ message: "Story not found" }, { status: 404 });
    }

    const chapter = story.chapters[0];
    if (!chapter) {
      console.error("Chapter not found:", chapterNumber);
      return NextResponse.json(
        { message: "Chapter not found" },
        { status: 404 }
      );
    }

    const chapterData = chapter as any;
    if (!chapterData.questions || chapterData.questions.length === 0) {
      console.error("No questions found in chapter:", chapterNumber);
      return NextResponse.json(
        { message: "No questions found" },
        { status: 404 }
      );
    }

    const questionData = (chapterData.questions as any[]).find(
      (q: any) => q.type === "LAQ"
    );

    if (!questionData) {
      return NextResponse.json(
        { message: "No LAQ question found" },
        { status: 404 }
      );
    }

    let cefrLevelReformatted = story.cefrLevel?.replace(/[+-]/g, "") || "";

    const feedbackResponse = await getFeedbackWritter({
      preferredLanguage,
      targetCEFRLevel: cefrLevelReformatted,
      readingPassage: chapter.summary,
      writingPrompt: questionData.question,
      studentResponse: answer,
    });

    const feedbackData = await feedbackResponse.json();

    const randomExample =
      feedbackData.exampleRevisions[
        Math.floor(Math.random() * feedbackData.exampleRevisions.length)
      ];

    const result = { ...feedbackData, exampleRevisions: randomExample };

    return NextResponse.json(
      {
        state: QuestionState.INCOMPLETE,
        result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function answerStoryLAQuestion(
  req: ExtendedNextRequest,
  { params: { storyId, chapterNumber, questionNumber } }: SubRequestContext
) {
  const { answer, feedback, timeRecorded } = await req.json();

  // Get story with chapter
  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: {
      chapters: {
        where: { chapterNumber: parseInt(chapterNumber, 10) },
      },
    },
  });

  if (!story) {
    return NextResponse.json({ message: "Story not found" }, { status: 404 });
  }

  const chapter = story.chapters[0];
  if (!chapter) {
    return NextResponse.json({ message: "Chapter not found" }, { status: 404 });
  }

  const chapterData = chapter as any;
  if (
    !Array.isArray(chapterData.questions) ||
    chapterData.questions.length === 0
  ) {
    return NextResponse.json(
      { message: "No questions found" },
      { status: 404 }
    );
  }

  const question = (chapterData.questions as any[]).find(
    (q: any) => q.type === "LAQ"
  );

  if (!question) {
    return NextResponse.json(
      { message: "No LAQ question found" },
      { status: 404 }
    );
  }

  const userId = req.session?.user.id as string;
  const targetId = `${storyId}-${chapterNumber}-${questionNumber}`;

  // Create user activity record
  await prisma.userActivity.create({
    data: {
      userId,
      activityType: ActivityType.LA_QUESTION,
      targetId,
      timer: timeRecorded,
      completed: true,
      details: {
        id: targetId,
        time_recorded: timeRecorded,
        question: question.question,
        answer,
        feedback,
        created_at: new Date().toISOString(),
      },
    },
  });

  // Update story record status
  await prisma.storyRecord.upsert({
    where: {
      userId_storyId: {
        userId,
        storyId,
      },
    },
    update: {
      status: QuizStatus.COMPLETED_LAQ,
      updatedAt: new Date(),
    },
    create: {
      userId,
      storyId,
      status: QuizStatus.COMPLETED_LAQ,
    },
  });

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
