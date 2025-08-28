"use client";

import React, { useState, useEffect } from "react";
import { Article } from "../../models/article-model";
import { Book, PlayIcon, PauseIcon, VolumeXIcon, Settings } from "lucide-react";
import { useScopedI18n } from "@/locales/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Phase3FirstReadingProps {
  article: Article;
  articleId: string;
  userId: string;
  locale: "en" | "th" | "cn" | "tw" | "vi";
  onCompleteChange: (complete: boolean) => void;
}

const Phase3FirstReading: React.FC<Phase3FirstReadingProps> = ({
  article,
  articleId,
  userId,
  locale,
  onCompleteChange,
}) => {
  const t = useScopedI18n("pages.student.lessonPage");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [readingSpeed, setReadingSpeed] = useState("1");
  const [highlightMode, setHighlightMode] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);

  const paragraphs = article.passage.split('\n').filter(p => p.trim());

  useEffect(() => {
    onCompleteChange(true);
  }, [onCompleteChange]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleParagraphClick = (index: number) => {
    setCurrentParagraph(index);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950 p-8 rounded-2xl border border-emerald-200 dark:border-emerald-800">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-100 dark:bg-emerald-900 rounded-full mb-4">
          <Book className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t("phase3Title")}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {t("phase3Description")}
        </p>
      </div>

      {/* Reading Controls */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-wrap items-center gap-6">
          {/* Play/Pause Button */}
          <Button
            onClick={handlePlayPause}
            size="lg"
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6"
          >
            {isPlaying ? (
              <PauseIcon className="h-5 w-5 mr-2" />
            ) : (
              <PlayIcon className="h-5 w-5 mr-2" />
            )}
            {isPlaying ? 'Pause Reading' : 'Start Reading'}
          </Button>

          {/* Reading Speed Control */}
          <div className="flex items-center gap-3">
            <Settings className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Speed:</span>
            <Select value={readingSpeed} onValueChange={setReadingSpeed}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">0.5x</SelectItem>
                <SelectItem value="0.75">0.75x</SelectItem>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="1.25">1.25x</SelectItem>
                <SelectItem value="1.5">1.5x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Highlight Toggle */}
          <Button
            variant={highlightMode ? "default" : "outline"}
            size="sm"
            onClick={() => setHighlightMode(!highlightMode)}
          >
            Highlight
          </Button>

          {/* Translation Toggle */}
          <Button
            variant={showTranslation ? "default" : "outline"}
            size="sm"
            onClick={() => setShowTranslation(!showTranslation)}
          >
            Translation
          </Button>
        </div>
      </div>

      {/* Reading Content */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-8">
          {/* Article Title */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            {article.title}
          </h2>

          {/* Reading Text */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {paragraphs.map((paragraph, index) => (
              <div
                key={index}
                className={`mb-6 p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                  currentParagraph === index && highlightMode
                    ? 'bg-emerald-50 dark:bg-emerald-950 border-l-4 border-emerald-500 shadow-sm'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                } ${
                  currentParagraph === index && isPlaying
                    ? 'ring-2 ring-emerald-400 dark:ring-emerald-600'
                    : ''
                }`}
                onClick={() => handleParagraphClick(index)}
              >
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-lg">
                  {paragraph}
                </p>
                
                {showTranslation && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-3 italic border-t border-gray-200 dark:border-gray-700 pt-3">
                    [Translation would appear here based on target language]
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-8 pb-6">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${((currentParagraph + 1) / paragraphs.length) * 100}%` 
              }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span>
              Paragraph {currentParagraph + 1} of {paragraphs.length}
            </span>
            <span>
              {Math.round(((currentParagraph + 1) / paragraphs.length) * 100)}% complete
            </span>
          </div>
        </div>
      </div>

      {/* Reading Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
          📚 First Reading Tips
        </h3>
        <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
            Read through the entire article to get the general idea
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
            Don't worry about understanding every word
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
            Focus on the main message and key points
          </li>
        </ul>
      </div>
    </div>
  );
};

Phase3FirstReading.displayName = "Phase3FirstReading";
export default Phase3FirstReading;
