"use client";

import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LessonMCQ from "../practics/lesson-mcq";
import { Article } from "../../models/article-model";
import { Book } from "lucide-react";
import { useScopedI18n } from "@/locales/client";

interface Phase7MultipleChoiceProps {
  article: Article;
  articleId: string;
  userId: string;
  onCompleteChange: (complete: boolean) => void;
}

const Phase7MultipleChoice: React.FC<Phase7MultipleChoiceProps> = ({
  article,
  articleId,
  userId,
  onCompleteChange,
}) => {
  const t = useScopedI18n("pages.student.lessonPage");

  return (
    <div className="w-full h-full">
      {/* Header Card */}
      <Card className="mb-6 border-0 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/50 dark:to-blue-950/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center text-lg font-bold text-purple-800 dark:text-purple-200">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-3">
              <Book className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>{t("phase7Title")}</div>
          </CardTitle>
          <CardDescription className="text-purple-700 dark:text-purple-300 ml-11">
            <span className="font-medium">{t("phase7Description")}</span>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* MCQ Component */}
      <LessonMCQ
        userId={userId}
        articleId={articleId}
        articleTitle={article.title}
        articleLevel={article.ra_level}
        onCompleteChange={onCompleteChange}
      />
    </div>
  );
};

Phase7MultipleChoice.displayName = "Phase7MultipleChoice";
export default Phase7MultipleChoice;
