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
import { cn } from "@/lib/utils";
import {
  AnswerStatus,
  MultipleChoiceQuestion,
  QuestionState,
} from "../models/questions-model";
import { Icons } from "../icons";
import {useQuestionStore} from '@/store/question-store'

type Props = {
  userId: string;
  articleId: string;
};

export type QuestionResponse = {
  results: MultipleChoiceQuestion[];
  progress: AnswerStatus[];
  total: number;
  state: QuestionState;
};

export default function MCQuestionCard({ userId, articleId }: Props) {
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
        useQuestionStore.setState({mcQuestion: data});
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

  switch (state) {
    case QuestionState.LOADING:
      return <QuestionCardLoading />;
    case QuestionState.INCOMPLETE:
      return (
        <QuestionCardIncomplete
          resp={data}
          articleId={articleId}
          handleCompleted={handleCompleted}
        />
      );
    case QuestionState.COMPLETED:
      return <QuestionCardComplete resp={data} onRetake={onRetake} />;
    default:
      return <QuestionCardLoading />;
  }
}

function QuestionCardComplete({
  resp,
  onRetake,
}: {
  resp: QuestionResponse;
  onRetake: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bold text-3xl md:text-3xl text-muted-foreground">
          Multiple Choice Questions
        </CardTitle>
        <CardDescription>
          You already completed the quiz.
          <p className="text-green-500 dark:text-green-400 inline font-bold">
            {" "}
            Your score is{" "}
            {
              resp.progress.filter((status) => status === AnswerStatus.CORRECT)
                .length
            }{" "}
            out of {resp.total}.
          </p>
        </CardDescription>
        <Button size={"sm"} variant={"outline"} onClick={onRetake}>
          Retake Quiz
        </Button>
      </CardHeader>
    </Card>
  );
}

function QuestionCardLoading() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bold text-3xl md:text-3xl text-muted-foreground">
          Multiple Choice Questions
        </CardTitle>
        <CardDescription>
          Getting questions for this article. Please wait a moment.
        </CardDescription>
        <Skeleton className="h-8 w-full mt-2" />
      </CardHeader>
    </Card>
  );
}

function QuestionCardIncomplete({
  resp,
  articleId,
  handleCompleted,
}: {
  resp: QuestionResponse;
  articleId: string;
  handleCompleted: () => void;
}) {
  return (
    <Card>
      <QuestionHeader
        heading="Multiple Choice Questions"
        description="Take the quiz to check your understanding"
        buttonLabel="Start Quiz"
        disabled={false}
      >
        <QuizContextProvider>
          <MCQeustion
            articleId={articleId}
            resp={resp}
            handleCompleted={handleCompleted}
          />
        </QuizContextProvider>
      </QuestionHeader>
    </Card>
  );
}

function MCQeustion({
  articleId,
  resp,
  handleCompleted,
}: {
  articleId: string;
  resp: QuestionResponse;
  handleCompleted: () => void;
}) {
  const [progress, setProgress] = useState(resp.progress);
  const [isLoadingAnswer, setLoadingAnswer] = useState(false);
  const [index, setIndex] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState(-1);
  const { timer, setPaused } = useContext(QuizContext);
  const t = useScopedI18n("components.mcq");

  const onSubmitted = (questionId: string, option: string, i: number) => {
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
        console.log(data);
        setCorrectAnswer(data.correct_answer);
        setSelectedOption(i);
        setProgress(data.progress);
      })
      .finally(() => {
        setLoadingAnswer(false);
      });
  };

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
      {resp.results[index]?.options.map((option, i) => (
        <Button
          key={i}
          className={cn(
            "mt-2 h-auto w-full",
            selectedOption === i && "bg-red-500 hover:bg-red-600",
            correctAnswer === option && "bg-green-500 hover:bg-green-600"
          )}
          disabled={isLoadingAnswer}
          onClick={() => onSubmitted(resp.results[index].id, option, i)}
        >
          <p className="w-full text-left">
            {i + 1}. {option}
          </p>
        </Button>
      ))}
      {
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
            } else {
              handleCompleted();
            }
          }}
        >
          {isLoadingAnswer && (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          )}
          {5 - resp.results.length + 1 + index < resp.total
            ? "Next Question"
            : "Submit Quiz"        
          }
        </Button>
      }
    </CardContent>
  );
}
