import { QuizStatus } from "./questions-model";

export interface UserArticleRecord {
    id: string;
    user_id: string;
    article_id: string;
    rated: number;
    scores: number;
    created_at: string;
    updated_at: string;
    status: QuizStatus;
    title: string;
    level: number;
}
