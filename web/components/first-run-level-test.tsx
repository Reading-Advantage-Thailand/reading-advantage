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

export default function FirstRunLevelTest({userId, language_placement_test}: Props) {

        const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);  
        const [shuffledQuestions, setShuffledQuestions] = useState<{ prompt: string; options: Record<string, string>; }[]>([]);   

        const handleNext = () => {
          if (currentQuestionIndex < language_placement_test.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
          }
        };

        useEffect(() => {
            const questions = [...language_placement_test[0].questions];
        
            // Shuffle questions
            for (let i = questions.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [questions[i], questions[j]] = [questions[j], questions[i]];
            }
        
            // Select the first 'numQuestions' questions
            const selectedQuestions = questions.slice(0, 3);
        
            // Shuffle the choices for each question
            selectedQuestions.forEach((question) => {
              let choices = Object.entries(question.options);
              for (let i = choices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [choices[i], choices[j]] = [choices[j], choices[i]];
              }
              question.options = Object.fromEntries(choices);
            });
        
            setShuffledQuestions(selectedQuestions);
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
                    Section {currentQuestionIndex + 1}
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
                  <form>
                    {Object.entries(question.options).map(([key, value]) => (
                      <div key={key}>
                        <input
                          type="radio"
                          name={`option${index}`}
                          value={key}
                          id={key}
                          className="mr-3"
                        />
                        <label htmlFor={key}>{value}</label>
                      </div>
                    ))}
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
          onClick={handleNext}
          // disabled={loading}
        >
          {/* {loading && (
                          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      )} */}
          <span>Next</span>
        </Button>
      </div>
    </>
  )
}

