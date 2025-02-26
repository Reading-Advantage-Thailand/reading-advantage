import { ArticleBaseCefrLevel, ArticleType } from "@/server/models/enum";

// ประกาศ Type สำหรับ StoryBible
export interface GenerateStoryArticleParams {
  type: ArticleType;
  genre: string;
  subgenre: string;
  topic: string;
  cefrLevel: ArticleBaseCefrLevel;
  chapterNumber: number;
  previousContent?: string;
  previousSummary?: string;
  wordCountLimit: number;
  storyBible?: StoryBible;
  plotProgression?: string; // plot progression ที่ส่งมาจาก generateStories
  chapterCount?: number; // จำนวนบททั้งหมด เพื่อรู้ว่าตอนนี้เป็นบทสุดท้ายหรือไม่
}

interface Place {
  name: string;
  description: string;
}

interface CharacterArc {
  startingState: string;
  development: string;
  endState: string;
}

interface Character {
  name: string;
  description: string;
  background?: string;
  speechPatterns?: string;
  arc?: CharacterArc;
  relationships?: {
    withCharacter: string;
    nature: string;
    evolution: string;
  }[];
}

interface StorySetting {
  time: string;
  places: Place[];
}

interface StoryTheme {
  theme: string;
  development: string;
}

interface MainPlot {
  premise: string;
  exposition: string;
  risingAction: string;
  climax: string;
  fallingAction: string;
  resolution: string;
}

export interface StoryBible {
  mainPlot: MainPlot;
  characters: Character[];
  setting: StorySetting;
  themes: StoryTheme[];
  worldRules?: String;
}

export async function generateChapterOutline({
  topic,
  chapterNumber,
  cefrLevel,
}: {
  topic: string;
  chapterNumber: number;
  cefrLevel: ArticleBaseCefrLevel;
}) {
  return {
    chapterNumber,
    title: `Chapter ${chapterNumber}: Key Event`,
    summary: `This chapter covers major developments in ${topic}.`,
  };
}
