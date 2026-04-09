/**
 * Shared types for the lesson domain.
 * Import from here instead of re-defining per-file.
 */

// -------------------------------------------------------
// Article / Audio
// -------------------------------------------------------

/** A single audio-synced sentence from the article timepoints field. */
export interface TimePoint {
  file: string;
  index: number;
  markName: string;
  sentences: string;
  timeSeconds: number;
}

/** Per-language translated sentences array keyed by locale code. */
export interface TranslatedPassage {
  cn?: string[];
  en?: string[];
  th?: string[];
  tw?: string[];
  vi?: string[];
}

// -------------------------------------------------------
// Locale
// -------------------------------------------------------

export type SupportedLocale = "en" | "th" | "cn" | "tw" | "vi";

// -------------------------------------------------------
// Lesson phase common props
// -------------------------------------------------------

/**
 * Minimum prop shape that every phase component that shows an
 * article must accept. Extend per-phase as needed.
 */
export interface LessonPhaseBaseProps {
  articleId: string;
  userId: string;
  onCompleteChange: (complete: boolean) => void;
}
