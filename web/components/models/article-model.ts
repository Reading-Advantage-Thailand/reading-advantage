import { StoryBible } from "@/app/[locale]/(student)/student/stories/[storyId]/page";

export interface ArticleShowcase {
  average_rating: number;
  cefr_level: string;
  id: string;
  ra_level?: string;
  summary?: string;
  title: string;
  is_read?: boolean;
  is_completed?: boolean;
  is_approved?: boolean;
  type?: string;
  subgenre?: string;
  genre?: string;
  storyBible?: StoryBible;
}

export interface StoryChapter {
  storyId: string;
  chapterNumber: string;
  ra_Level: number;
  cefr_level: string;
  type:string
  genre: string;
  subgenre : string;
  totalChapters: number;
  storyBible: StoryBible;
  chapter: {
    title: string;
    content: string;
    summary: string;
    "image-description": string;
    analysis: {
      wordCount: number;
      averageSentenceLength: number;
      vocabulary: {
        uniqueWords: number;
        complexWords: number;
        targetWordsUsed: [];
      };
      grammarStructures: [];
      readabilityScore: number;
    };
    questions: {
      type: string;
      question: string;
      options: string[];
      answer: string;
    }[];
  };
  timepoints: Timepoint[];
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
  file: string;
  index: number;
  sentences: string;
}
