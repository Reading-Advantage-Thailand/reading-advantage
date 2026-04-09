"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Article } from "../models/article-model";
import { useCurrentLocale } from "@/locales/client";
import { useTimer } from "@/contexts/timer-context";
import {
  Phase1Introduction,
  Phase2VocabularyPreview,
  Phase3FirstReading,
  Phase4VocabularyCollection,
  Phase5DeepReading,
  Phase6SentenceCollection,
  Phase7MultipleChoice,
  Phase8ShortAnswer,
  Phase9VocabularyFlashcards,
  Phase10VocabularyMatching,
  Phase11SentenceFlashcards,
  Phase12SentenceActivities,
  Phase13LanguageQuestions,
  Phase14LessonSummary,
} from "./phases";
import LessonTimer from "./lesson-timer";
import PhaseList from "./phase-list";
import LessonNavButtons from "./lesson-nav-buttons";
import {
  buildLessonApiUrl,
  logLessonActivity,
  formatElapsedTime,
} from "./utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface LessonProgressBarProps {
  phases: string[];
  article: Article;
  articleId: string;
  userId: string;
  classroomId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const LessonProgressBar: React.FC<LessonProgressBarProps> = ({
  phases,
  article,
  articleId,
  userId,
  classroomId,
}) => {
  // ── Navigation state ───────────────────────────────────────────────────────
  const [currentPhase, setCurrentPhase] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [nextPhaseContent, setNextPhaseContent] = useState<number | null>(null);
  const [phaseLoading, setPhaseLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Refs so we can read current values in effects without stale closures
  const currentPhaseRef = useRef(currentPhase);
  const isTransitioningRef = useRef(isTransitioning);
  useEffect(() => { currentPhaseRef.current = currentPhase; }, [currentPhase]);
  useEffect(() => { isTransitioningRef.current = isTransitioning; }, [isTransitioning]);

  // ── Phase completion tracking ──────────────────────────────────────────────
  const [phaseCompletion, setPhaseCompletion] = useState<boolean[]>(
    Array(phases.length).fill(false)
  );
  const [shakeButton, setShakeButton] = useState(false);

  // ── Per-phase activity toggles ─────────────────────────────────────────────
  const [showVocabularyButton, setShowVocabularyButton] = useState(true);
  const [showSentenseButton, setShowSentenseButton] = useState(true);
  const [sentenceActivity, setSentenceActivity] = useState("none");

  // ── Sidebar accordion (mobile) ─────────────────────────────────────────────
  const [isExpanded, setIsExpanded] = useState(false);
  const [maxHeight, setMaxHeight] = useState("0px");
  const contentRef = useRef<HTMLDivElement>(null);

  // ── Timer ──────────────────────────────────────────────────────────────────
  const locale = useCurrentLocale() as "en" | "th" | "cn" | "tw" | "vi";
  const { elapsedTime, startTimer, stopTimer, setTimer } = useTimer();

  // ─────────────────────────────────────────────────────────────────────────
  // Initial fetch: restore current phase from server
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const fetchCurrentPhase = async () => {
      try {
        if (!isMounted) return;
        setPhaseLoading(true);

        const response = await fetch(
          `/api/v1/lesson/${userId}?articleId=${articleId}`
        );
        if (!isMounted) return;

        if (response.ok) {
          const phase = await response.json();
          const phaseNumber = parseInt(phase.currentPhase) || 1;
          const validPhase = Math.max(1, Math.min(phaseNumber, phases.length));
          if (isMounted) setCurrentPhase(validPhase);
          setTimer(phase.elapsedTime || 0);
          setInitialLoadComplete(true);
        } else {
          console.error("Failed to fetch current phase on initial load");
          if (isMounted) {
            setCurrentPhase(1);
            setInitialLoadComplete(true);
          }
        }
      } catch (error) {
        console.error("Error fetching current phase on initial load:", error);
        if (isMounted) {
          setCurrentPhase(1);
          setInitialLoadComplete(true);
        }
      } finally {
        if (isMounted) setPhaseLoading(false);
      }
    };

    if (!initialLoadComplete) {
      timeoutId = setTimeout(fetchCurrentPhase, 100);
    }

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [userId, articleId, setTimer, phases.length, initialLoadComplete]);

  // ─────────────────────────────────────────────────────────────────────────
  // Timer: run only during active phases (2–13)
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (currentPhase >= 2 && currentPhase < 14) {
      startTimer();
    } else {
      stopTimer();
    }
  }, [currentPhase, startTimer, stopTimer]);

  // ─────────────────────────────────────────────────────────────────────────
  // Sidebar accordion height
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (contentRef.current) {
      setMaxHeight(isExpanded ? `${contentRef.current.scrollHeight}px` : "0px");
    }
  }, [isExpanded]);

  // ─────────────────────────────────────────────────────────────────────────
  // Phase completion callback (memoised per-phase to avoid infinite fetches)
  // ─────────────────────────────────────────────────────────────────────────
  const updatePhaseCompletion = useCallback(
    (phaseIndex: number, isComplete: boolean) => {
      setPhaseCompletion((prev) => {
        const updated = [...prev];
        if (updated[phaseIndex] !== isComplete) {
          updated[phaseIndex] = isComplete;
          return updated;
        }
        return prev;
      });
    },
    []
  );

  const phaseCallbacks = useMemo(
    () =>
      Array.from({ length: phases.length + 1 }, (_, i) => (complete: boolean) =>
        updatePhaseCompletion(i, complete)
      ),
    [phases.length, updatePhaseCompletion]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Shared transition helper
  // ─────────────────────────────────────────────────────────────────────────

  /** Animate out → update server → animate in */
  const performTransition = async (
    newPhase: number,
    serverCall: () => Promise<Response>
  ): Promise<boolean> => {
    setFadeOut(true);
    setNextPhaseContent(newPhase);

    await new Promise((resolve) => setTimeout(resolve, 200));
    setPhaseLoading(true);

    const response = await serverCall();

    if (response.ok) {
      setCurrentPhase(newPhase);
      setPhaseLoading(false);
      await new Promise((resolve) => setTimeout(resolve, 50));
      setFadeOut(false);
      setNextPhaseContent(null);
      return true;
    }

    // Rollback animation on failure
    setFadeOut(false);
    setNextPhaseContent(null);
    setPhaseLoading(false);
    return false;
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Navigation handlers
  // ─────────────────────────────────────────────────────────────────────────

  const startLesson = async () => {
    if (phaseLoading || isTransitioning) return;
    setIsTransitioning(true);

    try {
      const url = buildLessonApiUrl(userId, articleId, classroomId);
      await performTransition(2, () =>
        fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phase: 1, status: 2, elapsedTime: 0 }),
        })
      );
    } catch (error) {
      console.error("Error starting lesson:", error);
      setFadeOut(false);
      setNextPhaseContent(null);
      setPhaseLoading(false);
    } finally {
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const nextPhase = async (phase: number, elapsed: number) => {
    if (!phaseCompletion[phase - 1]) {
      setShakeButton(true);
      setTimeout(() => setShakeButton(false), 500);
      return;
    }
    if (phaseLoading || isTransitioning) return;

    setIsTransitioning(true);
    try {
      const newPhase = phase + 1;

      // Log completion when leaving the last content phase
      if (phase === 13) {
        await logLessonActivity({ userId, article, elapsedTime: elapsed });
      }

      const url = buildLessonApiUrl(userId, articleId, classroomId);
      await performTransition(newPhase, () =>
        fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phase, status: 2, elapsedTime: elapsed }),
        })
      );
    } catch (error) {
      console.error("Error updating phase:", error);
      setFadeOut(false);
      setNextPhaseContent(null);
      setPhaseLoading(false);
    } finally {
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const previousPhase = async () => {
    if (currentPhase <= 2 || phaseLoading || isTransitioning) return;

    setIsTransitioning(true);
    try {
      const newPhase = currentPhase - 1;
      const url = buildLessonApiUrl(userId, articleId, classroomId);

      const ok = await performTransition(newPhase, () =>
        fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phase: newPhase,
            status: 1,
            elapsedTime,
          }),
        })
      );

      if (ok) {
        const updatedCompletion = [...phaseCompletion];
        updatedCompletion[currentPhase - 1] = false;
        setPhaseCompletion(updatedCompletion);
      }
    } catch (error) {
      console.error("Error going back to previous phase:", error);
      setFadeOut(false);
      setNextPhaseContent(null);
      setPhaseLoading(false);
    } finally {
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const skipPhase = async (phase: number) => {
    if (phase === 13) {
      await logLessonActivity({ userId, article, elapsedTime });
    }

    setCurrentPhase(phase + 1);

    const url = buildLessonApiUrl(userId, articleId, classroomId);
    await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phase, status: 2, elapsedTime }),
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Phase component renderer (switch kept here as it needs local state)
  // ─────────────────────────────────────────────────────────────────────────

  const getPhaseComponent = (phaseNum: number) => {
    switch (phaseNum) {
      case 1:
        return (
          <Phase1Introduction
            article={article}
            articleId={articleId}
            userId={userId}
            onCompleteChange={phaseCallbacks[0]}
          />
        );
      case 2:
        return (
          <Phase2VocabularyPreview
            article={article}
            articleId={articleId}
            userId={userId}
            onCompleteChange={phaseCallbacks[1]}
          />
        );
      case 3:
        return (
          <Phase3FirstReading
            article={article}
            articleId={articleId}
            userId={userId}
            locale={locale}
            onCompleteChange={phaseCallbacks[2]}
          />
        );
      case 4:
        return (
          <Phase4VocabularyCollection
            article={article}
            articleId={articleId}
            userId={userId}
            onCompleteChange={phaseCallbacks[3]}
          />
        );
      case 5:
        return (
          <Phase5DeepReading
            article={article}
            articleId={articleId}
            userId={userId}
            locale={locale}
            onCompleteChange={phaseCallbacks[4]}
          />
        );
      case 6:
        return (
          <Phase6SentenceCollection
            article={article}
            articleId={articleId}
            userId={userId}
            locale={locale}
            onCompleteChange={phaseCallbacks[5]}
          />
        );
      case 7:
        return (
          <Phase7MultipleChoice
            article={article}
            articleId={articleId}
            userId={userId}
            onCompleteChange={phaseCallbacks[6]}
          />
        );
      case 8:
        return (
          <Phase8ShortAnswer
            article={article}
            articleId={articleId}
            userId={userId}
            onCompleteChange={phaseCallbacks[7]}
          />
        );
      case 9:
        return showVocabularyButton ? (
          <Phase9VocabularyFlashcards
            articleId={articleId}
            userId={userId}
            showVocabularyButton={showVocabularyButton}
            setShowVocabularyButton={setShowVocabularyButton}
            onCompleteChange={phaseCallbacks[8]}
          />
        ) : null;
      case 10:
        return (
          <Phase10VocabularyMatching
            articleId={articleId}
            userId={userId}
            onCompleteChange={phaseCallbacks[9]}
          />
        );
      case 11:
        return (
          <Phase11SentenceFlashcards
            articleId={articleId}
            userId={userId}
            showSentenseButton={showSentenseButton}
            setShowSentenseButton={setShowSentenseButton}
            onCompleteChange={phaseCallbacks[10]}
          />
        );
      case 12:
        return (
          <Phase12SentenceActivities
            articleId={articleId}
            userId={userId}
            sentenceActivity={sentenceActivity}
            setSentenceActivity={setSentenceActivity}
            onCompleteChange={phaseCallbacks[11]}
          />
        );
      case 13:
        return (
          <Phase13LanguageQuestions
            article={article}
            onCompleteChange={phaseCallbacks[12]}
            skipPhase={() => skipPhase(currentPhase)}
          />
        );
      case 14:
        return (
          <Phase14LessonSummary
            articleId={articleId}
            userId={userId}
            elapsedTime={formatElapsedTime(elapsedTime)}
          />
        );
      default:
        return null;
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="xl:col-span-3">
        {phaseLoading && !fadeOut ? (
          /* Loading skeleton */
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-lg w-1/2" />
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Phase content */}
            <div
              className={`transition-all duration-300 ease-in-out transform ${
                fadeOut
                  ? "opacity-0 translate-y-4 scale-95"
                  : "opacity-100 translate-y-0 scale-100"
              }`}
            >
              {getPhaseComponent(currentPhase)}
            </div>

            {/* Navigation buttons */}
            <div
              className={`mt-6 transition-all duration-300 ease-in-out ${
                fadeOut ? "opacity-50 pointer-events-none" : "opacity-100"
              }`}
            >
              <LessonNavButtons
                currentPhase={currentPhase}
                totalPhases={phases.length}
                isLoading={phaseLoading}
                isTransitioning={isTransitioning}
                shakeButton={shakeButton}
                onStart={startLesson}
                onNext={() => nextPhase(currentPhase, elapsedTime)}
                onPrevious={previousPhase}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Sidebar: Progress Tracker ─────────────────────────────────────── */}
      <div className="xl:col-span-1">
        <div className="sticky top-6">
          <div className="bg-gray-200 dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
            {/* Progress header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
              <div className="flex items-center justify-between text-white">
                <div>
                  <h3 className="font-semibold">Progress</h3>
                  <p className="text-sm opacity-90">
                    Phase {currentPhase} of {phases.length}
                  </p>
                </div>
                {currentPhase >= 2 && currentPhase < 14 && (
                  <LessonTimer />
                )}
              </div>

              {/* Progress bar */}
              <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${(currentPhase / phases.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Phase list */}
            <PhaseList
              phases={phases}
              currentPhase={currentPhase}
              isExpanded={isExpanded}
              onToggleExpanded={() => setIsExpanded((v) => !v)}
              contentRef={contentRef}
              maxHeight={maxHeight}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

LessonProgressBar.displayName = "LessonProgressBar";
export default LessonProgressBar;
