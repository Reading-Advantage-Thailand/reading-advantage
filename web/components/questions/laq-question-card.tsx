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
import { useQuestionStore } from "@/store/question-store";
import { useRouter } from "next/navigation";

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

export type QuestionResponse = {
  result: LongAnswerQuestion;
  state: QuestionState;
};

type AnswerResponse = {
  state: QuestionState;
  answer: string;
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
        useQuestionStore.setState({ laqQuestion: data });
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
          userId={userId}
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
  userId,
  resp,
  userLevel,
  articleId,
  handleCompleted,
  handleCancel,
}: {
  userId: string;
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
        userId={userId}
        articleId={articleId}
        disabled={false}
      >
        <QuizContextProvider>
          <LAQuestion
            userId={userId}
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
  userId,
  resp,
  userLevel,
  articleId,
  handleCompleted,
  handleCancel,
}: {
  userId: string;
  resp: QuestionResponse;
  userLevel: number;
  articleId: string;
  handleCompleted: () => void;
  handleCancel: () => void;
}) {
  const t = useScopedI18n("components.laq");
  const tf = useScopedI18n("components.rate");
  const { timer, setPaused } = useContext(QuizContext);
  const [isCompleted, setIsCompleted] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [openModal, setOpenModal] = React.useState<boolean>(false);
  const [rating, setRating] = React.useState<number>(0);
  const [data, setData] = useState<AnswerResponse>({
    state: QuestionState.LOADING,
    answer: "",
    result: {
      detailedFeedback: {},
      exampleRevisions: "",
      nextSteps: [],
      overallImpression: "",
      scores: {},
    },
  });

  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState("");

  const currentLocale = useCurrentLocale();

  const minimumCharacters = 30 * (userLevel + 1);

  const longAnswerSchema = z.object({
    answer: z
      .string()
      .trim()
      .min(minimumCharacters, {
        message: `Please Enter minimum ${minimumCharacters} character...`,
      })
      .max(2000, { message: "Answer must be less than 2000 characters..." }),
    method: z.string(),
  });

  type FormData = z.infer<typeof longAnswerSchema>;

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(longAnswerSchema),
  });

  async function onSubmitted(dataForm: FormData) {
    setIsLoading(true);
    setOpenModal(false);
    setSelectedCategory("");

    try {
      const feedbackResponse = await fetch(
        `/api/v1/articles/${articleId}/questions/laq/${resp.result.id}/feedback`,
        {
          method: "POST",
          body: JSON.stringify({
            answer: dataForm.answer,
            preferredLanguage: localeNames[currentLocale],
          }),
        }
      );

      const feedback = await feedbackResponse.json();
      setData({ ...feedback, answer: dataForm.answer });

      if (dataForm.method === "submit") {
        setPaused(true);
        const submitAnswer = await fetch(
          `/api/v1/articles/${articleId}/questions/laq/${resp.result.id}`,
          {
            method: "POST",
            body: JSON.stringify({
              answer: dataForm.answer,
              feedback: feedback.result,
              timeRecorded: timer,
            }),
          }
        );

        const finalFeedback = await submitAnswer.json();
        setData(finalFeedback);
        setRating(finalFeedback.sumScores);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsLoading(false);
      setOpenModal(true);
    }
  }

  async function onGetExp() {
    setIsLoading(true);
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
            imgSrc: true,
            description: `Congratulations!, You received ${rating} XP for completing this activity.`,
          });
        }
        handleCompleted();
      })
      .finally(() => {
        setIsLoading(false);
      });
    await fetch(`/api/v1/users/${userId}/activitylog`, {
      method: "POST",
      body: JSON.stringify({
        articleId: articleId || "STSTEM",
        activityType: "la_question",
        activityStatus: "completed",
        timeTaken: timer,
        xpEarned: rating,
        details: data,
      }),
    });
    router.refresh();
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(selectedCategory === category ? "" : category);
  };

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
        />
        {errors.answer?.message && (
          <p className="text-red-500">{errors.answer?.message}</p>
        )}
        <div className="space-x-2 mt-3">
          <Button variant="outline" onClick={handleCancel}>
            {t("cancelButton")}
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            {...register("method")}
            onClick={() => {
              setOpenModal(false);
              setValue("method", "feedback");
            }}
          >
            {isLoading && getValues("method") === "feedback" && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t("feedbackButton")}
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            {...register("method")}
            onClick={() => {
              setOpenModal(false);
              setValue("method", "submit");
            }}
          >
            {isLoading && getValues("method") === "submit" && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t("submitButton")}
          </Button>
        </div>
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogTrigger asChild></DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader className="text-left">
              <DialogTitle className="font-bold text-2xl">
                {getValues("method") === "feedback"
                  ? "Writing Feedback"
                  : "Final Feedback"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                className="rounded-full"
                size="sm"
                onClick={() => handleCategoryChange("vocabularyUse")}
                variant={
                  selectedCategory === "vocabularyUse" ? "default" : "outline"
                }
              >
                Vocabulary Use
              </Button>
              <Button
                className="rounded-full"
                size="sm"
                onClick={() => handleCategoryChange("grammarAccuracy")}
                variant={
                  selectedCategory === "grammarAccuracy" ? "default" : "outline"
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
                onClick={() => handleCategoryChange("complexityAndStructure")}
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
                onClick={() => handleCategoryChange("contentAndDevelopment")}
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
                    <p>
                      {
                        data.result?.detailedFeedback[selectedCategory]
                          ?.areasForImprovement
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-lg ">Examples</p>
                    <p>
                      {
                        data.result?.detailedFeedback[selectedCategory]
                          ?.examples
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-lg ">Strength</p>
                    <p>
                      {
                        data.result?.detailedFeedback[selectedCategory]
                          ?.strengths
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-lg ">Suggestions</p>
                    <p>
                      {
                        data.result?.detailedFeedback[selectedCategory]
                          ?.suggestions
                      }
                    </p>
                  </div>
                </DialogDescription>
                <div>
                  <p className="text-green-500 dark:text-green-400 inline font-bold">
                    Score is {data.result?.scores[selectedCategory]}
                  </p>
                </div>
              </>
            )}
            {!selectedCategory && (
              <div className="flex flex-col flex-grow overflow-y-auto pr-4 gap-2">
                <p className="text-bold text-xl">Feedback Overall</p>
                <p className="text-sm ">{data.result?.overallImpression}</p>
                {getValues("method") === "feedback" ? (
                  <>
                    <p className="text-bold text-xl">Example Revisions</p>
                    <p className="text-sm ">{data.result?.exampleRevisions}</p>
                  </>
                ) : (
                  <>
                    <p className="text-bold text-xl">Next Step</p>
                    <div className="text-sm ">
                      {data.result?.nextSteps.map((item, index) => (
                        <p key={index}>
                          {index + 1}.{item}
                        </p>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            <DialogFooter className="flex-shrink-0">
              <DialogClose>
                {getValues("method") === "feedback" ? (
                  <Button>Revise Your Response</Button>
                ) : (
                  <Button
                    disabled={isLoading}
                    onClick={() => {
                      setIsCompleted(true);
                      onGetExp();
                    }}
                  >
                    Get your XP!
                  </Button>
                )}
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </form>
    </CardContent>
  );
}
