"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import LessonWordList from "./lesson-vocabulary-preview";
import { Article } from "../models/article-model";
import { Book, Timer } from "lucide-react";
import { useScopedI18n } from "@/locales/client";
import LessonSentensePreview from "./lesson-sentence-preview";
import { useCurrentLocale } from "@/locales/client";
import LessonWordCollection from "./lesson-vocabulary-collection";
import MCQuestionCard from "../questions/mc-question-card";
import SAQuestionCard from "../questions/sa-question-card";
import LessonVocabularyFlashCard from "./lesson-vocabulary-flash-card";
import LessonMatchingWords from "./lesson-vocabulary-activity-choice";
import LessonSentenseFlashCard from "./lesson-sentense-flash-card";
import LessonOrderSentences from "./lesson-order-sentence";
import LessonClozeTest from "./lesson-cloze-test";
import LessonOrderWords from "./lesson-order-word";
import LessonMatching from "./lesson-matching-word";
import LessonLanguageQuestion from "./lesson-language-question";
import LessonSummary from "./lesson-summary";
import LessonIntroduction from "./lesson-introduction";
import { useTimer } from "@/contexts/timer-context";
import {
  ActivityType,
  ActivityStatus,
} from "../models/user-activity-log-model";

interface LessonProgressBar {
  phases: string[];
  article: Article;
  articleId: string;
  userId: string;
}

const LessonProgressBar: React.FC<LessonProgressBar> = ({
  phases,
  article,
  articleId,
  userId,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [maxHeight, setMaxHeight] = useState("0px");
  const contentRef = useRef<HTMLDivElement>(null);
  const [currentPhase, setCurrentPhase] = useState(1);
  const t = useScopedI18n("pages.student.lessonPage");
  const tb = useScopedI18n("pages.student.practicePage");
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
    await fetch(`/api/v1/lesson/${userId}?articleId=${articleId}`, {
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
    await fetch(`/api/v1/lesson/${userId}?articleId=${articleId}`, {
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
    await fetch(`/api/v1/lesson/${userId}?articleId=${articleId}`, {
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
            <LessonIntroduction
              article={article}
              articleId={articleId}
              userId={userId}
              onCompleteChange={(complete) =>
                updatePhaseCompletion(0, complete)
              }
            />
          )}

          {/* Phase 2 Vocabulary Preview */}
          {currentPhase === 2 && (
            <LessonWordList
              article={article}
              articleId={articleId}
              userId={userId}
              onCompleteChange={(complete) =>
                updatePhaseCompletion(1, complete)
              }
            />
          )}

          {/* Phase 3 First Reading with Audio */}
          {currentPhase === 3 && (
            <Card className="pb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Book />
                  <div className="ml-2">{t("phase3Title")}</div>
                </CardTitle>
              </CardHeader>
              <div className="px-6">
                <span className="font-bold">{t("phase3Description")}</span>
              </div>
              <CardDescription className="px-6">
                <LessonSentensePreview
                  article={article}
                  articleId={articleId}
                  userId={userId}
                  targetLanguage={locale}
                  phase="phase3"
                  onCompleteChange={(complete) =>
                    updatePhaseCompletion(2, complete)
                  }
                />
              </CardDescription>
            </Card>
          )}

          {/* Phase 4 Vocabulary Collection */}
          {currentPhase === 4 && (
            <LessonWordCollection
              article={article}
              articleId={articleId}
              userId={userId}
              onCompleteChange={(complete) =>
                updatePhaseCompletion(3, complete)
              }
            />
          )}

          {/* Phase 5 Deep Reading */}
          {currentPhase === 5 && (
            <Card className="pb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Book />
                  <div className="ml-2">{t("phase5Title")}</div>
                </CardTitle>
              </CardHeader>
              <div className="px-6">
                <span className="font-bold">{t("phase5Description")}</span>
              </div>
              <CardDescription className="px-6">
                <LessonSentensePreview
                  article={article}
                  articleId={articleId}
                  userId={userId}
                  targetLanguage={locale}
                  phase="phase5"
                  onCompleteChange={(complete) =>
                    updatePhaseCompletion(4, complete)
                  }
                />
              </CardDescription>
            </Card>
          )}

          {/* Phase 6 Sentence Collection */}
          {currentPhase === 6 && (
            <Card className="pb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Book />
                  <div className="ml-2">{t("phase6Title")}</div>
                </CardTitle>
              </CardHeader>
              <div className="px-6">
                <span className="font-bold">{t("phase6Description")}</span>
              </div>
              <CardDescription className="px-6">
                <LessonSentensePreview
                  article={article}
                  articleId={articleId}
                  userId={userId}
                  targetLanguage={locale}
                  phase="phase6"
                  onCompleteChange={(complete) =>
                    updatePhaseCompletion(5, complete)
                  }
                />
              </CardDescription>
            </Card>
          )}

          {/* Phase 7 Multiple-Choice Questions*/}
          {currentPhase === 7 && (
            <Card className="pb-7 xl:h-[550px] w-full md:w-[725px] xl:w-[750px]">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Book />
                  <div className="ml-2">{t("phase7Title")}</div>
                </CardTitle>
              </CardHeader>
              <div className="px-6">
                <span className="font-bold">{t("phase7Description")}</span>
              </div>
              <CardDescription className="px-6">
                <MCQuestionCard
                  userId={userId}
                  articleId={articleId}
                  articleTitle={article.title}
                  articleLevel={article.ra_level}
                  page="lesson"
                  onCompleteChange={(complete) =>
                    updatePhaseCompletion(6, complete)
                  }
                />
              </CardDescription>
            </Card>
          )}

          {/* Phase 8 Short-Answer Questions*/}
          {currentPhase === 8 && (
            <Card className="pb-7 xl:h-[550px] w-full md:w-[725px] xl:w-[750px]">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Book />
                  <div className="ml-2">{t("phase8Title")}</div>
                </CardTitle>
              </CardHeader>
              <div className="px-6">
                <span className="font-bold">{t("phase8Description")}</span>
              </div>
              <CardDescription className="px-6">
                <SAQuestionCard
                  userId={userId}
                  articleId={articleId}
                  articleTitle={article.title}
                  articleLevel={article.ra_level}
                  page="lesson"
                  onCompleteChange={(complete) =>
                    updatePhaseCompletion(7, complete)
                  }
                />
              </CardDescription>
            </Card>
          )}

          {/* Phase 9 Vocabulary Practice - Flashcards*/}
          {currentPhase === 9 && (
            <Card className="pb-7 w-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Book />
                  <div className="ml-2">{t("phase10Title")}</div>
                </CardTitle>
              </CardHeader>
              <div className="px-6">
                <span className="font-bold">{t("phase10Description")}</span>
              </div>
              <CardDescription className="px-6">
                <LessonVocabularyFlashCard
                  userId={userId}
                  articleId={articleId}
                  showButton={showVocabularyButton}
                  setShowButton={setShowVocabularyButton}
                  onCompleteChange={(complete) =>
                    updatePhaseCompletion(8, complete)
                  }
                />
              </CardDescription>
            </Card>
          )}

          {/* Phase 10 Vocabulary Practice - Activity Choice*/}
          {currentPhase === 10 && (
            <Card className="pb-7 xl:h-[550px] w-full md:w-[725px] xl:w-[750px]">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Book />
                  <div className="ml-2">{t("phase10Title")}</div>
                </CardTitle>
              </CardHeader>
              <div className="px-6">
                <span className="font-bold">{t("phase10Description")}</span>
              </div>
              <CardDescription className="px-6">
                <LessonMatchingWords
                  userId={userId}
                  articleId={articleId}
                  onCompleteChange={(complete) =>
                    updatePhaseCompletion(9, complete)
                  }
                />
              </CardDescription>
            </Card>
          )}

          {/* Phase 11 Sentence Practice Flashcards*/}
          {currentPhase === 11 && (
            <Card className="pb-7 w-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Book />
                  <div className="ml-2">{t("phase11Title")}</div>
                </CardTitle>
              </CardHeader>
              <div className="px-6">
                <span className="font-bold">{t("phase11Description")}</span>
              </div>
              <CardDescription className="px-6">
                <LessonSentenseFlashCard
                  userId={userId}
                  articleId={articleId}
                  showButton={showSentenseButton}
                  setShowButton={setShowSentenseButton}
                  onCompleteChange={(complete) =>
                    updatePhaseCompletion(10, complete)
                  }
                />
              </CardDescription>
            </Card>
          )}

          {/* Phase 12 Sentence Practice - Activity Choice*/}
          {currentPhase === 12 && sentenceActivity === "none" && (
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
                      <Button
                        onClick={() => setSentenceActivity("order-sentences")}
                      >
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
                      <Button
                        onClick={() => setSentenceActivity("order-words")}
                      >
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
          )}

          {/* Phase 12 Sentence Practice - orderSentences*/}
          {currentPhase === 12 && sentenceActivity === "order-sentences" && (
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
                onCompleteChange={(complete) =>
                  updatePhaseCompletion(11, complete)
                }
              />
            </Card>
          )}

          {/* Phase 12 Sentence Practice - clozeTest*/}
          {currentPhase === 12 && sentenceActivity === "cloze-test" && (
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
                onCompleteChange={(complete) =>
                  updatePhaseCompletion(11, complete)
                }
              />
            </Card>
          )}

          {/* Phase 12 Sentence Practice - orderWords*/}
          {currentPhase === 12 && sentenceActivity === "order-words" && (
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
                onCompleteChange={(complete) =>
                  updatePhaseCompletion(11, complete)
                }
              />
            </Card>
          )}

          {/* Phase 12 Sentence Practice - matching*/}
          {currentPhase === 12 && sentenceActivity === "matching" && (
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
                onCompleteChange={(complete) =>
                  updatePhaseCompletion(11, complete)
                }
              />
            </Card>
          )}

          {/* Phase 13 Language Questions (Optional)*/}
          {currentPhase === 13 && (
            <Card className="pb-7 w-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Book />
                  <div className="ml-2">{t("phase13Title")}</div>
                </CardTitle>
              </CardHeader>
              <div className="px-6">
                <span className="font-bold">{t("phase13Description")}</span>
              </div>
              <CardDescription className="px-6">
                <LessonLanguageQuestion
                  article={article}
                  onCompleteChange={(complete) =>
                    updatePhaseCompletion(12, complete)
                  }
                  skipPhase={() => skipPhase(currentPhase)}
                />
              </CardDescription>
            </Card>
          )}

          {/* Phase 14 Lesson Summary */}
          {currentPhase === 14 && (
            <Card className="pb-7 w-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Book />
                  <div className="ml-2">{t("phase14Title")}</div>
                </CardTitle>
              </CardHeader>
              <CardDescription className="px-6">
                <LessonSummary
                  articleId={articleId}
                  userId={userId}
                  elapsedTime={` ${Math.floor(elapsedTime / 60)}m ${
                    elapsedTime % 60
                  }s`}
                />
              </CardDescription>
            </Card>
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
