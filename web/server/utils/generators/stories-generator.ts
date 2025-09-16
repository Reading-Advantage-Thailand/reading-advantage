import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomSelectGenre } from "./random-select-genre";
import { ArticleBaseCefrLevel, ArticleType } from "../../models/enum";
import { generateStoryBible } from "./stories-bible-generator";
import { getCEFRRequirements } from "../CEFR-requirements";
import { generateChapters } from "./stories-chapters-generator";
import { generateStoriesTopic } from "./stories-topic-generator";
import { generateImage } from "./image-generator";
import { deleteStoryAndImages } from "@/utils/deleteStories";
import { evaluateRating } from "./evaluate-rating-generator";
import { calculateLevel } from "@/lib/calculateLevel";
import { sendDiscordWebhook } from "../send-discord-webhook";
import { generateAudio } from "./audio-generator";
import { generateAudioForWord } from "./audio-words-generator";
import { 
  generateTranslatedSummary, 
  generateTranslatedPassage 
} from "./translation-generator";

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
    console.log("🚀 Starting story generation process");
    console.log("Received request to generate stories");
    const body = await req.json();
    const { amountPerGenre } = body;
    if (!amountPerGenre) throw new Error("amountPerGenre is required");

    const amount = parseInt(amountPerGenre);
    const articleTypes = [ArticleType.FICTION];

    let successfulCount = 0;
    let failedCount = 0;

    console.log(`📊 Generation parameters: amountPerGenre=${amountPerGenre}, totalStories=${amount * CEFRLevels.length}`);

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
      console.log(`🎯 Processing CEFR Level: ${level}`);

      for (const type of articleTypes) {
        console.log(`📚 Processing article type: ${type}`);
        const genreData = await randomSelectGenre({ type });
        const { genre, subgenre } = genreData;
        console.log(`🎭 Selected genre: ${genre}, subgenre: ${subgenre}`);

        const topicData = await generateStoriesTopic({
          type,
          genre,
          subgenre,
          amountPerGenre: amount,
        });
        console.log(`📝 Generated ${topicData.topics.length} topics for ${genre}/${subgenre}`);
        console.log(topicData);
        const topics = topicData.topics;

        for (const topic of topics) {
          console.log(`📖 Processing topic: "${topic}" for CEFR ${level}`);

          let storyId: string;
          let storyBible: any;

          const existingStory = await prisma.story.findFirst({
            where: {
              title: topic,
              cefrLevel: level,
            },
            include: {
              chapters: true,
            },
          });

          if (existingStory) {
            console.log(`🔄 Found existing story: ${existingStory.id}, reusing storyBible`);
            storyId = existingStory.id;
            storyBible = existingStory.storyBible;
            // Calculate and update raLevel for existing story
            try {
              const { raLevel: storyRaLevel } = calculateLevel(existingStory.summary || "", level);
              await prisma.story.update({ where: { id: storyId }, data: { raLevel: storyRaLevel } });
              console.log("✅ Updated raLevel for existing story");
            } catch (levelError) {
              console.error("❌ Updating existing story raLevel failed:", levelError);
            }
          } else {
            console.log(`🆕 Creating new story for topic: "${topic}"`);
            storyBible = await generateStoryBible({ topic, genre, subgenre });
            console.log(`📚 StoryBible generated with summary: "${(storyBible as any)?.summary?.substring(0, 100)}..."`);

            // Calculate raLevel for new story based on summary
            const { raLevel: storyRaLevel } = calculateLevel((storyBible as any)?.summary || "", level);
            const newStory = await prisma.story.create({
              data: {
                title: topic,
                summary: (storyBible as any)?.summary || "",
                imageDescription: (storyBible as any)?.["image-description"] || "",
                genre,
                subgenre,
                type,
                storyBible: storyBible as any, // Cast to any for JSON storage
                cefrLevel: level,
                raLevel: storyRaLevel,
              },
            });
            storyId = newStory.id;
            console.log(`✅ Story created with ID: ${storyId}`);

            // Generate translations for story summary
            try {
              console.log(`🌐 Generating translations for story summary...`);
              const translatedSummary = await generateTranslatedSummary({
                summary: (storyBible as any)?.summary || "",
              });

              // Update story with translated summary
              await prisma.story.update({
                where: { id: storyId },
                data: {
                  translatedSummary: translatedSummary as any,
                },
              });
              console.log("✅ Story translated summary generated successfully");
            } catch (translationError) {
              console.error("❌ Story translation failed:", translationError);
              // Continue without translations rather than failing completely
            }
          }

          try {
            console.log(`🖼️ Generating story image...`);
            await generateImage({
              imageDesc: (storyBible as any)?.["image-description"] || "",
              articleId: storyId,
            });
            console.log(`✅ Story image generated successfully`);
          } catch (imageError) {
            console.error("❌ Image generation failed:", imageError);
            await deleteStoryAndImages(storyId);
            failedCount++;
            continue;
          }

          const chapterCount = Math.floor(Math.random() * 3) + 6;
          const wordCountPerChapter =
            getCEFRRequirements(level).wordCount.fiction;

          console.log(`📚 Generating ${chapterCount} chapters with ~${wordCountPerChapter} words each`);

          const previousChapters = existingStory ? existingStory.chapters : [];

          try {
            console.log(`📝 Starting chapter generation...`);
            const chapters = await generateChapters({
              type,
              storyBible: storyBible as any, // Cast to expected type
              cefrLevel: level,
              previousChapters: [], // We'll simplify this for now
              chapterCount,
              wordCountPerChapter,
              storyId: storyId,
            });

            if (chapters.length !== chapterCount) {
              throw new Error(
                `Expected ${chapterCount} chapters, but got ${chapters.length}`
              );
            }
            console.log(`✅ Generated ${chapters.length} chapters successfully`);

            // Calculate levels before saving chapters
            const { raLevel, cefrLevel: calculatedCefrLevel } = calculateLevel(
              (storyBible as any)?.summary || "",
              level
            );

            // Save chapters to database using Prisma
            console.log(`💾 Saving chapters to database...`);
            const createdChapters = [];
            for (let i = 0; i < chapters.length; i++) {
              const chapter = chapters[i];
              const createdChapter = await prisma.chapter.create({
                data: {
                  storyId: storyId,
                  chapterNumber: i + 1,
                  type: type,
                  genre: genre,
                  subGenre: subgenre,
                  cefrLevel: level,
                  raLevel: raLevel,
                  title: chapter.title,
                  passage: chapter.passage, // Use 'passage' instead of 'content' to match Article
                  summary: chapter.summary,
                  imageDescription: chapter["image-description"],
                  rating: chapter.rating,
                  wordCount: chapter.analysis?.wordCount,
                  audioUrl: `https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/stories/${storyId}/${i + 1}/audio.mp3`,
                  audioWordUrl: `https://storage.googleapis.com/artifacts.reading-advantage.appspot.com/stories/${storyId}/${i + 1}/words.json`,
                },
              });

              // Generate translations for chapter
              try {
                console.log(`🌐 Generating translations for chapter ${i + 1}...`);
                const [translatedSummary, translatedPassage] = await Promise.all([
                  generateTranslatedSummary({
                    summary: chapter.summary || "",
                  }),
                  generateTranslatedPassage({
                    passage: chapter.passage || "",
                  }),
                ]);

                // Update chapter with translations
                await prisma.chapter.update({
                  where: { id: createdChapter.id },
                  data: {
                    translatedSummary: translatedSummary as any,
                    translatedPassage: translatedPassage as any,
                  },
                });
                console.log(`✅ Chapter ${i + 1} translations generated successfully`);
              } catch (translationError) {
                console.error(`❌ Chapter ${i + 1} translation failed:`, translationError);
                // Continue without translations rather than failing completely
              }

              // Generate audio and timepoints for chapter (similar to generateUserArticle)
              try {
                console.log(`🎵 Generating audio and timepoints for chapter ${i + 1}...`);
                
                // Generate word list for audio
                const wordListForAudio = chapter.analysis?.vocabulary.targetWordsUsed || [];
                console.log(`📝 Chapter ${i + 1} word list count: ${wordListForAudio.length}`);
                console.log(`📝 Sample words:`, wordListForAudio.slice(0, 3).map(w => w.vocabulary));

                // Generate chapter audio with sentences timepoints
                const sentences = await generateAudio({
                  passage: chapter.passage,
                  articleId: `${storyId}-${i + 1}`,
                  isUserGenerated: false, // This is system generated
                  userId: "",
                });

                // Generate words audio with timepoints
                const wordsWithTimePoints = await generateAudioForWord({
                  wordList: wordListForAudio,
                  articleId: `${storyId}-${i + 1}`,
                  isUserGenerated: false, // This is system generated
                  userId: "",
                });

                // Update chapter with sentences and words timepoints
                await prisma.chapter.update({
                  where: { id: createdChapter.id },
                  data: {
                    sentences: sentences,
                    words: wordsWithTimePoints,
                  },
                });

                console.log(`✅ Chapter ${i + 1} audio and words timepoints saved successfully`);

              } catch (audioError) {
                console.error(`❌ Chapter ${i + 1} audio generation failed:`, audioError);
                // Continue with other chapters
              }

              createdChapters.push(createdChapter);
            }
            console.log(`✅ All ${createdChapters.length} chapters saved to database`);

            const chapterRatings = chapters.map((chapter) => chapter.rating || 0);
            const totalRating = chapterRatings.reduce((sum, rating) => sum + rating, 0);
            let averageRating = chapters.length > 0 ? totalRating / chapters.length : 0;

            averageRating = Math.min(5, Math.max(1, Math.round(averageRating * 4) / 4));

            const cefr_level = calculatedCefrLevel.replace(/[+-]/g, "");

            console.log(`📊 Updating story with ratings and levels...`);
            await prisma.story.update({
              where: { id: storyId },
              data: {
                averageRating: averageRating,
                raLevel: raLevel,
                cefrLevel: cefr_level,
              },
            });

            console.log(
             `📈 CEFR ${level}, Evaluated Rating: ${averageRating}, Evaluated CEFR: ${cefr_level}, Evaluated raLevel: ${raLevel}`
            );

            console.log(`🖼️ Generating chapter images...`);
            for (let i = 0; i < chapters.length; i++) {
              try {
                await generateImage({
                  imageDesc: chapters[i]["image-description"],
                  articleId: `${storyId}-${i + 1}`,
                });
                console.log(`✅ Chapter ${i + 1} image generated`);

              } catch (imageError) {
                console.error(`❌ Chapter ${i + 1} image generation failed:`, imageError);
                await deleteStoryAndImages(storyId);
                failedCount++;
                continue;
              }
            }

            successfulCount++;
            console.log(`🎉 Story generated successfully: "${topic}" (ID: ${storyId})`);
            
          } catch (chapterError) {
            console.error("❌ Error generating chapters:", chapterError);
            await deleteStoryAndImages(storyId);
            failedCount++;
            continue;
          }
        }
      }
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 60000;

    console.log(`🎊 Story generation completed!`);
    console.log(`📊 Final Statistics:`);
    console.log(`   - Total stories attempted: ${amount * CEFRLevels.length}`);
    console.log(`   - Successful stories: ${successfulCount}`);
    console.log(`   - Failed stories: ${failedCount}`);
    console.log(`   - Total time: ${duration.toFixed(2)} minutes`);
    console.log(`   - Average time per story: ${(duration / (successfulCount + failedCount)).toFixed(2)} minutes`);

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
    console.error("💥 Critical error in story generation:", error);

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
