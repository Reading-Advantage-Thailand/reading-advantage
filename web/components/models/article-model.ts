export interface ArticleShowcase {
    average_rating: number;
    cefr_level: string;
    id: string;
    ra_level: string;
    summary: string;
    title: string;
    is_read: boolean;
    is_approved: boolean;
}

export interface Article {
    summary: string;
    image_description: string;
    passage: string;
    created_at: string;
    average_rating: number;
    timepoints: Timepoint[];
    type: string;
    title: string;
    cefr_level: string;
    thread_id: string;
    ra_level: number;
    subgenre: string;
    genre: string;
    id: string;
    read_count: number;
}

export interface Timepoint {
    timeSeconds: number;
    markName: string;
}

