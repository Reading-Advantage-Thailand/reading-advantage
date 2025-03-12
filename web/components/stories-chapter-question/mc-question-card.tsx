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
  storyId: string;
  articleTitle: string;
  articleLevel: number;
  chapterNumber: string;
};

export type QuestionResponse = {
  results: {
    id: string;
    question: string;
    options: string[];
    textual_evidence: string;
    question_number: number;
    chapter_number: string;
  }[];
  progress: AnswerStatus[];
  total: number;
  state: QuestionState;
};

interface MCQQuestionProps {
  storyId: string;
  resp: QuestionResponse;
  handleCompleted: () => void;
  userId: string;
  articleTitle: string;
  articleLevel: number;
  chapterNumber: string;
}

export default function StoryMCQuestionCard({
  userId,
  storyId,
  articleTitle,
  articleLevel,
  chapterNumber,
}: Props) {
  const [state, setState] = useState(QuestionState.LOADING);
  const [data, setData] = useState<QuestionResponse>({
    results: [],
    progress: [],
    total: 0,
    state: QuestionState.LOADING,
  });

  useEffect(() => {
    fetch(`/api/v1/stories/${storyId}/${chapterNumber}/question/mcq`)
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ API Response:", data);
        setData(data);
        setState(data.state);
        useQuestionStore.setState({ mcQuestion: data });
      });
  }, [state, storyId]);

  const handleCompleted = () => {
    setState(QuestionState.LOADING);
  };

  const onRetake = () => {
    setState(QuestionState.LOADING);
    fetch(`/api/v1/stories/${storyId}/${chapterNumber}/question/mcq`, {
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
          userId={userId}
          chapterNumber={chapterNumber}
          resp={data}
          storyId={storyId}
          handleCompleted={handleCompleted}
          articleTitle={articleTitle}
          articleLevel={articleLevel}
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
  const t = useScopedI18n("components.mcq");
  return (
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
  );
}

function QuestionCardLoading() {
  const t = useScopedI18n("components.mcq");
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-bold text-3xl md:text-3xl text-muted-foreground">
          {t("title")}
        </CardTitle>
        <CardDescription>{t("descriptionLoading")}</CardDescription>
        <Skeleton className="h-8 w-full mt-2" />
      </CardHeader>
    </Card>
  );
}

function QuestionCardIncomplete({
  userId,
  resp,
  storyId,
  handleCompleted,
  articleTitle,
  articleLevel,
  chapterNumber,
}: {
  userId: string;
  resp: QuestionResponse;
  storyId: string;
  handleCompleted: () => void;
  articleTitle: string;
  articleLevel: number;
  chapterNumber: string;
}) {
  const t = useScopedI18n("components.mcq");
  console.log("ParentstoryId", storyId);
  return (
    <Card id="onborda-mcq">
      <QuestionHeader
        heading={t("title")}
        description={t("description")}
        buttonLabel={t("startButton")}
        userId={userId}
        articleId={storyId}
        disabled={false}
      >
        <QuizContextProvider>
          <MCQeustion
            chapterNumber={chapterNumber}
            storyId={storyId}
            resp={resp}
            handleCompleted={handleCompleted}
            userId={userId}
            articleTitle={articleTitle}
            articleLevel={articleLevel}
          />
        </QuizContextProvider>
      </QuestionHeader>
    </Card>
  );
}

function MCQeustion({
  storyId,
  resp,
  handleCompleted,
  userId,
  articleTitle,
  articleLevel,
  chapterNumber,
}: MCQQuestionProps) {
  const [progress, setProgress] = useState(resp.progress);
  const [isLoadingAnswer, setLoadingAnswer] = useState(false);
  const [index, setIndex] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState(-1);
  const { timer, setPaused } = useContext(QuizContext);
  const router = useRouter();
  const [textualEvidence, setTextualEvidence] = useState("");

  const onSubmitted = async (
    storyId: string,
    questionNumber: number,
    chapterNumber: string,
    option: string,
    i: number
  ) => {
    setPaused(true);
    setLoadingAnswer(true);

    try {
      const response = await fetch(
        `/api/v1/stories/${storyId}/${chapterNumber}/question/mcq/${questionNumber}`,
        {
          method: "POST",
          body: JSON.stringify({
            answer: option,
            timeRecorded: timer,
          }),
        }
      );

      const data = await response.json();

      setCorrectAnswer(data.correct_answer);
      setSelectedOption(i);
      setProgress(data.progress);
      setTextualEvidence(resp.results[index].textual_evidence);
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setLoadingAnswer(false);
    }
  };

  useEffect(() => {
    let count = 0;
    let countTest = 0;
    progress.forEach(async (status, idx) => {
      if (status === AnswerStatus.CORRECT) {
        count += UserXpEarned.MC_Question;
        countTest++;
      } else if (status === AnswerStatus.INCORRECT) {
        countTest++;
      }
      if (countTest === 5) {
        await fetch(`/api/v1/users/${userId}/activitylog`, {
          method: "POST",
          body: JSON.stringify({
            storyId,
            chapterNumber,
            questionNumber: index + 1,
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
  }, [progress]);

  return (
    <CardContent>
      <div className="flex gap-2 items-end mt-6">
        <Badge className="flex-1" variant="destructive">
          Time Elapsed: {timer} seconds
        </Badge>
        {progress.map((status, idx) =>
          status === AnswerStatus.CORRECT ? (
            <Icons.correctChecked
              key={idx}
              className="text-green-500"
              size={22}
            />
          ) : status === AnswerStatus.INCORRECT ? (
            <Icons.incorrectChecked
              key={idx}
              className="text-red-500"
              size={22}
            />
          ) : (
            <Icons.unChecked key={idx} className="text-gray-500" size={22} />
          )
        )}
      </div>

      <CardTitle className="font-bold text-3xl md:text-3xl mt-3">
        Question {index + 1} of {resp.total}
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
          className={`mt-2 h-auto w-full ${
            selectedOption === i ? "bg-red-500 hover:bg-red-600" : ""
          } ${
            correctAnswer === option ? "bg-green-500 hover:bg-green-600" : ""
          }`}
          disabled={isLoadingAnswer}
          onClick={() => {
            if (selectedOption === -1) {
              onSubmitted(
                storyId,
                resp.results[index].question_number,
                resp.results[index].chapter_number,
                option,
                i
              );
            }
          }}
        >
          <p className="w-full text-left">
            {i + 1}. {option}
          </p>
        </Button>
      ))}

      <Button
        variant="outline"
        size="sm"
        className="mt-2"
        disabled={isLoadingAnswer || selectedOption === -1}
        onClick={() => {
          if (index + 1 < resp.results.length) {
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
        {isLoadingAnswer ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          ""
        )}
        {index + 1 < resp.results.length ? "Next Question" : "Submit"}
      </Button>
    </CardContent>
  );
}
