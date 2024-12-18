import db from "@/configs/firestore-config";
import { NextResponse } from "next/server";
import { ExtendedNextRequest } from "./auth-controller";
import { sendDiscordWebhook } from "../utils/send-discord-webhook";
import { randomSelectGenre } from "../utils/generators/random-select-genre";
import { generateTopic } from "../utils/generators/topic-generator";
import { ArticleBaseCefrLevel, ArticleType } from "../models/enum";
import { generateArticle } from "../utils/generators/article-generator";
import { evaluateRating } from "../utils/generators/evaluate-rating-generator";
import { generateMCQuestion } from "../utils/generators/mc-question-generator";
import { generateSAQuestion } from "../utils/generators/sa-question-generator";
import { generateLAQuestion } from "../utils/generators/la-question-generator";
import { generateAudio } from "../utils/generators/audio-generator";
import { generateImage } from "../utils/generators/image-generator";
import { getLevelNumber } from "@/lib/calculateLevel";
import { generateWordList } from "../utils/generators/word-list-generator";
import { generateAudioForWord } from "../utils/generators/audio-words-generator";

// Function to generate queue
export async function generateQueue(req: ExtendedNextRequest) {
  try {
    const { amountPerGenre } = await req.json();
    if (!amountPerGenre) {
      throw new Error("amountPerGenre is required");
    }
    // initialize
    const timeTaken = Date.now();
    const userAgent = req.headers.get("user-agent") || "";
    const reqUrl = req.url;
    const amount = parseInt(amountPerGenre);

    //Send a message to Discord that the generation has started
    await sendDiscordWebhook({
      title: "Generate Queue",
      embeds: [
        {
          description: {
            "amount per genre": amountPerGenre,
            total: `${amount * 6 * 2}`,
          },
          color: 0x0099ff,
        },
      ],
      color: 0x0099ff,
      reqUrl,
      userAgent,
    });

    const [fictionResults, nonfictionResults] = await Promise.all([
      generateForGenre(ArticleType.FICTION, amount),
      generateForGenre(ArticleType.NONFICTION, amount),
    ]);

    // Combine results from both genres
    const combinedResults = [...fictionResults, ...nonfictionResults];

    // Separate and count results in a single pass
    const { failedResults, successCount } = combinedResults.reduce(
      (acc, result) => {
        if (typeof result === "string") {
          acc.failedResults.push(result);
        } else {
          acc.successCount += 1;
        }
        return acc;
      },
      { failedResults: [], successCount: 0 } as {
        failedResults: string[];
        successCount: number;
      }
    );

    // Calculate counts and time taken
    const failedCount = failedResults.length;
    const timeTakenMinutes = (Date.now() - timeTaken) / (1000 * 60);

    // Log failed results if any
    if (failedCount > 0) {
      try {
        const formattedDate = new Date().toISOString().split(".")[0];
        await db
          .collection("error-log")
          .doc(formattedDate)
          .set({
            error: failedResults,
            created_at: new Date().toISOString(),
            amount: amount * 12,
            id: formattedDate,
          });
      } catch (error) {
        console.error("Failed to log errors:", error);
      }
    }

    // Generate queue for fiction and nonfiction
    // Run fiction generation first, then nonfiction
    // const fictionResults = await generateForGenre(ArticleType.FICTION, amount);
    // const nonfictionResults = await generateForGenre(
    //   ArticleType.NONFICTION,
    //   amount
    // );

    // Count failed results
    // const failedCount = combinedResults.filter(
    //   (result) => typeof result === "string"
    // ).length;
    // const successCount = combinedResults.filter(
    //   (result) => typeof result !== "string"
    // ).length;
    // const failedReasons = combinedResults.filter(
    //   (result) => typeof result === "string"
    // );
    // calculate taken time
    //const timeTakenMinutes = (Date.now() - timeTaken) / 1000 / 60;

    // Log failed results
    // if (failedCount > 0) {
    //   const currentDate = new Date();
    //   const formattedDate = currentDate.toISOString().split(".")[0];
    //   const errorLogRef = db.collection("error-log").doc(formattedDate);
    //   await errorLogRef.set({
    //     error: failedReasons,
    //     created_at: new Date().toISOString(),
    //     amount: amount * 6 * 2,
    //     id: formattedDate,
    //   });
    // }

    await sendDiscordWebhook({
      title: "Queue Generation Complete",
      embeds: [
        {
          description: {
            "amount per genre": amountPerGenre,
            total: `${amount * 6 * 2}`,
            failed: `${failedCount} articles`,
            success: `${successCount} articles`,
            "time taken": `${timeTakenMinutes.toFixed(2)} minutes\n`,
            // ":star: failed reasons": failedCount ? "\n" + failedReasons.join("\n") : "none",
          },
          color: 0xff0000,
        },
      ],
      color: 0xff0000,
      reqUrl,
      userAgent,
    });

    return NextResponse.json(
      {
        message: "Queue generation complete",
        total: amount * 6 * 2,
        failedCount,
        timeTaken: timeTakenMinutes.toFixed(2),
        results: successCount,
      },
      { status: 200 }
    );
  } catch (error) {
    await sendDiscordWebhook({
      title: "Queue Generation Failed",
      embeds: [
        {
          description: {
            error: `${error}`,
          },
          color: 0xff0000,
        },
      ],
      reqUrl: "unknown",
      userAgent: "unknown",
    });
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

// Function to generate queue for a given genre
// fiction or nonfiction
async function generateForGenre(type: ArticleType, amountPerGenre: number) {
  const randomGenre = await randomSelectGenre({ type });

  const generatedTopic = await generateTopic({
    type: type,
    genre: randomGenre.genre,
    subgenre: randomGenre.subgenre,
    amountPerGenre: amountPerGenre,
  });

  const cefrLevels = [
    ArticleBaseCefrLevel.A1,
    ArticleBaseCefrLevel.A2,
    ArticleBaseCefrLevel.B1,
    ArticleBaseCefrLevel.B2,
    ArticleBaseCefrLevel.C1,
    ArticleBaseCefrLevel.C2,
  ];

  const results = await Promise.all(
    generatedTopic.topics.map(
      async (topic) =>
        await Promise.all(
          cefrLevels.map((level) =>
            queue(type, randomGenre.genre, randomGenre.subgenre, topic, level)
          )
        )
    )
  );

  // Process each topic concurrently
  // const results = await Promise.all(
  //   generatedTopic.topics.map(async (topic) => {
  //     const topicResults = [];
  //     topicResults.push(
  //       await queue(
  //         type,
  //         randomGenre.genre,
  //         randomGenre.subgenre,
  //         topic,
  //         ArticleBaseCefrLevel.A1
  //       )
  //     );
  //     topicResults.push(
  //       await queue(
  //         type,
  //         randomGenre.genre,
  //         randomGenre.subgenre,
  //         topic,
  //         ArticleBaseCefrLevel.A2
  //       )
  //     );
  //     topicResults.push(
  //       await queue(
  //         type,
  //         randomGenre.genre,
  //         randomGenre.subgenre,
  //         topic,
  //         ArticleBaseCefrLevel.B1
  //       )
  //     );
  //     topicResults.push(
  //       await queue(
  //         type,
  //         randomGenre.genre,
  //         randomGenre.subgenre,
  //         topic,
  //         ArticleBaseCefrLevel.B2
  //       )
  //     );
  //     topicResults.push(
  //       await queue(
  //         type,
  //         randomGenre.genre,
  //         randomGenre.subgenre,
  //         topic,
  //         ArticleBaseCefrLevel.C1
  //       )
  //     );
  //     topicResults.push(
  //       await queue(
  //         type,
  //         randomGenre.genre,
  //         randomGenre.subgenre,
  //         topic,
  //         ArticleBaseCefrLevel.C2
  //       )
  //     );
  //     return topicResults;
  //   })
  // );

  return results.flat();
}

// Function to generate article, questions, and save to db
// Returns a string if failed, otherwise returns an object
async function queue(
  type: ArticleType,
  genre: string,
  subgenre: string,
  topic: string,
  cefrLevel: ArticleBaseCefrLevel
) {
  try {
    // Generate article and evaluate rating
    // low rating will regenerate article until rating is above 2 or max attempts reached
    const {
      article: generatedArticle,
      rating,
      cefrlevel,
      ralevel,
    } = await evaluateArticle(type, genre, subgenre, topic, cefrLevel);

    const ref = db.collection("new-articles").doc();
    const createdAt = new Date().toISOString();

    await ref.set({
      average_rating: rating,
      cefr_level: cefrlevel,
      created_at: createdAt,
      genre,
      image_description: generatedArticle.imageDesc,
      passage: generatedArticle.passage,
      ra_level: ralevel,
      read_count: 0,
      subgenre,
      summary: generatedArticle.summary,
      title: generatedArticle.title,
      type,
      id: ref.id,
    });

    const [mcq, saq, laq, wordList] = await Promise.all([
      generateMCQuestion({
        type,
        cefrlevel: cefrLevel,
        passage: generatedArticle.passage,
        title: generatedArticle.title,
        summary: generatedArticle.summary,
        imageDesc: generatedArticle.imageDesc,
      }),
      generateSAQuestion({
        type,
        cefrlevel: cefrLevel,
        passage: generatedArticle.passage,
        title: generatedArticle.title,
        summary: generatedArticle.summary,
        imageDesc: generatedArticle.imageDesc,
      }),
      generateLAQuestion({
        type,
        cefrlevel: cefrLevel,
        passage: generatedArticle.passage,
        title: generatedArticle.title,
        summary: generatedArticle.summary,
        imageDesc: generatedArticle.imageDesc,
      }),
      generateWordList({
        passage: generatedArticle.passage,
      }),
    ]);

    // const mcq = await generateMCQuestion({
    //   type,
    //   cefrlevel: cefrLevel,
    //   passage: generatedArticle.passage,
    //   title: generatedArticle.title,
    //   summary: generatedArticle.summary,
    //   imageDesc: generatedArticle.imageDesc,
    // });

    // const saq = await generateSAQuestion({
    //   type,
    //   cefrlevel: cefrLevel,
    //   passage: generatedArticle.passage,
    //   title: generatedArticle.title,
    //   summary: generatedArticle.summary,
    //   imageDesc: generatedArticle.imageDesc,
    // });

    // const laq = await generateLAQuestion({
    //   type,
    //   cefrlevel: cefrLevel,
    //   passage: generatedArticle.passage,
    //   title: generatedArticle.title,
    //   summary: generatedArticle.summary,
    //   imageDesc: generatedArticle.imageDesc,
    // });

    // const wordList = await generateWordList({
    //   passage: generatedArticle.passage,
    // });

    await Promise.all([
      addQuestionsToCollection(ref.id, "mc-questions", mcq.questions),
      addQuestionsToCollection(ref.id, "sa-questions", saq.questions),
      addQuestionsToCollection(ref.id, "la-questions", [laq]),
      addWordList(ref.id, wordList.word_list, createdAt),
    ]);

    // //update mcq
    // for (let i = 0; i < mcq.questions.length; i++) {
    //   await db
    //     .collection("new-articles")
    //     .doc(ref.id)
    //     .collection("mc-questions")
    //     .add(mcq.questions[i]);
    // }

    // // update saq
    // for (let i = 0; i < saq.questions.length; i++) {
    //   await db
    //     .collection("new-articles")
    //     .doc(ref.id)
    //     .collection("sa-questions")
    //     .add(saq.questions[i]);
    // }

    // // update laq
    // await db
    //   .collection("new-articles")
    //   .doc(ref.id)
    //   .collection("la-questions")
    //   .add(laq);

    // //update wordlist
    // const wordListRef = db.collection(`word-list`).doc(ref.id);
    // await wordListRef.set({
    //   word_list: wordList,
    //   articleId: ref.id,
    //   id: ref.id,
    //   created_at: new Date().toISOString(),
    // });

    await Promise.all([
      generateAudio({ passage: generatedArticle.passage, articleId: ref.id }),
      generateImage({
        imageDesc: generatedArticle.imageDesc,
        articleId: ref.id,
      }),
      generateAudioForWord({ wordList: wordList.word_list, articleId: ref.id }),
    ]);

    // await generateAudio({
    //   passage: generatedArticle.passage,
    //   articleId: ref.id,
    // });

    // await generateImage({
    //   imageDesc: generatedArticle.imageDesc,
    //   articleId: ref.id,
    // });

    // await generateAudioForWord({
    //   wordList: wordList,
    //   articleId: ref.id,
    // });
  } catch (error) {
    console.log("error => ", error);
    return `${cefrLevel} ${
      type === ArticleType.FICTION ? "F" : "N"
    } - ${error}`;
  }
}

// Helper function to add questions to a specific subcollection
async function addQuestionsToCollection(
  articleId: string,
  collectionName: string,
  questions: any[]
) {
  const collectionRef = db
    .collection("new-articles")
    .doc(articleId)
    .collection(collectionName);

  const promises = questions.map((question) => collectionRef.add(question));
  await Promise.all(promises);
}

// Helper function to store word list
async function addWordList(
  articleId: string,
  wordList: any[],
  createdAt: string
) {
  const wordListRef = db.collection("word-list").doc(articleId);
  await wordListRef.set({
    word_list: wordList,
    articleId,
    id: articleId,
    created_at: createdAt,
  });
}

async function evaluateArticle(
  type: ArticleType,
  genre: string,
  subgenre: string,
  topic: string,
  cefrLevel: ArticleBaseCefrLevel,
  maxAttempts: number = 2
) {
  let attempts = 0;

  // Helper to log attempts
  const logAttempt = (message: string) => {
    console.log(`Attempt (${attempts + 1}/${maxAttempts}): ${message}`);
  };

  while (attempts < maxAttempts) {
    try {
      const generatedArticle = await generateArticle({
        type,
        genre,
        subgenre,
        topic,
        cefrLevel,
      });

      const evaluatedRating = await evaluateRating({
        passage: generatedArticle.passage,
        cefrLevel,
      });

      console.log(
        `CEFR ${cefrLevel}, Evaluated Rating: ${evaluatedRating.rating}, Evaluated CEFR: ${evaluatedRating.cefr_level}`
      );

      if (evaluatedRating.rating > 2) {
        return {
          article: generatedArticle,
          rating: evaluatedRating.rating,
          cefrlevel: evaluatedRating.cefr_level,
          ralevel: getLevelNumber(evaluatedRating.cefr_level),
        };
      }

      // Log failure and increment attempts
      logAttempt(`Rating failed (${evaluatedRating.rating}), regenerating...`);
    } catch (error) {
      console.error(`Error during article generation/evaluation: ${error}`);
    }
    attempts++;
  }

  // All attempts failed
  throw new Error(
    `Failed to generate a suitable article after ${maxAttempts} attempts.`
  );
}
