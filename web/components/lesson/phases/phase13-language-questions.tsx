"use client";

import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LessonLanguageQuestion from "../lesson-language-question";
import { Article } from "../../models/article-model";
import { Book } from "lucide-react";
import { useScopedI18n } from "@/locales/client";

interface Phase13LanguageQuestionsProps {
  article: Article;
  onCompleteChange: (complete: boolean) => void;
  skipPhase: () => void;
}

const Phase13LanguageQuestions: React.FC<Phase13LanguageQuestionsProps> = ({
  article,
  onCompleteChange,
  skipPhase,
}) => {
  const t = useScopedI18n("pages.student.lessonPage");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4 bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-950 dark:via-gray-950 dark:to-zinc-950 p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="inline-flex items-center justify-center p-3 bg-slate-100 dark:bg-slate-900 rounded-full mb-4">
          <Book className="h-8 w-8 text-slate-600 dark:text-slate-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t("phase13Title")}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {t("phase13Description")}
        </p>
      </div>

      {/* Language Question Component */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6">
          <LessonLanguageQuestion
            article={article}
            onCompleteChange={onCompleteChange}
            skipPhase={skipPhase}
          />
        </div>
      </div>
    </div>
  );
};

Phase13LanguageQuestions.displayName = "Phase13LanguageQuestions";
export default Phase13LanguageQuestions;
