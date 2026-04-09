"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
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
import { usePassageTranslation } from "../hooks/usePassageTranslation";
import { groupSentencesIntoParagraphs } from "../utils";
import type { TimePoint, TranslatedPassage } from "../types";

// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────

const Phase6SentenceCollection: React.FC<Phase6SentenceCollectionProps> = ({
  article,
  articleId,
  userId,
  locale,
  onCompleteChange,
}) => {
  const t = useScopedI18n("pages.student.lessonPage");

  // ── Save / selection state ─────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savedCount, setSavedCount] = useState(0);
  const [selectedCount, setSelectedCount] = useState(0);
  const [selectedSentences, setSelectedSentences] = useState<Set<number>>(new Set());
  const [disabledSentences, setDisabledSentences] = useState<Set<number>>(new Set());

  const sentenceRefs = useRef<{ [key: number]: HTMLElement | null }>({});
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  // ── Article data ───────────────────────────────────────────────────────────
  const timepoints = useMemo<TimePoint[]>(
    () => ((article as any).timepoints as TimePoint[]) || [],
    [article]
  );
  const existingTranslations: TranslatedPassage =
    ((article as any).translatedPassage as TranslatedPassage) || {};

  const sentences = useMemo(() => {
    if (timepoints.length > 0) return timepoints.map((tp) => tp.sentences);
    return article.passage
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => s + ".");
  }, [timepoints, article.passage]);

  const paragraphs = article.passage.split("\\n").filter((p) => p.trim());

  const paragraphGroups = useMemo(
    () => groupSentencesIntoParagraphs(sentences),
    [sentences]
  );

  // ── Translation hook ───────────────────────────────────────────────────────
  const {
    showTranslation,
    isTranslating,
    selectedForTranslation,
    setSelectedForTranslation,
    handleTranslationToggle,
    getTranslation,
  } = usePassageTranslation({ articleId, locale, existingTranslations });

  // ── Form ───────────────────────────────────────────────────────────────────
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { sentences: [] },
  });

  // ── Fetch already-saved sentences ─────────────────────────────────────────
  const fetchExistingSentences = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/users/sentences/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        const data = await response.json();
        const allCollected = data.sentences || [];
        const disabled = new Set<number>();
        sentences.forEach((sentence, index) => {
          const alreadyCollected = allCollected.some(
            (c: any) =>
              c.sentence.trim().toLowerCase() === sentence.trim().toLowerCase()
          );
          if (alreadyCollected) disabled.add(index);
        });
        setDisabledSentences(disabled);
        setSavedCount(disabled.size);
      }
    } catch (error) {
      console.error("Failed to fetch existing sentences:", error);
    } finally {
      setLoading(false);
    }
  }, [userId, articleId, sentences]);

  useEffect(() => {
    if (userId && sentences.length > 0) fetchExistingSentences();
  }, [userId, articleId, sentences.length]);

  // ── Sync form + completion status ─────────────────────────────────────────
  useEffect(() => {
    form.setValue(
      "sentences",
      Array.from(selectedSentences).map((i) => sentences[i])
    );
    setSelectedCount(selectedSentences.size);
    onCompleteChange(savedCount >= 5);
  }, [selectedSentences, sentences, form, onCompleteChange, savedCount]);

  // ── Sentence interaction handlers ──────────────────────────────────────────
  const handleSentenceClick = (index: number) => {
    if (disabledSentences.has(index)) return;
    const next = new Set(selectedSentences);
    next.has(index) ? next.delete(index) : next.add(index);
    setSelectedSentences(next);
  };

  const handleTranslationClick = (index: number) => {
    if (!showTranslation) return;
    setSelectedForTranslation(selectedForTranslation === index ? null : index);
  };

  const handleTouchStart = (index: number) => {
    setIsLongPressing(false);
    longPressTimer.current = setTimeout(() => {
      setIsLongPressing(true);
      if (showTranslation) {
        handleTranslationClick(index);
        if (navigator.vibrate) navigator.vibrate(50);
      }
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleSentenceInteraction = (index: number) => {
    if (isLongPressing) { setIsLongPressing(false); return; }
    if (disabledSentences.has(index)) return;
    handleSentenceClick(index);
  };

  // ── Sentence complexity helper ─────────────────────────────────────────────
  const getSentenceComplexity = (sentence: string) => {
    const wc = sentence.split(" ").length;
    if (wc < 10) return { level: t("simple"), color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" };
    if (wc < 20) return { level: t("medium"), color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" };
    return { level: t("complex"), color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" };
  };

  // ── Submit: save sentences ─────────────────────────────────────────────────
  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      setSaving(true);
      if (selectedSentences.size < 5) {
        toast({ title: t("insufficientSentences"), description: t("selectAtLeast5Sentences"), variant: "destructive" });
        return;
      }

      // Ensure article has translations (generate if missing)
      let articleTranslations = existingTranslations;
      const needsTranslation =
        !existingTranslations ||
        Object.keys(existingTranslations).length === 0 ||
        !existingTranslations.th ||
        existingTranslations.th.length === 0;

      if (needsTranslation) {
        try {
          const res = await fetch(`/api/v1/assistant/translate/${articleId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "passage", targetLanguage: "th" }),
          });
          if (res.ok) {
            const updated = await fetch(`/api/articles/${articleId}`);
            if (updated.ok) {
              const updatedArticle = await updated.json();
              articleTranslations = (updatedArticle as any).translatedPassage || existingTranslations;
            }
          }
        } catch (err) {
          console.error("Error translating article:", err);
        }
      }

      // Save each selected sentence
      const savePromises = Array.from(selectedSentences).map(async (sentenceIndex) => {
        const sentence = sentences[sentenceIndex];
        let timepoint = 0;
        let endTimepoint = 0;
        if (timepoints.length > sentenceIndex) {
          timepoint = timepoints[sentenceIndex].timeSeconds || 0;
          endTimepoint = timepoints[sentenceIndex + 1]?.timeSeconds || timepoint + 5;
        }
        const wc = sentence.split(" ").length;
        const difficulty = wc >= 20 ? 3 : wc >= 10 ? 2 : 1;
        const now = new Date();
        const due = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const langMap: Record<string, string> = { "zh-CN": "cn", "zh-TW": "tw", th: "th", vi: "vi", en: "en" };
        const sentenceTranslation: Record<string, string> = {};
        if (articleTranslations && Object.keys(articleTranslations).length > 0) {
          Object.entries(articleTranslations).forEach(([code, arr]) => {
            const mapped = langMap[code] || code;
            if (Array.isArray(arr) && arr[sentenceIndex]) sentenceTranslation[mapped] = arr[sentenceIndex];
          });
        }

        const response = await fetch(`/api/v1/users/sentences/${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            articleId, sentence: sentence.trim(), translation: sentenceTranslation, sn: sentenceIndex,
            timepoint, endTimepoint, difficulty, due: due.toISOString(),
            elapsed_days: 0, lapses: 0, reps: 0, scheduled_days: 1, stability: 1, state: 0,
            audioUrl: (article as any).audio_url || null,
          }),
        });
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message || `Failed to save sentence: ${sentence.substring(0, 50)}...`);
        }
        return response.json();
      });

      await Promise.all(savePromises);

      toast({ title: t("success"), description: t("sentencesAddedToCollection", { count: selectedSentences.size }) });
      onCompleteChange(true);
      setSelectedSentences(new Set());
      await fetchExistingSentences();
      onCompleteChange(true);
    } catch (error: any) {
      console.error("Error saving sentences:", error);
      toast({ title: t("error"), description: error.message || t("failedToSaveSentences"), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-zinc-200 dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mr-4" />
            <span className="text-lg text-gray-600 dark:text-gray-400">
              {t("loadingSentenceCollection")}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4 bg-gradient-to-br from-teal-300 via-green-300 to-emerald-300 dark:from-teal-950 dark:via-green-950 dark:to-emerald-950 p-8 rounded-2xl border border-teal-200 dark:border-teal-800">
        <div className="inline-flex items-center justify-center p-3 bg-teal-100 dark:bg-teal-900 rounded-full mb-4">
          <FileTextIcon className="h-8 w-8 text-teal-600 dark:text-teal-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("phase6Title")}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{t("phase6Description")}</p>
      </div>

      {/* Controls bar */}
      <div className="bg-zinc-200 dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Progress info */}
          <div className="flex items-center gap-3">
            {savedCount >= 5 ? (
              <CheckCircle2Icon className="h-6 w-6 text-green-500" />
            ) : (
              <AlertCircleIcon className={`h-6 w-6 ${selectedCount >= 5 ? "text-blue-500" : "text-amber-500"}`} />
            )}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{t("collectionStatus")}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {savedCount >= 5 ? (
                  <>✅ {t("phaseCompletedSavedSentences", { count: savedCount })}</>
                ) : selectedCount >= 5 ? (
                  <>📝 {t("sentencesSelectedClickAdd", { count: selectedCount })}<br />
                    <span className="text-amber-600 dark:text-amber-400 font-medium text-xs">{t("mustSaveAtLeast5Sentences")}</span>
                  </>
                ) : (
                  <>{t("availableSentencesSelected", { selected: selectedCount, available: sentences.length - disabledSentences.size })}<br />
                    <span className="text-amber-600 dark:text-amber-400 font-medium text-xs">{t("selectAndSaveAtLeast5")}</span>
                  </>
                )}
                {savedCount > 0 && savedCount < 5 && (
                  <span className="block text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {t("sentencesSavedNeedMore", { saved: savedCount, needed: 5 - savedCount })}
                  </span>
                )}
                {disabledSentences.size > 0 && (
                  <span className="block text-xs text-gray-500 mt-1">
                    {t("sentencesAlreadyInCollection", { count: disabledSentences.size })}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Translation toggle */}
          <Button
            variant={showTranslation ? "default" : "outline"}
            size="sm"
            onClick={handleTranslationToggle}
            disabled={isTranslating}
            className={showTranslation ? "bg-blue-500 hover:bg-blue-600" : ""}
          >
            {isTranslating ? (
              <><div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />Loading...</>
            ) : (
              <>{showTranslation ? "🌐" : "🌍"} Translation {showTranslation ? t("translationOn") : t("translationOff")}</>
            )}
          </Button>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${selectedCount >= 5 ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gradient-to-r from-teal-500 to-cyan-500"}`}
              style={{ width: `${Math.min((disabledSentences.size / Math.max(5, 1)) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Article content */}
      <div className="bg-zinc-200 dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden relative">
        {/* Translation overlay */}
        {showTranslation && selectedForTranslation !== null && sentenceRefs.current[selectedForTranslation] && (
          <div className="absolute inset-0 z-[100] pointer-events-none">
            <div
              className="absolute bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-sm px-4 py-3 rounded-lg shadow-2xl border border-gray-600 dark:border-gray-300 pointer-events-auto"
              style={(() => {
                const el = sentenceRefs.current[selectedForTranslation];
                if (!el) return { display: "none" };
                const rect = el.getBoundingClientRect();
                const containerRect = el.closest(".bg-zinc-200, .dark\\:bg-gray-900")?.getBoundingClientRect();
                if (!containerRect) return { display: "none" };
                return {
                  top: `${Math.max(10, rect.top - containerRect.top - 120)}px`,
                  left: `${rect.left - containerRect.left + rect.width / 2}px`,
                  transform: "translateX(-50%)",
                  width: "min(calc(100% - 40px), 350px)",
                  maxHeight: "calc(100% - 40px)",
                  overflow: "auto",
                };
              })()}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium text-yellow-300 dark:text-blue-600">{t("translation")}:</div>
                <button
                  className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold flex items-center justify-center transition-colors ml-2"
                  onClick={() => setSelectedForTranslation(null)}
                >×</button>
              </div>
              <div className="text-wrap leading-relaxed">
                {getTranslation(selectedForTranslation, t("translationNotAvailable"))}
              </div>
            </div>
          </div>
        )}

        <div className="p-4 sm:p-8 lg:p-12 max-w-none">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 lg:mb-12 text-center leading-tight font-serif tracking-normal sm:tracking-wide">
            {article.title}
          </h2>

          <div className="mb-8 p-4 bg-blue-100 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-blue-800 dark:text-blue-200 text-center font-medium">
              {savedCount >= 5 ? (
                <>{t("greatSavedSentencesMessage", { count: savedCount })}</>
              ) : (
                <>{t("clickSentencesToAdd")}{showTranslation && <><br />{t("desktopRightClick")}</>}</>
              )}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="text-gray-800 dark:text-gray-200">
                {sentences.length > 0 ? (
                  <div className="space-y-4 sm:space-y-6 leading-relaxed">
                    {paragraphGroups.map((sentenceGroup, groupIndex) => (
                      <div key={`paragraph-${groupIndex}`} className="mb-4 sm:mb-6 no-select">
                        <p className={`text-justify leading-relaxed sm:leading-loose text-base sm:text-lg font-serif tracking-normal sm:tracking-wide ${
                          groupIndex === 0
                            ? "first-letter:text-4xl sm:first-letter:text-6xl lg:first-letter:text-7xl first-letter:font-bold first-letter:float-left first-letter:mr-1 sm:first-letter:mr-2 first-letter:mt-0 first-letter:leading-[0.8] first-letter:text-teal-600 dark:first-letter:text-teal-400 pl-2 sm:pl-4"
                            : "indent-4 sm:indent-8"
                        }`}>
                          {sentenceGroup.map((sentenceIndex, posInGroup) => {
                            const sentence = sentences[sentenceIndex];
                            const isSelected = selectedSentences.has(sentenceIndex);
                            const isDisabled = disabledSentences.has(sentenceIndex);
                            const isTranslationShown = showTranslation && selectedForTranslation === sentenceIndex;
                            const complexity = getSentenceComplexity(sentence);
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
                                  ref={(el) => { sentenceRefs.current[sentenceIndex] = el; }}
                                  onClick={() => handleSentenceInteraction(sentenceIndex)}
                                  onContextMenu={(e) => { e.preventDefault(); if (showTranslation) handleTranslationClick(sentenceIndex); }}
                                  onTouchStart={() => handleTouchStart(sentenceIndex)}
                                  onTouchEnd={handleTouchEnd}
                                  onTouchCancel={handleTouchEnd}
                                  title={`${complexity.level} sentence`}
                                >
                                  {isDisabled ? <LockIcon className="inline w-4 h-4 mr-1 text-gray-400" /> : isSelected ? <BookmarkCheckIcon className="inline w-4 h-4 mr-1 text-teal-600 dark:text-teal-400" /> : null}
                                  {!isDisabled && (
                                    <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-0 z-10">
                                      <Badge className={`text-xs ${complexity.color} shadow-lg`}>{complexity.level}</Badge>
                                    </span>
                                  )}
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
                  <div className="space-y-4 sm:space-y-8">
                    {paragraphs.map((paragraph, i) => (
                      <p key={i} className={`text-gray-800 dark:text-gray-200 leading-relaxed sm:leading-loose text-base sm:text-lg font-serif text-justify tracking-normal sm:tracking-wide ${i === 0 ? "first-letter:text-4xl sm:first-letter:text-6xl lg:first-letter:text-7xl first-letter:font-bold first-letter:float-left first-letter:mr-1 sm:first-letter:mr-3 first-letter:mt-1 first-letter:leading-none first-letter:text-teal-600 dark:first-letter:text-teal-400" : ""}`}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                {savedCount >= 5 ? (
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center p-4 bg-green-100 dark:bg-green-900 rounded-xl border border-green-200 dark:border-green-700 mb-4">
                      <CheckCircle2Icon className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
                      <div>
                        <h3 className="font-semibold text-green-800 dark:text-green-200">{t("phaseCompleted")}</h3>
                        <p className="text-sm text-green-600 dark:text-green-300">{t("sentencesSavedToCollection", { count: savedCount })}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="submit"
                    disabled={selectedCount < 5 || saving}
                    size="lg"
                    className={`w-full ${selectedCount >= 5 ? "bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700" : "bg-gray-400 cursor-not-allowed"}`}
                  >
                    {saving ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        {t("saving")}
                      </div>
                    ) : (
                      <><BookmarkIcon className="w-5 h-5 mr-2" />{t("addSentencesToCollection", { count: selectedCount })}</>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>

      {/* Guide */}
      <div className="bg-gradient-to-r from-green-300 to-emerald-300 dark:from-green-950 dark:to-emerald-950 p-6 rounded-xl border border-green-200 dark:border-green-800">
        <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">{t("sentenceCollectionGuide")}</h3>
        <div className="grid gap-3 text-sm text-green-700 dark:text-green-300">
          {[
            { color: "bg-green-500", label: t("simple"), desc: t("simpleSentencesDesc") },
            { color: "bg-yellow-500", label: t("medium"), desc: t("mediumSentencesDesc") },
            { color: "bg-red-500", label: t("complex"), desc: t("complexSentencesDesc") },
          ].map(({ color, label, desc }) => (
            <div key={label} className="flex items-start">
              <span className={`w-2 h-2 ${color} rounded-full mr-3 mt-2 flex-shrink-0`} />
              <div><strong>{label} sentences:</strong> {desc}</div>
            </div>
          ))}
          <div className="flex items-start mt-4 pt-3 border-t border-green-300 dark:border-green-700">
            <BookmarkIcon className="w-4 h-4 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <strong>{t("howToSelect")}:</strong> {t("howToSelectDesc")}{" "}
              {showTranslation && <>{t("useTranslationFeature")}</>}
            </div>
          </div>
          <div className="flex items-start">
            <LockIcon className="w-4 h-4 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
            <div><strong>{t("alreadyCollected")}:</strong> {t("alreadyCollectedDesc")}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

Phase6SentenceCollection.displayName = "Phase6SentenceCollection";
export default Phase6SentenceCollection;
