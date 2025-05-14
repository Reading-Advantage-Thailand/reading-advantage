"use client";

import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { Sentence } from "./lesson-sentense-flash-card";

interface LessonSummaryProps {
  quizPerformance: string;
  articleId: string;
  userId: string;
  elapsedTime: string;
}

interface WordList {
  vocabulary: string;
  definition: {
    en: string;
    th: string;
    cn: string;
    tw: string;
    vi: string;
  };
  index: number;
  startTime: number;
  endTime: number;
  audioUrl: string;
}

const LessonSummary: React.FC<LessonSummaryProps> = ({
  quizPerformance,
  articleId,
  userId,
  elapsedTime,
}) => {
  const [loading, setLoading] = useState(false);
  const [wordList, setWordList] = useState<WordList[]>([]);
  const [sentenceList, setSentenceList] = useState<Sentence[]>([]);
  const [totalXp, setTotalXp] = useState(0);

  const fetchWordList = async () => {
    try {
      const res = await fetch(
        `/api/v1/users/wordlist/${userId}?articleId=${articleId}`
      );
      const data = await res.json();
      if (!Array.isArray(data.word)) throw new Error("Invalid word list");
      const extractedWords = data.word.map((entry: any) => entry.word);
      setWordList(extractedWords);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Something went wrong.",
        description: error?.message || "Unknown error",
        variant: "destructive",
      });
    }
  };

  const fetchSentence = async () => {
    try {
      const res = await fetch(
        `/api/v1/users/sentences/${userId}?articleId=${articleId}`
      );
      const data = await res.json();
      setSentenceList(data.sentences);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Something went wrong.",
        description: error?.message || "Unknown error",
        variant: "destructive",
      });
    }
  };

  const fetchXp = async () => {
    try {
      const res = await fetch(`/api/v1/xp/${userId}?articleId=${articleId}`);
      const data = await res.json();
      setTotalXp(data.total_xp);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Something went wrong.",
        description: error?.message || "Unknown error",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      if (!userId || !articleId) return;
      try {
        setLoading(true);
        await Promise.all([fetchWordList(), fetchSentence(), fetchXp()]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [articleId, userId]);

  return (
    <div className="lesson-summary max-w-screen-xl mx-auto   w-full md:w-[700px] lg:w-[550px] xl:w-[660px] p-5">
      {loading ? (
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mx-auto animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto animate-pulse"></div>
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-center text-green-600 dark:text-green-400 mb-4">
            🎉 Congratulations! 🎉
          </h1>
          <p className="text-lg text-center mb-6 text-gray-800 dark:text-gray-200">
            You’ve completed the lesson. Here’s what you achieved:
          </p>

          <ul className="space-y-3 text-gray-800 dark:text-gray-100">
            <li>
              <strong className="text-green-500 dark:text-green-300">
                🌟 Words Saved:
              </strong>{" "}
              {wordList.length}
              <ul className="mt-3">
                <div className="flex flex-wrap gap-4 justify-center">
                  {wordList.map((word, index) => (
                    <div
                      key={index}
                      className="shadow-md rounded-lg py-2 px-4 text-center bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <strong className="text-green-600 dark:text-green-300">
                        {word.vocabulary}
                      </strong>
                    </div>
                  ))}
                </div>
              </ul>
            </li>
            <li>
              <strong className="text-blue-500 dark:text-blue-300">
                📘 Sentences Saved:
              </strong>{" "}
              {sentenceList.length}
              <ul className="mt-3 space-y-2">
                {sentenceList.map((sentence, index) => (
                  <li
                    key={index}
                    className="bg-white dark:bg-gray-800 shadow-md rounded-lg py-2 px-4 text-center"
                  >
                    <strong className="text-blue-600 dark:text-blue-300">
                      {sentence.sentence}
                    </strong>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <strong className="text-purple-500 dark:text-purple-300">
                📊 Quiz Performance:
              </strong>{" "}
              {quizPerformance}
            </li>
            <li>
              <strong className="text-orange-500 dark:text-orange-300">
                ⏱️ Time Taken:
              </strong>{" "}
              {elapsedTime}
            </li>
            <li>
              <strong className="text-yellow-500 dark:text-yellow-300">
                🏆 XP Earned:
              </strong>{" "}
              {totalXp}
            </li>
          </ul>
        </>
      )}
    </div>
  );
};

export default LessonSummary;
