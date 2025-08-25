"use client";

import React from "react";
import LessonIntroduction from "../lesson-introduction";
import { Article } from "../../models/article-model";

interface Phase1IntroductionProps {
  article: Article;
  articleId: string;
  userId: string;
  onCompleteChange: (complete: boolean) => void;
}

const Phase1Introduction: React.FC<Phase1IntroductionProps> = ({
  article,
  articleId,
  userId,
  onCompleteChange,
}) => {
  return (
    <LessonIntroduction
      article={article}
      articleId={articleId}
      userId={userId}
      onCompleteChange={onCompleteChange}
    />
  );
};

Phase1Introduction.displayName = "Phase1Introduction";
export default Phase1Introduction;
