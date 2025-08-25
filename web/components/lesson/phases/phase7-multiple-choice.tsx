"use client";

import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import MCQuestionCard from "../../questions/mc-question-card";
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
    <Card className="pb-12 xl:h-[550px] w-full md:w-[725px] xl:w-[750px]">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Book />
          <div className="ml-2">{t("phase7Title")}</div>
        </CardTitle>
      </CardHeader>
      <div className="px-6">
        <span className="font-bold">{t("phase7Description")}</span>
      </div>
      <CardDescription className="px-6">
        <MCQuestionCard
          userId={userId}
          articleId={articleId}
          articleTitle={article.title}
          articleLevel={article.ra_level}
          page="lesson"
          onCompleteChange={onCompleteChange}
        />
      </CardDescription>
    </Card>
  );
};

Phase7MultipleChoice.displayName = "Phase7MultipleChoice";
export default Phase7MultipleChoice;
