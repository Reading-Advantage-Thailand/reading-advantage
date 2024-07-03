"use client";
import React, { useState, useContext, useEffect } from "react";
import { Button } from "@/components/ui/button";
import TextareaAutosize from "react-textarea-autosize";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { QuizContext, QuizContextProvider } from "@/contexts/quiz-context";
import { useScopedI18n } from "@/locales/client";
import { LongAnswerQuestion } from "../models/questions-model";
import QuestionHeader from "./question-header";
import { Skeleton } from "../ui/skeleton";
import * as z from "zod";
import { toast } from "../ui/use-toast";
import { Icons } from "../icons";

interface Props {
  userId: string;
  articleId: string;
}

type QuestionResponse = {
  result: LongAnswerQuestion;
  state: QuestionState;
};

type AnswerResponse = {
  state: QuestionState;
  answer: string;
  suggested_answer: string;
};

enum QuestionState {
  LOADING = 0,
  INCOMPLETE = 1,
  COMPLETED = 2,
  ERROR = 3,
}

export default function LAQuestionCard({ userId, articleId }: Props) {
  const [state, setState] = useState(QuestionState.LOADING);
  const [data, setData] = useState<QuestionResponse>({
    result: {
      id: "",
      question: "",
    },
    state: QuestionState.LOADING,
  });

  useEffect(() => {
    fetch(`/api/v1/articles/${articleId}/questions/laq`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setState(data.state);
      })
      .catch((error) => {
        setState(QuestionState.ERROR);
      });
  }, [state, articleId]);

  const handleCompleted = () => {
    setState(QuestionState.LOADING);
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
      return <QuestionCardComplete resp={data} />;
    default:
      return <QuestionCardError data={data} />;
  }
}

function QuestionCardError(data: any) {
  return (
    <Card className="mt-3">
      <CardHeader>
        <CardTitle className="font-bold text-3xl md:text-3xl text-muted-foreground">
          Long Answer Question
        </CardTitle>
        <CardDescription className="text-red-500 dark:text-red-400">
          There was an error getting the question. {data.error}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function QuestionCardComplete({ resp }: { resp: QuestionResponse }) {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="font-bold text-3xl md:text-3xl text-muted-foreground">
          Long Answer Question
        </CardTitle>
        <CardDescription>
          You already completed the short answer question.
          <p className="font-bold text-lg mt-4">Question</p>
          <p>{resp.result.question}</p>
          <p className="font-bold text-lg mt-4">Suggested Answer</p>
          <p></p>
          <p className="font-bold text-lg mt-4">Your Answer</p>
          <p className="text-green-500 dark:text-green-400 inline font-bold mt-2"></p>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function QuestionCardLoading() {
  return (
    <Card className="mt-3">
      <CardHeader>
        <CardTitle className="font-bold text-3xl md:text-3xl text-muted-foreground">
          Long Answer Question
        </CardTitle>
        <CardDescription>Getting the short answer question...</CardDescription>
        <Skeleton className={"h-10 w-full mt-2"} />
        <Skeleton className={"h-40 w-full mt-2"} />
        <Skeleton className={"h-8 w-full mt-2"} />
        <Skeleton className={"h-20 w-full mt-2"} />
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
    <Card className="mt-3">
      <QuestionHeader
        heading="Long Answer Question"
        description="The long answer question is unlocked after you complete the quiz."
        buttonLabel="Practice Writing"
        disabled={false}
      >
        <QuizContextProvider>
          <LAQuestion
            resp={resp}
            articleId={articleId}
            handleCompleted={handleCompleted}
          />
        </QuizContextProvider>
      </QuestionHeader>
    </Card>
  );
}

function LAQuestion({
  resp,
  articleId,
  handleCompleted,
}: {
  resp: QuestionResponse;
  articleId: string;
  handleCompleted: () => void;
}) {
  const t = useScopedI18n("components.laq");
  const { timer, setPaused } = useContext(QuizContext);
  const [isCompleted, setIsCompleted] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [data, setData] = useState<AnswerResponse>({
    state: QuestionState.LOADING,
    answer: "",
    suggested_answer: "",
  });
  const [studentResponse, setStudentResponse] = useState("");
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleCancel = () => {};

  const handleGetFeedback = () => {
    setIsFeedbackModalOpen(true);
  };

  const handleSubmit = () => {
    setIsSubmissionModalOpen(true);
  };

  return (
    <CardContent>
      <div className="flex gap-2 items-end mt-6">
        <Badge className="flex-1" variant="destructive">
          {t("elapsedTime", {
            time: timer,
          })}
        </Badge>
      </div>
      <CardTitle className="flex font-bold text-3xl md:text-3xl mt-3">
        Long Answer Question
      </CardTitle>
      <CardDescription className="text-lg md:text-lg mt-3">
        {resp.result.question}
      </CardDescription>
      <TextareaAutosize
        autoFocus
        disabled={isCompleted}
        id="long-answer"
        minRows={5}
        maxRows={5}
        placeholder="Type your answer here..."
        className="w-full my-3 p-3 rounded-sm resize-none appearance-none overflow-hidden bg-gray-100 dark:bg-gray-900 focus:outline-none"
      />
      <div className="space-x-2">
        <Button variant="outline" onClick={handleCancel}>
          {t("cancleButton")}
        </Button>
        <Button onClick={handleGetFeedback}>{t("feedbackButton")}</Button>
        <Button onClick={handleSubmit}>{t("submitButton")}</Button>
      </div>
      <Dialog open={isFeedbackModalOpen} onOpenChange={setIsFeedbackModalOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Writing Feedback</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-4">
            <p>This is where the feedback content will go.</p>
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button>Revise Your Response</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={isSubmissionModalOpen}
        onOpenChange={setIsSubmissionModalOpen}
      >
        <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Final Feedback</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-4">
            <p>
              Great job! Here`s your final feedback on your writing submission.
            </p>
            {/* Add more detailed feedback here */}
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button>Get your XP!</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardContent>
  );
}
