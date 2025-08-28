"use client";

import React, { useState, useEffect } from "react";
import { Article } from "../../models/article-model";
import { BookOpenText, EyeIcon, MessageSquareIcon, LightbulbIcon, PlayIcon, PauseIcon } from "lucide-react";
import { useScopedI18n } from "@/locales/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

interface Phase5DeepReadingProps {
  article: Article;
  articleId: string;
  userId: string;
  locale: "en" | "th" | "cn" | "tw" | "vi";
  onCompleteChange: (complete: boolean) => void;
}

const Phase5DeepReading: React.FC<Phase5DeepReadingProps> = ({
  article,
  articleId,
  userId,
  locale,
  onCompleteChange,
}) => {
  const t = useScopedI18n("pages.student.lessonPage");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSentence, setCurrentSentence] = useState(0);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [userNotes, setUserNotes] = useState("");
  const [readingTime, setReadingTime] = useState(0);

  const sentences = article.passage
    .split(/[.!?]+/)
    .filter(s => s.trim().length > 0)
    .map(s => s.trim() + '.');

  useEffect(() => {
    onCompleteChange(true);
  }, [onCompleteChange]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setReadingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSentenceClick = (index: number) => {
    setCurrentSentence(index);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getReadingInsights = () => [
    {
      type: "Main Theme",
      content: "This article explores the relationship between technology and society",
      icon: <LightbulbIcon className="h-4 w-4" />
    },
    {
      type: "Key Arguments",
      content: "The author presents three main arguments about digital transformation",
      icon: <MessageSquareIcon className="h-4 w-4" />
    },
    {
      type: "Writing Style",
      content: "Formal academic tone with supporting evidence and examples",
      icon: <EyeIcon className="h-4 w-4" />
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-cyan-950 dark:via-blue-950 dark:to-indigo-950 p-8 rounded-2xl border border-cyan-200 dark:border-cyan-800">
        <div className="inline-flex items-center justify-center p-3 bg-cyan-100 dark:bg-cyan-900 rounded-full mb-4">
          <BookOpenText className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t("phase5Title")}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {t("phase5Description")}
        </p>
      </div>

      {/* Reading Controls & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Reading Time</p>
              <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                {formatTime(readingTime)}
              </p>
            </div>
            <Button
              onClick={handlePlayPause}
              size="sm"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
            >
              {isPlaying ? (
                <PauseIcon className="h-4 w-4" />
              ) : (
                <PlayIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {Math.round(((currentSentence + 1) / sentences.length) * 100)}%
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              <EyeIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sentences</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {currentSentence + 1}/{sentences.length}
              </p>
            </div>
            <Button
              onClick={() => setShowAnalysis(!showAnalysis)}
              variant="outline"
              size="sm"
            >
              Analysis
            </Button>
          </div>
        </div>
      </div>

      {/* Main Reading Area */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-8">
          {/* Article Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            {article.title}
          </h2>

          {/* Sentence-by-sentence Reading */}
          <div className="space-y-4">
            {sentences.map((sentence, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-300 border-2 ${
                  currentSentence === index
                    ? 'border-cyan-400 bg-cyan-50 dark:bg-cyan-950 dark:border-cyan-600 shadow-lg transform scale-[1.02]'
                    : currentSentence > index
                    ? 'border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800 opacity-75'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => handleSentenceClick(index)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Badge 
                      variant={currentSentence >= index ? "default" : "outline"}
                      className={`${
                        currentSentence === index
                          ? 'bg-cyan-500 text-white'
                          : currentSentence > index
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </Badge>
                  </div>
                  <p className={`text-lg leading-relaxed ${
                    currentSentence === index
                      ? 'text-gray-900 dark:text-white font-medium'
                      : currentSentence > index
                      ? 'text-gray-600 dark:text-gray-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {sentence}
                  </p>
                </div>

                {/* Sentence Analysis (shown for current sentence) */}
                {currentSentence === index && showAnalysis && (
                  <div className="mt-4 p-3 bg-cyan-25 dark:bg-cyan-975 rounded-lg border-l-4 border-cyan-500">
                    <p className="text-sm text-cyan-800 dark:text-cyan-200">
                      <strong>Analysis:</strong> This sentence introduces the main concept and establishes the context for the following discussion.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => setCurrentSentence(Math.max(0, currentSentence - 1))}
              disabled={currentSentence === 0}
              variant="outline"
            >
              Previous Sentence
            </Button>
            <Button
              onClick={() => setCurrentSentence(Math.min(sentences.length - 1, currentSentence + 1))}
              disabled={currentSentence === sentences.length - 1}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
            >
              Next Sentence
            </Button>
          </div>
        </div>
      </div>

      {/* Reading Insights */}
      {showAnalysis && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Deep Reading Insights
          </h3>
          <div className="grid gap-4">
            {getReadingInsights().map((insight, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white dark:bg-gray-700 rounded-lg">
                    {insight.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {insight.type}
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      {insight.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Note-taking Area */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          📝 Your Reading Notes
        </h3>
        <Textarea
          placeholder="Write your thoughts, questions, or key insights from this reading..."
          value={userNotes}
          onChange={(e) => setUserNotes(e.target.value)}
          className="min-h-[120px] resize-none"
        />
        <div className="mt-3 flex justify-end">
          <Button
            size="sm"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
            disabled={!userNotes.trim()}
          >
            Save Notes
          </Button>
        </div>
      </div>

      {/* Deep Reading Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
          🎯 Deep Reading Strategies
        </h3>
        <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
            Focus on understanding each sentence before moving to the next
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
            Look for connections between ideas and main themes
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
            Take notes on important concepts and your personal insights
          </li>
        </ul>
      </div>
    </div>
  );
};

Phase5DeepReading.displayName = "Phase5DeepReading";
export default Phase5DeepReading;
