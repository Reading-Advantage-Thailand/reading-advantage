"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { ArticleSummary } from "./article-summary";
import CollapsibleNotice from "./lesson-collapsible-notice";
import LessonWordList from "./lesson-vocabulary-preview";
import { Article } from "./models/article-model";
import { Book } from "lucide-react";
import { useScopedI18n } from "@/locales/client";
import LessonSentensePreview from "./lesson-sentence-preview";
import { useCurrentLocale } from "@/locales/client";
import LessonWordCollection from "./lesson-vocabulary-collection";
import MCQuestionCard from "./questions/mc-question-card";
import SAQuestionCard from "./questions/sa-question-card";
import LessonVocabularyFlashCard from "./lesson-vocabulary-flash-card";
import LessonMatchingWords from "./lesson-vocabulary-activity-choice";
import LessonSentenseFlashCard from "./lesson-sentense-flash-card";
import LessonOrderSentences from "./lesson-order-sentence";
import LessonClozeTest from "./lesson-cloze-test";
import LessonOrderWords from "./lesson-order-word";
import LessonMatching from "./lesson-matching-word";

export default function VerticalProgress({
  article,
  articleId,
  userId,
  phases,
}: {
  phases: Array<string>;
  article: Article;
  articleId: string;
  userId: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [maxHeight, setMaxHeight] = useState("0px");
  const contentRef = useRef<HTMLDivElement>(null);
  const [currentPhase, setCurrentPhase] = useState(12);
  const t = useScopedI18n("pages.student.lessonPage");
  const tc = useScopedI18n("components.articleCard");
  const tb = useScopedI18n("pages.student.practicePage");
  const locale = useCurrentLocale() as "en" | "th" | "cn" | "tw" | "vi";
  const [showVocabularyButton, setShowVocabularyButton] = useState(true);
  const [showSentenseButton, setShowSentenseButton] = useState(true);
  const [sentenceActivity, setSentenceActivity] = useState("none");

  useEffect(() => {
    if (contentRef.current) {
      setMaxHeight(isExpanded ? `${contentRef.current.scrollHeight}px` : "0px");
    }
  }, [isExpanded]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
      <div className=" mt-6">
        {/*Phase 1 Introduction */}
        {currentPhase === 1 && (
          <Card className="pb-6">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center">
                <Book />
                <div className="ml-2">{t("phase1Title")}</div>
              </CardTitle>
              <div>
                <span className="font-bold">
                  {t("phase1Description", { topic: article.title })}
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                <Badge>{tc("raLevel", { raLevel: article.ra_level })}</Badge>
                <Badge>
                  {tc("cefrLevel", { cefrLevel: article.cefr_level })}
                </Badge>
              </div>
              <CardDescription>
                <ArticleSummary article={article} articleId={articleId} />
              </CardDescription>
              <div className="flex justify-center h-[350px] overflow-hidden">
                <Image
                  src={`https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/images/${articleId}.png`}
                  alt="Malcolm X"
                  width={840}
                  height={250}
                  className="object-cover"
                />
              </div>
            </CardHeader>
            <CollapsibleNotice />
          </Card>
        )}

        {/* Phase 2 Vocabulary Preview */}
        {currentPhase === 2 && (
          <LessonWordList
            article={article}
            articleId={articleId}
            userId={userId}
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
          />
        )}

        {/* Phase 5 Sentence Collection */}
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
              />
            </CardDescription>
          </Card>
        )}

        {/* Phase 6 Deep Reading */}
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
              />
            </CardDescription>
          </Card>
        )}

        {/* Phase 7 Multiple-Choice Questions*/}
        {currentPhase === 7 && (
          <Card className="pb-7 w-full">
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
              />
            </CardDescription>
          </Card>
        )}

        {/* Phase 8 Short-Answer Questions*/}
        {currentPhase === 8 && (
          <Card className="pb-7 w-full">
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
              />
            </CardDescription>
          </Card>
        )}

        {/* Phase 10 Vocabulary Practice - Activity Choice*/}
        {currentPhase === 10 && (
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
              <LessonMatchingWords userId={userId} articleId={articleId} />
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
            <LessonOrderSentences articleId={articleId} userId={userId} />
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

            <LessonClozeTest articleId={articleId} userId={userId} />
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

            <LessonOrderWords articleId={articleId} userId={userId} />
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
            <LessonMatching articleId={articleId} userId={userId} />
          </Card>
        )}
      </div>

      {/* Progress Bar */}
      <div className="lg:mt-6">
        <Card className="p-4">
          {/* Mobile view */}
          <div className="lg:hidden">
            <div className="flex justify-between items-center mb-2">
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
          <div className="hidden lg:flex flex-col space-y-4 font-bold items-start max-w-[300px] min-w-[300px]">
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
        </Card>
        {currentPhase === 1 && (
          <div className="mt-4">
            <Button
              className="w-full"
              onClick={() => setCurrentPhase(currentPhase + 1)}
            >
              {t("startLesson")}
            </Button>
          </div>
        )}

        {currentPhase < phases.length && currentPhase > 1 && (
          <div className="mt-4">
            <Button
              className="w-full"
              onClick={() => setCurrentPhase(currentPhase + 1)}
            >
              {t("nextPhase")}
            </Button>
          </div>
        )}

        {currentPhase <= phases.length && currentPhase > 1 && (
          <div className="mt-4">
            <Button
              className="w-full"
              onClick={() => setCurrentPhase(currentPhase - 1)}
            >
              {t("previousPhase")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
