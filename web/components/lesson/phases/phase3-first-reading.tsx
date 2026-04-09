"use client";

import React, { useEffect, useMemo } from "react";
import { Article } from "../../models/article-model";
import {
  Book,
  PlayIcon,
  PauseIcon,
  VolumeXIcon,
  Settings,
  RotateCcwIcon,
} from "lucide-react";
import { useScopedI18n } from "@/locales/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useArticleAudio } from "../hooks/useArticleAudio";
import { groupSentencesIntoParagraphs } from "../utils";
import type { TimePoint } from "../types";

// ─────────────────────────────────────────────────────────────────────────────

interface Phase3FirstReadingProps {
  article: Article;
  articleId: string;
  userId: string;
  locale: "en" | "th" | "cn" | "tw" | "vi";
  onCompleteChange: (complete: boolean) => void;
}

// ─────────────────────────────────────────────────────────────────────────────

const Phase3FirstReading: React.FC<Phase3FirstReadingProps> = ({
  article,
  articleId,
  userId,
  locale,
  onCompleteChange,
}) => {
  const t = useScopedI18n("pages.student.lessonPage");

  // ── Derived article data ─────────────────────────────────────────────────
  const timepoints = useMemo<TimePoint[]>(
    () => ((article as any).timepoints as TimePoint[]) || [],
    [article]
  );
  const sentences = useMemo(
    () => timepoints.map((tp) => tp.sentences),
    [timepoints]
  );
  const paragraphs = article.passage.split("\n").filter((p) => p.trim());

  // ── Audio hook ───────────────────────────────────────────────────────────
  const {
    isAudioLoaded,
    isLoadingAudio,
    audioLoadProgress,
    audioLoadError,
    isPlaying,
    currentSentence,
    retryAudioLoad,
    handlePlayPause,
    handleSentenceClick,
    readingSpeed,
    setReadingSpeed,
    highlightMode,
    setHighlightMode,
    hasCompletedReading,
    resetReadingProgress,
    sentenceRefs,
  } = useArticleAudio({ article, articleId, timepoints, sentences }, userId);

  // ── Notify parent on completion change ────────────────────────────────────
  useEffect(() => {
    if (sentences.length === 0) {
      onCompleteChange(true);
      return;
    }
    onCompleteChange(hasCompletedReading);
  }, [onCompleteChange, hasCompletedReading, sentences.length]);

  // ── Paragraph grouping ────────────────────────────────────────────────────
  const paragraphGroups = useMemo(
    () => groupSentencesIntoParagraphs(sentences),
    [sentences]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4 bg-gradient-to-br from-emerald-300 via-teal-300 to-cyan-300 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950 p-8 rounded-2xl border border-emerald-200 dark:border-emerald-800">
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

      {/* Audio loading status */}
      {isLoadingAudio && !audioLoadError && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
            <span className="text-blue-800 dark:text-blue-200 font-medium">
              Loading audio... {Math.round(audioLoadProgress)}%
            </span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${audioLoadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Audio loading error */}
      {audioLoadError && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <VolumeXIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-red-800 dark:text-red-200 font-medium">
                {audioLoadError}
              </p>
            </div>
            <Button
              onClick={retryAudioLoad}
              size="sm"
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900"
            >
              <RotateCcwIcon className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Reading controls */}
      <div className="bg-zinc-200 dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-wrap items-center gap-6">
          {/* Play / Pause */}
          <Button
            onClick={handlePlayPause}
            size="lg"
            disabled={!isAudioLoaded}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlaying ? (
              <PauseIcon className="h-5 w-5 mr-2" />
            ) : (
              <PlayIcon className="h-5 w-5 mr-2" />
            )}
            {isPlaying
              ? t("pauseReading")
              : isAudioLoaded
                ? t("startReading")
                : t("loadingAudio")}
          </Button>

          {/* Speed */}
          <div className="flex items-center gap-3">
            <Settings className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t("speed")}
            </span>
            <Select value={readingSpeed} onValueChange={setReadingSpeed}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["0.5", "0.75", "1", "1.25", "1.5", "2"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}x
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Highlight toggle */}
          <Button
            variant={highlightMode ? "default" : "outline"}
            size="sm"
            onClick={() => setHighlightMode(!highlightMode)}
            className={highlightMode ? "bg-yellow-500 hover:bg-yellow-600" : ""}
          >
            {highlightMode ? "🔆" : "🔅"} {t("highlight")}{" "}
            {highlightMode ? t("on") : t("off")}
          </Button>

          {/* Reset */}
          {hasCompletedReading && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetReadingProgress}
              className="text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400"
            >
              <RotateCcwIcon className="h-4 w-4 mr-1" />
              {t("listenAgain")}
            </Button>
          )}
        </div>
      </div>

      {/* Reading content */}
      <div className="bg-zinc-200 dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden relative">
        <div className="p-4 sm:p-8 lg:p-12 max-w-none">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 lg:mb-12 text-center leading-tight font-serif tracking-normal sm:tracking-wide">
            {article.title}
          </h2>

          <div className="text-gray-800 dark:text-gray-200">
            {sentences.length > 0 ? (
              <div className="space-y-4 sm:space-y-6 leading-relaxed">
                {paragraphGroups.map((sentenceGroup, groupIndex) => (
                  <div key={`paragraph-${groupIndex}`} className="mb-4 sm:mb-6 no-select">
                    <p
                      className={`text-justify leading-relaxed sm:leading-loose text-base sm:text-lg font-serif tracking-normal sm:tracking-wide ${
                        groupIndex === 0
                          ? "first-letter:text-4xl sm:first-letter:text-6xl lg:first-letter:text-7xl first-letter:font-bold first-letter:float-left first-letter:mr-1 sm:first-letter:mr-2 first-letter:mt-0 first-letter:leading-[0.8] first-letter:text-emerald-600 dark:first-letter:text-emerald-400 pl-2 sm:pl-4"
                          : "indent-4 sm:indent-8"
                      }`}
                    >
                      {sentenceGroup.map((sentenceIndex, posInGroup) => {
                        const sentence = sentences[sentenceIndex];
                        const isCurrentSentence =
                          isPlaying && highlightMode && sentenceIndex === currentSentence;
                        return (
                          <span key={`sentence-${sentenceIndex}`}>
                            <span
                              className={`transition-all duration-300 cursor-pointer relative inline ${
                                isCurrentSentence
                                  ? "bg-yellow-200 dark:bg-yellow-600 text-yellow-900 dark:text-yellow-100 shadow-md rounded-md px-1.5 py-0.5 font-medium"
                                  : "hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm px-1 py-0.5"
                              }`}
                              ref={(el) => { sentenceRefs.current[sentenceIndex] = el; }}
                              onClick={() => handleSentenceClick(sentenceIndex)}
                            >
                              {sentence.trim()}
                            </span>
                            {posInGroup < sentenceGroup.length - 1 && " "}
                          </span>
                        );
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              /* Fallback: no timepoints */
              <div className="space-y-4 sm:space-y-8">
                {paragraphs.map((paragraph, i) => (
                  <p
                    key={i}
                    className={`text-gray-800 dark:text-gray-200 leading-relaxed sm:leading-loose text-base sm:text-lg font-serif text-justify tracking-normal sm:tracking-wide ${
                      i === 0
                        ? "first-letter:text-4xl sm:first-letter:text-6xl lg:first-letter:text-7xl first-letter:font-bold first-letter:float-left first-letter:mr-1 sm:first-letter:mr-3 first-letter:mt-1 first-letter:leading-none first-letter:text-emerald-600 dark:first-letter:text-emerald-400"
                        : ""
                    }`}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reading progress bar */}
        <div className="px-4 sm:px-8 pb-4 sm:pb-6">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                hasCompletedReading
                  ? "bg-gradient-to-r from-green-500 to-emerald-600"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600"
              }`}
              style={{
                width: `${
                  sentences.length > 0
                    ? hasCompletedReading
                      ? 100
                      : ((currentSentence + 1) / sentences.length) * 100
                    : 0
                }%`,
              }}
            />
          </div>
          <div className="flex justify-between items-center mt-3 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <span className={`font-medium ${hasCompletedReading ? "text-green-600 dark:text-green-400" : ""}`}>
              {t("sentenceProgress", {
                current: hasCompletedReading
                  ? sentences.length
                  : Math.min(currentSentence + 1, sentences.length),
                total: sentences.length,
              })}
            </span>
            <span className={`font-medium flex items-center gap-1 ${hasCompletedReading ? "text-green-600 dark:text-green-400" : ""}`}>
              {sentences.length > 0
                ? hasCompletedReading
                  ? 100
                  : Math.round(((currentSentence + 1) / sentences.length) * 100)
                : 0}
              {t("percentComplete")}
              {hasCompletedReading && <span className="text-green-500">🎉</span>}
            </span>
          </div>
        </div>
      </div>

      {/* Reading tips */}
      <div className="bg-gradient-to-r from-blue-300 to-indigo-300 dark:from-blue-950 dark:to-indigo-950 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
          {t("firstReadingTips")}
        </h3>
        <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
          {[
            "readEntireArticle",
            "clickStartReading",
            "clickSentenceJump",
            "useHighlightMode",
            "listenCompleteAudio",
          ].map((key) => (
            <li key={key} className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
              {t(key as any)}
            </li>
          ))}
        </ul>
      </div>

      {/* Completion status */}
      {sentences.length > 0 && (
        <div
          className={`p-4 rounded-xl border transition-all duration-500 ${
            hasCompletedReading
              ? "bg-gradient-to-r from-green-300 to-emerald-300 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800"
              : "bg-gradient-to-r from-orange-300 to-yellow-300 dark:from-orange-950 dark:to-yellow-950 border-orange-200 dark:border-orange-800"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                hasCompletedReading ? "bg-green-500 animate-pulse" : "bg-orange-500"
              }`}
            />
            <span
              className={`font-medium ${
                hasCompletedReading
                  ? "text-green-800 dark:text-green-200"
                  : "text-orange-800 dark:text-orange-200"
              }`}
            >
              {hasCompletedReading ? t("readingCompleted") : t("listenToUnlock")}
            </span>
          </div>
          {hasCompletedReading && (
            <div className="mt-2 text-xs text-green-600 dark:text-green-400">
              {t("progressAutoSaved")}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

Phase3FirstReading.displayName = "Phase3FirstReading";
export default Phase3FirstReading;
