"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useScopedI18n } from "@/locales/client";

interface LessonNavButtonsProps {
  currentPhase: number;
  totalPhases: number;
  isLoading: boolean;
  isTransitioning: boolean;
  shakeButton: boolean;
  onStart: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

/**
 * Renders the lesson navigation buttons:
 * - Phase 1     → "Start Lesson" button
 * - Phase 2–N-1 → "Previous" (if > 2) + "Next" buttons
 * - Phase N     → nothing (summary page)
 *
 * Extracted from LessonProgressBar to reduce its complexity.
 */
const LessonNavButtons: React.FC<LessonNavButtonsProps> = ({
  currentPhase,
  totalPhases,
  isLoading,
  isTransitioning,
  shakeButton,
  onStart,
  onNext,
  onPrevious,
}) => {
  const t = useScopedI18n("pages.student.lessonPage");
  const isDisabled = isLoading || isTransitioning;

  // ── Phase 1: Start button ────────────────────────────────────────────────
  if (currentPhase === 1) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <Button
          id="lesson-start-btn"
          size="lg"
          className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white py-4 px-6 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          onClick={onStart}
          disabled={isDisabled}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative flex items-center justify-center">
            {isDisabled ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3" />
                <span>Starting...</span>
              </>
            ) : (
              <>
                <span>{t("startLesson")}</span>
                <ArrowLeft className="h-5 w-5 ml-3 rotate-180 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </div>
        </Button>
      </div>
    );
  }

  // ── Phase 2 to N-1: Prev + Next ─────────────────────────────────────────
  if (currentPhase < totalPhases && currentPhase > 1) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex gap-4">
          {/* Back Button — only visible from phase 3 onward */}
          {currentPhase > 2 && (
            <Button
              id="lesson-prev-btn"
              variant="outline"
              size="lg"
              className="flex-1 group relative overflow-hidden border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-4 px-6 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              onClick={onPrevious}
              disabled={isDisabled}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-center">
                {isDisabled ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-400 border-t-transparent mr-3" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <ArrowLeft className="h-5 w-5 mr-3 transition-transform group-hover:-translate-x-1" />
                    <span>{t("previousPhase")}</span>
                  </>
                )}
              </div>
            </Button>
          )}

          {/* Next Button */}
          <Button
            id="lesson-next-btn"
            size="lg"
            className={`${currentPhase > 2 ? "flex-1" : "w-full"} group relative overflow-hidden bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 text-white py-4 px-6 text-base font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
              shakeButton ? "animate-shake" : ""
            }`}
            onClick={onNext}
            disabled={isDisabled}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center justify-center">
              {isDisabled ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{t("nextPhase")}</span>
                  <ArrowLeft className="h-5 w-5 ml-3 rotate-180 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </div>
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

LessonNavButtons.displayName = "LessonNavButtons";
export default LessonNavButtons;
