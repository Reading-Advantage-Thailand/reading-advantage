"use client";

import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LessonSentenseFlashCard from "../lesson-sentense-flash-card";
import { Book } from "lucide-react";
import { useScopedI18n } from "@/locales/client";

interface Phase11SentenceFlashcardsProps {
  userId: string;
  articleId: string;
  showSentenseButton: boolean;
  setShowSentenseButton: (show: boolean) => void;
  onCompleteChange: (complete: boolean) => void;
}

const Phase11SentenceFlashcards: React.FC<Phase11SentenceFlashcardsProps> = ({
  userId,
  articleId,
  showSentenseButton,
  setShowSentenseButton,
  onCompleteChange,
}) => {
  const t = useScopedI18n("pages.student.lessonPage");

  return (
    <Card className="pb-7 w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Book />
          <div className="ml-2">{t("phase11Title")}</div>
        </CardTitle>
      </CardHeader>
      <div className="px-6">
        <span className="font-bold">{t("phase11Description")}</span>
      </div>
      <CardDescription className="px-6">
        <LessonSentenseFlashCard
          userId={userId}
          articleId={articleId}
          showButton={showSentenseButton}
          setShowButton={setShowSentenseButton}
          onCompleteChange={onCompleteChange}
        />
      </CardDescription>
    </Card>
  );
};

Phase11SentenceFlashcards.displayName = "Phase11SentenceFlashcards";
export default Phase11SentenceFlashcards;
