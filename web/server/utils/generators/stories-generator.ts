import { NextResponse, type NextRequest } from "next/server";
import db from "@/configs/firestore-config";
import { randomSelectGenre } from "./random-select-genre";
import { ArticleBaseCefrLevel, ArticleType } from "../../models/enum";
import { generateStoryBible } from "./stories-bible-generator";
import { getCEFRRequirements } from "../CEFR-requirements";
import { generateChapters } from "./stories-chapters-generator";
import { generateStoriesTopic } from "./stories-topic-generator";
import { generateImage } from "./image-generator";
import { Timestamp } from "firebase-admin/firestore";
import { deleteStoryAndImages } from "@/utils/deleteStories";
import { evaluateRating } from "./evaluate-rating-generator";
import { calculateLevel } from "@/lib/calculateLevel";
import { sendDiscordWebhook } from "../send-discord-webhook";

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
    const startTime = Date.now();
    //console.log("Received request to generate stories");
    const body = await req.json();
    const { amountPerGenre } = body;
    if (!amountPerGenre) throw new Error("amountPerGenre is required");

    const amount = parseInt(amountPerGenre);
    const articleTypes = [ArticleType.FICTION];

    let successfulCount = 0;
    let failedCount = 0;

    await sendDiscordWebhook({
      title: "Generate Stories",
      embeds: [
        {
          description: {
            "Amount per genre": amountPerGenre,
            "Total stories generating": `${amount * CEFRLevels.length}`,
          },
          color: 0x0099ff,
        },
      ],
      color: 0x0099ff,
      reqUrl: req.url,
      userAgent: req.headers.get("user-agent") || "",
    });

    for (const level of CEFRLevels) {
      //console.log(`Generating stories for CEFR Level: ${level}`);

      for (const type of articleTypes) {
        const genreData = await randomSelectGenre({ type });
        const { genre, subgenre } = genreData;

        const topicData = await generateStoriesTopic({
          type,
          genre,
          subgenre,
          amountPerGenre: amount,
        });
        //console.log(topicData);
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

            await ref.set({
              id: ref.id,
              title: topic,
              genre,
              subgenre,
              type,
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
              storyId: ref.id,
            });

            if (chapters.length !== chapterCount) {
              throw new Error(
                `Expected ${chapterCount} chapters, but got ${chapters.length}`
              );
            }

            const validatedChapters = chapters.map((chapter) => ({
              ...chapter,
              questions: Array.isArray(chapter.questions)
                ? chapter.questions
                : [],
            }));

            await ref.update({ chapters: validatedChapters });

            const chapterRatings = chapters.map((chapter) => chapter.rating || 0);
            const totalRating = chapterRatings.reduce((sum, rating) => sum + rating, 0);
            let averageRating = chapters.length > 0 ? totalRating / chapters.length : 0;

            averageRating = Math.min(5, Math.max(1, Math.round(averageRating * 4) / 4));

            const { raLevel, cefrLevel } = calculateLevel(
              storyBible.summary,
              level
            );

            const cefr_level = cefrLevel.replace(/[+-]/g, "");

            await ref.update({
              average_rating: averageRating,
              ra_level: raLevel,
              cefr_level: cefr_level,
            });

            console.log(
             `CEFR ${level}, Evaluated Rating: ${averageRating}, Evaluated CEFR: ${cefr_level}, Evaluated raLevel: ${raLevel}`
            );

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
            successfulCount++;
            console.log(`Story generated successfully: ${topic}`);
            
          } catch (chapterError) {
            console.error("Error generating chapters:", chapterError);
            await deleteStoryAndImages(ref.id);
            failedCount++;
            continue;
          }
        }
      }
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 60000;

    await sendDiscordWebhook({
      title: "Stories Generation Complete",
      embeds: [
        {
          description: {
            "Total stories generated": `${amount * CEFRLevels.length}`,
            "Successful stories": `${successfulCount.toString()} stories`,
            "Failed stories": `${failedCount.toString()} stories`,
            "Time Taken": `${duration.toString()} minutes`,
          },
          color: 0x0099ff,
        },
      ],
      color: 0x0099ff,
      reqUrl: req.url,
      userAgent: req.headers.get("user-agent") || "",
    });

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

    await sendDiscordWebhook({
      title: "Stories Generation Complete",
      embeds: [
        {
          description: {
            "Error Detail": `${error}`,
          },
          color: 0xff0000,
        },
      ],
      color: 0xff0000,
      reqUrl: req.url,
      userAgent: req.headers.get("user-agent") || "",
    });

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
