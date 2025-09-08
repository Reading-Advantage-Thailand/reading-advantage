"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Article } from "../../models/article-model";
import {
  FileTextIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  BookmarkIcon,
  BookmarkCheckIcon,
  LockIcon,
} from "lucide-react";
import { useScopedI18n } from "@/locales/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";

interface TimePoint {
  file: string;
  index: number;
  markName: string;
  sentences: string;
  timeSeconds: number;
}

interface TranslatedPassage {
  cn?: string[];
  en?: string[];
  th?: string[];
  tw?: string[];
  vi?: string[];
}

interface Phase6SentenceCollectionProps {
  article: Article;
  articleId: string;
  userId: string;
  locale: "en" | "th" | "cn" | "tw" | "vi";
  onCompleteChange: (complete: boolean) => void;
}

const FormSchema = z.object({
  sentences: z.array(z.string()).refine((value) => value.length >= 5, {
    message: "You have to select at least 5 sentences.",
  }),
});

const Phase6SentenceCollection: React.FC<Phase6SentenceCollectionProps> = ({
  article,
  articleId,
  userId,
  locale,
  onCompleteChange,
}) => {
  const t = useScopedI18n("pages.student.lessonPage");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savedCount, setSavedCount] = useState(0);
  const [selectedCount, setSelectedCount] = useState(0);
  const [selectedSentences, setSelectedSentences] = useState<Set<number>>(
    new Set()
  );
  const [disabledSentences, setDisabledSentences] = useState<Set<number>>(
    new Set()
  );
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedForTranslation, setSelectedForTranslation] = useState<
    number | null
  >(null);
  const sentenceRefs = useRef<{ [key: number]: HTMLElement | null }>({});
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  // Get data from article
  const timepoints = useMemo(
    () => ((article as any).timepoints as TimePoint[]) || [],
    [article]
  );
  const translatedPassage =
    ((article as any).translatedPassage as TranslatedPassage) || {};

  // Extract sentences from timepoints or fallback to splitting passage
  const sentences = useMemo(() => {
    if (timepoints.length > 0) {
      return timepoints.map((tp: TimePoint) => tp.sentences);
    }
    // Fallback: split passage into sentences
    return article.passage
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => s + ".");
  }, [timepoints, article.passage]);

  const paragraphs = article.passage.split("\\n").filter((p) => p.trim());

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      sentences: [],
    },
  });

  // Fetch existing sentences from database
  const fetchExistingSentences = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/users/sentences/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Find sentences that belong to this article or are already collected
        const existingSentencesForThisArticle =
          data.sentences?.filter(
            (sentenceData: any) => sentenceData.articleId === articleId
          ) || [];

        // Find all sentences that user has collected from any article
        const allCollectedSentences = data.sentences || [];

        const disabledIndices = new Set<number>();

        // Check each sentence in current article against all collected sentences
        sentences.forEach((sentence: string, index: number) => {
          const isAlreadyCollected = allCollectedSentences.some(
            (collected: any) =>
              collected.sentence.trim().toLowerCase() ===
              sentence.trim().toLowerCase()
          );

          if (isAlreadyCollected) {
            disabledIndices.add(index);
          }
        });

        setDisabledSentences(disabledIndices);
        setSavedCount(disabledIndices.size);
      }
    } catch (error) {
      console.error("Failed to fetch existing sentences:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load existing sentences on component mount
  useEffect(() => {
    if (userId && sentences.length > 0) {
      fetchExistingSentences();
    }
  }, [userId, articleId, sentences.length]);

  // Get translation for specific sentence
  const getTranslation = (sentenceIndex: number): string => {
    const translations = translatedPassage[locale] || [];
    return translations[sentenceIndex] || "Translation not available";
  };

  // Update form and completion status when selection changes
  useEffect(() => {
    const selectedSentenceTexts = Array.from(selectedSentences).map(
      (index) => sentences[index]
    );
    form.setValue("sentences", selectedSentenceTexts);
    setSelectedCount(selectedSentences.size);
    
    // Phase can only be completed when user has saved at least 5 sentences
    // Selection alone is not enough - must actually save to database
    onCompleteChange(savedCount >= 5);
  }, [selectedSentences, sentences, form, onCompleteChange, savedCount]);

  // Handle sentence selection
  const handleSentenceClick = (sentenceIndex: number) => {
    // Don't allow selection of disabled sentences
    if (disabledSentences.has(sentenceIndex)) {
      return;
    }

    const newSelected = new Set(selectedSentences);
    if (newSelected.has(sentenceIndex)) {
      newSelected.delete(sentenceIndex);
    } else {
      newSelected.add(sentenceIndex);
    }
    setSelectedSentences(newSelected);
  };

  // Handle translation display
  const handleTranslationClick = (sentenceIndex: number) => {
    if (!showTranslation) return;
    const newSelected =
      selectedForTranslation === sentenceIndex ? null : sentenceIndex;
    setSelectedForTranslation(newSelected);
  };

  // Handle touch start for long press detection
  const handleTouchStart = (sentenceIndex: number) => {
    setIsLongPressing(false);
    longPressTimer.current = setTimeout(() => {
      setIsLongPressing(true);
      if (showTranslation) {
        handleTranslationClick(sentenceIndex);
        // Add haptic feedback if available
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }
    }, 500); // 500ms for long press
  };

  // Handle touch end/cancel to clear long press timer
  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Handle click with long press consideration
  const handleSentenceInteraction = (sentenceIndex: number) => {
    // If it was a long press, don't handle click
    if (isLongPressing) {
      setIsLongPressing(false);
      return;
    }
    // Don't allow interaction with disabled sentences for selection
    if (disabledSentences.has(sentenceIndex)) {
      return;
    }
    handleSentenceClick(sentenceIndex);
  };

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      setSaving(true);

      if (selectedSentences.size < 5) {
        toast({
          title: "Insufficient Sentences",
          description: "Please select at least 5 sentences to continue",
          variant: "destructive",
        });
        return;
      }

      // Save each sentence individually
      const savePromises = Array.from(selectedSentences).map(
        async (sentenceIndex) => {
          const sentence = sentences[sentenceIndex];

          // Get timepoint data if available
          let timepoint = 0;
          let endTimepoint = 0;
          if (timepoints.length > sentenceIndex) {
            timepoint = timepoints[sentenceIndex].timeSeconds || 0;
            endTimepoint =
              timepoints[sentenceIndex + 1]?.timeSeconds || timepoint + 5;
          }

          // Calculate basic difficulty based on sentence complexity
          const wordCount = sentence.split(" ").length;
          let difficulty = 1; // Easy
          if (wordCount >= 20)
            difficulty = 3; // Hard
          else if (wordCount >= 10) difficulty = 2; // Medium

          // Initial spaced repetition values
          const now = new Date();
          const due = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow

          const sentenceData = {
            articleId,
            sentence: sentence.trim(),
            translation: {}, // Will be filled by backend from translatedPassage
            sn: sentenceIndex,
            timepoint,
            endTimepoint,
            difficulty,
            due: due.toISOString(),
            elapsed_days: 0,
            lapses: 0,
            reps: 0,
            scheduled_days: 1,
            stability: 1,
            state: 0, // New
            audioUrl: (article as any).audio_url || null,
          };

          const response = await fetch(`/api/v1/users/sentences/${userId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(sentenceData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message ||
                `Failed to save sentence: ${sentence.substring(0, 50)}...`
            );
          }

          return response.json();
        }
      );

      // Wait for all sentences to be saved
      await Promise.all(savePromises);

      toast({
        title: "Success!",
        description: `${selectedSentences.size} sentences added to your collection`,
        variant: "default",
      });
      onCompleteChange(true);

      // Clear selections and refresh disabled sentences
      setSelectedSentences(new Set());
      await fetchExistingSentences();
      
      // Keep completion status as true since user has now saved 5+ sentences
      onCompleteChange(true);
    } catch (error: any) {
      console.error("Error saving sentences:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save sentences",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getSentenceComplexity = (sentence: string) => {
    const wordCount = sentence.split(" ").length;
    if (wordCount < 10)
      return {
        level: "Simple",
        color:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      };
    if (wordCount < 20)
      return {
        level: "Medium",
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      };
    return {
      level: "Complex",
      color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mr-4" />
            <span className="text-lg text-gray-600 dark:text-gray-400">
              Loading your sentence collection...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-4 bg-gradient-to-br from-teal-50 via-green-50 to-emerald-50 dark:from-teal-950 dark:via-green-950 dark:to-emerald-950 p-8 rounded-2xl border border-teal-200 dark:border-teal-800">
        <div className="inline-flex items-center justify-center p-3 bg-teal-100 dark:bg-teal-900 rounded-full mb-4">
          <FileTextIcon className="h-8 w-8 text-teal-600 dark:text-teal-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t("phase6Title")}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {t("phase6Description")}
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Progress Info */}
          <div className="flex items-center gap-3">
            {savedCount >= 5 ? (
              <CheckCircle2Icon className="h-6 w-6 text-green-500" />
            ) : selectedCount >= 5 ? (
              <AlertCircleIcon className="h-6 w-6 text-blue-500" />
            ) : (
              <AlertCircleIcon className="h-6 w-6 text-amber-500" />
            )}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Collection Status
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {savedCount >= 5 ? (
                  <>
                    ✅ Phase completed! You have saved {savedCount} sentences to your collection
                  </>
                ) : selectedCount >= 5 ? (
                  <>
                    📝 {selectedCount} sentences selected - click "Add to Collection" to save them
                    <br />
                    <span className="text-amber-600 dark:text-amber-400 font-medium text-xs">
                      ⚠️ You must save at least 5 sentences to proceed to the next phase
                    </span>
                  </>
                ) : (
                  <>
                    {selectedCount} of {sentences.length - disabledSentences.size}{" "}
                    available sentences selected
                    <br />
                    <span className="text-amber-600 dark:text-amber-400 font-medium text-xs">
                      Select and save at least 5 sentences to proceed
                    </span>
                  </>
                )}
                {savedCount > 0 && savedCount < 5 && (
                  <span className="block text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {savedCount} sentences saved - need {5 - savedCount} more to proceed
                  </span>
                )}
                {disabledSentences.size > 0 && (
                  <span className="block text-xs text-gray-500 mt-1">
                    {disabledSentences.size} sentences already in your collection
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Translation Toggle */}
          <Button
            variant={showTranslation ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setShowTranslation(!showTranslation);
              if (!showTranslation) {
                setSelectedForTranslation(null);
              }
            }}
            className={showTranslation ? "bg-blue-500 hover:bg-blue-600" : ""}
          >
            {showTranslation ? "🌐" : "🌍"} Translation{" "}
            {showTranslation ? "ON" : "OFF"}
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                selectedCount >= 5
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : "bg-gradient-to-r from-teal-500 to-cyan-500"
              }`}
              style={{
                width: `${Math.min((disabledSentences.size / Math.max(5)) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden relative">
        {/* Translation overlay */}
        {showTranslation &&
          selectedForTranslation !== null &&
          sentenceRefs.current[selectedForTranslation] && (
            <div className="absolute inset-0 z-[100] pointer-events-none">
              <div
                className="absolute bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-sm px-4 py-3 rounded-lg shadow-2xl border border-gray-600 dark:border-gray-300 pointer-events-auto"
                style={(() => {
                  const sentenceElement =
                    sentenceRefs.current[selectedForTranslation];
                  if (!sentenceElement) return { display: "none" };

                  const rect = sentenceElement.getBoundingClientRect();
                  const containerElement = sentenceElement.closest(
                    ".bg-white, .dark\\:bg-gray-900"
                  );
                  const containerRect =
                    containerElement?.getBoundingClientRect();

                  if (!containerRect) return { display: "none" };

                  const relativeTop = rect.top - containerRect.top;
                  const relativeLeft =
                    rect.left - containerRect.left + rect.width / 2;

                  return {
                    top: `${Math.max(10, relativeTop - 120)}px`,
                    left: `${relativeLeft}px`,
                    transform: "translateX(-50%)",
                    width: "min(calc(100% - 40px), 350px)",
                    maxHeight: "calc(100% - 40px)",
                    overflow: "auto",
                  };
                })()}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="font-medium text-yellow-300 dark:text-blue-600">
                    Translation:
                  </div>
                  <button
                    className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold flex items-center justify-center transition-colors ml-2"
                    onClick={() => setSelectedForTranslation(null)}
                  >
                    ×
                  </button>
                </div>
                <div className="text-wrap leading-relaxed">
                  {getTranslation(selectedForTranslation)}
                </div>
              </div>
            </div>
          )}

        <div className="p-4 sm:p-8 lg:p-12 max-w-none">
          {/* Article Title */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 lg:mb-12 text-center leading-tight font-serif tracking-normal sm:tracking-wide">
            {article.title}
          </h2>

          {/* Instructions */}
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-blue-800 dark:text-blue-200 text-center font-medium">
              {savedCount >= 5 ? (
                <>
                  🎉 Great! You have successfully saved {savedCount} sentences to your collection. 
                  You can now proceed to the next phase!
                </>
              ) : (
                <>
                  📖 Click on sentences to add them to your collection. Selected
                  sentences will be marked with a bookmark icon.
                  {showTranslation && (
                    <>
                      <br />
                      💬 Desktop: Right-click to see translations. Mobile:
                      Long-press (hold) for translations.
                    </>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Reading Content */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="text-gray-800 dark:text-gray-200">
                {sentences.length > 0 ? (
                  <div className="space-y-4 sm:space-y-6 leading-relaxed">
                    {(() => {
                      const paragraphGroups: number[][] = [];
                      let currentGroup: number[] = [];

                      sentences.forEach((sentence: string, index: number) => {
                        currentGroup.push(index);

                        if (
                          sentence.trim().endsWith(".") ||
                          sentence.trim().endsWith("!") ||
                          sentence.trim().endsWith("?")
                        ) {
                          const nextSentence = sentences[index + 1];
                          if (nextSentence) {
                            if (
                              currentGroup.length >= 3 &&
                              sentence.trim().length > 50
                            ) {
                              paragraphGroups.push([...currentGroup]);
                              currentGroup = [];
                            }
                          }
                        }
                      });

                      if (currentGroup.length > 0) {
                        paragraphGroups.push(currentGroup);
                      }

                      return paragraphGroups.map(
                        (sentenceGroup, groupIndex) => (
                          <div
                            key={`paragraph-${groupIndex}`}
                            className="mb-4 sm:mb-6"
                          >
                            <p
                              className={`text-justify leading-relaxed sm:leading-loose text-base sm:text-lg font-serif tracking-normal sm:tracking-wide ${
                                groupIndex === 0
                                  ? "first-letter:text-4xl sm:first-letter:text-6xl lg:first-letter:text-7xl first-letter:font-bold first-letter:float-left first-letter:mr-1 sm:first-letter:mr-2 first-letter:mt-0 first-letter:leading-[0.8] first-letter:text-teal-600 dark:first-letter:text-teal-400 pl-2 sm:pl-4"
                                  : "indent-4 sm:indent-8"
                              }`}
                            >
                              {sentenceGroup.map(
                                (sentenceIndex, sentenceInGroupIndex) => {
                                  const sentence = sentences[sentenceIndex];
                                  const isSelected =
                                    selectedSentences.has(sentenceIndex);
                                  const isDisabled =
                                    disabledSentences.has(sentenceIndex);
                                  const isTranslationShown =
                                    showTranslation &&
                                    selectedForTranslation === sentenceIndex;
                                  const complexity =
                                    getSentenceComplexity(sentence);

                                  return (
                                    <span key={`sentence-${sentenceIndex}`}>
                                      <span
                                        className={`relative inline transition-all duration-300 group ${
                                          isDisabled
                                            ? "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-600 rounded-sm px-1 py-0.5"
                                            : isSelected
                                              ? "bg-teal-100 dark:bg-teal-900 text-teal-900 dark:text-teal-100 shadow-sm rounded-md px-2 py-1 font-medium border-2 border-teal-300 dark:border-teal-600 cursor-pointer"
                                              : isTranslationShown
                                                ? "bg-blue-100 dark:bg-blue-800 rounded-md px-1.5 py-0.5 cursor-pointer"
                                                : "hover:bg-gray-100 dark:hover:bg-gray-700 rounded-sm px-1 py-0.5 hover:shadow-sm cursor-pointer"
                                        }`}
                                        ref={(el) => {
                                          sentenceRefs.current[sentenceIndex] =
                                            el;
                                        }}
                                        onClick={() =>
                                          handleSentenceInteraction(
                                            sentenceIndex
                                          )
                                        }
                                        onContextMenu={(e) => {
                                          e.preventDefault();
                                          if (showTranslation) {
                                            handleTranslationClick(
                                              sentenceIndex
                                            );
                                          }
                                        }}
                                        onTouchStart={() =>
                                          handleTouchStart(sentenceIndex)
                                        }
                                        onTouchEnd={handleTouchEnd}
                                        onTouchCancel={handleTouchEnd}
                                        title={`${complexity.level} sentence (${sentence.split(" ").length} words) - ${
                                          isDisabled
                                            ? "Already in your collection"
                                            : `Click to ${isSelected ? "deselect" : "select"}${
                                                showTranslation
                                                  ? ". Right-click (desktop) or long-press (mobile) for translation"
                                                  : ""
                                              }`
                                        }`}
                                      >
                                        {/* Selection/Disabled indicator */}
                                        {isDisabled ? (
                                          <LockIcon className="inline w-4 h-4 mr-1 text-gray-400" />
                                        ) : isSelected ? (
                                          <BookmarkCheckIcon className="inline w-4 h-4 mr-1 text-teal-600 dark:text-teal-400" />
                                        ) : null}

                                        {/* Complexity badge for hover */}
                                        {!isDisabled && (
                                          <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-0 z-10">
                                            <Badge
                                              className={`text-xs ${complexity.color} shadow-lg`}
                                            >
                                              {complexity.level}
                                            </Badge>
                                          </span>
                                        )}
                                        {sentence.trim()}
                                      </span>
                                      {sentenceInGroupIndex <
                                        sentenceGroup.length - 1 && " "}
                                    </span>
                                  );
                                }
                              )}
                            </p>
                          </div>
                        )
                      );
                    })()}
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-8">
                    {paragraphs.map((paragraph, paragraphIndex) => (
                      <p
                        key={paragraphIndex}
                        className={`text-gray-800 dark:text-gray-200 leading-relaxed sm:leading-loose text-base sm:text-lg font-serif text-justify tracking-normal sm:tracking-wide ${
                          paragraphIndex === 0
                            ? "first-letter:text-4xl sm:first-letter:text-6xl lg:first-letter:text-7xl first-letter:font-bold first-letter:float-left first-letter:mr-1 sm:first-letter:mr-3 first-letter:mt-1 first-letter:leading-none first-letter:text-teal-600 dark:first-letter:text-teal-400"
                            : ""
                        }`}
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                {savedCount >= 5 ? (
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center p-4 bg-green-50 dark:bg-green-900 rounded-xl border border-green-200 dark:border-green-700 mb-4">
                      <CheckCircle2Icon className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
                      <div>
                        <h3 className="font-semibold text-green-800 dark:text-green-200">
                          Phase Completed!
                        </h3>
                        <p className="text-sm text-green-600 dark:text-green-300">
                          {savedCount} sentences saved to your collection
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="submit"
                    disabled={selectedCount < 5 || saving}
                    size="lg"
                    className={`w-full ${
                      selectedCount >= 5
                        ? "bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {saving ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Saving...
                      </div>
                    ) : (
                      <>
                        <BookmarkIcon className="w-5 h-5 mr-2" />
                        Add {selectedCount} Sentences to Collection
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>

      {/* Collection Guide */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-6 rounded-xl border border-green-200 dark:border-green-800">
        <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">
          📖 Sentence Collection Guide
        </h3>
        <div className="grid gap-3 text-sm text-green-700 dark:text-green-300">
          <div className="flex items-start">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
            <div>
              <strong>Simple sentences:</strong> Good for practicing basic
              structure and common vocabulary
            </div>
          </div>
          <div className="flex items-start">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
            <div>
              <strong>Medium sentences:</strong> Help develop understanding of
              complex ideas
            </div>
          </div>
          <div className="flex items-start">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2 flex-shrink-0"></span>
            <div>
              <strong>Complex sentences:</strong> Challenge your comprehension
              and analytical skills
            </div>
          </div>
          <div className="flex items-start mt-4 pt-3 border-t border-green-300 dark:border-green-700">
            <BookmarkIcon className="w-4 h-4 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <strong>How to select:</strong> Click on sentences to bookmark
              them.{" "}
              {showTranslation && (
                <>
                  Use translation feature - right-click (desktop) or long-press
                  (mobile) to understand difficult sentences before selecting.
                </>
              )}
            </div>
          </div>
          <div className="flex items-start">
            <LockIcon className="w-4 h-4 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Already collected:</strong> Sentences with lock icons are
              already in your collection and cannot be selected again.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Phase6SentenceCollection.displayName = "Phase6SentenceCollection";
export default Phase6SentenceCollection;
