/**
 * Shared hooks and utilities for lesson game activities
 * (cloze test, order sentence, order word, matching, flashcards).
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { formatTime } from "../utils";

// ─────────────────────────────────────────────────────────────────────────────
// Game Timer Hook
// ─────────────────────────────────────────────────────────────────────────────

export interface UseGameTimerReturn {
  /** Elapsed seconds (display value, updated every 1s) */
  displayTimer: number;
  /** Current elapsed raw value (via ref — no re-render overhead) */
  timerRef: React.MutableRefObject<number>;
  /** Formatted "M:SS" string */
  formattedTime: string;
  resetTimer: () => void;
}

/**
 * Simple interval-based game timer.
 * Only ticks when `isPlaying === true` and `isComplete === false`.
 */
export function useGameTimer(
  isPlaying: boolean,
  isComplete: boolean
): UseGameTimerReturn {
  const timerRef = useRef(0);
  const [displayTimer, setDisplayTimer] = useState(0);

  useEffect(() => {
    if (!isPlaying || isComplete) return;
    const interval = setInterval(() => {
      timerRef.current += 1;
      setDisplayTimer(timerRef.current);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, isComplete]);

  const resetTimer = useCallback(() => {
    timerRef.current = 0;
    setDisplayTimer(0);
  }, []);

  return {
    displayTimer,
    timerRef,
    formattedTime: formatTime(displayTimer),
    resetTimer,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Drag-and-Drop Hook
// ─────────────────────────────────────────────────────────────────────────────

export interface UseDragAndDropReturn<T> {
  draggedItem: T | null;
  dragOverIndex: number | null;
  handleDragStart: (item: T) => void;
  handleDragOver: (e: React.DragEvent, index: number) => void;
  handleDrop: (
    e: React.DragEvent,
    dropIndex: number,
    items: T[],
    onReorder: (items: T[]) => void
  ) => void;
  handleDragEnd: () => void;
}

/**
 * Generic drag-and-drop reordering hook.
 * Works with any item type that has an `id` field.
 */
export function useDragAndDrop<T extends { id: string }>(): UseDragAndDropReturn<T> {
  const [draggedItem, setDraggedItem] = useState<T | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((item: T) => {
    setDraggedItem(item);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      setDragOverIndex(index);
    },
    []
  );

  const handleDrop = useCallback(
    (
      e: React.DragEvent,
      dropIndex: number,
      items: T[],
      onReorder: (items: T[]) => void
    ) => {
      e.preventDefault();
      if (!draggedItem) return;

      const fromIndex = items.findIndex((item) => item.id === draggedItem.id);
      if (fromIndex === -1 || fromIndex === dropIndex) {
        setDraggedItem(null);
        setDragOverIndex(null);
        return;
      }

      const newItems = [...items];
      const [removed] = newItems.splice(fromIndex, 1);
      newItems.splice(dropIndex, 0, removed);
      onReorder(newItems);

      setDraggedItem(null);
      setDragOverIndex(null);
    },
    [draggedItem]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverIndex(null);
  }, []);

  return {
    draggedItem,
    dragOverIndex,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Activity Check Hook
// ─────────────────────────────────────────────────────────────────────────────

export interface UseActivityCheckOptions {
  userId: string;
  articleId: string;
  activityType: string;
  onCompleteChange: (complete: boolean) => void;
}

export interface UseActivityCheckReturn {
  isAlreadyCompleted: boolean;
  existingActivityData: any | null;
  checkExistingActivity: () => Promise<boolean>;
}

/**
 * Checks if a lesson activity has already been completed by the user.
 * Used at the start of cloze-test, order-sentence, etc.
 */
export function useActivityCheck({
  userId,
  articleId,
  activityType,
  onCompleteChange,
}: UseActivityCheckOptions): UseActivityCheckReturn {
  const [isAlreadyCompleted, setIsAlreadyCompleted] = useState(false);
  const [existingActivityData, setExistingActivityData] = useState<any>(null);

  const checkExistingActivity = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(
        `/api/v1/users/${userId}/activitylog?articleId=${articleId}&activityType=${activityType}`
      );
      if (!response.ok) return false;

      const data = await response.json();
      const existing = data.activityLogs?.find(
        (a: any) =>
          a.activityType === activityType &&
          a.targetId === articleId &&
          a.completed
      );

      if (existing) {
        setIsAlreadyCompleted(true);
        setExistingActivityData(existing);
        onCompleteChange(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [userId, articleId, activityType, onCompleteChange]);

  return { isAlreadyCompleted, existingActivityData, checkExistingActivity };
}

// ─────────────────────────────────────────────────────────────────────────────
// Common Word List (for cloze blank generation)
// ─────────────────────────────────────────────────────────────────────────────

export const COMMON_ENGLISH_WORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "had",
  "her", "was", "one", "our", "out", "day", "get", "has", "him", "his",
  "how", "its", "may", "new", "now", "old", "see", "two", "way", "who",
  "boy", "did", "man", "end", "few", "run", "own", "say", "she", "too",
  "use", "many", "some", "time", "very", "when", "much", "know", "take",
  "than", "only", "think", "also", "back", "after", "first", "well",
  "year", "work", "such", "make", "even", "most", "give",
]);

/**
 * Generates cloze blanks for a sentence based on difficulty.
 * Extracted from LessonClozeTest to be a pure, testable function.
 */
export function generateClozeBlanksSentence(
  sentenceData: {
    sentence: string;
    words: Array<{ word: string; start: number; end: number }>;
    blanks: Array<{ id: string; position: number; correctAnswer: string; options: string[]; hint?: string }>;
  },
  difficulty: "easy" | "medium" | "hard"
) {
  const blankCount = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;

  const candidateWords = sentenceData.words.filter(({ word }) => {
    const w = word.toLowerCase();
    return w.length > 2 && !COMMON_ENGLISH_WORDS.has(w) && /^[a-zA-Z]+$/.test(w);
  });

  const selectedWords = [...candidateWords]
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(blankCount, candidateWords.length));

  const blanks = selectedWords.map((wordObj, index) => {
    const position = sentenceData.sentence.indexOf(wordObj.word);
    const options = [wordObj.word];
    const distractors = sentenceData.words
      .map((w) => w.word)
      .filter(
        (w) =>
          w !== wordObj.word &&
          w.length >= wordObj.word.length - 2 &&
          w.length <= wordObj.word.length + 2
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    options.push(...distractors);
    return {
      id: `blank-${index}`,
      position,
      correctAnswer: wordObj.word,
      options: options.sort(() => Math.random() - 0.5),
      hint: `Word that starts at ${wordObj.start.toFixed(1)}s`,
    };
  });

  return {
    ...sentenceData,
    blanks: blanks.sort((a, b) => a.position - b.position),
    difficulty,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Shuffle helper
// ─────────────────────────────────────────────────────────────────────────────

/** Fisher-Yates shuffle (returns a new array) */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
