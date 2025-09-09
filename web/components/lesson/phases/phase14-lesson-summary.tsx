"use client";

import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LessonSummary from "../lesson-summary";
import { Book } from "lucide-react";
import { useScopedI18n } from "@/locales/client";

interface Phase14LessonSummaryProps {
  articleId: string;
  userId: string;
  elapsedTime: string;
}

const Phase14LessonSummary: React.FC<Phase14LessonSummaryProps> = ({
  articleId,
  userId,
  elapsedTime,
}) => {
  const t = useScopedI18n("pages.student.lessonPage");

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4 bg-gradient-to-br from-green-50 via-lime-50 to-emerald-50 dark:from-green-950 dark:via-lime-950 dark:to-emerald-950 p-8 rounded-2xl border border-green-200 dark:border-green-800">
        <div className="inline-flex items-center justify-center p-3 bg-green-100 dark:bg-green-900 rounded-full mb-4">
          <Book className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t("phase14Title")}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Congratulations! Review your lesson performance and achievements.
        </p>
      </div>

      {/* Summary Component */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6">
          <LessonSummary
            articleId={articleId}
            userId={userId}
            elapsedTime={elapsedTime}
          />
        </div>
      </div>
    </div>
  );
};

Phase14LessonSummary.displayName = "Phase14LessonSummary";
export default Phase14LessonSummary;
