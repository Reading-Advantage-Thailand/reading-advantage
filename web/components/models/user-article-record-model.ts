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

export interface UserArticleRecord {
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
