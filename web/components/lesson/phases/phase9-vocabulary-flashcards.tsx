"use client";

import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LessonVocabularyFlashCard from "../lesson-vocabulary-flash-card";
import { Book } from "lucide-react";
import { useScopedI18n } from "@/locales/client";

interface Phase9VocabularyFlashcardsProps {
  userId: string;
  articleId: string;
  showVocabularyButton: boolean;
  setShowVocabularyButton: (show: boolean) => void;
  onCompleteChange: (complete: boolean) => void;
}

const Phase9VocabularyFlashcards: React.FC<Phase9VocabularyFlashcardsProps> = ({
  userId,
  articleId,
  showVocabularyButton,
  setShowVocabularyButton,
  onCompleteChange,
}) => {
  const t = useScopedI18n("pages.student.lessonPage");

  return (
    <Card className="pb-7 w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Book />
          <div className="ml-2">{t("phase10Title")}</div>
        </CardTitle>
      </CardHeader>
      <div className="px-6">
        <span className="font-bold">{t("phase10Description")}</span>
      </div>
      <CardDescription className="px-6">
        <LessonVocabularyFlashCard
          userId={userId}
          articleId={articleId}
          showButton={showVocabularyButton}
          setShowButton={setShowVocabularyButton}
          onCompleteChange={onCompleteChange}
        />
      </CardDescription>
    </Card>
  );
};

Phase9VocabularyFlashcards.displayName = "Phase9VocabularyFlashcards";
export default Phase9VocabularyFlashcards;
