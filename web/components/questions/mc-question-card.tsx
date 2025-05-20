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
  onCompleteChange: (complete: boolean) => void;
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

  useEffect(() => {
    fetch(`/api/v1/articles/${articleId}/questions/mcq`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setState(data.state);
        useQuestionStore.setState({ mcQuestion: data });
      });
  }, [state, articleId]);

  const handleCompleted = () => {
    setState(QuestionState.LOADING);
  };

  const onRetake = () => {
    setState(QuestionState.LOADING);
    fetch(`/api/v1/articles/${articleId}/questions/mcq`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        setState(data.state);
        setData({
          progress: [2, 2, 2, 2, 2],
          results: [],
          total: 0,
          state: data.state,
        });
      });
  };

  useEffect(() => {
    if (state === QuestionState.COMPLETED) {
      onCompleteChange(true);
    }
  }, [state, onCompleteChange]);

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
                  score: resp.progress.filter(
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
                score: resp.progress.filter(
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
}: {
  userId: string;
  resp: QuestionResponse;
  articleId: string;
  handleCompleted: () => void;
  articleTitle: string;
  articleLevel: number;
  page?: "lesson" | "article";
}) {
  const t = useScopedI18n("components.mcq");
  return (
    <>
      {page === "article" && (
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
              />
            </QuizContextProvider>
          </QuestionHeader>
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
  const [progress, setProgress] = useState(resp.progress);
  const [isLoadingAnswer, setLoadingAnswer] = useState(false);
  const [index, setIndex] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState(-1);
  const { timer, setPaused } = useContext(QuizContext);
  const t = useScopedI18n("components.mcq");
  const router = useRouter();
  const [textualEvidence, setTextualEvidence] = useState("");

  const onSubmitted = async (questionId: string, option: string, i: number) => {
    setPaused(true);
    setLoadingAnswer(true);
    fetch(`/api/v1/articles/${articleId}/questions/mcq/${questionId}`, {
      method: "POST",
      body: JSON.stringify({
        answer: option,
        timeRecorded: timer,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setCorrectAnswer(data.correct_answer);
        setSelectedOption(i);
        setProgress(data.progress);
        setTextualEvidence(resp.results[index].textual_evidence);
      })
      .finally(() => {
        setLoadingAnswer(false);
      });
  };

  useEffect(() => {
    if (page === "lesson") {
      setPaused(false);
    }
    let count = 0;
    let countTest = 0;
    progress.forEach(async (status) => {
      if (status == AnswerStatus.CORRECT) {
        count += UserXpEarned.MC_Question;
        countTest++;
      } else if (status == AnswerStatus.INCORRECT) {
        countTest++;
      }
      if (countTest == 5) {
        await fetch(`/api/v1/users/${userId}/activitylog`, {
          method: "POST",
          body: JSON.stringify({
            articleId: articleId,
            activityType: ActivityType.MC_Question,
            activityStatus: ActivityStatus.Completed,
            timeTaken: timer,
            xpEarned: count,
            details: {
              ceft_level: levelCalculation(count).cefrLevel,
              correctAnswer,
              progress,
              title: articleTitle,
              level: articleLevel,
            },
          }),
        });
        toast({
          title: "Success",
          imgSrc: true,
          description: `Congratulations!, You received ${count} XP for completing this activity.`,
        });
        router.refresh();
      }
    });
  }, [progress, QuestionState]);

  return (
    <CardContent>
      <div className="flex gap-2 items-end mt-6">
        <Badge className="flex-1" variant="destructive">
          {t("elapsedTime", {
            time: timer,
          })}
        </Badge>
        {progress.map((status, index) => {
          if (status === AnswerStatus.CORRECT) {
            return (
              <Icons.correctChecked
                key={index}
                className="text-green-500"
                size={22}
              />
            );
          } else if (status === AnswerStatus.INCORRECT) {
            return (
              <Icons.incorrectChecked
                key={index}
                className="text-red-500"
                size={22}
              />
            );
          }
          return (
            <Icons.unChecked key={index} className="text-gray-500" size={22} />
          );
        })}
      </div>
      <CardTitle className="font-bold text-3xl md:text-3xl mt-3">
        {t("questionHeading", {
          number: 5 - resp.results.length + 1 + index,
          total: resp.total,
        })}
      </CardTitle>
      <CardDescription className="text-2xl md:text-2xl mt-3">
        {resp.results[index]?.question}
      </CardDescription>

      {textualEvidence && (
        <div className="mt-4 p-4 font-semibold bg-gray-100 text-gray-700 rounded">
          <p>
            <span className="font-bold text-lg text-gray-800">Feedback: </span>
            {`"${textualEvidence}"`}
          </p>
        </div>
      )}

      {resp.results[index]?.options.map((option, i) => (
        <Button
          key={i}
          className={cn(
            "mt-2 h-auto w-full",
            selectedOption === i && "bg-red-500 hover:bg-red-600",
            correctAnswer === option && "bg-green-500 hover:bg-green-600"
          )}
          disabled={isLoadingAnswer}
          onClick={() => {
            if (selectedOption === -1) {
              onSubmitted(resp.results[index].id, option, i);
            }
          }}
        >
          <p className="w-full text-left">
            {i + 1}. {option}
          </p>
        </Button>
      ))}
      {page === "article" && (
        <Button
          variant={"outline"}
          size={"sm"}
          className="mt-2"
          disabled={isLoadingAnswer || selectedOption === -1}
          onClick={() => {
            if (5 - resp.results.length + 1 + index < resp.total) {
              setIndex((prevIndex) => prevIndex + 1);
              setSelectedOption(-1);
              setCorrectAnswer("");
              setPaused(false);
              setTextualEvidence("");
            } else {
              handleCompleted();
            }
          }}
        >
          {isLoadingAnswer && (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          )}
          {5 - resp.results.length + 1 + index < resp.total ? (
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
            disabled={isLoadingAnswer || selectedOption === -1}
            onClick={() => {
              if (5 - resp.results.length + 1 + index < resp.total) {
                setIndex((prevIndex) => prevIndex + 1);
                setSelectedOption(-1);
                setCorrectAnswer("");
                setPaused(false);
                setTextualEvidence("");
              } else {
                handleCompleted();
              }
            }}
          >
            {isLoadingAnswer && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {5 - resp.results.length + 1 + index < resp.total ? (
              <>{t("nextQuestionButton")}</>
            ) : (
              <>{t("submitButton")}</>
            )}
          </Button>
        </div>
      )}
    </CardContent>
  );
}
