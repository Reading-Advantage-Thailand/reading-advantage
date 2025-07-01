"use client";
import React, { useContext, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import QuestionHeader from "./question-header";
import { QuizContext, QuizContextProvider } from "@/contexts/quiz-context";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";
import { useScopedI18n } from "@/locales/client";
import { Button } from "../ui/button";
import { cn, levelCalculation } from "@/lib/utils";
import {
  AnswerStatus,
  MultipleChoiceQuestion,
  QuestionState,
} from "../models/questions-model";
import { Icons } from "../icons";
import { useQuestionStore } from "@/store/question-store";
import { set } from "lodash";
import { toast } from "../ui/use-toast";
import {
  UserXpEarned,
  ActivityStatus,
  ActivityType,
} from "../models/user-activity-log-model";
import { useRouter } from "next/navigation";

type Props = {
  userId: string;
  articleId: string;
  articleTitle: string;
  articleLevel: number;
  page?: "lesson" | "article";
  onCompleteChange?: (complete: boolean) => void;
};

export type QuestionResponse = {
  results: MultipleChoiceQuestion[];
  progress: AnswerStatus[];
  total: number;
  state: QuestionState;
};

export default function MCQuestionCard({
  userId,
  articleId,
  articleTitle,
  articleLevel,
  page,
  onCompleteChange,
}: Props) {
  const [state, setState] = useState(QuestionState.LOADING);
  const [data, setData] = useState<QuestionResponse>({
    results: [],
    progress: [],
    total: 0,
    state: QuestionState.LOADING,
  });

  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const checkAndClearCorruptedData = async () => {
      try {
        const savedProgress = sessionStorage.getItem(
          `quiz_progress_${articleId}`
        );
        const savedStarted = sessionStorage.getItem(
          `quiz_started_${articleId}`
        );

        if (savedProgress) {
          const parsedProgress = JSON.parse(savedProgress);
          if (
            Array.isArray(parsedProgress) &&
            parsedProgress.length === 5 &&
            parsedProgress.every(
              (status: number) => status === AnswerStatus.CORRECT
            )
          ) {
            sessionStorage.removeItem(`quiz_progress_${articleId}`);
            sessionStorage.removeItem(`quiz_started_${articleId}`);
            setHasStarted(false);
          }
        }

        if (savedStarted === "true" && !savedProgress) {
          sessionStorage.removeItem(`quiz_started_${articleId}`);
          setHasStarted(false);
        }
      } catch (e) {
        console.error("Error checking cached data:", e);
        try {
          sessionStorage.removeItem(`quiz_progress_${articleId}`);
          sessionStorage.removeItem(`quiz_started_${articleId}`);
          setHasStarted(false);
        } catch (clearError) {
          console.error("Error clearing corrupted data:", clearError);
        }
      }
    };

    checkAndClearCorruptedData();
  }, [articleId]);

  useEffect(() => {
    try {
      const quizStarted = sessionStorage.getItem(`quiz_started_${articleId}`);
      if (quizStarted === "true") {
        setHasStarted(true);
      } else {
        setHasStarted(false);
      }
    } catch (e) {
      console.error("Failed to read from sessionStorage:", e);
      setHasStarted(false);
    }
  }, [articleId]);

  useEffect(() => {
    const timestamp = new Date().getTime();
    fetch(`/api/v1/articles/${articleId}/questions/mcq?_t=${timestamp}`)
      .then((res) => res.json())
      .then((data) => {
        try {
          const savedProgress = sessionStorage.getItem(
            `quiz_progress_${articleId}`
          );
          if (savedProgress) {
            const parsedProgress = JSON.parse(savedProgress);
            if (
              Array.isArray(parsedProgress) &&
              parsedProgress.length === 5 &&
              parsedProgress.every(
                (status) =>
                  status === AnswerStatus.CORRECT ||
                  status === AnswerStatus.INCORRECT ||
                  status === AnswerStatus.UNANSWERED
              )
            ) {
              data.progress = parsedProgress;
            }
          }
        } catch (e) {
          try {
            sessionStorage.removeItem(`quiz_progress_${articleId}`);
          } catch (clearError) {}
        }

        if (
          data.progress &&
          Array.isArray(data.progress) &&
          data.progress.length === 5 &&
          data.progress.every(
            (status: number) => status === AnswerStatus.CORRECT
          ) &&
          data.state === QuestionState.INCOMPLETE
        ) {
          data.progress = [
            AnswerStatus.UNANSWERED,
            AnswerStatus.UNANSWERED,
            AnswerStatus.UNANSWERED,
            AnswerStatus.UNANSWERED,
            AnswerStatus.UNANSWERED,
          ];
          setHasStarted(false);
          try {
            sessionStorage.removeItem(`quiz_progress_${articleId}`);
            sessionStorage.removeItem(`quiz_started_${articleId}`);
          } catch (clearError) {}
        }

        setData(data);
        setState(data.state);
        useQuestionStore.setState({ mcQuestion: data });
      })
      .catch((error) => {
        setState(QuestionState.LOADING);
      });
  }, [articleId]);

  const handleCompleted = () => {
    setState(QuestionState.LOADING);

    setHasStarted(true);
    try {
      sessionStorage.setItem(`quiz_started_${articleId}`, "true");
    } catch (e) {}
  };

  const onRetake = () => {
    setState(QuestionState.LOADING);

    try {
      sessionStorage.removeItem(`quiz_progress_${articleId}`);
      sessionStorage.removeItem(`quiz_started_${articleId}`);
    } catch (e) {}

    fetch(`/api/v1/articles/${articleId}/questions/mcq`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        setState(data.state);
        setData({
          progress: [
            AnswerStatus.UNANSWERED,
            AnswerStatus.UNANSWERED,
            AnswerStatus.UNANSWERED,
            AnswerStatus.UNANSWERED,
            AnswerStatus.UNANSWERED,
          ],
          results: [],
          total: 0,
          state: data.state,
        });
      })
      .catch((error) => {
        setState(QuestionState.LOADING);
      });
  };

  useEffect(() => {
    if (state === QuestionState.COMPLETED && page === "lesson") {
      onCompleteChange?.(true);
    }
  }, [state, onCompleteChange, page]);

  switch (state) {
    case QuestionState.LOADING:
      return <QuestionCardLoading page={page} />;
    case QuestionState.INCOMPLETE:
      return (
        <QuestionCardIncomplete
          userId={userId}
          resp={data}
          articleId={articleId}
          handleCompleted={handleCompleted}
          articleTitle={articleTitle}
          articleLevel={articleLevel}
          page={page}
          hasStarted={hasStarted}
        />
      );
    case QuestionState.COMPLETED:
      return (
        <QuestionCardComplete resp={data} onRetake={onRetake} page={page} />
      );
    default:
      return <QuestionCardLoading page={page} />;
  }
}

function QuestionCardComplete({
  resp,
  page,
  onRetake,
}: {
  resp: QuestionResponse;
  onRetake: () => void;
  page?: "lesson" | "article";
}) {
  const t = useScopedI18n("components.mcq");
  return (
    <>
      {page === "article" && (
        <Card>
          <CardHeader>
            <CardTitle className="font-bold text-3xl md:text-3xl text-muted-foreground">
              {t("title")}
            </CardTitle>
            <CardDescription>
              {t("descriptionSuccess")}{" "}
              <p className="text-green-500 dark:text-green-400 inline font-bold">
                {t("descriptionSuccess2", {
                  score: (resp.progress || []).filter(
                    (status) => status === AnswerStatus.CORRECT
                  ).length,
                  total: resp.total,
                })}
              </p>
            </CardDescription>
            <Button size={"sm"} variant={"outline"} onClick={onRetake}>
              {t("retakeButton")}
            </Button>
          </CardHeader>
        </Card>
      )}

      {page === "lesson" && (
        <>
          <div className="flex flex-col gap-6 xl:h-[350px] h-full w-full md:w-[725px] xl:w-[710px] mt-4 items-center justify-center">
            {t("descriptionSuccess")}
            <p className="text-green-500 dark:text-green-400 inline font-bold">
              {t("descriptionSuccess2", {
                score: (resp.progress || []).filter(
                  (status) => status === AnswerStatus.CORRECT
                ).length,
                total: resp.total,
              })}
            </p>
          </div>
          <div className="flex items-center justify-end mt-6">
            <Button
              className="w-full lg:w-1/4"
              size={"sm"}
              variant={"outline"}
              onClick={onRetake}
            >
              {t("retakeButton")}
            </Button>
          </div>
        </>
      )}
    </>
  );
}

function QuestionCardLoading({ page }: { page?: "lesson" | "article" }) {
  const t = useScopedI18n("components.mcq");
  return (
    <>
      {page === "article" && (
        <Card>
          <CardHeader>
            <CardTitle className="font-bold text-3xl md:text-3xl text-muted-foreground">
              {t("title")}
            </CardTitle>
            <CardDescription>{t("descriptionLoading")}</CardDescription>
            <Skeleton className="h-8 w-full mt-2" />
          </CardHeader>
        </Card>
      )}
      {page === "lesson" && (
        <div className="flex items-start xl:h-[400px] w-full md:w-[725px] xl:w-[710px] space-x-4 mt-5">
          <div className="space-y-8 w-full">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      )}
    </>
  );
}

function QuestionCardIncomplete({
  userId,
  resp,
  articleId,
  handleCompleted,
  articleTitle,
  articleLevel,
  page,
  hasStarted = false,
}: {
  userId: string;
  resp: QuestionResponse;
  articleId: string;
  handleCompleted: () => void;
  articleTitle: string;
  articleLevel: number;
  page?: "lesson" | "article";
  hasStarted?: boolean;
}) {
  const t = useScopedI18n("components.mcq");

  const getCurrentQuizStartedStatus = () => {
    try {
      const sessionStarted = sessionStorage.getItem(
        `quiz_started_${articleId}`
      );
      return sessionStarted === "true";
    } catch (e) {
      console.error("Error reading quiz_started from sessionStorage:", e);
      return false;
    }
  };

  const hasStartedQuiz = (() => {
    const sessionStarted = getCurrentQuizStartedStatus();

    if (resp.progress && resp.progress.length === 5) {
      if (
        resp.state === QuestionState.INCOMPLETE &&
        resp.progress.every((status) => status === AnswerStatus.CORRECT)
      ) {
        try {
          sessionStorage.removeItem(`quiz_started_${articleId}`);
          sessionStorage.removeItem(`quiz_progress_${articleId}`);
        } catch (e) {
          console.error("Error clearing suspicious data:", e);
        }
        return false;
      }
      const hasAnswered = resp.progress.some(
        (status) =>
          status === AnswerStatus.CORRECT || status === AnswerStatus.INCORRECT
      );
      return hasAnswered;
    }
    return false;
  })();

  return (
    <>
      {page === "article" && !hasStartedQuiz && (
        <Card id="onborda-mcq">
          <QuestionHeader
            heading={t("title")}
            description={t("description")}
            buttonLabel={t("startButton")}
            userId={userId}
            articleId={articleId}
            disabled={false}
          >
            <QuizContextProvider>
              <MCQeustion
                articleId={articleId}
                resp={resp}
                handleCompleted={handleCompleted}
                userId={userId}
                articleTitle={articleTitle}
                articleLevel={articleLevel}
                page={page}
              />
            </QuizContextProvider>
          </QuestionHeader>
        </Card>
      )}

      {page === "article" && hasStartedQuiz && (
        <Card id="onborda-mcq">
          <CardHeader>
            <CardTitle className="font-bold text-3xl md:text-3xl text-muted-foreground">
              {t("title")}
            </CardTitle>
          </CardHeader>
          <QuizContextProvider>
            <MCQeustion
              articleId={articleId}
              resp={resp}
              handleCompleted={handleCompleted}
              userId={userId}
              articleTitle={articleTitle}
              articleLevel={articleLevel}
            />
          </QuizContextProvider>
        </Card>
      )}
      {page === "lesson" && (
        <QuizContextProvider>
          <MCQeustion
            articleId={articleId}
            resp={resp}
            handleCompleted={handleCompleted}
            userId={userId}
            articleTitle={articleTitle}
            articleLevel={articleLevel}
            page="lesson"
          />
        </QuizContextProvider>
      )}
    </>
  );
}

function MCQeustion({
  articleId,
  resp,
  handleCompleted,
  userId,
  articleTitle,
  articleLevel,
  page,
}: {
  articleId: string;
  resp: QuestionResponse;
  handleCompleted: () => void;
  userId: string;
  articleTitle: string;
  articleLevel: number;
  page?: "lesson" | "article";
}) {
  const [progress, setProgress] = useState(resp.progress || []);
  const [isLoadingAnswer, setLoadingAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState(-1);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const { timer, setPaused } = useContext(QuizContext);
  const t = useScopedI18n("components.mcq");
  const router = useRouter();
  const [textualEvidence, setTextualEvidence] = useState("");

  React.useEffect(() => {
    if (resp.results && resp.results[0]) {
      const options = resp.results[0].options || [];
      if (
        options.some(
          (opt) => !opt || typeof opt !== "string" || opt.trim() === ""
        )
      ) {
        console.warn("Warning: Some options may be empty or invalid:", options);
      }
    }

    let initialProgress = resp.progress || [];
    if (
      resp.state === QuestionState.INCOMPLETE &&
      initialProgress.length === 5 &&
      initialProgress.every((status) => status === AnswerStatus.CORRECT)
    ) {
      console.warn(
        "🚨 MCQeustion: Detected suspicious server progress, resetting to unanswered"
      );
      initialProgress = [
        AnswerStatus.UNANSWERED,
        AnswerStatus.UNANSWERED,
        AnswerStatus.UNANSWERED,
        AnswerStatus.UNANSWERED,
        AnswerStatus.UNANSWERED,
      ];
    }

    try {
      const savedProgress = sessionStorage.getItem(
        `quiz_progress_${articleId}`
      );
      if (savedProgress) {
        const parsedProgress = JSON.parse(savedProgress);
        if (
          Array.isArray(parsedProgress) &&
          parsedProgress.length === 5 &&
          parsedProgress.every(
            (status) =>
              status === AnswerStatus.CORRECT ||
              status === AnswerStatus.INCORRECT ||
              status === AnswerStatus.UNANSWERED
          )
        ) {
          setProgress(parsedProgress);
        } else {
          console.warn("Invalid saved progress data, using server data");
          setProgress(initialProgress);
          sessionStorage.removeItem(`quiz_progress_${articleId}`);
        }
      } else {
        setProgress(initialProgress);
      }
    } catch (e) {
      console.error("Failed to load progress from sessionStorage:", e);
      setProgress(initialProgress);
      try {
        sessionStorage.removeItem(`quiz_progress_${articleId}`);
      } catch (clearError) {
        console.error("Error clearing corrupted progress:", clearError);
      }
    }

    setSelectedOption(-1);
    setCorrectAnswer("");
    setTextualEvidence("");

    if (resp.results && resp.results[0]) {
      try {
        if (resp.results[0].question) {
          sessionStorage.setItem(`quiz_started_${articleId}`, "true");
        }
      } catch (e) {
        console.error("Failed to save to sessionStorage:", e);
      }
    }
  }, [resp, articleId]);

  const currentQuestionIndex = progress.findIndex(
    (p) => p === AnswerStatus.UNANSWERED
  );

  const onSubmitted = async (questionId: string, option: string, i: number) => {
    setPaused(true);
    setLoadingAnswer(true);

    if (!option) {
      console.error("Attempted to submit an empty option");
      option = `Option ${i + 1}`;
    }

    const cleanOption = option.replace(/^\d+\.\s*/, "");

    const originalOptions = resp.results[0]?.options || [];

    const validOptions = originalOptions.filter(
      (opt) => opt && typeof opt === "string" && opt.trim() !== ""
    );

    setSelectedOption(i);

    fetch(`/api/v1/articles/${articleId}/questions/mcq/${questionId}`, {
      method: "POST",
      body: JSON.stringify({
        selectedAnswer: cleanOption,
        timeRecorded: timer,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          const isCorrect = cleanOption === data.correctAnswer;

          setCorrectAnswer(data.correctAnswer || "");
          setSelectedOption(i);

          setTextualEvidence(data.textualEvidence || "");
          const newProgress = [...progress];
          if (currentQuestionIndex !== -1) {
            const actuallyCorrect = isCorrect;
            newProgress[currentQuestionIndex] = actuallyCorrect
              ? AnswerStatus.CORRECT
              : AnswerStatus.INCORRECT;
            setProgress(newProgress);

            try {
              sessionStorage.setItem(
                `quiz_progress_${articleId}`,
                JSON.stringify(newProgress)
              );
            } catch (e) {
              console.error("Failed to save progress to sessionStorage:", e);
            }
          }
        }
      })
      .catch((error) => {
        console.error("Error submitting answer:", error);
        setSelectedOption(i);
      })
      .finally(() => {
        setLoadingAnswer(false);
      });
  };

  useEffect(() => {
    if (page === "lesson") {
      setPaused(false);
    }

    let completedCount = 0;
    let correctCount = 0;
    (progress || []).forEach((status) => {
      if (
        status === AnswerStatus.CORRECT ||
        status === AnswerStatus.INCORRECT
      ) {
        completedCount++;
      }
      if (status === AnswerStatus.CORRECT) {
        correctCount++;
      }
    });

    if (completedCount === 5) {
      const totalXpEarned = correctCount * 2;
      toast({
        title: "Quiz Completed!",
        imgSrc: true,
        description: `Congratulations! You got ${correctCount} out of 5 questions correct and earned ${totalXpEarned} XP.`,
      });

      router.refresh();
    }
  }, [progress, QuestionState]);

  const handleNext = () => {
    setSelectedOption(-1);
    setCorrectAnswer("");
    setPaused(false);
    setTextualEvidence("");

    const answeredCount = progress.filter(
      (p) => p !== AnswerStatus.UNANSWERED
    ).length;
    if (answeredCount < resp.total) {
      setLoadingAnswer(true);

      const timestamp = new Date().getTime();
      fetch(`/api/v1/articles/${articleId}/questions/mcq?_t=${timestamp}`)
        .then((res) => res.json())
        .then((data) => {
          try {
            const savedProgress = sessionStorage.getItem(
              `quiz_progress_${articleId}`
            );
            if (savedProgress) {
              const parsedProgress = JSON.parse(savedProgress);
              setProgress(parsedProgress);
            } else {
              setProgress(data.progress || []);
            }
          } catch (e) {
            console.error("Error handling progress for next question:", e);
            setProgress(data.progress || []);
          }

          try {
            sessionStorage.setItem(`quiz_started_${articleId}`, "true");
          } catch (e) {
            console.error("Failed to save to sessionStorage:", e);
          }

          useQuestionStore.setState({ mcQuestion: data });

          handleCompleted();
        })
        .catch((error) => {
          console.error("Error fetching next question:", error);
        })
        .finally(() => {
          setLoadingAnswer(false);
        });
    } else {
      handleCompleted();
    }
  };

  return (
    <CardContent>
      <div className="flex gap-2 items-end mt-6">
        <Badge className="flex-1" variant="destructive">
          {t("elapsedTime", {
            time: timer,
          })}
        </Badge>
        {(progress || []).map((status, idx) => {
          if (status === AnswerStatus.CORRECT) {
            return (
              <Icons.correctChecked
                key={idx}
                className="text-green-500"
                size={22}
              />
            );
          } else if (status === AnswerStatus.INCORRECT) {
            return (
              <Icons.incorrectChecked
                key={idx}
                className="text-red-500"
                size={22}
              />
            );
          }
          return (
            <Icons.unChecked key={idx} className="text-gray-500" size={22} />
          );
        })}
      </div>
      <CardTitle className="font-bold text-3xl md:text-3xl mt-3">
        {t("questionHeading", {
          number: currentQuestionIndex + 1,
          total: resp.total,
        })}
      </CardTitle>
      <CardDescription className="text-2xl md:text-2xl mt-3">
        {resp.results[0]?.question || "Question not available"}
        <span className="hidden">Question ID: {resp.results[0]?.id}</span>
      </CardDescription>

      {textualEvidence && (
        <div className="mt-4 p-4 font-semibold bg-gray-100 text-gray-700 rounded">
          <p>
            <span className="font-bold text-lg text-gray-800">Feedback: </span>
            {`"${textualEvidence}"`}
          </p>
        </div>
      )}

      {(resp.results[0]?.options || [])
        .filter(
          (option) =>
            option && typeof option === "string" && option.trim() !== ""
        )
        .map((option, i) => {
          const optionText = option || "";
          return (
            <Button
              key={`${resp.results[0]?.id}-${i}`}
              className={cn(
                "mt-2 h-auto w-full",
                selectedOption === i && "bg-red-500 hover:bg-red-600",
                correctAnswer === optionText &&
                  "bg-green-500 hover:bg-green-600"
              )}
              disabled={isLoadingAnswer || selectedOption !== -1}
              onClick={() => {
                if (selectedOption === -1) {
                  onSubmitted(resp.results[0].id, optionText, i);
                }
              }}
            >
              <p className="w-full text-left">
                {i + 1}. {optionText}
              </p>
            </Button>
          );
        })}

      {selectedOption >= 0 && (
        <>
          {page === "article" && (
            <Button
              variant={"outline"}
              size={"sm"}
              className="mt-2"
              onClick={handleNext}
              disabled={isLoadingAnswer}
            >
              {isLoadingAnswer ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : progress.filter((p) => p !== AnswerStatus.UNANSWERED).length <
                resp.total ? (
                <>{t("nextQuestionButton")}</>
              ) : (
                <>{t("submitButton")}</>
              )}
            </Button>
          )}
          {page === "lesson" && (
            <div className="flex items-center justify-end">
              <Button
                variant={"outline"}
                size={"sm"}
                className="mt-4 w-full lg:w-1/4"
                onClick={handleNext}
                disabled={isLoadingAnswer}
              >
                {isLoadingAnswer ? (
                  <div className="flex items-center">
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </div>
                ) : progress.filter((p) => p !== AnswerStatus.UNANSWERED)
                    .length < resp.total ? (
                  <>{t("nextQuestionButton")}</>
                ) : (
                  <>{t("submitButton")}</>
                )}
              </Button>
            </div>
          )}
        </>
      )}

      {textualEvidence && !page && (
        <Button
          variant={"outline"}
          size={"sm"}
          className="mt-2"
          onClick={handleNext}
          disabled={isLoadingAnswer}
        >
          {isLoadingAnswer ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : progress.filter((p) => p !== AnswerStatus.UNANSWERED).length <
            resp.total ? (
            <>{t("nextQuestionButton")}</>
          ) : (
            <>{t("submitButton")}</>
          )}
        </Button>
      )}
    </CardContent>
  );
}
