"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LessonOrderSentences from "../lesson-order-sentence";
import LessonClozeTest from "../lesson-cloze-test";
import LessonOrderWords from "../lesson-order-word";
import LessonMatching from "../lesson-matching-word";
import { Book } from "lucide-react";
import { useScopedI18n } from "@/locales/client";

interface Phase12SentenceActivitiesProps {
  userId: string;
  articleId: string;
  sentenceActivity: string;
  setSentenceActivity: (activity: string) => void;
  onCompleteChange: (complete: boolean) => void;
}

const Phase12SentenceActivities: React.FC<Phase12SentenceActivitiesProps> = ({
  userId,
  articleId,
  sentenceActivity,
  setSentenceActivity,
  onCompleteChange,
}) => {
  const t = useScopedI18n("pages.student.lessonPage");
  const tb = useScopedI18n("pages.student.practicePage");

  // Activity Selection Screen
  if (sentenceActivity === "none") {
    return (
      <Card className="pb-7 w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Book />
            <div className="ml-2">{t("phase12Title")}</div>
          </CardTitle>
        </CardHeader>

        <div className="px-6">
          <span className="font-bold">{t("phase12Description")}</span>
        </div>

        <CardContent className="px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Order Sentences */}
            <Card className="pb-4">
              <CardHeader>
                <CardTitle>{tb("orderSentences")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  {tb("orderSentencesPractice.orderSentencesDescription")}
                </p>
              </CardContent>
              <div className="flex justify-end items-end pr-4">
                <Button onClick={() => setSentenceActivity("order-sentences")}>
                  {tb("orderSentencesPractice.orderSentences")}
                </Button>
              </div>
            </Card>

            {/* Cloze Test */}
            <Card className="pb-4">
              <CardHeader>
                <CardTitle>{tb("clozeTest")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  {tb("clozeTestPractice.clozeTestDescription")}
                </p>
              </CardContent>
              <div className="flex justify-end items-end pr-4">
                <Button onClick={() => setSentenceActivity("cloze-test")}>
                  {tb("clozeTestPractice.clozeTest")}
                </Button>
              </div>
            </Card>

            {/* Order Words */}
            <Card className="pb-4">
              <CardHeader>
                <CardTitle>{tb("orderWords")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  {tb("orderWordsPractice.orderWordsDescription")}
                </p>
              </CardContent>
              <div className="flex justify-end items-end pr-4">
                <Button onClick={() => setSentenceActivity("order-words")}>
                  {tb("orderWordsPractice.orderWords")}
                </Button>
              </div>
            </Card>

            {/* Matching */}
            <Card className="pb-4">
              <CardHeader>
                <CardTitle>{tb("matching")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  {tb("matchingPractice.matchingDescription")}
                </p>
              </CardContent>
              <div className="flex justify-end items-end pr-4">
                <Button onClick={() => setSentenceActivity("matching")}>
                  {tb("matchingPractice.matching")}
                </Button>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Order Sentences Activity
  if (sentenceActivity === "order-sentences") {
    return (
      <Card className="pb-7 w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Book />
            <div className="ml-2">
              {tb("orderSentencesPractice.orderSentences")}
            </div>
          </CardTitle>
        </CardHeader>
        <div className="px-6">
          <span className="font-bold">
            {tb("orderSentencesPractice.orderSentencesDescription")}
          </span>
        </div>
        <LessonOrderSentences
          articleId={articleId}
          userId={userId}
          onCompleteChange={onCompleteChange}
        />
      </Card>
    );
  }

  // Cloze Test Activity
  if (sentenceActivity === "cloze-test") {
    return (
      <Card className="pb-7 w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Book />
            <div className="ml-2">{tb("clozeTest")}</div>
          </CardTitle>
        </CardHeader>
        <div className="px-6">
          <span className="font-bold">
            {tb("clozeTestPractice.clozeTestDescription")}
          </span>
        </div>
        <LessonClozeTest
          articleId={articleId}
          userId={userId}
          onCompleteChange={onCompleteChange}
        />
      </Card>
    );
  }

  // Order Words Activity
  if (sentenceActivity === "order-words") {
    return (
      <Card className="pb-7 w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Book />
            <div className="ml-2">{tb("orderWords")}</div>
          </CardTitle>
        </CardHeader>
        <div className="px-6">
          <span className="font-bold">
            {tb("orderWordsPractice.orderWordsDescription")}
          </span>
        </div>
        <LessonOrderWords
          articleId={articleId}
          userId={userId}
          onCompleteChange={onCompleteChange}
        />
      </Card>
    );
  }

  // Matching Activity
  if (sentenceActivity === "matching") {
    return (
      <Card className="pb-7 w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Book />
            <div className="ml-2">{tb("matching")}</div>
          </CardTitle>
        </CardHeader>
        <div className="px-6">
          <span className="font-bold">
            {tb("matchingPractice.matchingDescription")}
          </span>
        </div>
        <LessonMatching
          articleId={articleId}
          userId={userId}
          onCompleteChange={onCompleteChange}
        />
      </Card>
    );
  }

  return null;
};

Phase12SentenceActivities.displayName = "Phase12SentenceActivities";
export default Phase12SentenceActivities;
