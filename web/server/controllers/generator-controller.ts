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
import { calculateLevel } from "@/lib/calculateLevel";
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

      // Send a message to Discord that the generation has started
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

      // Generate queue for fiction and nonfiction
      // Run fiction generation first, then nonfiction
      const fictionResults = await generateForGenre(
        ArticleType.FICTION,
        amount
      );
      // comment for test
      // const nonfictionResults = await generateForGenre(ArticleType.NONFICTION, amount);

      // Combine results from both genres
      const combinedResults = fictionResults; // comment for test //.concat(nonfictionResults);

      // Count failed results
      const failedCount = combinedResults.filter(
        (result) => typeof result === "string"
      ).length;
      const successCount = combinedResults.filter(
        (result) => typeof result !== "string"
      ).length;
      // const failedReasons = combinedResults.filter((result) => typeof result === "string");
      // calculate taken time
      const timeTakenMinutes = (Date.now() - timeTaken) / 1000 / 60;

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

      return NextResponse.json({
        message: "Queue generation complete",
        total: amount * 6 * 2,
        failedCount,
        timeTaken: timeTakenMinutes,
        results: combinedResults,
      });
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

    // Process each topic concurrently
    const results = await Promise.all(
        generatedTopic.topics.map(async (topic) => {
            const topicResults = [];
            topicResults.push(await queue(type, randomGenre.genre, randomGenre.subgenre, topic, ArticleBaseCefrLevel.A1));
            // comment for test
            // topicResults.push(await queue(type, randomGenre.genre, randomGenre.subgenre, topic, ArticleBaseCefrLevel.A2));
            // topicResults.push(await queue(type, randomGenre.genre, randomGenre.subgenre, topic, ArticleBaseCefrLevel.B1));
            // topicResults.push(await queue(type, randomGenre.genre, randomGenre.subgenre, topic, ArticleBaseCefrLevel.B2));
            // topicResults.push(await queue(type, randomGenre.genre, randomGenre.subgenre, topic, ArticleBaseCefrLevel.C1));
            // topicResults.push(await queue(type, randomGenre.genre, randomGenre.subgenre, topic, ArticleBaseCefrLevel.C2));
            return topicResults;
        })
    );

    return results.flat();
};

// Function to generate article, questions, and save to db
// Returns a string if failed, otherwise returns an object
async function queue(type: ArticleType, genre: string, subgenre: string, topic: string, cefrLevel: ArticleBaseCefrLevel) {
    try {
      // Generate article and evaluate rating
      // low rating will regenerate article until rating is above 2 or max attempts reached
      const { article: generatedArticle, rating } = await evaluateArticle(
        type,
        genre,
        subgenre,
        topic,
        cefrLevel
      );

      const mcq = await generateMCQuestion({
        type,
        cefrlevel: cefrLevel,
        passage: generatedArticle.passage,
        title: generatedArticle.title,
        summary: generatedArticle.summary,
        imageDesc: generatedArticle.imageDesc,
      });
      const saq = await generateSAQuestion({
        type,
        cefrlevel: cefrLevel,
        passage: generatedArticle.passage,
        title: generatedArticle.title,
        summary: generatedArticle.summary,
        imageDesc: generatedArticle.imageDesc,
      });
      const laq = await generateLAQuestion({
        type,
        cefrlevel: cefrLevel,
        passage: generatedArticle.passage,
        title: generatedArticle.title,
        summary: generatedArticle.summary,
        imageDesc: generatedArticle.imageDesc,
      });

      const wordList = await generateWordList({
        passage: generatedArticle.passage,
      });
    
      const { cefrLevel: calculatedCefrLevel, raLevel } = calculateLevel(
        generatedArticle.passage
      );

      const ref = db.collection("new-articles").doc();
      await ref.set({
        average_rating: rating,
        cefr_level: calculatedCefrLevel,
        created_at: new Date().toISOString(),
        genre,
        image_description: generatedArticle.imageDesc,
        passage: generatedArticle.passage,
        ra_level: raLevel,
        read_count: 0,
        subgenre,
        summary: generatedArticle.summary,
        title: generatedArticle.title,
        type,
        id: ref.id,
      });

      // update mcq
      for (let i = 0; i < mcq.questions.length; i++) {
        db.collection("new-articles")
          .doc(ref.id)
          .collection("mc-questions")
          .add(mcq.questions[i]);
      }

      // update saq
      for (let i = 0; i < saq.questions.length; i++) {
        db.collection("new-articles")
          .doc(ref.id)
          .collection("sa-questions")
          .add(saq.questions[i]);
      }

      // update laq
      db.collection("new-articles")
        .doc(ref.id)
        .collection("la-questions")
        .add(laq);

      // update wordlist      
      const wordListRef = db.collection(`word-list`).doc(ref.id);
      await wordListRef.set({
        word_list: wordList,
        articleId: ref.id,
        id: ref.id,
        created_at: new Date().toISOString(),
      });
      

      await generateAudio({
        passage: generatedArticle.passage,
        articleId: ref.id,
      });

      await generateImage({
        imageDesc: generatedArticle.imageDesc,
        articleId: ref.id,
      });

      await generateAudioForWord({
        wordList: wordList,
        articleId: ref.id,
      });

    } catch (error) {
        return `${cefrLevel} ${type === ArticleType.FICTION ? "F" : "N"} - ${error}`;
    }
}

async function evaluateArticle(
    type: ArticleType,
    genre: string,
    subgenre: string,
    topic: string,
    cefrLevel: ArticleBaseCefrLevel,
    maxAttempts: number = 2
) {
    try {
        let attempts = 0;
        let generatedArticle;

        while (attempts < maxAttempts) {
            generatedArticle = await generateArticle({
                type,
                genre,
                subgenre,
                topic,
                cefrLevel,
            });

            const evaluatedRating = await evaluateRating({
                type,
                genre,
                subgenre,
                cefrLevel,
                title: generatedArticle.title,
                summary: generatedArticle.summary,
                passage: generatedArticle.passage,
                image_description: generatedArticle.imageDesc,
            });
            console.log(`${cefrLevel} evaluated rating: ${evaluatedRating.rating}`);

            if (evaluatedRating.rating > 2) {
                return { article: generatedArticle, rating: evaluatedRating.rating };
            }

            attempts++;
            console.log(`Failed to evaluate rating: ${evaluatedRating.rating}`);
            console.log(`Regenerating article... Attempt (${attempts}/${maxAttempts})`);
        }

        throw `max attempts reached (low rating)`;
    } catch (error) {
        throw `failed to evaluate article: ${error}`;
    }
}
