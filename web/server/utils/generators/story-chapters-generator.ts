<<<<<<< HEAD
import { ArticleBaseCefrLevel, ArticleType } from "../../models/enum";
import { generateObject } from "ai";
import { openai, openaiModel4o } from "@/utils/openai";
import { z } from "zod";
import { getCEFRRequirements } from "../CEFR-requirements";

// Import functions สำหรับสร้างคำถามที่มีอยู่แล้ว
import { generateMCQuestion } from "./mc-question-generator";
import { generateSAQuestion } from "./sa-question-generator";
import { generateLAQuestion } from "./la-question-generator";

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

interface StoryBible {
  mainPlot: MainPlot;
  characters: Character[];
  setting: StorySetting;
  themes: StoryTheme[];
  worldRules?: String;
}
=======
import { StoryBible } from "./chapter-outline-generator";
import { ArticleBaseCefrLevel } from "../../models/enum";
import { generateObject } from "ai";
import { google, googleModel } from "@/utils/google";
>>>>>>> a7a3c6c9 (fix : make ai response storybible and story outline currect and minor fix some function)

interface Chapter {
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
      targetWordsUsed: string[];
    };
    grammarStructures: string[];
    readabilityScore: number;
  };
  continuityData: {
    events: string[];
    characterStates: {
      character: string;
      currentState: string;
      location: string;
    }[];
    introducedElements: string[];
  };
<<<<<<< HEAD
  questions: Question[];
}

interface Question {
  type: "MCQ" | "SAQ" | "LAQ";
  question: string;
  options?: string[];
  answer: string;
}

interface GenerateChaptersParams {
  type: string;
=======
}

interface GenerateChaptersParams {
  fullStory: string;
>>>>>>> a7a3c6c9 (fix : make ai response storybible and story outline currect and minor fix some function)
  storyBible: StoryBible;
  cefrLevel: ArticleBaseCefrLevel;
  previousChapters?: Chapter[];
  chapterCount: number;
<<<<<<< HEAD
  wordCountPerChapter: number;
}

const ChapterSchema = z.object({
  title: z.string(),
  content: z.string(),
  summary: z.string(),
  "image-description": z.string(),
  analysis: z.object({
    wordCount: z.number(),
    averageSentenceLength: z.number(),
    vocabulary: z.object({
      uniqueWords: z.number(),
      complexWords: z.number(),
      targetWordsUsed: z.array(z.string()),
    }),
    grammarStructures: z.array(z.string()),
    readabilityScore: z.number(),
  }),
  continuityData: z.object({
    events: z.array(z.string()),
    characterStates: z.array(
      z.object({
        character: z.string(),
        currentState: z.string(),
        location: z.string(),
      })
    ),
    introducedElements: z.array(z.string()),
  }),
  questions: z.array(
    z.object({
      type: z.enum(["MCQ", "SAQ", "LAQ"]),
      question: z.string(),
      options: z.array(z.string()).optional(),
      answer: z.string(),
    })
  ),
});

const ChaptersSchema = z.object({
  chapters: z.array(ChapterSchema),
});

export async function generateChapters({
  type,
  storyBible,
  cefrLevel,
  chapterCount,
  wordCountPerChapter,
}: GenerateChaptersParams): Promise<Chapter[]> {
  console.log(
    `Generating ${chapterCount} chapters for CEFR level ${cefrLevel}...`
  );

  let chapters: Chapter[] = [];

  try {
    for (let i = 0; i < chapterCount; i++) {
      console.log(`Generating Chapter ${i + 1} of ${chapterCount}...`);

      const previousChapters = chapters.length > 0 ? chapters : [];

      const newChapter = await generateSingleChapter({
        storyBible,
        cefrLevel,
        wordCountPerChapter,
        previousChapters, // ส่งบทก่อนหน้าให้ AI ใช้เป็น context
      });

      if (!newChapter) {
        throw new Error(`Failed to generate chapter ${i + 1}`);
      }

      // เพิ่มบทใหม่ในลิสต์
      chapters.push(newChapter);

      // สร้างคำถาม
      const questions = await generateChapterQuestions(newChapter, type, cefrLevel);
      newChapter.questions = questions;
    }

    return chapters;
=======
}

function findChapters(obj: any): any[] | null {
  if (obj && typeof obj === "object") {
    if (obj.hasOwnProperty("chapters") && Array.isArray(obj["chapters"])) {
      return obj["chapters"];
    }
    for (const key in obj) {
      const result = findChapters(obj[key]);
      if (result) return result;
    }
  }
  return null;
}

export async function generateChaptersFromStory({
  fullStory,
  storyBible,
  cefrLevel,
  previousChapters = [],
  chapterCount,
}: GenerateChaptersParams): Promise<Chapter[]> {
  console.log("Splitting story into chapters with AI assistance...");

  try {
    const structuredChapters = await aiProcessChapters({
      fullStory,
      storyBible,
      chapterCount,
    });

    // ตรวจสอบจำนวนบทที่ได้ตามที่ต้องการ
    if (structuredChapters.length !== chapterCount) {
      throw new Error(
        `Expected ${chapterCount} chapters, but got ${structuredChapters.length}`
      );
    }

    return structuredChapters;
>>>>>>> a7a3c6c9 (fix : make ai response storybible and story outline currect and minor fix some function)
  } catch (error) {
    console.error("Error generating chapters:", error);
    throw error;
  }
}

<<<<<<< HEAD
/**
 * ฟังก์ชันให้ AI สร้างบทเดียว โดยอิงจาก Story Bible และบทก่อนหน้า
 */
async function generateSingleChapter({
  storyBible,
  cefrLevel,
  wordCountPerChapter,
  previousChapters,
}: {
  storyBible: StoryBible;
  cefrLevel: ArticleBaseCefrLevel;
  wordCountPerChapter: number;
  previousChapters: Chapter[];
}): Promise<Chapter | null> {
  console.log(`Processing single chapter with AI (CEFR: ${cefrLevel})...`);

  const cefrRequirements = getCEFRRequirements(cefrLevel);
  const minWordCount = Math.floor(wordCountPerChapter * 0.9);
  const maxWordCount = Math.ceil(wordCountPerChapter * 1.1);

  const previousChapterSummaries = previousChapters
    .map((c, index) => `Chapter ${index + 1}: ${c.summary}`)
    .join("\n");

  const prompt = `
Generate a new structured chapter for a story based on the Story Bible and the previous chapters provided. This chapter should continue the logical progression of the story while maintaining CEFR level (${cefrLevel}) constraints.

**Story Bible:**
- **Main Plot:** ${storyBible.mainPlot.premise}
- **Setting:** ${storyBible.setting.time}, Locations: ${storyBible.setting.places.map(p => p.name).join(", ")}
- **Characters:** ${storyBible.characters.map(c => c.name).join(", ")}
- **Themes:** ${storyBible.themes.map(t => t.theme).join(", ")}

**Previous Chapters Summary:**
${previousChapterSummaries || "None (This is the first chapter)"}

**CEFR Constraints (${cefrLevel}):**
- **Word Count per Chapter:** ${minWordCount} - ${maxWordCount} words
- **Vocabulary Level:** ${cefrRequirements.vocabulary.level}
- **Grammar Restrictions:** ${cefrRequirements.grammar.restrictions.join(", ")}

Ensure that:
- The chapter logically follows from previous events.
- Character states, introduced elements, and locations remain consistent.
- The text meets CEFR-level requirements for readability, grammar, and vocabulary.
- Include an **image-description** summarizing the chapter visually.

Return only valid JSON.
`;

  try {
    const response = await generateObject({
      model: openai(openaiModel4o),
      schema: ChapterSchema,
      prompt,
      temperature: 1,
    });

    return response.object;
  } catch (error) {
    console.error("Error generating single chapter:", error);
    return null;
  }
}

/**
 * ฟังก์ชันสร้างคำถามให้แต่ละบท
 */
async function generateChapterQuestions(
  chapter: Chapter,
  type: string,
  cefrLevel: ArticleBaseCefrLevel
): Promise<Question[]> {
  try {
    // สร้าง MCQ
    const mcResponse = await generateMCQuestion({
      cefrlevel: cefrLevel,
      type: type === "fiction" ? ArticleType.FICTION : ArticleType.NONFICTION,
      passage: chapter.content,
      title: chapter.title,
      summary: chapter.summary,
      imageDesc: chapter["image-description"],
    });
    const mcQuestions = (mcResponse?.questions || []).map((q) => ({
      type: "MCQ" as const,
      question: q.question || "Missing question",
      options: [
        q.correct_answer,
        q.distractor_1 || "Option 1",
        q.distractor_2 || "Option 2",
        q.distractor_3 || "Option 3",
      ].filter(Boolean),
      answer: q.correct_answer || "No answer",
    }));

    // สร้าง SAQ
    const saResponse = await generateSAQuestion({
      cefrlevel: cefrLevel,
      type: type === "fiction" ? ArticleType.FICTION : ArticleType.NONFICTION,
      passage: chapter.content,
      title: chapter.title,
      summary: chapter.summary,
      imageDesc: chapter["image-description"],
    });
    const saQuestions = (saResponse?.questions || []).map((q) => ({
      type: "SAQ" as const,
      question: q.question || "Missing question",
      answer: q.suggested_answer || "No answer",
    }));

    // สร้าง LAQ
    const laResponse = await generateLAQuestion({
      cefrlevel: cefrLevel,
      type: type === "fiction" ? ArticleType.FICTION : ArticleType.NONFICTION,
      passage: chapter.content,
      title: chapter.title,
      summary: chapter.summary,
      imageDesc: chapter["image-description"],
    });
    const laQuestion = {
      type: "LAQ" as const,
      question: laResponse?.question || "Missing question",
      answer: "",
    };

    return [...mcQuestions, ...saQuestions, laQuestion];
  } catch (error) {
    console.error("Error generating questions:", error);
    return [];
  }
}
=======
async function aiProcessChapters({
  fullStory,
  storyBible,
  chapterCount,
}: {
  fullStory: string;
  storyBible: StoryBible;
  chapterCount: number;
}): Promise<Chapter[]> {
  console.log("Processing story structure with AI...");

  // สร้าง prompt โดยผสมข้อมูลจาก Story Bible ให้ครบถ้วน
  const prompt = `
Using the following Story Bible details, split the full story into ${chapterCount} well-structured chapters.
The chapters must incorporate the key plot points, characters, setting, themes, and other elements as specified below.

Story Bible:
Main Plot:
  - Premise: ${storyBible.mainPlot.premise}
  - Exposition: ${storyBible.mainPlot.exposition}
  - Rising Action: ${storyBible.mainPlot.risingAction}
  - Climax: ${storyBible.mainPlot.climax}
  - Falling Action: ${storyBible.mainPlot.fallingAction}
  - Resolution: ${storyBible.mainPlot.resolution}

Characters:
${storyBible.characters
  .map((c: any) => `  - ${c.name}: ${c.description}`)
  .join("\n")}

Setting:
  Time: ${storyBible.setting.time}
  Places:
${storyBible.setting.places
  .map((p: any) => `  - ${p.name}: ${p.description}`)
  .join("\n")}

World Rules:
${storyBible.worldRules ? storyBible.worldRules : "  - None specified."}

Themes:
${storyBible.themes
  .map((t: any) => `  - ${t.theme}: ${t.development}`)
  .join("\n")}

Full Story:
${fullStory}

Please ensure that each chapter reflects these details and maintains consistency with the Story Bible.
Return the result as a JSON object with the following structure:
{
  "chapters": [
    {  
      "chapter_number": number
      "title": "Chapter title",
      "content": "Complete chapter text including all narrative elements",
      "summary": "A one-sentence summary without spoilers",
      "image-description": "Detailed description of an image to be displayed alongside the chapter summary",
      "analysis": {
         "wordCount": number,
         "averageSentenceLength": number,
         "vocabulary": {
            "uniqueWords": number,
            "complexWords": number,
            "targetWordsUsed": [string]
         },
         "grammarStructures": [string],
         "readabilityScore": number
      },
      "continuityData": {
         "events": [string],
         "characterStates": [
            {
              "character": string,
              "currentState": string,
              "location": string
            }
         ],
         "introducedElements": [string]
      }
    }
  ]
}
`;

  const response = await generateObject({
    model: google(googleModel),
    prompt,
    temperature: 1,
    output: "no-schema", // เพิ่ม property นี้ให้ตรงตาม type definition
  });

  // แปลง response ให้เป็น JSON ธรรมดา
  const parsedResponse = JSON.parse(JSON.stringify(response));

  const chapters = findChapters(parsedResponse);
  if (!chapters) {
    console.error("Invalid AI response format:", parsedResponse);
    throw new Error("AI did not return a valid array for chapters.");
  }
  return chapters as Chapter[];
}
>>>>>>> a7a3c6c9 (fix : make ai response storybible and story outline currect and minor fix some function)
