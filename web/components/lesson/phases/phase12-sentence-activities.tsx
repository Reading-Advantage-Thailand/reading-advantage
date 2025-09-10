"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LessonOrderSentences from "../lesson-order-sentence";
import LessonClozeTest from "../lesson-cloze-test";
import LessonOrderWords from "../lesson-order-word";
import LessonMatching from "../lesson-matching-word";
import {
  Book,
  ListOrdered,
  FileText,
  Shuffle,
  GitBranch,
  ArrowRight,
} from "lucide-react";
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-4 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950 dark:via-amber-950 dark:to-yellow-950 p-8 rounded-2xl border border-orange-200 dark:border-orange-800">
          <div className="inline-flex items-center justify-center p-3 bg-orange-100 dark:bg-orange-900 rounded-full mb-4">
            <Book className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t("phase12Title")}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t("phase12Description")}
          </p>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Sentences */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
              <ListOrdered className="h-16 w-16" />
            </div>
            <div className="relative p-6 h-full flex flex-col">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full mr-4">
                  <ListOrdered className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {tb("orderSentences")}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow">
                {tb("orderSentencesPractice.orderSentencesDescription")}
              </p>
              <Button
                onClick={() => setSentenceActivity("order-sentences")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white group-hover:bg-blue-700 transition-all duration-300"
              >
                <span className="flex items-center justify-center">
                  {tb("orderSentencesPractice.orderSentences")}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            </div>
          </div>

          {/* Cloze Test */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-950 border border-green-200 dark:border-green-800 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
              <FileText className="h-16 w-16" />
            </div>
            <div className="relative p-6 h-full flex flex-col">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full mr-4">
                  <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {tb("clozeTest")}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow">
                {tb("clozeTestPractice.clozeTestDescription")}
              </p>
              <Button
                onClick={() => setSentenceActivity("cloze-test")}
                className="w-full bg-green-600 hover:bg-green-700 text-white group-hover:bg-green-700 transition-all duration-300"
              >
                <span className="flex items-center justify-center">
                  {tb("clozeTestPractice.clozeTest")}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            </div>
          </div>

          {/* Order Words */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950 dark:to-violet-950 border border-purple-200 dark:border-purple-800 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
              <Shuffle className="h-16 w-16" />
            </div>
            <div className="relative p-6 h-full flex flex-col">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full mr-4">
                  <Shuffle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {tb("orderWords")}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow">
                {tb("orderWordsPractice.orderWordsDescription")}
              </p>
              <Button
                onClick={() => setSentenceActivity("order-words")}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white group-hover:bg-purple-700 transition-all duration-300"
              >
                <span className="flex items-center justify-center">
                  {tb("orderWordsPractice.orderWords")}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            </div>
          </div>

          {/* Matching */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-950 dark:to-pink-950 border border-rose-200 dark:border-rose-800 transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
              <GitBranch className="h-16 w-16" />
            </div>
            <div className="relative p-6 h-full flex flex-col">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-rose-100 dark:bg-rose-900 rounded-full mr-4">
                  <GitBranch className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {tb("matching")}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 flex-grow">
                {tb("matchingPractice.matchingDescription")}
              </p>
              <Button
                onClick={() => setSentenceActivity("matching")}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white group-hover:bg-rose-700 transition-all duration-300"
              >
                <span className="flex items-center justify-center">
                  {tb("matchingPractice.matching")}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Order Sentences Activity
  if (sentenceActivity === "order-sentences") {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-4 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950 dark:via-amber-950 dark:to-yellow-950 p-8 rounded-2xl border border-orange-200 dark:border-orange-800">
          <div className="inline-flex items-center justify-center p-3 bg-orange-100 dark:bg-orange-900 rounded-full mb-4">
            <Book className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {tb("orderSentencesPractice.orderSentences")}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {tb("orderSentencesPractice.orderSentencesDescription")}
          </p>
        </div>

        {/* Order Sentences Component */}

        <LessonOrderSentences
          articleId={articleId}
          userId={userId}
          onCompleteChange={onCompleteChange}
        />
      </div>
    );
  }

  // Cloze Test Activity
  if (sentenceActivity === "cloze-test") {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-4 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950 dark:via-amber-950 dark:to-yellow-950 p-8 rounded-2xl border border-orange-200 dark:border-orange-800">
          <div className="inline-flex items-center justify-center p-3 bg-orange-100 dark:bg-orange-900 rounded-full mb-4">
            <Book className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {tb("clozeTest")}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {tb("clozeTestPractice.clozeTestDescription")}
          </p>
        </div>

        {/* Cloze Test Component */}
        <LessonClozeTest
          articleId={articleId}
          userId={userId}
          onCompleteChange={onCompleteChange}
        />
      </div>
    );
  }

  // Order Words Activity
  if (sentenceActivity === "order-words") {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-4 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950 dark:via-amber-950 dark:to-yellow-950 p-8 rounded-2xl border border-orange-200 dark:border-orange-800">
          <div className="inline-flex items-center justify-center p-3 bg-orange-100 dark:bg-orange-900 rounded-full mb-4">
            <Book className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {tb("orderWords")}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {tb("orderWordsPractice.orderWordsDescription")}
          </p>
        </div>

        {/* Order Words Component */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6">
            <LessonOrderWords
              articleId={articleId}
              userId={userId}
              onCompleteChange={onCompleteChange}
            />
          </div>
        </div>
      </div>
    );
  }

  // Matching Activity
  if (sentenceActivity === "matching") {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-4 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-orange-950 dark:via-amber-950 dark:to-yellow-950 p-8 rounded-2xl border border-orange-200 dark:border-orange-800">
          <div className="inline-flex items-center justify-center p-3 bg-orange-100 dark:bg-orange-900 rounded-full mb-4">
            <Book className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {tb("matching")}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {tb("matchingPractice.matchingDescription")}
          </p>
        </div>

        {/* Matching Component */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6">
            <LessonMatching
              articleId={articleId}
              userId={userId}
              onCompleteChange={onCompleteChange}
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

Phase12SentenceActivities.displayName = "Phase12SentenceActivities";
export default Phase12SentenceActivities;
