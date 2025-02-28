// full-story-generator.ts
import { ArticleType, ArticleBaseCefrLevel } from "../../models/enum";
import { generateStoriesArticle } from "./stories-article-generator";

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

interface GenerateFullStoryParams {
  type: ArticleType;
  genre: string;
  subgenre: string;
  topic: string;
  cefrLevel: ArticleBaseCefrLevel;
  storyBible: StoryBible;
  wordCountLimit: number;
  characterList: string[];
  mainPlot: {
    premise: string;
    exposition: string;
    risingAction: string;
    climax: string;
    fallingAction: string;
    resolution: string;
  };
  themes: string[];
  worldRules: string[];
}

export async function generateFullStory({
  type,
  genre,
  subgenre,
  topic,
  cefrLevel,
  storyBible,
  wordCountLimit,
}: GenerateFullStoryParams): Promise<string> {
  console.log(`Generating full story for topic: ${topic}`);

  // สร้าง context จาก Story Bible เพื่อให้ AI สร้างเรื่องที่สอดคล้องกับเนื้อหาและองค์ประกอบที่กำหนดไว้
  const promptContext = `
Write a complete structured story in the ${genre} genre (${subgenre}) with a word limit of approximately ${wordCountLimit} words.
Ensure the story has a clear beginning, middle, and end, and that the resolution is not cut off.
The main plot follows this structure:
- Premise: ${storyBible.mainPlot.premise}
- Exposition: ${storyBible.mainPlot.exposition}
- Rising Action: ${storyBible.mainPlot.risingAction}
- Climax: ${storyBible.mainPlot.climax}
- Falling Action: ${storyBible.mainPlot.fallingAction}
- Resolution: ${storyBible.mainPlot.resolution}

Setting: ${storyBible.setting.time}
Key Places: ${storyBible.setting.places.map((p) => p.name).join(", ")}

Characters:
${storyBible.characters
  .map(
    (c: { name: string; description: string }) => `${c.name}: ${c.description}`
  )
  .join("; ")}

Themes to include: ${storyBible.themes.map((t) => t.theme).join(", ")}
`;

  // เรียกใช้ generateStoriesArticle โดยส่ง context จาก Story Bible ไปด้วย
  const fullStory = await generateStoriesArticle({
    type,
    genre,
    subgenre,
    topic,
    cefrLevel,
    previousContent: promptContext,
  });

  return fullStory.passage;
}
