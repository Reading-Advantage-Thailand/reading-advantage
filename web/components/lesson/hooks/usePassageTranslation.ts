"use client";

import { useState } from "react";
import type { SupportedLocale, TranslatedPassage } from "../types";

export interface UsePassageTranslationOptions {
  articleId: string;
  locale: SupportedLocale;
  /** Pre-loaded translations already in the article payload */
  existingTranslations: TranslatedPassage;
}

export interface UsePassageTranslationReturn {
  translatedSentences: string[];
  isTranslating: boolean;
  translationError: string | null;
  showTranslation: boolean;
  selectedForTranslation: number | null;
  setSelectedForTranslation: (index: number | null) => void;
  handleTranslationToggle: () => void;
  getTranslation: (sentenceIndex: number, fallbackLabel: string) => string;
}

/**
 * Manages passage translation state for Phase 6 (Sentence Collection).
 * - Uses existing translations from the article payload first
 * - Lazily fetches from API when the user enables the translation toggle
 */
export function usePassageTranslation({
  articleId,
  locale,
  existingTranslations,
}: UsePassageTranslationOptions): UsePassageTranslationReturn {
  const [translatedSentences, setTranslatedSentences] = useState<string[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [selectedForTranslation, setSelectedForTranslation] = useState<
    number | null
  >(null);

  const fetchTranslations = async () => {
    if (translatedSentences.length > 0) return; // Already fetched
    setIsTranslating(true);
    setTranslationError(null);

    try {
      const response = await fetch(
        `/api/v1/assistant/translate/${articleId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "passage", targetLanguage: locale }),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch translations");
      const data = await response.json();
      setTranslatedSentences(data.translated_sentences || []);
    } catch (error) {
      console.error("Translation error:", error);
      setTranslationError("Failed to load translations");
      // Fallback to existing translations in article data
      setTranslatedSentences(existingTranslations[locale] || []);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslationToggle = () => {
    const next = !showTranslation;
    setShowTranslation(next);
    if (next && translatedSentences.length === 0) fetchTranslations();
    if (!next) setSelectedForTranslation(null);
  };

  const getTranslation = (
    sentenceIndex: number,
    fallbackLabel: string
  ): string => {
    if (translatedSentences.length > 0 && translatedSentences[sentenceIndex]) {
      return translatedSentences[sentenceIndex];
    }
    const fallback = existingTranslations[locale] || [];
    return fallback[sentenceIndex] || fallbackLabel;
  };

  return {
    translatedSentences,
    isTranslating,
    translationError,
    showTranslation,
    selectedForTranslation,
    setSelectedForTranslation,
    handleTranslationToggle,
    getTranslation,
  };
}
