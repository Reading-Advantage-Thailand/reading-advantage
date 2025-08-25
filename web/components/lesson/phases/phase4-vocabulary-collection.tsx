"use client";

import React from "react";
import LessonWordCollection from "../lesson-vocabulary-collection";
import { Article } from "../../models/article-model";

interface Phase4VocabularyCollectionProps {
  article: Article;
  articleId: string;
  userId: string;
  onCompleteChange: (complete: boolean) => void;
}

const Phase4VocabularyCollection: React.FC<Phase4VocabularyCollectionProps> = ({
  article,
  articleId,
  userId,
  onCompleteChange,
}) => {
  return (
    <LessonWordCollection
      article={article}
      articleId={articleId}
      userId={userId}
      onCompleteChange={onCompleteChange}
    />
  );
};

Phase4VocabularyCollection.displayName = "Phase4VocabularyCollection";
export default Phase4VocabularyCollection;
