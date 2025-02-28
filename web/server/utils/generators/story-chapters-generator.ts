import { StoryBible } from "./full-stories-generator";
import { ArticleBaseCefrLevel } from "../../models/enum";
import { generateObject } from "ai";
import { openai, openaiModel4o } from "@/utils/openai";
import { z } from "zod";
import { getCEFRRequirements } from "../CEFR-requirements";

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

interface GenerateChaptersParams {
  fullStory: string;
  storyBible: StoryBible;
  cefrLevel: ArticleBaseCefrLevel;
  previousChapters?: Chapter[];
  chapterCount: number;
  wordCountPerChapter: number;
}

export async function generateChaptersFromStory({
  fullStory,
  storyBible,
  cefrLevel,
  chapterCount,
  wordCountPerChapter,
}: GenerateChaptersParams): Promise<Chapter[]> {
  console.log(
    `Splitting story into ${chapterCount} chapters with CEFR level ${cefrLevel} constraints...`
  );

  try {
    const structuredChapters = await aiProcessChapters({
      fullStory,
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

    return structuredChapters;
  } catch (error) {
    console.error("Error generating chapters:", error);
    throw error;
  }
}

async function aiProcessChapters({
  fullStory,
  storyBible,
  cefrLevel,
  chapterCount,
  wordCountPerChapter,
}: {
  fullStory: string;
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

**Full Story**
- ${fullStory}

- **Characters:**
${storyBible.characters
  .map(
    (c) =>
      `  - Name: ${c.name}, Description: ${c.description}, Background: ${c.background}`
  )
  .join("\n")}

- **Setting:**
  - Time: ${storyBible.setting.time}
  - Places:
${storyBible.setting.places
  .map((p) => `  - ${p.name}: ${p.description}`)
  .join("\n")}

- **Themes:**
${storyBible.themes.map((t) => `  - ${t.theme}: ${t.development}`).join("\n")}

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
    - Transition Complexity: ${cefrRequirements.structure.transitionComplexity}

    Ensure each chapter:
    - Maintains logical story progression
    - Adheres to the CEFR level's vocabulary and grammar constraints
    - Includes readability analysis with word count, vocabulary complexity, and grammar structures
    - Tracks continuity, including character states and events
    - Uses language that aligns with the CEFR level constraints

    For each chapter, generate 3 types of comprehension questions that match the difficulty level of CEFR ${cefrLevel}:

    1. **MCQ (Multiple Choice Question - 3 options)**
      - A question with 3 answer choices, only one of which is correct.
      - The question should focus on key events, vocabulary, or inferences from the chapter.
      - Ensure the complexity of the vocabulary and sentence structures matches the CEFR level.

    2. **SAQ (Short Answer Question)**
      - A question requiring a brief response (1-2 sentences or key points).
      - The question can test comprehension, character motivations, or cause-effect relationships.
      - The expected answer should align with CEFR ${cefrLevel} complexity.

    3. **LAQ (Long Answer Question)**
      - A question that requires an in-depth response, encouraging critical thinking.
      - The question should prompt the reader to analyze themes, moral dilemmas, or predict future events based on the story.
      - Ensure that the question structure and depth align with CEFR ${cefrLevel} level.

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
