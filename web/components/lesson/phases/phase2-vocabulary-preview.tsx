"use client";

import React from "react";
import LessonWordList from "../lesson-vocabulary-preview";
import { Article } from "../../models/article-model";

interface Phase2VocabularyPreviewProps {
  article: Article;
  articleId: string;
  userId: string;
  onCompleteChange: (complete: boolean) => void;
}

const Phase2VocabularyPreview: React.FC<Phase2VocabularyPreviewProps> = ({
  article,
  articleId,
  userId,
  onCompleteChange,
}) => {
  return (
    <LessonWordList
      article={article}
      articleId={articleId}
      userId={userId}
      onCompleteChange={onCompleteChange}
    />
  );
};

Phase2VocabularyPreview.displayName = "Phase2VocabularyPreview";
export default Phase2VocabularyPreview;
