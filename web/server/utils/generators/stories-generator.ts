import { NextResponse, type NextRequest } from "next/server";
import db from "@/configs/firestore-config";
import { randomSelectGenre } from "./random-select-genre";
import { ArticleBaseCefrLevel, ArticleType } from "../../models/enum";
import { generateStoryBible } from "./story-bible-generator";
import { getCEFRRequirements } from "../CEFR-requirements";
import { generateChapters } from "./story-chapters-generator";
import { generateStoriesTopic } from "./stories-topic-generator";
import { generateImage } from "./image-generator";
import { Timestamp } from "firebase-admin/firestore";
import { deleteStoryAndImages } from "@/utils/deleteStoryAndImage";
import { evaluateRating } from "./evaluate-rating-generator";
import { calculateLevel } from "@/lib/calculateLevel";

const CEFRLevels = [
  ArticleBaseCefrLevel.A1,
  ArticleBaseCefrLevel.A2,
  ArticleBaseCefrLevel.B1,
  ArticleBaseCefrLevel.B2,
  ArticleBaseCefrLevel.C1,
  ArticleBaseCefrLevel.C2,
];

export async function generateStories(req: NextRequest) {
  try {
    console.log("Received request to generate stories");
    const body = await req.json();
    const { amountPerGenre } = body;
    if (!amountPerGenre) throw new Error("amountPerGenre is required");

    const amount = parseInt(amountPerGenre);
    const articleTypes = [ArticleType.FICTION];

    let successfulCount = 0;
    let failedCount = 0;

    for (const level of CEFRLevels) {
      console.log(`Generating stories for CEFR Level: ${level}`);

      for (const type of articleTypes) {
        const genreData = await randomSelectGenre({ type });
        const { genre, subgenre } = genreData;

        const topicData = await generateStoriesTopic({
          type,
          genre,
          subgenre,
          amountPerGenre: amount,
        });
        console.log(topicData);
        const topics = topicData.topics;

        for (const topic of topics) {
          const existingStorySnapshot = await db
            .collection("stories")
            .where("title", "==", topic)
            .where("cefrLevel", "==", level)
            .get();
          let ref, storyBible;

          if (!existingStorySnapshot.empty) {
            const existingStory = existingStorySnapshot.docs[0].data();
            ref = existingStorySnapshot.docs[0].ref;
            storyBible = existingStory.storyBible;
          } else {
            storyBible = await generateStoryBible({ topic, genre, subgenre });
            ref = db.collection("stories").doc();

            const evaluatedRating = await evaluateRating({
              title: topic,
              summary: storyBible.summary,
              type,
              image_description: storyBible["image-description"],
              passage: storyBible.summary,
              cefrLevel: level,
            });

            const { raLevel, cefrLevel: cefr_level } = calculateLevel(
              storyBible.summary,
              level
            );

            console.log(
              `CEFR ${level}, Evaluated Rating: ${evaluatedRating.rating}, Evaluated CEFR: ${cefr_level}, Evaluated raLevel: ${raLevel}`
            );

            await ref.set({
              id: ref.id,
              title: topic,
              average_rating: evaluatedRating.rating,
              genre,
              subgenre,
              type,
              ra_level: raLevel,
              cefr_level: cefr_level,
              storyBible,
              chapters: [],
              createdAt: Timestamp.now(),
            });
          }

          try {
            await generateImage({
              imageDesc: storyBible["image-description"],
              articleId: ref.id,
            });
          } catch (imageError) {
            console.error("Image generation failed:", imageError);
            await deleteStoryAndImages(ref.id);
            failedCount++;
            continue;
          }

          const chapterCount = Math.floor(Math.random() * 3) + 6;
          const wordCountPerChapter =
            getCEFRRequirements(level).wordCount.fiction;

          const previousChapters = existingStorySnapshot.empty
            ? []
            : existingStorySnapshot.docs[0].data().chapters;

          try {
            const chapters = await generateChapters({
              type,
              storyBible,
              cefrLevel: level,
              previousChapters,
              chapterCount,
              wordCountPerChapter,
            });

            // ตรวจสอบให้แน่ใจว่าจำนวน chapter ถูกต้อง
            if (chapters.length !== chapterCount) {
              throw new Error(
                `Expected ${chapterCount} chapters, but got ${chapters.length}`
              );
            }

            // ตรวจสอบให้แน่ใจว่าทุก chapter มี `questions`
            const validatedChapters = chapters.map((chapter) => ({
              ...chapter,
              questions: Array.isArray(chapter.questions)
                ? chapter.questions
                : [],
            }));

            await ref.update({ chapters: validatedChapters });

            for (let i = 0; i < chapters.length; i++) {
              try {
                await generateImage({
                  imageDesc: chapters[i]["image-description"],
                  articleId: `${ref.id}-${i + 1}`,
                });
              } catch (imageError) {
                console.error("Chapter image generation failed:", imageError);
                await deleteStoryAndImages(ref.id);
                failedCount++;
                continue;
              }
            }

            await ref.update({ chapters });
            successfulCount++; // นับว่าเรื่องนี้สร้างสำเร็จ
          } catch (chapterError) {
            console.error("Error generating chapters:", chapterError);
            await deleteStoryAndImages(ref.id);
            failedCount++;
            continue;
          }
        }
      }
    }

    return NextResponse.json(
      {
        message: "Stories generation completed",
        successfulStories: successfulCount,
        failedStories: failedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating stories:", error);

    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
