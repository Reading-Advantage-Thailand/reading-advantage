"use client";
import React, { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import TextareaAutosize from "react-textarea-autosize";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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

interface Props {
  userId: string;
  articleId: string;
}

export default function LAQuestionCard({ userId, articleId }: Props) {
  const t = useScopedI18n("components.laq");

  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const [studentResponse, setStudentResponse] = useState("");
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handlePracticeClick = () => {
    setIsPromptVisible(true);
  };

  const handleCancel = () => {
    setIsPromptVisible(false);
    setStudentResponse("");
  };

  const handleGetFeedback = () => {
    setIsFeedbackModalOpen(true);
  };

  const handleSubmit = () => {
    setIsSubmissionModalOpen(true);
  };

  const handleRevise = () => {
    setIsFeedbackModalOpen(false);
  };

  const handleGetXP = () => {
    setIsSubmissionModalOpen(false);
    setIsComplete(true);
    setIsPromptVisible(false);
    setStudentResponse("");
  };

  return (
    <CardContent className="rounded-xl border mt-3 gap-4 p-6 flex flex-col">
      <CardTitle className="flex font-bold text-3xl md:text-3xl mt-3">
        Long Answer Question
      </CardTitle>
      <Button
        className="w-fit"
        onClick={handlePracticeClick}
        disabled={isComplete}
      >
        {isComplete ? t("successButton") : t("practiceButton")}
      </Button>

      {isPromptVisible && (
        <>
          <h2 className="text-xl font-semibold">Writing Prompt</h2>
          <TextareaAutosize
            placeholder="Type your answer here..."
            minRows={5}
            className="w-full my-3 p-3 rounded-sm resize-none appearance-none overflow-hidden bg-gray-100 dark:bg-gray-900 focus:outline-none"
            value={studentResponse}
            onChange={(e) => setStudentResponse(e.target.value)}
          />
          <div className="space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              {t("cancleButton")}
            </Button>
            <Button onClick={handleGetFeedback}>{t("feedbackButton")}</Button>
            <Button onClick={handleSubmit}>{t("submitButton")}</Button>
          </div>
        </>
      )}
      <Dialog open={isFeedbackModalOpen} onOpenChange={setIsFeedbackModalOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Writing Feedback</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-4">
            <p>This is where the feedback content will go.</p>
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button onClick={handleRevise}>Revise Your Response</Button>
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
              Great job! Here's your final feedback on your writing submission.
            </p>
            {/* Add more detailed feedback here */}
          </div>
          <DialogFooter className="flex-shrink-0">
            <Button onClick={handleGetXP}>Get your XP!</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CardContent>
  );
}
