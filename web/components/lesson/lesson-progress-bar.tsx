"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Article } from "../models/article-model";
import { Timer } from "lucide-react";
import { useScopedI18n, useCurrentLocale } from "@/locales/client";
import { useTimer } from "@/contexts/timer-context";
import {
  ActivityType,
  ActivityStatus,
} from "../models/user-activity-log-model";
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

interface LessonProgressBar {
  phases: string[];
  article: Article;
  articleId: string;
  userId: string;
  classroomId?: string;
}

const LessonProgressBar: React.FC<LessonProgressBar> = ({
  phases,
  article,
  articleId,
  userId,
  classroomId,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [maxHeight, setMaxHeight] = useState("0px");
  const contentRef = useRef<HTMLDivElement>(null);
  const [currentPhase, setCurrentPhase] = useState(1);
  const t = useScopedI18n("pages.student.lessonPage");
  const locale = useCurrentLocale() as "en" | "th" | "cn" | "tw" | "vi";
  const [showVocabularyButton, setShowVocabularyButton] = useState(true);
  const [showSentenseButton, setShowSentenseButton] = useState(true);
  const [sentenceActivity, setSentenceActivity] = useState("none");
  const [phaseCompletion, setPhaseCompletion] = useState<boolean[]>(
    Array(phases.length).fill(false)
  );
  const [shakeButton, setShakeButton] = useState(false);
  const { elapsedTime, startTimer, stopTimer, setTimer } = useTimer();
  const [phaseLoading, setPhaseLoading] = useState(true);

  {
    /* Track Lesson Progress */
  }
  useEffect(() => {
    const fetchCurrentPhase = async () => {
      try {
        setPhaseLoading(true);
        const response = await fetch(
          `/api/v1/lesson/${userId}?articleId=${articleId}`
        );
        const phase = await response.json();
        setCurrentPhase(phase.currentPhase);
        setTimer(phase.elapsedTime);
      } catch (error) {
        console.error("Error fetching current phase:", error);
      } finally {
        setPhaseLoading(false);
      }
    };

    fetchCurrentPhase();
  }, [userId, articleId]);

  const LessonTimer = React.memo(() => {
    const { elapsedTime } = useTimer();

    return (
      <div className="mr-5">
        <span className="text-sm">
          {`${Math.floor(elapsedTime / 60)}m ${elapsedTime % 60}s`}
        </span>
      </div>
    );
  });
  LessonTimer.displayName = "LessonTimer";

  const updatePhaseCompletion = (phaseIndex: number, isComplete: boolean) => {
    setPhaseCompletion((prev) => {
      const updated = [...prev];
      updated[phaseIndex] = isComplete;
      return updated;
    });
  };

  useEffect(() => {
    if (currentPhase >= 2 && currentPhase < 14) {
      startTimer();
    } else {
      stopTimer();
    }
  }, [currentPhase]);

  useEffect(() => {
    const logActivity = async () => {
      if (currentPhase === 14) {
        await fetch(`/api/v1/users/${userId}/activitylog`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            articleId: article.id,
            activityType: ActivityType.LessonRead,
            activityStatus: ActivityStatus.Completed,
            timeTaken: elapsedTime,
            details: {
              title: article.title,
              level: article.ra_level,
              cefr_level: article.cefr_level,
              type: article.type,
              genre: article.genre,
              subgenre: article.subgenre,
            },
          }),
        });
      }
    };

    logActivity();
  }, [currentPhase]);

  const startLesson = async () => {
    setCurrentPhase(currentPhase + 1);
    const url = classroomId
      ? `/api/v1/lesson/${userId}?articleId=${articleId}&classroomId=${classroomId}`
      : `/api/v1/lesson/${userId}?articleId=${articleId}`;

    await fetch(url, {
      method: "POST",
    });
  };

  const nextPhase = async (Phase: number, elapsedTime: number) => {
    if (Phase === 13) {
      await fetch(`/api/v1/users/${userId}/activitylog`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: article.id,
          activityType: ActivityType.LessonRead,
          activityStatus: ActivityStatus.Completed,
          timeTaken: elapsedTime,
          details: {
            title: article.title,
            level: article.ra_level,
            cefr_level: article.cefr_level,
            type: article.type,
            genre: article.genre,
            subgenre: article.subgenre,
          },
        }),
      });
    }
    if (!phaseCompletion[Phase - 1]) {
      setShakeButton(true);
      setTimeout(() => setShakeButton(false), 500);
      return;
    }
    setCurrentPhase(Phase + 1);

    const url = classroomId
      ? `/api/v1/lesson/${userId}?articleId=${articleId}&classroomId=${classroomId}`
      : `/api/v1/lesson/${userId}?articleId=${articleId}`;

    await fetch(url, {
      method: "PUT",
      body: JSON.stringify({
        phase: Phase,
        status: 2,
        elapsedTime: elapsedTime,
      }),
    });
  };

  const skipPhase = async (Phase: number) => {
    if (Phase === 13) {
      await fetch(`/api/v1/users/${userId}/activitylog`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: article.id,
          activityType: ActivityType.LessonRead,
          activityStatus: ActivityStatus.Completed,
          timeTaken: elapsedTime,
          details: {
            title: article.title,
            level: article.ra_level,
            cefr_level: article.cefr_level,
            type: article.type,
            genre: article.genre,
            subgenre: article.subgenre,
          },
        }),
      });
    }
    setCurrentPhase(Phase + 1);

    const url = classroomId
      ? `/api/v1/lesson/${userId}?articleId=${articleId}&classroomId=${classroomId}`
      : `/api/v1/lesson/${userId}?articleId=${articleId}`;

    await fetch(url, {
      method: "PUT",
      body: JSON.stringify({
        phase: Phase,
        status: 2,
        elapsedTime: elapsedTime,
      }),
    });
  };

  useEffect(() => {
    if (contentRef.current) {
      setMaxHeight(isExpanded ? `${contentRef.current.scrollHeight}px` : "0px");
    }
  }, [isExpanded]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      {phaseLoading ? (
        <div className="flex items-start xl:h-[400px] w-full md:w-[725px] xl:w-[710px] space-x-4 mt-5"></div>
      ) : (
        <div className=" mt-6">
          {/*Phase 1 Introduction */}
          {currentPhase === 1 && (
            <Phase1Introduction
              article={article}
              articleId={articleId}
              userId={userId}
              onCompleteChange={(complete: boolean) =>
                updatePhaseCompletion(0, complete)
              }
            />
          )}

          {/* Phase 2 Vocabulary Preview */}
          {currentPhase === 2 && (
            <Phase2VocabularyPreview
              article={article}
              articleId={articleId}
              userId={userId}
              onCompleteChange={(complete: boolean) =>
                updatePhaseCompletion(1, complete)
              }
            />
          )}

          {/* Phase 3 First Reading with Audio */}
          {currentPhase === 3 && (
            <Phase3FirstReading
              article={article}
              articleId={articleId}
              userId={userId}
              locale={locale}
              onCompleteChange={(complete: boolean) =>
                updatePhaseCompletion(2, complete)
              }
            />
          )}

          {/* Phase 4 Vocabulary Collection */}
          {currentPhase === 4 && (
            <Phase4VocabularyCollection
              article={article}
              articleId={articleId}
              userId={userId}
              onCompleteChange={(complete: boolean) =>
                updatePhaseCompletion(3, complete)
              }
            />
          )}

          {/* Phase 5 Deep Reading */}
          {currentPhase === 5 && (
            <Phase5DeepReading
              article={article}
              articleId={articleId}
              userId={userId}
              locale={locale}
              onCompleteChange={(complete: boolean) =>
                updatePhaseCompletion(4, complete)
              }
            />
          )}

          {/* Phase 6 Sentence Collection */}
          {currentPhase === 6 && (
            <Phase6SentenceCollection
              article={article}
              articleId={articleId}
              userId={userId}
              locale={locale}
              onCompleteChange={(complete: boolean) =>
                updatePhaseCompletion(5, complete)
              }
            />
          )}

          {/* Phase 7 Multiple-Choice Questions*/}
          {currentPhase === 7 && (
            <Phase7MultipleChoice
              article={article}
              articleId={articleId}
              userId={userId}
              onCompleteChange={(complete: boolean) =>
                updatePhaseCompletion(6, complete)
              }
            />
          )}

          {/* Phase 8 Short-Answer Questions*/}
          {currentPhase === 8 && (
            <Phase8ShortAnswer
              article={article}
              articleId={articleId}
              userId={userId}
              onCompleteChange={(complete: boolean) =>
                updatePhaseCompletion(7, complete)
              }
            />
          )}

          {/* Phase 9 Vocabulary Practice - Flashcards*/}
          {currentPhase === 9 && (
            <Phase9VocabularyFlashcards
              userId={userId}
              articleId={articleId}
              showVocabularyButton={showVocabularyButton}
              setShowVocabularyButton={setShowVocabularyButton}
              onCompleteChange={(complete: boolean) =>
                updatePhaseCompletion(8, complete)
              }
            />
          )}

          {/* Phase 10 Vocabulary Practice - Activity Choice*/}
          {currentPhase === 10 && (
            <Phase10VocabularyMatching
              userId={userId}
              articleId={articleId}
              onCompleteChange={(complete: boolean) =>
                updatePhaseCompletion(9, complete)
              }
            />
          )}

          {/* Phase 11 Sentence Practice Flashcards*/}
          {currentPhase === 11 && (
            <Phase11SentenceFlashcards
              userId={userId}
              articleId={articleId}
              showSentenseButton={showSentenseButton}
              setShowSentenseButton={setShowSentenseButton}
              onCompleteChange={(complete: boolean) =>
                updatePhaseCompletion(10, complete)
              }
            />
          )}

          {/* Phase 12 Sentence Practice Activities*/}
          {currentPhase === 12 && (
            <Phase12SentenceActivities
              userId={userId}
              articleId={articleId}
              sentenceActivity={sentenceActivity}
              setSentenceActivity={setSentenceActivity}
              onCompleteChange={(complete: boolean) =>
                updatePhaseCompletion(11, complete)
              }
            />
          )}

          {/* Phase 13 Language Questions (Optional)*/}
          {currentPhase === 13 && (
            <Phase13LanguageQuestions
              article={article}
              onCompleteChange={(complete: boolean) =>
                updatePhaseCompletion(12, complete)
              }
              skipPhase={() => skipPhase(currentPhase)}
            />
          )}

          {/* Phase 14 Lesson Summary */}
          {currentPhase === 14 && (
            <Phase14LessonSummary
              articleId={articleId}
              userId={userId}
              elapsedTime={` ${Math.floor(elapsedTime / 60)}m ${
                elapsedTime % 60
              }s`}
            />
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className="lg:mt-6">
        <Card className="p-4">
          {/* Mobile view */}
          <div className="lg:hidden">
            <div className="flex justify-between items-center mb-2">
              <LessonTimer />
              <span className="font-semibold text-blue-700">
                Phase {currentPhase}: {phases[currentPhase - 1]}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <>
                    Hide <ChevronUp className="ml-1 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Show All <ChevronDown className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
            {/* Smooth Dropdown */}
            <div
              ref={contentRef}
              style={{ maxHeight }}
              className="transition-all duration-500 ease-in-out overflow-hidden space-y-3"
            >
              {phases.map((phase, index) => {
                const isActive = index + 1 === currentPhase;
                const isCompleted = index + 1 < currentPhase;

                return (
                  <div key={index} className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full border-2 
                      ${isActive ? "bg-blue-500 border-blue-500" : ""}
                      ${isCompleted ? "bg-green-500 border-green-500" : ""}
                      ${
                        !isActive && !isCompleted
                          ? "bg-white border-gray-300"
                          : ""
                      }
                    `}
                    />
                    <span
                      className={`text-sm ${
                        isCompleted
                          ? "text-gray-400 line-through"
                          : isActive
                          ? "text-blue-700 font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      {index + 1}. {phase}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Desktop view */}
          <div className="hidden lg:flex flex-col space-y-4 font-bold items-start max-w-[300px] min-w-[300px] relative">
            {currentPhase >= 2 && currentPhase < 14 && (
              <div className="absolute top-0 right-0 text-center font-bold text-blue-700">
                <span className="flex flex-row gap-3">
                  <Timer />
                  <LessonTimer />
                </span>
              </div>
            )}
            {phases.map((phase, index) => {
              const isActive = index + 1 === currentPhase;
              const isCompleted = index + 1 < currentPhase;

              return (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className={`w-4 h-4 rounded-full border-2 
                ${isActive ? "bg-blue-500 border-blue-500" : ""}
                ${isCompleted ? "bg-green-500 border-green-500" : ""}
                ${!isActive && !isCompleted ? "bg-white border-gray-300" : ""}
                `}
                  />
                  <span
                    className={`text-sm ${
                      isCompleted
                        ? "text-gray-400 line-through"
                        : isActive
                        ? "text-blue-700 font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {index + 1}. {phase}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
        {currentPhase === 1 && (
          <div className="mt-4">
            <Button className="w-full" onClick={startLesson}>
              {t("startLesson")}
            </Button>
          </div>
        )}

        {currentPhase < phases.length && currentPhase > 1 && (
          <div className="mt-4">
            <Button
              className={`w-full transition duration-300 ${
                shakeButton ? "animate-shake" : ""
              }`}
              onClick={() => nextPhase(currentPhase, elapsedTime)}
            >
              {t("nextPhase")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

LessonProgressBar.displayName = "LessonProgressBar";
export default LessonProgressBar;
