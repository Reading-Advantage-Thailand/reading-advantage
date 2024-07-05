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
import { useForm } from "react-hook-form";
import { QuizContext, QuizContextProvider } from "@/contexts/quiz-context";
import { useScopedI18n } from "@/locales/client";
import { LongAnswerQuestion } from "../models/questions-model";
import QuestionHeader from "./question-header";
import { Skeleton } from "../ui/skeleton";
import * as z from "zod";
import { toast } from "../ui/use-toast";
import { Icons } from "../icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCurrentLocale } from "@/locales/client";
import { Locale, localeNames } from "@/configs/locale-config";
import local from "next/font/local";

interface Props {
  userId: string;
  articleId: string;
}

interface FeedbackDetails {
  areasForImprovement: string;
  examples: string;
  strengths: string;
  suggestions: string;
}

interface DetailedFeedback {
  [key: string]: FeedbackDetails;
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

type FeedbackResponse = {
  state: QuestionState;
  result: {
    detailedFeedback: DetailedFeedback;
    exampleRevisions: [];
    nextSteps: [];
    overallImpression: string;
    score: {
      clarityAndCoherence: number;
      complexityAndStructure: number;
      contentAndDevelopment: number;
      grammarAccuracy: number;
      vocabularyUse: number;
    };
  };
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

  const handleCancel = () => {
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
          handleCancel={handleCancel}
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
          You already completed the long answer question.
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
        <CardDescription>Getting the long answer question...</CardDescription>
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
  handleCancel,
}: {
  resp: QuestionResponse;
  articleId: string;
  handleCompleted: () => void;
  handleCancel: () => void;
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
            handleCancel={handleCancel}
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
  handleCancel,
}: {
  resp: QuestionResponse;
  articleId: string;
  handleCompleted: () => void;
  handleCancel: () => void;
}) {
  const longAnswerSchema = z.object({
    answer: z
      .string()
      .min(1, {
        message: "Answer is required",
      })
      .max(1000, {
        message: "Answer must be less than 1000 characters",
      }),
  });
  type FormData = z.infer<typeof longAnswerSchema>;

  const t = useScopedI18n("components.laq");
  const { timer, setPaused } = useContext(QuizContext);
  const [isCompleted, setIsCompleted] = React.useState<boolean>(false);
  const [isLoadingFeedback, setIsLoadingFeedback] =
    React.useState<boolean>(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = React.useState<boolean>(false);
  const [data, setData] = useState<AnswerResponse>({
    state: QuestionState.LOADING,
    answer: "",
    suggested_answer: "",
  });
  const [studentResponse, setStudentResponse] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [feedbackData, setFeedbackData] = useState<FeedbackResponse>({
    state: QuestionState.INCOMPLETE,
    result: {
      detailedFeedback: {},
      exampleRevisions: [],
      nextSteps: [],
      overallImpression: "",
      score: {
        clarityAndCoherence: 0,
        complexityAndStructure: 0,
        contentAndDevelopment: 0,
        grammarAccuracy: 0,
        vocabularyUse: 0,
      },
    },
  });
  const [selectedCategory, setSelectedCategory] = useState("");

  const currentLocale = useCurrentLocale();

  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(longAnswerSchema),
  });

  const handleGetFeedback = (studentResponse: string) => {
    setIsLoadingFeedback(true);
    fetch(
      `/api/v1/articles/${articleId}/questions/laq/${resp.result.id}/feedback`,
      {
        method: "POST",
        body: JSON.stringify({
          answer: studentResponse,
          preferredLanguage: localeNames[currentLocale],
        }),
      }
    )
      .then((res) => res.json())
      .then((data) => setFeedbackData(data))
      .finally(() => setIsLoadingFeedback(false));
  };

  async function onSubmitted(data: FormData) {
    setIsLoadingSubmit(true);
    setPaused(true);
    // fetch(`/api/v1/articles/${articleId}/questions/la/${resp.result.id}`, {
    //   method: "POST",
    //   body: JSON.stringify({
    //     answer: data.answer,
    //     timeRecorded: timer,
    //   }),
    // })
    //   .then((res) => res.json())
    //   .then((data) => {
    //     console.log(data);
    //     setData(data);
    //   })
    //   .finally(() => {
    //     setIsLoading(false);
    //   });
    setIsLoadingSubmit(false);
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(selectedCategory === category ? "" : category);
  };

  const Category = feedbackData.result.detailedFeedback[selectedCategory];

  const buttonToggle = (category: string) => ({
    variant: selectedCategory === category ? "default" : "outline",
  });

  console.log("feedbackData => ", feedbackData);

  return (
    <CardContent>
      <form onSubmit={handleSubmit(onSubmitted)}>
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
          {...register("answer")}
          onChange={(e) => setStudentResponse(e.target.value)}
        />
        <div className="space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            {t("cancelButton")}
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                type="button"
                disabled={isLoadingFeedback || isLoadingSubmit}
                onClick={() => handleGetFeedback(studentResponse)}
              >
                {isLoadingFeedback && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("feedbackButton")}
              </Button>
            </DialogTrigger>
            {!isLoadingFeedback && (
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="text-left">
                  <DialogTitle className="font-bold text-2xl">
                    Writing Feedback
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    className="rounded-full"
                    size="sm"
                    onClick={() => handleCategoryChange("vocabularyUse")}
                    {...buttonToggle("vocabularyUse")}
                  >
                    Vocabulary Use
                  </Button>
                  <Button
                    className="rounded-full"
                    size="sm"
                    onClick={() => handleCategoryChange("grammarAccuracy")}
                    {...buttonToggle("grammarAccuracy")}
                  >
                    Grammar Accuracy
                  </Button>
                  <Button
                    className="rounded-full"
                    size="sm"
                    onClick={() => handleCategoryChange("clarityAndCoherence")}
                    {...buttonToggle("clarityAndCoherence")}
                  >
                    Clarity and Coherence
                  </Button>
                  <Button
                    className="rounded-full"
                    size="sm"
                    onClick={() =>
                      handleCategoryChange("complexityAndStructure")
                    }
                    {...buttonToggle("complexityAndStructure")}
                  >
                    Complexity and Structure
                  </Button>
                  <Button
                    className="rounded-full"
                    size="sm"
                    onClick={() =>
                      handleCategoryChange("contentAndDevelopment")
                    }
                    {...buttonToggle("contentAndDevelopment")}
                  >
                    Content and Development
                  </Button>
                </div>
                {selectedCategory && (
                  <DialogDescription className="flex flex-col gap-2">
                    <div>
                      <p className="text-lg">Area for impovement</p>
                      <p>{Category.areasForImprovement}</p>
                    </div>
                    <div>
                      <p className="text-lg">Examples</p>
                      <p>{Category.examples}</p>
                    </div>
                    <div>
                      <p className="text-lg">Strength</p>
                      <p>{Category.strengths}</p>
                    </div>
                    <div>
                      <p className="text-lg">Suggestions</p>
                      <p>{Category.suggestions}</p>
                    </div>
                  </DialogDescription>
                )}
                {!selectedCategory && (
                  <div className="flex-grow overflow-y-auto pr-4">
                    <p className="text-bold text-xl">Feedback Overall</p>
                    <p>{feedbackData.result.overallImpression}</p>
                    <p className="text-bold text-xl">Example Revisions</p>
                    <p>{feedbackData.result.exampleRevisions[0]}</p>
                  </div>
                )}

                <DialogFooter className="flex-shrink-0">
                  <Button>Revise Your Response</Button>
                </DialogFooter>
              </DialogContent>
            )}
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                type="submit"
                disabled={isLoadingSubmit || isLoadingFeedback}
              >
                {isLoadingSubmit && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t("submitButton")}
              </Button>
            </DialogTrigger>
            {!isLoadingSubmit && (
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>Final Feedback</DialogTitle>
                </DialogHeader>
                <div className="flex-grow overflow-y-auto pr-4">
                  <p>
                    Great job! Here`s your final feedback on your writing
                    submission.
                  </p>
                </div>
                <DialogFooter className="flex-shrink-0">
                  <Button>Get your XP!</Button>
                </DialogFooter>
              </DialogContent>
            )}
          </Dialog>
        </div>
      </form>
    </CardContent>
  );
}
