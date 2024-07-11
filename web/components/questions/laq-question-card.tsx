"use client";
import React, { useState, useContext, useEffect } from "react";
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
import { Icons } from "../icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCurrentLocale } from "@/locales/client";
import { localeNames } from "@/configs/locale-config";
import { DialogClose } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";

interface Props {
  userId: string;
  userLevel: number;
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

interface ScoreCategoty {
  [key: string]: number;
}

type QuestionResponse = {
  result: LongAnswerQuestion;
  state: QuestionState;
};

type AnswerResponse = {
  state: QuestionState;
  answer: string;
  feedback: {
    detailedFeedback: DetailedFeedback;
    exampleRevisions: string;
    nextSteps: [];
    overallImpression: string;
    scores: ScoreCategoty;
  };
};

type FeedbackResponse = {
  state: QuestionState;
  result: {
    detailedFeedback: DetailedFeedback;
    exampleRevisions: string;
    nextSteps: [];
    overallImpression: string;
    scores: ScoreCategoty;
  };
};

enum QuestionState {
  LOADING = 0,
  INCOMPLETE = 1,
  COMPLETED = 2,
  ERROR = 3,
}

export default function LAQuestionCard({
  userId,
  userLevel,
  articleId,
}: Props) {
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
          userLevel={userLevel}
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
          <p>You already completed the long answer question.</p>
          <Button className="mt-4" disabled={true}>
            Practice Completed
          </Button>
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
  userLevel,
  articleId,
  handleCompleted,
  handleCancel,
}: {
  resp: QuestionResponse;
  userLevel: number;
  articleId: string;
  handleCompleted: () => void;
  handleCancel: () => void;
}) {
  return (
    <Card className="mt-3">
      <QuestionHeader
        heading="Long Answer Question"
        description="Write an essay."
        buttonLabel="Practice Writing"
        disabled={false}
      >
        <QuizContextProvider>
          <LAQuestion
            resp={resp}
            userLevel={userLevel}
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
  userLevel,
  articleId,
  handleCompleted,
  handleCancel,
}: {
  resp: QuestionResponse;
  userLevel: number;
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
  const tf = useScopedI18n("components.rate");
  const { timer, setPaused } = useContext(QuizContext);
  const [isCompleted, setIsCompleted] = React.useState<boolean>(false);
  const [isLoadingFeedback, setIsLoadingFeedback] =
    React.useState<boolean>(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = React.useState<boolean>(false);
  const [rating, setRating] = React.useState<number>(3);
  const [data, setData] = useState<AnswerResponse>({
    state: QuestionState.LOADING,
    answer: "",
    feedback: {
      detailedFeedback: {},
      exampleRevisions: "",
      nextSteps: [],
      overallImpression: "",
      scores: {},
    },
  });
  const [studentResponse, setStudentResponse] = useState("");
  const [errorText, setErrorText] = useState("");
  const [feedbackData, setFeedbackData] = useState<FeedbackResponse>({
    state: QuestionState.INCOMPLETE,
    result: {
      detailedFeedback: {},
      exampleRevisions: "",
      nextSteps: [],
      overallImpression: "",
      scores: {},
    },
  });
  const [selectedCategory, setSelectedCategory] = useState("");

  const currentLocale = useCurrentLocale();

  const minimumCharacter = 30 * (userLevel + 1);

  const { register, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(longAnswerSchema),
  });

  const handleGetFeedback = (studentResponse: string) => {
    if (studentResponse === "") {
      setErrorText("Please Enter Text...");
    } else if (studentResponse.length < minimumCharacter) {
      setErrorText(`Please Enter minimum ${minimumCharacter} character...`);
    } else {
      setIsLoadingFeedback(true);
      setErrorText("");
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
    }
  };

  async function onSubmitted(data: FormData) {
    if (data.answer.length === 0) {
      setErrorText("Please Enter Text...");
    } else if (data.answer.length < minimumCharacter) {
      setErrorText(`Please Enter minimum ${minimumCharacter} character...`);
    } else {
      setIsLoadingSubmit(true);
      setPaused(true);

      try {
        const feedbackResponse = await fetch(
          `/api/v1/articles/${articleId}/questions/laq/${resp.result.id}/feedback`,
          {
            method: "POST",
            body: JSON.stringify({
              answer: data.answer,
              preferredLanguage: localeNames[currentLocale],
            }),
          }
        );

        const feedback = await feedbackResponse.json();
        setFeedbackData(feedback);
        const submitAnswer = await fetch(
          `/api/v1/articles/${articleId}/questions/laq/${resp.result.id}`,
          {
            method: "POST",
            body: JSON.stringify({
              answer: data.answer,
              feedback: feedback.result, // use feedback instead of feedbackData
              timeRecorded: timer,
            }),
          }
        );

        const finalFeedback = await submitAnswer.json();
        setData(finalFeedback);
        setRating(finalFeedback.sumScores);
      } catch (error) {
        console.error("Error submitting feedback:", error);
      } finally {
        setIsLoadingSubmit(false);
      }
    }
  }

  async function onGetExp() {
    setIsLoadingSubmit(true);
    fetch(
      `/api/v1/articles/${articleId}/questions/laq/${resp.result.id}/getxp`,
      {
        method: "POST",
        body: JSON.stringify({
          rating,
        }),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          toast({
            title: tf("toast.success"),
            imgSrc: "/xpBox.webp",
            description: `Congratulations, you earned ${rating} XP.`,
          });
        }
        handleCompleted();
      })
      .finally(() => {
        setIsLoadingSubmit(false);
      });
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(selectedCategory === category ? "" : category);
  };

  const Category = feedbackData.result.detailedFeedback[selectedCategory];

  const finalCategory = data.feedback.detailedFeedback[selectedCategory];

  const scoreOfCategoty = feedbackData.result.scores[selectedCategory];

  const finalScoreOfCategoty = data.feedback.scores[selectedCategory];

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
          placeholder="Type your answer here..."
          className="w-full mt-3 p-3 rounded-sm resize-none appearance-none overflow-hidden bg-gray-100 dark:bg-gray-900 focus:outline-none"
          {...register("answer")}
          onChange={(e) => setStudentResponse(e.target.value)}
        />
        {errorText ||
          (!studentResponse && <p className="text-red-500">{errorText}</p>)}
        <div className="space-x-2 mt-3">
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
            {!isLoadingFeedback && !errorText && (
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
                    variant={
                      selectedCategory === "vocabularyUse"
                        ? "default"
                        : "outline"
                    }
                  >
                    Vocabulary Use
                  </Button>
                  <Button
                    className="rounded-full"
                    size="sm"
                    onClick={() => handleCategoryChange("grammarAccuracy")}
                    variant={
                      selectedCategory === "grammarAccuracy"
                        ? "default"
                        : "outline"
                    }
                  >
                    Grammar Accuracy
                  </Button>
                  <Button
                    className="rounded-full"
                    size="sm"
                    onClick={() => handleCategoryChange("clarityAndCoherence")}
                    variant={
                      selectedCategory === "clarityAndCoherence"
                        ? "default"
                        : "outline"
                    }
                  >
                    Clarity and Coherence
                  </Button>
                  <Button
                    className="rounded-full"
                    size="sm"
                    onClick={() =>
                      handleCategoryChange("complexityAndStructure")
                    }
                    variant={
                      selectedCategory === "complexityAndStructure"
                        ? "default"
                        : "outline"
                    }
                  >
                    Complexity and Structure
                  </Button>
                  <Button
                    className="rounded-full"
                    size="sm"
                    onClick={() =>
                      handleCategoryChange("contentAndDevelopment")
                    }
                    variant={
                      selectedCategory === "contentAndDevelopment"
                        ? "default"
                        : "outline"
                    }
                  >
                    Content and Development
                  </Button>
                </div>
                {selectedCategory && (
                  <>
                    <DialogDescription className="flex flex-col gap-2">
                      <div>
                        <p className="text-lg ">Area for impovement</p>
                        <p>{Category?.areasForImprovement}</p>
                      </div>
                      <div>
                        <p className="text-lg ">Examples</p>
                        <p>{Category?.examples}</p>
                      </div>
                      <div>
                        <p className="text-lg ">Strength</p>
                        <p>{Category?.strengths}</p>
                      </div>
                      <div>
                        <p className="text-lg ">Suggestions</p>
                        <p>{Category?.suggestions}</p>
                      </div>
                    </DialogDescription>
                    <div>
                      <p className="text-green-500 dark:text-green-400 inline font-bold">
                        Score is {scoreOfCategoty}
                      </p>
                    </div>
                  </>
                )}
                {!selectedCategory && (
                  <div className="flex flex-col flex-grow overflow-y-auto pr-4 gap-2">
                    <p className="text-bold text-xl">Feedback Overall</p>
                    <p className="text-sm ">
                      {feedbackData.result.overallImpression}
                    </p>
                    <p className="text-bold text-xl">Example Revisions</p>
                    <p className="text-sm ">
                      {feedbackData.result.exampleRevisions}
                    </p>
                  </div>
                )}

                <DialogFooter className="flex-shrink-0">
                  <DialogClose>
                    <Button onClick={() => setSelectedCategory("")}>
                      Revise Your Response
                    </Button>
                  </DialogClose>
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
            {!isLoadingSubmit && !errorText && (
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle>Final Feedback</DialogTitle>
                </DialogHeader>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    className="rounded-full"
                    size="sm"
                    onClick={() => handleCategoryChange("vocabularyUse")}
                    variant={
                      selectedCategory === "vocabularyUse"
                        ? "default"
                        : "outline"
                    }
                  >
                    Vocabulary Use
                  </Button>
                  <Button
                    className="rounded-full"
                    size="sm"
                    onClick={() => handleCategoryChange("grammarAccuracy")}
                    variant={
                      selectedCategory === "grammarAccuracy"
                        ? "default"
                        : "outline"
                    }
                  >
                    Grammar Accuracy
                  </Button>
                  <Button
                    className="rounded-full"
                    size="sm"
                    onClick={() => handleCategoryChange("clarityAndCoherence")}
                    variant={
                      selectedCategory === "clarityAndCoherence"
                        ? "default"
                        : "outline"
                    }
                  >
                    Clarity and Coherence
                  </Button>
                  <Button
                    className="rounded-full"
                    size="sm"
                    onClick={() =>
                      handleCategoryChange("complexityAndStructure")
                    }
                    variant={
                      selectedCategory === "complexityAndStructure"
                        ? "default"
                        : "outline"
                    }
                  >
                    Complexity and Structure
                  </Button>
                  <Button
                    className="rounded-full"
                    size="sm"
                    onClick={() =>
                      handleCategoryChange("contentAndDevelopment")
                    }
                    variant={
                      selectedCategory === "contentAndDevelopment"
                        ? "default"
                        : "outline"
                    }
                  >
                    Content and Development
                  </Button>
                </div>
                {selectedCategory && (
                  <>
                    <DialogDescription className="flex flex-col gap-2">
                      <div>
                        <p className="text-lg ">Area for impovement</p>
                        <p>{finalCategory?.areasForImprovement}</p>
                      </div>
                      <div>
                        <p className="text-lg ">Examples</p>
                        <p>{finalCategory?.examples}</p>
                      </div>
                      <div>
                        <p className="text-lg ">Strength</p>
                        <p>{finalCategory?.strengths}</p>
                      </div>
                      <div>
                        <p className="text-lg ">Suggestions</p>
                        <p>{finalCategory?.suggestions}</p>
                      </div>
                    </DialogDescription>
                    <div>
                      <p className="text-green-500 dark:text-green-400 inline font-bold">
                        Score is {finalScoreOfCategoty}
                      </p>
                    </div>
                  </>
                )}
                {!selectedCategory && (
                  <div className="flex flex-col flex-grow overflow-y-auto pr-4 gap-2">
                    <p className="text-bold text-xl">Feedback Overall</p>
                    <p className="text-sm ">
                      {data.feedback.overallImpression}
                    </p>
                    <p className="text-bold text-xl">Next Step</p>
                    <div className="text-sm ">
                      {data.feedback.nextSteps.map((item, index) => (
                        <p key={index}>
                          {index + 1}.{item}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                <DialogFooter className="flex-shrink-0">
                  <Button
                    disabled={isLoadingSubmit}
                    onClick={() => {
                      setIsCompleted(true);
                      onGetExp();
                    }}
                  >
                    Get your XP!
                  </Button>
                </DialogFooter>
              </DialogContent>
            )}
          </Dialog>
        </div>
      </form>
    </CardContent>
  );
}
