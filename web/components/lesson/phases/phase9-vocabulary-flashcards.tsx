"use client";

import React from "react";
import LessonVocabularyFlashcardGame from "../lesson-vocabulary-flashcard-game";
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
    <div className="pb-7 w-full">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
            <Book className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t("phase10Title")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              {t("phase10Description")}
            </p>
          </div>
        </div>
      </div>
      
      <LessonVocabularyFlashcardGame
        userId={userId}
        articleId={articleId}
        onCompleteChange={onCompleteChange}
      />
    </div>
  );
};

Phase9VocabularyFlashcards.displayName = "Phase9VocabularyFlashcards";
export default Phase9VocabularyFlashcards;
