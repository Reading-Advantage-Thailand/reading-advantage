import { ArticleBaseCefrLevel, ArticleType } from "../../models/enum";
import { generateObject } from "ai";
import { openai, openaiModel4o } from "@/utils/openai";
import { z } from "zod";
import { getCEFRRequirements } from "../CEFR-requirements";
import { generateChapterAudio } from "./audio-generator";
import { generateChapterAudioForWord } from "./audio-words-generator";
import { saveWordList } from "./audio-words-generator";
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
      targetWordsUsed: {
        vocabulary: string;
        definition: {
          en: string;
          th: string;
          cn: string;
          tw: string;
          vi: string;
        };
      }[];
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
  storyId: string;
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
      targetWordsUsed: z.array(
        z.object({
          vocabulary: z.string(),
          definition: z.object({
            en: z.string(),
            th: z.string(),
            cn: z.string(),
            tw: z.string(),
            vi: z.string(),
          }),
        })
      ),
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

export async function generateChapters(
  {
    type,
    storyBible,
    cefrLevel,
    chapterCount,
    wordCountPerChapter,
    storyId,
  }: GenerateChaptersParams,
  maxRetries = 3
): Promise<Chapter[]> {
  console.log(
    `Generating ${chapterCount} chapters for CEFR level ${cefrLevel}...`
  );

  let chapters: Chapter[] = [];

  try {
    for (let i = 0; i < chapterCount; i++) {
      let attempts = 0;
      let newChapter: Chapter | null = null;

      while (attempts < maxRetries) {
        try {
          console.log(
            `Generating Chapter ${i + 1} of ${chapterCount} (Attempt ${
              attempts + 1
            }/${maxRetries})...`
          );

          const previousChapters = chapters.length > 0 ? chapters : [];

          newChapter = await generateSingleChapter({
            storyBible,
            cefrLevel,
            wordCountPerChapter,
            previousChapters,
          });

          if (!newChapter) {
            throw new Error(`Failed to generate chapter ${i + 1}`);
          }

          chapters.push(newChapter);

          const questions = await generateChapterQuestions(
            newChapter,
            type,
            cefrLevel
          );
          newChapter.questions = questions;

          console.log("Generating chapter audio...");

          await generateChapterAudio({
            content: newChapter.content,
            storyId: storyId,
            chapterNumber: `${i + 1}`,
          });
          console.log("Chapter audio generated successfully.");

          const wordListForAudio =
            newChapter.analysis.vocabulary.targetWordsUsed.map((word) => ({
              vocabulary: word.vocabulary,
              definition: word.definition,
            }));

          console.log("Saving word list for audio...");

          await saveWordList({
            wordList: wordListForAudio,
            storyId: storyId,
            chapterNumber: `${i + 1}`,
          });

          console.log("Word list saved for audio successfully.");

          console.log("Generating chapter audio for words...");

          await generateChapterAudioForWord({
            wordList: wordListForAudio,
            storyId: storyId,
            chapterNumber: `${i + 1}`,
          });

          console.log("Chapter audio for words generated successfully.");

          break;
        } catch (error) {
          console.error(
            `Failed to generate chapter ${i + 1} (Attempt ${attempts + 1}):`,
            error
          );
          attempts++;

          if (attempts >= maxRetries) {
            throw new Error(
              `Failed to generate chapter ${
                i + 1
              } after ${maxRetries} attempts: ${error}`
            );
          }

          const delay = Math.pow(2, attempts) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    console.log("All chapters generated successfully.");

    return chapters;
  } catch (error) {
    console.error("Error generating chapters:", error);
    throw error;
  }
}

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
- **Setting:** ${
    storyBible.setting.time
  }, Locations: ${storyBible.setting.places.map((p) => p.name).join(", ")}
- **Characters:** ${storyBible.characters.map((c) => c.name).join(", ")}
- **Themes:** ${storyBible.themes.map((t) => t.theme).join(", ")}

**Previous Chapters Summary:**
${previousChapterSummaries || "None (This is the first chapter)"}

**CEFR Constraints (${cefrLevel}):**
- **Word Count per Chapter:** ${minWordCount} - ${maxWordCount} words
- **Sentence Structure:**
  - Average Words: ${cefrRequirements.sentenceStructure.averageWords}
  - Complexity: ${cefrRequirements.sentenceStructure.complexity}
  - Allowed Structures: ${cefrRequirements.sentenceStructure.allowedStructures.join(
    ", "
  )}
- **Vocabulary:**
  - Level: ${cefrRequirements.vocabulary.level}
  - Restrictions: ${cefrRequirements.vocabulary.restrictions.join(", ")}
  - Suggested Words: ${cefrRequirements.vocabulary.suggestions.join(", ")}
- **Grammar:**
  - Allowed Tenses: ${cefrRequirements.grammar.allowedTenses.join(", ")}
  - Allowed Structures: ${cefrRequirements.grammar.allowedStructures.join(", ")}
  - Restrictions: ${cefrRequirements.grammar.restrictions.join(", ")}
- **Content:**
  - Plot Complexity: ${cefrRequirements.content.plotComplexity}
  - Character Depth: ${cefrRequirements.content.characterDepth}
  - Themes: ${cefrRequirements.content.themes}
  - Cultural References: ${cefrRequirements.content.culturalReferences}
- **Style:**
  - Tone: ${cefrRequirements.style.tone}
  - Literary Devices: ${cefrRequirements.style.literaryDevices.join(", ")}
  - Narrative Approach: ${cefrRequirements.style.narrativeApproach}
- **Structure:**
  - Paragraph Length: ${cefrRequirements.structure.paragraphLength}
  - Text Organization: ${cefrRequirements.structure.textOrganization}
  - Transition Complexity: ${cefrRequirements.structure.transitionComplexity}

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

async function generateChapterQuestions(
  chapter: Chapter,
  type: string,
  cefrLevel: ArticleBaseCefrLevel
): Promise<Question[]> {
  try {
    const mcResponse = await generateMCQuestion({
      cefrlevel: cefrLevel,
      type: type === "fiction" ? ArticleType.FICTION : ArticleType.NONFICTION,
      passage: chapter.content,
      title: chapter.title,
      summary: chapter.summary,
      imageDesc: chapter["image-description"],
    });
    const mcQuestions = (mcResponse?.questions || [])
      .slice(0, 5)
      .map((q) => ({
        type: "MCQ" as const,
        question_number: q.question_number,
        question: q.question || "Missing question",
        options: [
          q.correct_answer,
          q.distractor_1 || "Option 1",
          q.distractor_2 || "Option 2",
          q.distractor_3 || "Option 3",
        ].filter(Boolean),
        answer: q.correct_answer || "No answer",
        textual_evidence: q.textual_evidence,
      }));

    const saResponse = await generateSAQuestion({
      cefrlevel: cefrLevel,
      type: type === "fiction" ? ArticleType.FICTION : ArticleType.NONFICTION,
      passage: chapter.content,
      title: chapter.title,
      summary: chapter.summary,
      imageDesc: chapter["image-description"],
    });
    const saQuestions = (saResponse?.questions || [])
      .slice(0, 1)
      .map((q) => ({
        type: "SAQ" as const,
        question: q.question || "Missing question",
        suggested_answer: q.suggested_answer || "Missing suggested answer",
        answer: q.suggested_answer || "No answer",
      }));

    const laResponse = await generateLAQuestion({
      cefrlevel: cefrLevel,
      type: type === "fiction" ? ArticleType.FICTION : ArticleType.NONFICTION,
      passage: chapter.content,
      title: chapter.title,
      summary: chapter.summary,
      imageDesc: chapter["image-description"],
    });
    const laQuestion = laResponse?.question
      ? [
          {
            type: "LAQ" as const,
            question: laResponse.question,
            answer: "",
          },
        ]
      : [];

    return [...mcQuestions, ...saQuestions, ...laQuestion];
  } catch (error) {
    console.error("Error generating questions:", error);
    return [];
  }
}
