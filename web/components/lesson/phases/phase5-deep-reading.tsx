"use client";

import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LessonSentensePreview from "../lesson-sentence-preview";
import { Article } from "../../models/article-model";
import { Book } from "lucide-react";
import { useScopedI18n } from "@/locales/client";

interface Phase5DeepReadingProps {
  article: Article;
  articleId: string;
  userId: string;
  locale: "en" | "th" | "cn" | "tw" | "vi";
  onCompleteChange: (complete: boolean) => void;
}

const Phase5DeepReading: React.FC<Phase5DeepReadingProps> = ({
  article,
  articleId,
  userId,
  locale,
  onCompleteChange,
}) => {
  const t = useScopedI18n("pages.student.lessonPage");

  return (
    <Card className="pb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Book />
          <div className="ml-2">{t("phase5Title")}</div>
        </CardTitle>
      </CardHeader>
      <div className="px-6">
        <span className="font-bold">{t("phase5Description")}</span>
      </div>
      <CardDescription className="px-6">
        <LessonSentensePreview
          article={article}
          articleId={articleId}
          userId={userId}
          targetLanguage={locale}
          phase="phase5"
          onCompleteChange={onCompleteChange}
        />
      </CardDescription>
    </Card>
  );
};

Phase5DeepReading.displayName = "Phase5DeepReading";
export default Phase5DeepReading;
