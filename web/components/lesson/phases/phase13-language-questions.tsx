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
    <Card className="pb-7 w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Book />
          <div className="ml-2">{t("phase13Title")}</div>
        </CardTitle>
      </CardHeader>
      <div className="px-6">
        <span className="font-bold">{t("phase13Description")}</span>
      </div>
      <CardDescription className="px-6">
        <LessonLanguageQuestion
          article={article}
          onCompleteChange={onCompleteChange}
          skipPhase={skipPhase}
        />
      </CardDescription>
    </Card>
  );
};

Phase13LanguageQuestions.displayName = "Phase13LanguageQuestions";
export default Phase13LanguageQuestions;
