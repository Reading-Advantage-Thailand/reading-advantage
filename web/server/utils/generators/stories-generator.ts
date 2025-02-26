import { NextRequest } from "next/server";
import db from "@/configs/firestore-config";
import { randomSelectGenre } from "./random-select-genre";
import { ArticleBaseCefrLevel, ArticleType } from "../../models/enum";
import { generateStoryBible } from "./story-bible-generator";
import { getCEFRRequirements } from "../CEFR-requirements";
import { generateFullStory } from "./full-stories-generator";
import { generateChaptersFromStory } from "./story-chapters-generator";
import { generateStoriesTopic } from "./stories-topic-generator";

const CEFRLevels = [
  ArticleBaseCefrLevel.A1,
  ArticleBaseCefrLevel.A2,
  ArticleBaseCefrLevel.B1,
  ArticleBaseCefrLevel.B2,
  ArticleBaseCefrLevel.C1,
  ArticleBaseCefrLevel.C2,
];

let currentCEFRIndex = 0;

export async function generateStories(req: NextRequest) {
  try {
    console.log("Received request to generate stories");
    const body = await req.json();
    const { amountPerGenre } = body;
    if (!amountPerGenre) throw new Error("amountPerGenre is required");

    const amount = parseInt(amountPerGenre);
    const level = CEFRLevels[currentCEFRIndex];
    const articleTypes = [ArticleType.FICTION, ArticleType.NONFICTION];

    for (const type of articleTypes) {
      const genreData = await randomSelectGenre({ type });
      const { genre, subgenre } = genreData;

      const topicData = await generateStoriesTopic({
        type,
        genre,
        subgenre,
        amountPerGenre: amount,
      });
      const topics = topicData.topics;

      for (const topic of topics) {
        const existingStorySnapshot = await db
          .collection("stories")
          .where("title", "==", topic)
          .get();
        let ref, storyBible;

        if (!existingStorySnapshot.empty) {
          const existingStory = existingStorySnapshot.docs[0].data();
          ref = existingStorySnapshot.docs[0].ref;
          storyBible = existingStory.storyBible;
        } else {
          storyBible = await generateStoryBible({ topic, genre, subgenre });
          ref = db.collection("stories").doc();
          await ref.set({
            title: topic,
            genre,
            subgenre,
            type,
            cefrLevel: level,
            storyBible,
            chapters: [],
          });
        }

        // สุ่มจำนวนบทระหว่าง 6 ถึง 8 และคำนวณจำนวนคำรวมที่นี่
        const chapterCount = Math.floor(Math.random() * 3) + 6;
        const wordCountPerChapter = getCEFRRequirements(level).wordCount.fiction;
        const totalWordCount = chapterCount * wordCountPerChapter;

        // 1. ให้ AI สร้างเรื่องราวเต็ม ๆ ตาม Story Bible
        const fullStory = await generateFullStory({
          type,
          genre,
          subgenre,
          topic,
          cefrLevel: level,
          storyBible,
          wordCountLimit: totalWordCount,
          characterList: storyBible.characters.map(
            (char: { name: string }) => char.name
          ),
          mainPlot: storyBible.mainPlot,
          themes: storyBible.themes.map((theme: { theme: string }) => theme.theme),
          worldRules: storyBible.setting.worldRules ?? [],
        });

        // 2. ให้ AI แบ่งเรื่องเป็นบท โดยใช้จำนวนบทที่สุ่มได้
        const previousChapters = existingStorySnapshot.empty
          ? []
          : existingStorySnapshot.docs[0].data().chapters;
        const chapters = await generateChaptersFromStory({
          fullStory,
          storyBible,
          cefrLevel: level,
          previousChapters,
          chapterCount, // ใช้จำนวนบทที่สุ่มได้
        });

        await ref.update({ chapters });
      }
    }

    return new Response(
      JSON.stringify({ message: "Stories generated and stored successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating stories:", error);

    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500 },
    );
  }
}
