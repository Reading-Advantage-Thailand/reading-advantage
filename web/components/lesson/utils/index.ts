/**
 * Shared utility functions for the lesson domain.
 */

import { ActivityStatus, ActivityType } from "../../models/user-activity-log-model";
import type { Article } from "../../models/article-model";

// -------------------------------------------------------
// Time formatting
// -------------------------------------------------------

/**
 * Format a duration in seconds as "M:SS".
 * e.g. formatTime(90) → "1:30"
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format elapsed seconds as a human-readable "Xm Ys" string.
 * e.g. formatElapsedTime(90) → "1m 30s"
 */
export function formatElapsedTime(seconds: number): string {
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

// -------------------------------------------------------
// Sentence grouping
// -------------------------------------------------------

/**
 * Groups a flat list of sentences into paragraph buckets using a simple
 * heuristic: start a new group when the current group has ≥3 sentences,
 * the last sentence ends with punctuation, and the sentence is long enough.
 *
 * Returns an array of groups, each group being an array of sentence indices.
 */
export function groupSentencesIntoParagraphs(sentences: string[]): number[][] {
  const groups: number[][] = [];
  let current: number[] = [];

  sentences.forEach((sentence, index) => {
    current.push(index);

    const endsWithPunctuation =
      sentence.trim().endsWith(".") ||
      sentence.trim().endsWith("!") ||
      sentence.trim().endsWith("?");

    const nextSentence = sentences[index + 1];

    if (
      endsWithPunctuation &&
      nextSentence &&
      current.length >= 3 &&
      sentence.trim().length > 50
    ) {
      groups.push([...current]);
      current = [];
    }
  });

  if (current.length > 0) {
    groups.push(current);
  }

  return groups;
}

// -------------------------------------------------------
// Lesson API helpers
// -------------------------------------------------------

/**
 * Build the lesson progress API URL, optionally including a classroomId.
 */
export function buildLessonApiUrl(
  userId: string,
  articleId: string,
  classroomId?: string
): string {
  const base = `/api/v1/lesson/${userId}?articleId=${articleId}`;
  return classroomId ? `${base}&classroomId=${classroomId}` : base;
}

// -------------------------------------------------------
// Activity logging
// -------------------------------------------------------

export interface LogLessonActivityOptions {
  userId: string;
  article: Article;
  elapsedTime: number;
}

/**
 * Fire-and-forget helper that logs a LessonRead Completed activity.
 * Extracted to avoid duplicating fetch logic across nextPhase / skipPhase.
 */
export async function logLessonActivity({
  userId,
  article,
  elapsedTime,
}: LogLessonActivityOptions): Promise<void> {
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
