import { QuizStatus } from "./questions-model";

// export interface UserArticleRecord {
//     id: string;
//     user_id: string;
//     article_id: string;
//     rated: number;
//     scores: number;
//     created_at: string;
//     updated_at: string;
//     status: QuizStatus;
//     title: string;
//     level: number;
// }

export interface UserActivityLog {
  contentId: string;
  userId: string;
  articleId: string;
  activityType: string;
  activityStatus: string;
  timestamp: string;
  timeTaken: number;
  xpEarned: number;
  initialXp: number;
  finalXp: number;
  initialLevel: number;
  finalLevel: number;
  details: {};
}

export enum UserXpEarned {
  MC_Question = 2,
  Article_Rating = 10,
  Vocabulary_Flashcards = 15,
  Vocabulary_Matching = 5,
  Sentence_Flashcards = 15,
  Sentence_Matching = 5,
  Sentence_Cloze_Test = 2,
  Sentence_Ordering = 5,
  Sentence_Word_Ordering = 5,
}

export enum ActivityType {
  ArticleRating = "article_rating",
  ArticleRead = "article_read",
  LevelTest = "level_test",
  MC_Question = "mc_question",
  SA_Question = "sa_question",
  LA_Question = "la_question",
  SentenceFlashcards = "sentence_flashcards",
  SentenceMatching = "sentence_matching",
  SentenceOrdering = "sentence_ordering",
  SentenceWordOrdering = "sentence_word_ordering",
  SentenceClozeTest = "sentence_cloze_test",
  VocabularyFlashcards = "vocabulary_flashcards",
  VocabularyMatching = "vocabulary_matching",
}

export enum ActivityStatus {
  InProgress = "in_progress",
  Completed = "completed",
}
