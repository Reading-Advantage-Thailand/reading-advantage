// full-story-generator.ts
import { ArticleType, ArticleBaseCefrLevel } from "../../models/enum";
import { StoryBible } from "./chapter-outline-generator";
import { generateStoriesArticle } from "./stories-article-generator";

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
Create a complete, structured story in the ${genre} genre (${subgenre}) based on the provided Story Bible.
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
  .map((c: { name: string; description: string }) => `${c.name}: ${c.description}`)
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

  // จำกัดจำนวนคำตาม wordCountLimit
  const words = fullStory.passage.split(" ");
  const trimmedContent = words.slice(0, wordCountLimit).join(" ");

  return trimmedContent;
}
