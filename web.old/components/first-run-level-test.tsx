"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import React, { useState, useEffect, useCallback } from "react";
import { toast } from "./ui/use-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Confetti from "react-confetti";
import { useScopedI18n } from "../locales/client";
import { levelCalculation } from "../lib/utils";
import { ActivityStatus, ActivityType } from "./models/user-activity-log-model";

type Props = {
  userId: string;
  language_placement_test: levelTest[];
};

type levelTest = {
  level: string;
  questions: {
    prompt: string;
    options: Record<string, string>;
  }[];
  points: number;
};

type Option = {
  id: number;
  text: string;
};

type Question = {
  prompt: string;
  options: Record<string, Option>;
};

export default function FirstRunLevelTest({
  userId,
  language_placement_test,
}: Props) {
  const t = useScopedI18n("components.firstRunLevelTest");
  const router = useRouter();
  const { data: session, status, update } = useSession();
  const [testFinished, setTestFinished] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[][]>([]);
  const [xp, setXp] = useState(0);
  const [correctAnswer, setCorrectAnswer] = React.useState<string[]>([]);
  const [formkey, setFormKey] = useState(0);
  const [countOfRightAnswers, setCountOfRightAnswers] = useState(0);
  const [isQuestionAnswered, setIsQuestionAnswered] = useState(
    new Array(
      language_placement_test[currentSectionIndex].questions.length
    ).fill(false)
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const answerOptionIndexArray: number[] = [];
  const answerValueArray: any[] = [];
  const questionIndexArray: number[] = [];

  const getCorrectAnswer = useCallback(async () => {
    let allCorrectAnswers: string[] = [];
    for (let i = language_placement_test.length - 1; i >= 0; i--) {
      for (
        let j = language_placement_test[i].questions.length - 1;
        j >= 0;
        j--
      ) {
        const answerA = language_placement_test[i].questions[j].options["A"];
        allCorrectAnswers.push(answerA);
      }
      setCorrectAnswer(allCorrectAnswers);
    }
  }, [language_placement_test]);

  const onAnswerSelected = (optionId: number, answer: string, index: any) => {
    if (!answerOptionIndexArray.includes(optionId)) {
      answerOptionIndexArray.push(optionId);
    }
    if (!answerValueArray.includes(answer)) {
      answerValueArray.push(answer);
    }
    if (!questionIndexArray.includes(index)) {
      questionIndexArray.push(index);
    }
  };

  function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const handleQuestions = useCallback(async () => {
    let optionId = 0;

    let initialShuffledQuestions = [...language_placement_test];

    let updatedShuffledQuestions = initialShuffledQuestions.map((section) => {
      let shuffledSection = shuffleArray(section.questions).slice(0, 3);

      return shuffledSection.map((question) => {
        let choices = Object.entries(question.options);
        for (let i = choices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [choices[i], choices[j]] = [choices[j], choices[i]];
        }

        // Assign a unique ID to each option
        let updatedOptions = Object.fromEntries(
          choices.map(([key, value]) => [key, { id: optionId++, text: value }])
        );

        return { ...question, options: updatedOptions };
      });
    });

    setShuffledQuestions(updatedShuffledQuestions);
  }, [language_placement_test]);

  const handleNext = () => {
    if (answerOptionIndexArray.length < 3) {
      toast({
        title: t("toast.attention"),
        description: t("toast.attentionDescription"),
        variant: "destructive",
      });
    } else {
      const correctSelectedAnswer: string[] = [];
      //For loop to check if the array answerValueArray is in the array correctAnswer
      for (let i = 0; i < answerOptionIndexArray.length; i++) {
        if (correctAnswer.includes(answerValueArray[i])) {
          correctSelectedAnswer.push(answerValueArray[i]);
          if (!isQuestionAnswered[questionIndexArray[i]]) {
            setCountOfRightAnswers(countOfRightAnswers + 1);
            const newIsQuestionAnswered = [...isQuestionAnswered];
            newIsQuestionAnswered[questionIndexArray[i]] = true;
            setIsQuestionAnswered(newIsQuestionAnswered);
          }
        }
      }
      setXp(
        (prevScore: number) =>
          prevScore +
          correctSelectedAnswer.length *
            language_placement_test[currentSectionIndex].points
      );
      if (correctSelectedAnswer.length >= 2) {
        if (currentPage < shuffledQuestions.length - 1) {
          setCurrentPage(currentPage + 1);
          setCurrentSectionIndex(currentSectionIndex + 1);
          setFormKey(formkey + 1);
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setCountOfRightAnswers(0);
        } else {
          onFinishTest();
        }
      } else {
        onFinishTest();
      }
    }
  };

  const onFinishTest = async () => {
    setTestFinished(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await handleQuestions();
        await getCorrectAnswer();
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getCorrectAnswer, handleQuestions]);

  if (testFinished) {
    return (
      <div>
        <Confetti width={window.innerWidth} height={window.innerHeight} />
        <Card>
          <CardHeader>
            <CardTitle className="font-bold text-2xl md:text-2xl">
              {t("congratulations")}
            </CardTitle>
            <CardDescription>{t("congratulationsDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{t("yourScore", { xp })}</p>
            <p>
              {t("yourCefrLevel", {
                cefrLevel: levelCalculation(xp).cefrLevel,
              })}
            </p>
            <p>{t("yourRaLevel", { raLevel: levelCalculation(xp).raLevel })}</p>
            <br />

            <Button
              size="lg"
              onClick={async () => {
                try {
                  const updateResult = await fetch(
                    `/api/v1/users/${userId}/activitylog`,
                    {
                      method: "POST",
                      body: JSON.stringify({
                        activityType: ActivityType.LevelTest,
                        activityStatus: ActivityStatus.Completed,
                        xpEarned: xp,
                        details: {
                          questionsAnswered: isQuestionAnswered,
                          correctAnswers: countOfRightAnswers,
                          cefr_level: levelCalculation(xp).cefrLevel,
                        },
                      }),
                    }
                  );
                  if (updateResult.status == 200) {
                    toast({
                      title: t("toast.successUpdate"),
                      description: t("toast.successUpdateDescription"),
                    });

                    router.refresh();
                  } else {
                    console.log("Update Failed");
                  }
                } catch (error) {
                  console.error(error);
                  toast({
                    title: t("toast.errorTitle"),
                    description: t("toast.errorDescription"),
                    variant: "destructive",
                  });
                }
              }}
            >
              {t("getStartedButton")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  } else {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="font-bold text-2xl md:text-2xl">
              {t("heading")}
            </CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              {loading ? (
                <h1>Please wait...</h1>
              ) : (
                <div>
                  <h1 className="font-bold text-xl mb-4">
                    {t("section", {
                      currentSectionIndex: currentSectionIndex + 1,
                    })}
                  </h1>
                  {shuffledQuestions[currentPage] &&
                    shuffledQuestions[currentPage].map(
                      (
                        question: {
                          prompt: string;
                          options: Record<string, { id: number; text: string }>;
                        },
                        questionIndex: number
                      ) => (
                        <div key={questionIndex}>
                          <p className="font-bold">
                            {questionIndex + 1}. {question.prompt}
                          </p>
                          <form key={formkey + 1}>
                            {Object.entries(question.options).map(
                              ([key, { id, text }]) => (
                                <div key={id}>
                                  <input
                                    type="radio"
                                    name={`option${+questionIndex}`}
                                    value={text}
                                    id={key}
                                    className="mr-3"
                                    onChange={(e) =>
                                      onAnswerSelected(
                                        id,
                                        e.target.value,
                                        questionIndex
                                      )
                                    }
                                  />
                                  <label htmlFor={key}>{text}</label>
                                </div>
                              )
                            )}
                          </form>
                        </div>
                      )
                    )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="flex items-center pt-4">
          <Button
            size="lg"
            onClick={
              currentPage === shuffledQuestions.length - 1
                ? onFinishTest
                : handleNext
            }
          >
            {currentPage === shuffledQuestions.length - 1
              ? "Next"
              : t("nextButton")}
          </Button>
        </div>
      </>
    );
  }
}
