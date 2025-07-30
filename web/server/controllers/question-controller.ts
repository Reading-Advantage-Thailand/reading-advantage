import {
  AnswerStatus,
  QuestionState,
} from "@/components/models/questions-model";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getFeedbackWritter } from "./assistant-controller";
import { generateLAQuestion } from "../utils/generators/la-question-generator";
import { generateMCQuestion } from "../utils/generators/mc-question-generator";
import { ExtendedNextRequest } from "./auth-controller";
import { generateSAQuestion } from "../utils/generators/sa-question-generator";
import { UserXpEarned } from "@/components/models/user-activity-log-model";

async function checkAndUpdateArticleCompletion(
  userId: string,
  articleId: string
) {
  try {
    const mcqActivities = await prisma.userActivity.findMany({
      where: {
        userId: userId,
        activityType: "MC_QUESTION",
      },
    });

    const mcqForThisArticle = mcqActivities.filter((activity) => {
      const details = activity.details as any;
      return details?.articleId === articleId && activity.completed;
    });

    const saqActivities = await prisma.userActivity.findMany({
      where: {
        userId: userId,
        activityType: "SA_QUESTION",
      },
    });

    const saqForThisArticle = saqActivities.filter((activity) => {
      const details = activity.details as any;
      return details?.articleId === articleId && activity.completed;
    });

    const laqActivities = await prisma.userActivity.findMany({
      where: {
        userId: userId,
        activityType: "LA_QUESTION",
      },
    });

    const laqForThisArticle = laqActivities.filter((activity) => {
      const details = activity.details as any;
      return details?.articleId === articleId && activity.completed;
    });

    const allCompleted =
      mcqForThisArticle.length >= 5 &&
      saqForThisArticle.length >= 1 &&
      laqForThisArticle.length >= 1;

    if (allCompleted) {
      const existingArticleRead = await prisma.userActivity.findUnique({
        where: {
          userId_activityType_targetId: {
            userId: userId,
            activityType: "ARTICLE_READ",
            targetId: articleId,
          },
        },
      });

      if (existingArticleRead) {
        await prisma.userActivity.update({
          where: { id: existingArticleRead.id },
          data: {
            completed: true,
            updatedAt: new Date(),
          },
        });
      } else {
        await prisma.userActivity.create({
          data: {
            userId: userId,
            activityType: "ARTICLE_READ",
            targetId: articleId,
            completed: true,
            details: {
              articleId: articleId,
              allQuestionsCompleted: true,
            },
          },
        });
      }
    }
  } catch (error) {
    console.error("Error checking article completion:", error);
  }
}

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

export async function getMCQuestions(
  req: ExtendedNextRequest,
  { params: { article_id } }: RequestContext
) {
  try {
    const userId = req.session?.user.id as string;

    if (!userId) {
      return NextResponse.json(
        {
          message: "User not authenticated",
          state: QuestionState.LOADING,
          total: 5,
          progress: [
            AnswerStatus.UNANSWERED,
            AnswerStatus.UNANSWERED,
            AnswerStatus.UNANSWERED,
            AnswerStatus.UNANSWERED,
            AnswerStatus.UNANSWERED,
          ],
          results: [],
        },
        { status: 401 }
      );
    }

    let questions = await prisma.multipleChoiceQuestion.findMany({
      where: { articleId: article_id },
    });

    if (questions.length === 0) {
      const article = await prisma.article.findUnique({
        where: { id: article_id },
      });

      if (!article) {
        return NextResponse.json(
          { message: "Article not found" },
          { status: 404 }
        );
      }

      const cefrlevel = article.cefrLevel?.replace(/[+-]/g, "") as any;

      const generateMCQ = await generateMCQuestion({
        cefrlevel: cefrlevel,
        type: article.type as any,
        passage: article.passage || "",
        title: article.title || "",
        summary: article.summary || "",
        imageDesc: article.imageDescription || "",
      });

      const questionsToCreate = generateMCQ.questions.slice(0, 5);
      for (const question of questionsToCreate) {
        await prisma.multipleChoiceQuestion.create({
          data: {
            articleId: article_id,
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
        where: { articleId: article_id },
      });
    }

    const userActivities = await prisma.userActivity.findMany({
      where: {
        userId: userId,
        activityType: "MC_QUESTION",
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const articleActivities = userActivities.filter((activity) => {
      const details = activity.details as any;
      return details?.articleId === article_id;
    });

    const progress: AnswerStatus[] = [];
    const answeredQuestionIds = new Set();

    const questionAnswers = new Map();

    articleActivities.forEach((activity) => {
      const details = activity.details as any;
      if (details?.questionId) {
        answeredQuestionIds.add(details.questionId);
        questionAnswers.set(details.questionId, details.isCorrect);
      }
    });

    const questionsForThisArticle = questions.slice(0, 5);

    questionsForThisArticle.forEach((question) => {
      if (questionAnswers.has(question.id)) {
        const isCorrect = questionAnswers.get(question.id);
        progress.push(
          isCorrect ? AnswerStatus.CORRECT : AnswerStatus.INCORRECT
        );
      } else {
        progress.push(AnswerStatus.UNANSWERED);
      }
    });

    while (progress.length < 5) {
      progress.push(AnswerStatus.UNANSWERED);
    }

    const currentQuestionIndex = progress.findIndex(
      (p) => p === AnswerStatus.UNANSWERED
    );

    if (currentQuestionIndex === -1) {
      const responseData = {
        state: QuestionState.COMPLETED,
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

    const unansweredQuestions = questionsForThisArticle.filter(
      (question) => !answeredQuestionIds.has(question.id)
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

    const mcq = [
      {
        id: nextQuestion.id,
        question: nextQuestion.question,
        options: options.sort(() => 0.5 - Math.random()),
        textual_evidence: nextQuestion.textualEvidence,
      },
    ];

    const responseData = {
      state: QuestionState.INCOMPLETE,
      total: 5,
      progress,
      results: mcq,
    };

    return new NextResponse(JSON.stringify(responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
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
    const userId = req.session?.user.id as string;

    const existingActivity = await prisma.userActivity.findFirst({
      where: {
        userId: userId,
        activityType: "SA_QUESTION",
        completed: true,
        details: {
          path: ["articleId"],
          equals: article_id,
        },
      },
    });

    let activityWithDetails = existingActivity;
    if (!activityWithDetails) {
      activityWithDetails = await prisma.userActivity.findFirst({
        where: {
          userId: userId,
          activityType: "SA_QUESTION",
          targetId: article_id,
          completed: true,
        },
      });
    }

    if (activityWithDetails) {
      const details = activityWithDetails.details as any;
      return NextResponse.json(
        {
          message: "User already answered",
          result: {
            id: details?.questionId || "",
            question: details?.question || "",
          },
          suggested_answer: details?.suggested_answer || "",
          state: QuestionState.COMPLETED,
          answer: details?.answer || "",
        },
        { status: 200 }
      );
    }

    let questions = await prisma.shortAnswerQuestion.findMany({
      where: { articleId: article_id },
    });

    if (questions.length === 0) {
      const article = await prisma.article.findUnique({
        where: { id: article_id },
      });

      if (!article) {
        return NextResponse.json(
          { message: "Article not found" },
          { status: 404 }
        );
      }

      const cefrlevel = article.cefrLevel?.replace(/[+-]/g, "") as any;

      const generateSAQ = await generateSAQuestion({
        cefrlevel: cefrlevel,
        type: article.type as any,
        passage: article.passage || "",
        title: article.title || "",
        summary: article.summary || "",
        imageDesc: article.imageDescription || "",
      });

      for (const question of generateSAQ.questions) {
        await prisma.shortAnswerQuestion.create({
          data: {
            articleId: article_id,
            question: question.question,
            answer: question.suggested_answer || "",
          },
        });
      }

      questions = await prisma.shortAnswerQuestion.findMany({
        where: { articleId: article_id },
      });
    }

    const randomQuestion =
      questions[Math.floor(Math.random() * questions.length)];

    return NextResponse.json(
      {
        state: QuestionState.INCOMPLETE,
        result: {
          id: randomQuestion.id,
          question: randomQuestion.question,
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

export async function answerSAQuestion(
  req: ExtendedNextRequest,
  { params: { article_id, question_id } }: SubRequestContext
) {
  try {
    const { answer, timeRecorded } = await req.json();
    const userId = req.session?.user.id as string;

    const question = await prisma.shortAnswerQuestion.findUnique({
      where: { id: question_id },
    });

    if (!question) {
      return NextResponse.json(
        { message: "Question not found" },
        { status: 404 }
      );
    }

    const existingActivity = await prisma.userActivity.findUnique({
      where: {
        userId_activityType_targetId: {
          userId: userId,
          activityType: "SA_QUESTION",
          targetId: question_id,
        },
      },
    });

    if (existingActivity) {
      await prisma.userActivity.update({
        where: { id: existingActivity.id },
        data: {
          completed: true,
          timer: timeRecorded,
          details: {
            questionId: question_id,
            question: question.question,
            answer: answer,
            suggested_answer: question.answer,
            articleId: article_id,
          },
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.userActivity.create({
        data: {
          userId: userId,
          activityType: "SA_QUESTION",
          targetId: question_id,
          completed: true,
          timer: timeRecorded,
          details: {
            questionId: question_id,
            question: question.question,
            answer: answer,
            suggested_answer: question.answer,
            articleId: article_id,
          },
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user) {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { xp: user.xp + 3 },
      });

      await prisma.xPLog.create({
        data: {
          userId: userId,
          xpEarned: 3,
          activityId: question_id,
          activityType: "SA_QUESTION",
        },
      });

      if (req.session?.user) {
        req.session.user.xp = updatedUser.xp;
      }
    }

    await checkAndUpdateArticleCompletion(userId, article_id);

    return NextResponse.json(
      {
        state: QuestionState.COMPLETED,
        answer,
        suggested_answer: question.answer,
        xpEarned: 3,
        userXp: req.session?.user.xp,
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
    const userId = req.session?.user.id as string;

    const existingActivity = await prisma.userActivity.findFirst({
      where: {
        userId: userId,
        activityType: "LA_QUESTION",
        targetId: article_id,
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
        { status: 400 }
      );
    }

    let questions = await prisma.longAnswerQuestion.findMany({
      where: { articleId: article_id },
    });

    if (questions.length === 0) {
      const article = await prisma.article.findUnique({
        where: { id: article_id },
      });

      if (!article) {
        return NextResponse.json(
          { message: "Article not found" },
          { status: 404 }
        );
      }

      const cefrlevel = article.cefrLevel?.replace(/[+-]/g, "") as any;

      const generateLAQ = await generateLAQuestion({
        cefrlevel: cefrlevel,
        type: article.type as any,
        passage: article.passage || "",
        title: article.title || "",
        summary: article.summary || "",
        imageDesc: article.imageDescription || "",
      });

      await prisma.longAnswerQuestion.create({
        data: {
          articleId: article_id,
          question: generateLAQ.question,
        },
      });

      questions = await prisma.longAnswerQuestion.findMany({
        where: { articleId: article_id },
      });
    }

    const randomQuestion =
      questions[Math.floor(Math.random() * questions.length)];

    return NextResponse.json(
      {
        state: QuestionState.INCOMPLETE,
        result: {
          id: randomQuestion.id,
          question: randomQuestion.question,
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

export async function answerMCQuestion(
  req: ExtendedNextRequest,
  { params: { article_id, question_id } }: SubRequestContext
) {
  try {
    const { selectedAnswer, timeRecorded } = await req.json();
    const userId = req.session?.user.id as string;

    const question = await prisma.multipleChoiceQuestion.findUnique({
      where: { id: question_id },
    });

    if (!question) {
      return NextResponse.json(
        { message: "Question not found" },
        { status: 404 }
      );
    }

    const isCorrect = selectedAnswer === question.answer;

    const existingActivity = await prisma.userActivity.findUnique({
      where: {
        userId_activityType_targetId: {
          userId: userId,
          activityType: "MC_QUESTION",
          targetId: question_id,
        },
      },
    });

    if (existingActivity) {
      await prisma.userActivity.update({
        where: { id: existingActivity.id },
        data: {
          completed: true,
          timer: timeRecorded,
          details: {
            questionId: question_id,
            articleId: article_id,
            question: question.question,
            selectedAnswer: selectedAnswer,
            correctAnswer: question.answer,
            textualEvidence: question.textualEvidence,
            isCorrect: isCorrect,
          },
          updatedAt: new Date(),
        },
      });
    } else {
      await prisma.userActivity.create({
        data: {
          userId: userId,
          activityType: "MC_QUESTION",
          targetId: question_id,
          completed: true,
          timer: timeRecorded,
          details: {
            questionId: question_id,
            articleId: article_id,
            question: question.question,
            selectedAnswer: selectedAnswer,
            correctAnswer: question.answer,
            textualEvidence: question.textualEvidence,
            isCorrect: isCorrect,
          },
        },
      });
    }

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
            activityId: question_id,
            activityType: "MC_QUESTION",
          },
        });
      }
    }

    await checkAndUpdateArticleCompletion(userId, article_id);

    const responseData = {
      correct: isCorrect,
      correctAnswer: question.answer,
      textualEvidence: question.textualEvidence,
      xpEarned: isCorrect ? 1 : 0,
      userXp: req.session?.user.xp,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Error in answerMCQuestion:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function retakeMCQuestion(
  req: ExtendedNextRequest,
  { params: { article_id } }: RequestContext
) {
  try {
    const userId = req.session?.user.id as string;

    const activitiesToDelete = await prisma.userActivity.findMany({
      where: {
        userId: userId,
        activityType: "MC_QUESTION",
      },
    });

    const articleActivityIds = activitiesToDelete
      .filter((activity) => {
        const details = activity.details as any;
        return details?.articleId === article_id;
      })
      .map((activity) => activity.id);

    const mcQuestions = await prisma.multipleChoiceQuestion.findMany({
      where: {
        articleId: article_id,
      },
      select: {
        id: true,
      },
    });

    const questionIds = mcQuestions.map((q) => q.id);

    if (questionIds.length > 0) {
      await prisma.xPLog.deleteMany({
        where: {
          userId: userId,
          activityType: "MC_QUESTION",
          activityId: {
            in: questionIds,
          },
        },
      });

      const remainingXpLogs = await prisma.xPLog.findMany({
        where: {
          userId: userId,
        },
      });

      const totalXp = remainingXpLogs.reduce(
        (sum, log) => sum + log.xpEarned,
        0
      );

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          xp: totalXp,
        },
      });

      if (req.session?.user) {
        req.session.user.xp = totalXp;
      }
    }

    if (articleActivityIds.length > 0) {
      await prisma.userActivity.deleteMany({
        where: {
          id: {
            in: articleActivityIds,
          },
        },
      });
    }

    return NextResponse.json(
      { message: "MCQ progress reset successfully" },
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

export async function answerLAQuestion(
  req: ExtendedNextRequest,
  { params: { article_id, question_id } }: SubRequestContext
) {
  try {
    const { answer, feedback, timeRecorded } = await req.json();
    const userId = req.session?.user.id as string;

    const question = await prisma.longAnswerQuestion.findUnique({
      where: { id: question_id },
    });

    if (!question) {
      return NextResponse.json(
        { message: "Question not found" },
        { status: 404 }
      );
    }

    await prisma.userActivity.upsert({
      where: {
        userId_activityType_targetId: {
          userId: userId,
          activityType: "LA_QUESTION",
          targetId: article_id,
        },
      },
      update: {
        completed: true,
        timer: timeRecorded,
        details: {
          questionId: question_id,
          question: question.question,
          answer: answer,
          feedback: feedback,
        },
        updatedAt: new Date(),
      },
      create: {
        userId: userId,
        activityType: "LA_QUESTION",
        targetId: article_id,
        completed: true,
        timer: timeRecorded,
        details: {
          questionId: question_id,
          question: question.question,
          answer: answer,
          feedback: feedback,
        },
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    let scores: number[] = [];
    let sumScores = 0;

    if (feedback && feedback.scores && typeof feedback.scores === "object") {
      scores = Object.values(feedback.scores);
      sumScores = scores.reduce<number>((a, b) => a + b, 0);
    }

    await checkAndUpdateArticleCompletion(userId, article_id);

    return NextResponse.json(
      {
        state: QuestionState.COMPLETED,
        answer,
        result: feedback,
        sumScores,
        userXp: user.xp,
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
  try {
    const { answer, preferredLanguage } = await req.json();

    const question = await prisma.longAnswerQuestion.findUnique({
      where: { id: question_id },
    });

    const article = await prisma.article.findUnique({
      where: { id: article_id },
    });

    if (!question || !article) {
      return NextResponse.json(
        { message: "Question or article not found" },
        { status: 404 }
      );
    }

    const cefrLevelReformatted =
      article.cefrLevel?.replace(/[+-]/g, "") || "A1";

    const getFeedback = await getFeedbackWritter({
      preferredLanguage,
      targetCEFRLevel: cefrLevelReformatted,
      readingPassage: article.passage || "",
      writingPrompt: question.question,
      studentResponse: answer,
    });

    if (!getFeedback.ok) {
      throw new Error(
        `Feedback generation failed with status: ${getFeedback.status}`
      );
    }

    const getData = await getFeedback.json();

    if (!getData || typeof getData !== "object") {
      throw new Error("Invalid feedback data received");
    }

    let randomExamples = "";
    if (
      getData.exampleRevisions &&
      Array.isArray(getData.exampleRevisions) &&
      getData.exampleRevisions.length > 0
    ) {
      randomExamples =
        getData.exampleRevisions[
          Math.floor(Math.random() * getData.exampleRevisions.length)
        ];
    } else {
      const scores = getData.scores
        ? (Object.values(getData.scores) as number[])
        : [];
      const averageScore =
        scores.length > 0
          ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
          : 0;

      if (averageScore >= 4) {
        randomExamples =
          "Excellent work! Your writing meets the expectations for this level. Keep practicing to maintain this high standard.";
      } else {
        randomExamples =
          "No specific revisions needed at this time. Your writing is good for your level.";
      }
    }

    const result = { ...getData, exampleRevisions: randomExamples };

    return NextResponse.json(
      {
        state: QuestionState.INCOMPLETE,
        result,
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
    const userId = req.session?.user.id as string;

    await prisma.userActivity.create({
      data: {
        userId: userId,
        activityType: "ARTICLE_RATING",
        targetId: article_id,
        completed: true,
        details: {
          rating: rating,
        },
      },
    });

    return NextResponse.json(
      { message: "Article rated successfully" },
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

export async function getLAQuestionXP(
  req: ExtendedNextRequest,
  { params: { article_id, question_id } }: SubRequestContext
) {
  try {
    const { rating } = await req.json();
    const userId = req.session?.user.id as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const existingXPLog = await prisma.xPLog.findFirst({
      where: {
        userId: userId,
        activityId: question_id,
        activityType: "LA_QUESTION",
      },
    });

    if (existingXPLog) {
      return NextResponse.json(
        { message: "XP already awarded for this question", xpEarned: 0 },
        { status: 200 }
      );
    }

    const xpEarned = Math.max(1, Math.floor(rating / 2));

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { xp: user.xp + xpEarned },
    });

    await prisma.xPLog.create({
      data: {
        userId: userId,
        xpEarned: xpEarned,
        activityId: question_id,
        activityType: "LA_QUESTION",
      },
    });

    if (req.session?.user) {
      req.session.user.xp = updatedUser.xp;
    }

    return NextResponse.json(
      {
        message: "XP awarded successfully",
        xpEarned: xpEarned,
        userXp: updatedUser.xp,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error awarding LAQ XP:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function rateSAQuestion(
  req: ExtendedNextRequest,
  { params: { article_id, question_id } }: SubRequestContext
) {
  try {
    const { rating } = await req.json();
    const userId = req.session?.user.id as string;

    const existingRating = await prisma.userActivity.findFirst({
      where: {
        userId: userId,
        activityType: "ARTICLE_RATING",
        targetId: question_id,
        completed: true,
        details: {
          path: ["questionId"],
          equals: question_id,
        },
      },
    });

    if (existingRating) {
      return NextResponse.json(
        { message: "Rating already submitted", xpEarned: 0 },
        { status: 200 }
      );
    }

    await prisma.userActivity.create({
      data: {
        userId: userId,
        activityType: "ARTICLE_RATING",
        targetId: question_id,
        completed: true,
        details: {
          questionId: question_id,
          articleId: article_id,
          rating: rating,
          type: "SA_QUESTION_RATING",
        },
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user) {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { xp: user.xp + rating },
      });

      await prisma.xPLog.create({
        data: {
          userId: userId,
          xpEarned: rating,
          activityId: question_id,
          activityType: "ARTICLE_RATING",
        },
      });

      if (req.session?.user) {
        req.session.user.xp = updatedUser.xp;
      }
    }

    return NextResponse.json(
      {
        message: "Rating submitted successfully",
        xpEarned: rating,
        userXp: req.session?.user.xp,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting SAQ rating:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
