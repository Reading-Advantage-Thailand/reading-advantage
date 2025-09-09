"use client";

import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LessonSAQ from "../practics/lesson-saq";
import { Article } from "../../models/article-model";
import { Book } from "lucide-react";
import { useScopedI18n } from "@/locales/client";

interface Phase8ShortAnswerProps {
  article: Article;
  articleId: string;
  userId: string;
  onCompleteChange: (complete: boolean) => void;
}

const Phase8ShortAnswer: React.FC<Phase8ShortAnswerProps> = ({
  article,
  articleId,
  userId,
  onCompleteChange,
}) => {
  const t = useScopedI18n("pages.student.lessonPage");

  return (
    <div className="pb-7 w-full">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Book className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t("phase8Title")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              {t("phase8Description")}
            </p>
          </div>
        </div>
      </div>
      
      <LessonSAQ
        userId={userId}
        articleId={articleId}
        articleTitle={article.title}
        articleLevel={article.ra_level}
        onCompleteChange={onCompleteChange}
      />
    </div>
  );
};

Phase8ShortAnswer.displayName = "Phase8ShortAnswer";
export default Phase8ShortAnswer;
