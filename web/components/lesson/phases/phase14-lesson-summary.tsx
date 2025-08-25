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
    <Card className="pb-7 w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Book />
          <div className="ml-2">{t("phase14Title")}</div>
        </CardTitle>
      </CardHeader>
      <CardDescription className="px-6">
        <LessonSummary
          articleId={articleId}
          userId={userId}
          elapsedTime={elapsedTime}
        />
      </CardDescription>
    </Card>
  );
};

Phase14LessonSummary.displayName = "Phase14LessonSummary";
export default Phase14LessonSummary;
