"use client";

import React from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SAQuestionCard from "../../questions/sa-question-card";
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
    <Card className="pb-7 xl:h-[550px] w-full md:w-[725px] xl:w-[750px]">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Book />
          <div className="ml-2">{t("phase8Title")}</div>
        </CardTitle>
      </CardHeader>
      <div className="px-6">
        <span className="font-bold">{t("phase8Description")}</span>
      </div>
      <CardDescription className="px-6">
        <SAQuestionCard
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

Phase8ShortAnswer.displayName = "Phase8ShortAnswer";
export default Phase8ShortAnswer;
