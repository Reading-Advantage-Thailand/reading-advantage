import { StoryBible } from "./chapter-outline-generator";
import { ArticleBaseCefrLevel } from "../../models/enum";
import { generateObject } from "ai";
import { google, googleModel } from "@/utils/google";

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
}

interface GenerateChaptersParams {
  fullStory: string;
  storyBible: StoryBible;
  cefrLevel: ArticleBaseCefrLevel;
  previousChapters?: Chapter[];
  chapterCount: number;
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
  } catch (error) {
    console.error("Error generating chapters:", error);
    throw error;
  }
}

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
