"use client";

import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LessonMatchingWords from "../lesson-vocabulary-activity-choice";
import { Book } from "lucide-react";
import { useScopedI18n } from "@/locales/client";

interface Phase10VocabularyMatchingProps {
  userId: string;
  articleId: string;
  onCompleteChange: (complete: boolean) => void;
}

const Phase10VocabularyMatching: React.FC<Phase10VocabularyMatchingProps> = ({
  userId,
  articleId,
  onCompleteChange,
}) => {
  const t = useScopedI18n("pages.student.lessonPage");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4 bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 p-8 rounded-2xl border border-indigo-200 dark:border-indigo-800">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full mb-4">
          <Book className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t("phase10Title")}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {t("phase10Description")}
        </p>
      </div>

      {/* Matching Component */}
      <div className="bg-zinc-200 dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6">
          <LessonMatchingWords
            userId={userId}
            articleId={articleId}
            onCompleteChange={onCompleteChange}
          />
        </div>
      </div>
    </div>
  );
};

Phase10VocabularyMatching.displayName = "Phase10VocabularyMatching";
export default Phase10VocabularyMatching;
