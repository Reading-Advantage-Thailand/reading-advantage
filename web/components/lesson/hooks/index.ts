/**
 * Barrel export for lesson custom hooks.
 */
export { useArticleAudio } from "./useArticleAudio";
export type { UseArticleAudioOptions, UseArticleAudioReturn } from "./useArticleAudio";

export { usePassageTranslation } from "./usePassageTranslation";
export type { UsePassageTranslationOptions, UsePassageTranslationReturn } from "./usePassageTranslation";

export {
  useGameTimer,
  useDragAndDrop,
  useActivityCheck,
  generateClozeBlanksSentence,
  shuffleArray,
  COMMON_ENGLISH_WORDS,
} from "./useGameActivity";
export type {
  UseGameTimerReturn,
  UseDragAndDropReturn,
  UseActivityCheckOptions,
  UseActivityCheckReturn,
} from "./useGameActivity";
