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
import  ProgressBar  from "../components/progress-bar-xp";

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

export default function FirstRunLevelTest({
  userId,
  language_placement_test,
}: Props) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState<{ prompt: string; options: Record<string, string> }[]>([]);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctAnswer, setCorrectAnswer] = React.useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState(false);
  const [checked, setChecked] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [formkey, setFormKey] = useState(0);

  function getCorrectAnswer() {
      let allCorrectAnswers: string[] = [];
    for (let i = language_placement_test.length - 1; i >= 0; i--) {
    for (let j = language_placement_test[i].questions.length - 1; j >= 0; j--) {
        const answerA = language_placement_test[i].questions[j].options["A"];
        allCorrectAnswers.push(answerA);
    }
    setCorrectAnswer(allCorrectAnswers);
  }}

const onAnswerSelected = (answer: string, index: any) => {
    // setAnsweredQuestions([...answeredQuestions, index]);
    // if (!answeredQuestions.includes(index)) {
        setIsAnswered(true);
        try {
            setChecked(true);
            // setSelectedAnswerIndex(null);
            if (correctAnswer.includes(answer)) {
               setSelectedAnswer(true);
               setScore(score + language_placement_test[currentSectionIndex].points);
               console.log('true');
           } else {
               setSelectedAnswer(false);
               console.log('false');
           }
        } catch (error) {
            console.log(error);
        } finally {
            console.log('finally');
        }
    // }
  };
  
  function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
  const handleQuestions = () => {
      setShuffledQuestions(() => {
                const nextQuestions = language_placement_test[
                    currentSectionIndex
                  ].questions.slice(0, 3);
                  
                      const shuffledQuestions = shuffleArray(nextQuestions);
                      shuffledQuestions.forEach((question) => {
                          let choices = Object.entries(question.options);
                          for (let i = choices.length - 1; i > 0; i--) {
                              const j = Math.floor(Math.random() * (i + 1));
                              [choices[i], choices[j]] = [choices[j], choices[i]];
                          }
                          question.options = Object.fromEntries(choices);
                      });
                      return shuffledQuestions;
                  });
    
      // if (currentSectionIndex === 0) {
      //   // setCurrentSectionIndex(currentSectionIndex + 1);
      //   // setFormKey(formkey + 1);
      //   setShuffledQuestions(() => {
      //           const nextQuestions = language_placement_test[
      //               currentSectionIndex
      //             ].questions.slice(0, 3);
                  
      //                 const shuffledQuestions = shuffleArray(nextQuestions);
      //                 shuffledQuestions.forEach((question) => {
      //                     let choices = Object.entries(question.options);
      //                     for (let i = choices.length - 1; i > 0; i--) {
      //                         const j = Math.floor(Math.random() * (i + 1));
      //                         [choices[i], choices[j]] = [choices[j], choices[i]];
      //                     }
      //                     question.options = Object.fromEntries(choices);
      //                 });
      //                 return shuffledQuestions;
      //             });
      // } else if (currentSectionIndex > 0 && currentSectionIndex < language_placement_test.length - 1) {
      //   setCurrentSectionIndex(currentSectionIndex + 1);
      //   setFormKey(formkey + 1);
      //   setShuffledQuestions(() => {
      //           const nextQuestions = language_placement_test[
      //               currentSectionIndex + 1
      //             ].questions.slice(0, 3);
                  
      //                 const shuffledQuestions = shuffleArray(nextQuestions);
      //                 shuffledQuestions.forEach((question) => {
      //                     let choices = Object.entries(question.options);
      //                     for (let i = choices.length - 1; i > 0; i--) {
      //                         const j = Math.floor(Math.random() * (i + 1));
      //                         [choices[i], choices[j]] = [choices[j], choices[i]];
      //                     }
      //                     question.options = Object.fromEntries(choices);
      //                 });
      //                 return shuffledQuestions;
      //             });
      // } 

  }
  const handleNext = () => {


         if (currentSectionIndex < language_placement_test.length - 1) {
          setCurrentSectionIndex(currentSectionIndex + 1);
          setFormKey(formkey + 1);
          // handleQuestions();
    setShuffledQuestions(() => {
        const nextQuestions = language_placement_test[
            currentSectionIndex + 1
          ].questions.slice(0, 3);
          
              const shuffledQuestions = shuffleArray(nextQuestions);
              shuffledQuestions.forEach((question) => {
                  let choices = Object.entries(question.options);
                  for (let i = choices.length - 1; i > 0; i--) {
                      const j = Math.floor(Math.random() * (i + 1));
                      [choices[i], choices[j]] = [choices[j], choices[i]];
                  }
                  question.options = Object.fromEntries(choices);
              });
              return shuffledQuestions;
          });

  }
  // api update xp and level to database when click next
    };
    
    useEffect(() => {
        handleQuestions();
        getCorrectAnswer();
  }, []);

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
            <h1 className="font-bold text-xl mb-4">
              <span><ProgressBar progress={score} /> {score}</span><br/>
              Section {currentSectionIndex + 1} 
            </h1>
            {shuffledQuestions.map(
              (
                question: { prompt: string; options: Record<string, string> },
                index: number
              ) => (
                <div key={index}>
                  <p className="font-bold">
                    {index + 1}. {question.prompt}
                  </p>
                  <form key={formkey + 1}>
                    {Object.entries(question.options).map(([key, value]) => (
                      <div key={key}>
                        <input
                          type="radio"
                          name={`option${index}`}
                          value={value}
                          id={key}
                          className="mr-3"
                          onChange={(e) => onAnswerSelected(e.target.value, index)}
                          />
                        <label htmlFor={key}>{value}</label>
                      </div>
                    ))}
                  </form>
                </div>
              )
            )}
            score: {score}
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center pt-4">
      {checked ? (
        <Button size="lg" onClick={handleNext}>
        {/* <Button size="lg" onClick={handleQuestions}> */}
            {currentSectionIndex === language_placement_test.length -1 ? 'Finish' : 'Next'}
        </Button>
      ):(
        <Button size="lg" onClick={handleNext} disabled>
        {/* <Button size="lg" onClick={handleQuestions} disabled>  */}
            {''}
            {currentSectionIndex === language_placement_test.length -1 ? 'Finish' : 'Next'}
        </Button>
      )}
      </div>
    </>
  );
}
