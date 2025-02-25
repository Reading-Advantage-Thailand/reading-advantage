import { NextRequest } from "next/server";
import db from "@/configs/firestore-config";
import { randomSelectGenre } from "./random-select-genre";
import { generateTopic, GenerateTopicResponse } from "./topic-generator";
import { ArticleBaseCefrLevel, ArticleType } from "../../models/enum";
import { generateStoryBible } from "./story-bible-generator";
import { generateStoryArticle } from "./chapter-outline-generator";
import { getCEFRRequirements } from "../CEFR-requirements";

interface Chapter {
  chapterNumber: number;
  title: string;
  summary: string;
  content: string;
  analysis: object;
  mcq: object[];
  saq: object[];
  laq: object[];
}

export async function generateStories(req: NextRequest) {
  try {
    console.log("Received request to generate stories");
    const body = await req.json();
    console.log("Request body:", body);

    const { amountPerGenre } = body;
    if (!amountPerGenre) {
      console.error("Missing amountPerGenre in request");
      throw new Error("amountPerGenre is required");
    }

    const amount: number = parseInt(amountPerGenre);
    console.log(`Generating stories with ${amount} topics per genre`);

    const CEFRLevels: ArticleBaseCefrLevel[] = [
      ArticleBaseCefrLevel.A1,
      ArticleBaseCefrLevel.A2,
      ArticleBaseCefrLevel.B1,
      ArticleBaseCefrLevel.B2,
      ArticleBaseCefrLevel.C1,
      ArticleBaseCefrLevel.C2,
    ];

    for (const level of CEFRLevels) {
      console.log(`Processing CEFR level: ${level}`);
      const genre = await randomSelectGenre({ type: ArticleType.FICTION });
      console.log(`Selected genre: ${genre.genre} - ${genre.subgenre}`);

      const topic: GenerateTopicResponse = await generateTopic({
        type: ArticleType.FICTION,
        genre: genre.genre,
        subgenre: genre.subgenre,
        amountPerGenre: amount,
      });
      console.log(`Generated topics:`, topic.topics);

      for (const t of topic.topics) {
        console.log(`Generating StoryBible for topic: ${t}`);
        const storyBible = await generateStoryBible({
          topic: t,
          genre: genre.genre,
          subgenre: genre.subgenre,
        });

        const ref = db.collection("stories").doc();
        const chapters: Chapter[] = [];

        const chapterCount = 6 + Math.floor(Math.random() * 3);
        console.log(`Generating ${chapterCount} chapters for topic: ${t}`);

        let previousChapterContent = "";

        const cefrRequirements = getCEFRRequirements(level);
        const wordCountLimit = cefrRequirements?.wordCount.fiction || 1000;

        for (let i = 1; i <= chapterCount; i++) {
          console.log(`Generating chapter ${i} content with max ${wordCountLimit} words`);
          
          const generatedArticle = await generateStoryArticle({
            type: ArticleType.FICTION,
            genre: genre.genre,
            subgenre: genre.subgenre,
            topic: t,
            cefrLevel: level,
            chapterNumber: i,
            previousContent: previousChapterContent,
            wordCountLimit,
          });

          previousChapterContent = generatedArticle.content;

          chapters.push(generatedArticle);
        }

        await ref.set({
          title: t,
          summary: "Generated story based on topic",
          genre: genre.genre,
          subgenre: genre.subgenre,
          cefrLevel: level,
          createdAt: new Date().toISOString(),
          id: ref.id,
          chapters,
          storyBible,
        });
      }
    }

    return new Response(
      JSON.stringify({ message: "Stories generated and stored successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating stories:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error", details: (error as Error).message }),
      { status: 500 }
    );
  }
}


