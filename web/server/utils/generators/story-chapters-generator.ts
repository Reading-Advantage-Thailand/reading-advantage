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
  storyBible: StoryBible;
  cefrLevel: ArticleBaseCefrLevel;
  previousChapters?: Chapter[];
  chapterCount: number;
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
    `Splitting story into ${chapterCount} chapters with CEFR level ${cefrLevel} constraints...`
  );

  try {
    // เรียกสร้างบทโดยไม่รวมส่วนคำถาม (MCQ, SAQ, LAQ) ใน prompt
    const structuredChapters = await aiProcessChapters({
      storyBible,
      cefrLevel,
      chapterCount,
      wordCountPerChapter,
    });

    if (structuredChapters.length !== chapterCount) {
      throw new Error(
        `Expected ${chapterCount} chapters, but got ${structuredChapters.length}`
      );
    }

    // สำหรับแต่ละบท ให้เรียกใช้ฟังก์ชันสร้างคำถามที่มีอยู่เดิม
    for (const chapter of structuredChapters) {
      // สร้างคำถามแบบ MCQ
      const mcResponse = await generateMCQuestion({
        cefrlevel: cefrLevel,
        type: type === "fiction" ? ArticleType.FICTION : ArticleType.NONFICTION,
        passage: chapter.content,
        title: chapter.title,
        summary: chapter.summary,
        imageDesc: chapter["image-description"],
      });
      // สร้างคำถามแบบ SAQ
      const saResponse = await generateSAQuestion({
        cefrlevel: cefrLevel,
        type: type === "fiction" ? ArticleType.FICTION : ArticleType.NONFICTION,
        passage: chapter.content,
        title: chapter.title,
        summary: chapter.summary,
        imageDesc: chapter["image-description"],
      });
      // สร้างคำถามแบบ LAQ
      const laResponse = await generateLAQuestion({
        cefrlevel: cefrLevel,
        type: type === "fiction" ? ArticleType.FICTION : ArticleType.NONFICTION,
        passage: chapter.content,
        title: chapter.title,
        summary: chapter.summary,
        imageDesc: chapter["image-description"],
      });

      // แปลงผลลัพธ์ของแต่ละคำถามให้อยู่ในรูปแบบเดียวกันกับ Chapter.questions
      const mcQuestions = (mcResponse.questions || []).map((q) => ({
        type: "MCQ" as const,
        question: q.question,
        options: [
          q.correct_answer,
          q.distractor_1,
          q.distractor_2,
          q.distractor_3,
        ].slice(0, 3),
        answer: q.correct_answer,
      }));

      const saQuestions = (saResponse.questions || []).map((q) => ({
        type: "SAQ" as const,
        question: q.question,
        answer: q.suggested_answer,
      }));

      // สมมุติว่า generateLAQuestion ส่งกลับเป็น { question: string }
      const laQuestion = {
        type: "LAQ" as const,
        question: laResponse.question,
        answer: "",
      };

      // รวมคำถามทั้งหมดเข้าด้วยกัน
      chapter.questions = [...mcQuestions, ...saQuestions, laQuestion];
    }

    return structuredChapters;
  } catch (error) {
    console.error("Error generating chapters:", error);
    throw error;
  }
}

async function aiProcessChapters({
  storyBible,
  cefrLevel,
  chapterCount,
  wordCountPerChapter,
}: {
  storyBible: StoryBible;
  cefrLevel: ArticleBaseCefrLevel;
  chapterCount: number;
  wordCountPerChapter: number;
}): Promise<Chapter[]> {
  console.log(
    `Processing story with AI using CEFR level ${cefrLevel} requirements...`
  );

  // ดึงข้อกำหนดของ CEFR
  const cefrRequirements = getCEFRRequirements(cefrLevel);
  const minWordCount = Math.floor(wordCountPerChapter * 0.9);
  const maxWordCount = Math.ceil(wordCountPerChapter * 1.1);

  const prompt = `
Generate ${chapterCount} structured chapters for a story based on the following Story Bible and Full Story. Each chapter should adhere to the specified CEFR level (${cefrLevel}) in vocabulary, grammar, and readability.

**Story Bible:**
- **Main Plot:**
  - Premise: ${storyBible.mainPlot.premise}
  - Exposition: ${storyBible.mainPlot.exposition}
  - Rising Action: ${storyBible.mainPlot.risingAction}
  - Climax: ${storyBible.mainPlot.climax}
  - Falling Action: ${storyBible.mainPlot.fallingAction}
  - Resolution: ${storyBible.mainPlot.resolution}

- **Characters:**
${storyBible.characters
  .map(
    (c) =>
      `- Name: ${c.name}, Description: ${c.description}, Background: ${c.background}`
  )
  .join("\n")}

- **Setting:**
  - Time: ${storyBible.setting.time}
  - Places:
${storyBible.setting.places
  .map((p) => `  - ${p.name}: ${p.description}`)
  .join("\n")}

- **Themes:**
${storyBible.themes.map((t) => `- ${t.theme}: ${t.development}`).join("\n")}

- **CEFR Requirements (${cefrLevel}):**
    - **Word Count per Chapter:** Between ${minWordCount} and ${maxWordCount} words
    - **Sentence Structure:**
      - Average Words per Sentence: ${
        cefrRequirements.sentenceStructure.averageWords
      }
      - Complexity: ${cefrRequirements.sentenceStructure.complexity}
      - Allowed Structures: ${cefrRequirements.sentenceStructure.allowedStructures.join(
        ", "
      )}
    - **Vocabulary Level:** ${cefrRequirements.vocabulary.level}
      - Restrictions: ${cefrRequirements.vocabulary.restrictions.join(", ")}
      - Suggested Words: ${cefrRequirements.vocabulary.suggestions.join(", ")}
    - **Grammar:**
      - Allowed Tenses: ${cefrRequirements.grammar.allowedTenses.join(", ")}
      - Allowed Structures: ${cefrRequirements.grammar.allowedStructures.join(
        ", "
      )}
      - Restrictions: ${cefrRequirements.grammar.restrictions.join(", ")}
    - **Content Complexity:**
      - Plot Complexity: ${cefrRequirements.content.plotComplexity}
      - Character Depth: ${cefrRequirements.content.characterDepth}
      - Themes: ${cefrRequirements.content.themes}
      - Cultural References: ${cefrRequirements.content.culturalReferences}
    - **Writing Style:**
      - Tone: ${cefrRequirements.style.tone}
      - Literary Devices: ${cefrRequirements.style.literaryDevices.join(", ")}
      - Narrative Approach: ${cefrRequirements.style.narrativeApproach}
    - **Text Structure:**
      - Paragraph Length: ${cefrRequirements.structure.paragraphLength}
      - Text Organization: ${cefrRequirements.structure.textOrganization}
      - Transition Complexity: ${
        cefrRequirements.structure.transitionComplexity
      }

Ensure each chapter:
- Maintains logical story progression
- Adheres to the CEFR level's vocabulary and grammar constraints
- Includes readability analysis with word count, vocabulary complexity, and grammar structures
- Tracks continuity, including character states and events

Return only valid JSON following the schema.
`;

  const response = await generateObject({
    model: openai(openaiModel4o),
    schema: ChaptersSchema,
    prompt,
    temperature: 1,
  });

  return response.object.chapters;
}
