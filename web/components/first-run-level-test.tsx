"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import React, { useState, useEffect } from "react";
import ProgressBar from "../components/progress-bar-xp";
import { toast } from './ui/use-toast'

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
  const [testFinished, setTestFinished] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[][]>([]);
  const [score, setScore] = useState(0);
  const [correctAnswer, setCorrectAnswer] = React.useState<string[]>([]);
  const [rightWrongAnswer, setRightWrongAnswer] = useState(false);
  const [checked, setChecked] = useState(false);
  const [formkey, setFormKey] = useState(0);
  const [countOfRightAnswers, setCountOfRightAnswers] = useState(0);
  const [hasAnsweredCorrectly, setHasAnsweredCorrectly] = useState(false);
  const [isQuestionAnswered, setIsQuestionAnswered] = useState(
    new Array(
      language_placement_test[currentSectionIndex].questions.length
    ).fill(false)
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [rightAnswersCounts, setRightAnswersCounts] = useState<number[]>([]);
  const [sectionAnswerCount, setSectionAnswerCount] = useState(0);

  const answerOptionIndexArray: number[] = [];
  const answerValueArray: any[] = [];
  const questionIndexArray: number[] = [];

  function getCorrectAnswer() {
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
  }

  const onAnswerSelected = (optionId: number, answer: string, index: any) => {
    answerOptionIndexArray.push(optionId);
    answerValueArray.push(answer);
    questionIndexArray.push(index);
  };

  function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function levelCalculation(score: number) {
    const levels = [
      { min: 0, max: 5000, cerfLevel: "A0", raLevel: "1" },
      { min: 5001, max: 11000, cerfLevel: "A0+", raLevel: "2" },
      { min: 11001, max: 18000, cerfLevel: "A1", raLevel: "3" },
      { min: 18001, max: 26000, cerfLevel: "A1+", raLevel: "4" },
      { min: 26001, max: 35000, cerfLevel: "A2-", raLevel: "5" },
      { min: 35001, max: 45000, cerfLevel: "A2", raLevel: "6" },
      { min: 45001, max: 56000, cerfLevel: "A2+", raLevel: "7" },
      { min: 56001, max: 68000, cerfLevel: "B1-", raLevel: "8" },
      { min: 68001, max: 81000, cerfLevel: "B1", raLevel: "9" },
      { min: 81001, max: 95000, cerfLevel: "B1+", raLevel: "10" },
      { min: 95001, max: 110000, cerfLevel: "B2-", raLevel: "11" },
      { min: 110001, max: 126000, cerfLevel: "B2", raLevel: "12" },
      { min: 126001, max: 143000, cerfLevel: "B2+", raLevel: "13" },
      { min: 143001, max: 161000, cerfLevel: "C1-", raLevel: "14" },
      { min: 161001, max: 180000, cerfLevel: "C1", raLevel: "15" },
      { min: 180001, max: 221000, cerfLevel: "C1+", raLevel: "16" },
      { min: 221001, max: 243000, cerfLevel: "C2-", raLevel: "17" },
      { min: 243001, cerfLevel: "C2", raLevel: "18" }
  ];

  for (let level of levels) {
      if (score >= level.min && (!level.max || score <= level.max)) {
          return { cerfLevel: level.cerfLevel, raLevel: level.raLevel };
      }
  }

  return { cerfLevel: "", raLevel: "" };
  }

  const handleQuestions = () => {
    let optionId = 0; // Initialize a counter for option IDs

    let initialShuffledQuestions = [...language_placement_test]; // Copy the initial questions

    let updatedShuffledQuestions = initialShuffledQuestions.map((section) => {
      let shuffledSection = shuffleArray(section.questions).slice(0, 3); // Shuffle and slice the questions in each section

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

        return { ...question, options: updatedOptions }; // Return a new question object with the updated options
      });
    });

    setShuffledQuestions(updatedShuffledQuestions); // Set the state with the new array
  };

  const handleNext = () => {
    if (answerOptionIndexArray.length !== 3) {
      toast({
        title: "Attention!",
        description: "Please answer all questions!",
      });
    } else {
      const correctSelectedAnswer: string[] = [];
      //For loop to check if the array answerValueArray is in the array correctAnswer
      for (let i = 0; i < answerOptionIndexArray.length; i++) {
        if (correctAnswer.includes(answerValueArray[i])) {
          // console.log("Correct answer:" + answerValueArray[i]);
          correctSelectedAnswer.push(answerValueArray[i]);
          if (!isQuestionAnswered[questionIndexArray[i]]) {
            setCountOfRightAnswers(countOfRightAnswers + 1);
            const newIsQuestionAnswered = [...isQuestionAnswered];
            newIsQuestionAnswered[questionIndexArray[i]] = true;
            setIsQuestionAnswered(newIsQuestionAnswered);
          }
          setHasAnsweredCorrectly(true);
        } else {
          setRightWrongAnswer(false);
          setHasAnsweredCorrectly(false);
        }
      }
      setScore(
        (prevScore) =>
          prevScore +
          correctSelectedAnswer.length *
            language_placement_test[currentSectionIndex].points
      );
      if (correctSelectedAnswer.length >= 2) {
        if (currentPage < shuffledQuestions.length - 1) {
          // Save the count of correct answers for the current section
          setRightAnswersCounts((prevCounts) => [
            ...prevCounts,
            correctSelectedAnswer.length,
          ]);
          // Proceed to the next page
          setCurrentPage(currentPage + 1);
          setCurrentSectionIndex(currentSectionIndex + 1);
          setFormKey(formkey + 1);
          setChecked(false);
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setCountOfRightAnswers(0);
          setSectionAnswerCount(0); // Reset sectionAnswerCount to 0 for the new section
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
    const response = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({
        raLevel: levelCalculation(score).raLevel,
        score: score,
      }),
    });
  };

  useEffect(() => {
    handleQuestions();
    getCorrectAnswer();
  }, []);

  if (testFinished) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-bold text-2xl md:text-2xl">
            Congratulation!
          </CardTitle>
          <CardDescription>
          The assessment is done.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Your Score: {score}</p>
          <p>Your Level: {levelCalculation(score).cerfLevel}</p><br />
          <Button size="lg">
            {"Get Start"}
          </Button>
        </CardContent>
      </Card>
    );
  } else {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="font-bold text-2xl md:text-2xl">
              Let&apos;s get started by testing your skill!
            </CardTitle>
            <CardDescription>
              Choose the correct answer to assess your reading level.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <span>
                <ProgressBar progress={score} />
                {score}
              </span>
              <br />
              <h1 className="font-bold text-xl mb-4">
                Section {currentSectionIndex + 1}
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
            {currentPage === shuffledQuestions.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      </>
    );
  }
}
