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
    <Card className="pb-7 xl:h-[550px] w-full md:w-[725px] xl:w-[750px]">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Book />
          <div className="ml-2">{t("phase10Title")}</div>
        </CardTitle>
      </CardHeader>
      <div className="px-6">
        <span className="font-bold">{t("phase10Description")}</span>
      </div>
      <CardDescription className="px-6">
        <LessonMatchingWords
          userId={userId}
          articleId={articleId}
          onCompleteChange={onCompleteChange}
        />
      </CardDescription>
    </Card>
  );
};

Phase10VocabularyMatching.displayName = "Phase10VocabularyMatching";
export default Phase10VocabularyMatching;
