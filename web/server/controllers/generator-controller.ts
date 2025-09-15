import { prisma } from "@/lib/prisma";
import db from "@/configs/firestore-config";
import { NextResponse, NextRequest } from "next/server";
import { ExtendedNextRequest } from "./auth-controller";
import { sendDiscordWebhook } from "../utils/send-discord-webhook";
import { randomSelectGenre } from "../utils/generators/random-select-genre";
import { generateTopic } from "../utils/generators/topic-generator";
import { ArticleBaseCefrLevel, ArticleType } from "../models/enum";
import {
  generateArticle,
  GenerateArticleResponse,
} from "../utils/generators/article-generator";
import { evaluateRating } from "../utils/generators/evaluate-rating-generator";
import { generateMCQuestion } from "../utils/generators/mc-question-generator";
import { generateSAQuestion } from "../utils/generators/sa-question-generator";
import { generateLAQuestion } from "../utils/generators/la-question-generator";
import { generateAudio } from "../utils/generators/audio-generator";
import { generateImage } from "../utils/generators/image-generator";
import { calculateLevel } from "@/lib/calculateLevel";
import { generateWordList } from "../utils/generators/word-list-generator";
import {
  generateAudioForWord,
  WordWithTimePoint,
} from "../utils/generators/audio-words-generator";
import {
  generateTranslatedSummary,
  generateTranslatedPassage,
} from "../utils/generators/translation-generator";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface GenerateArticleRequest {
  type: string;
  genre: string;
  subgenre?: string;
  topic: string;
  cefrLevel: string;
  wordCount: number;
}

interface Context {
  params?: {
    articleId?: string;
  };
}

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

    // const [fictionResults, nonfictionResults] = await Promise.all([
    //   generateForGenre(ArticleType.FICTION, amount),
    //   generateForGenre(ArticleType.NONFICTION, amount),
    // ]);

    // // Combine results from both genres
    // const combinedResults = [...fictionResults, ...nonfictionResults];

    // // Separate and count results in a single pass
    // const { failedResults, successCount } = combinedResults.reduce(
    //   (acc, result) => {
    //     if (typeof result === "string") {
    //       acc.failedResults.push(result);
    //     } else {
    //       acc.successCount += 1;
    //     }
    //     return acc;
    //   },
    //   { failedResults: [], successCount: 0 } as {
    //     failedResults: string[];
    //     successCount: number;
    //   }
    // );

    // // Calculate counts and time taken
    // const failedCount = failedResults.length;
    // const timeTakenMinutes = (Date.now() - timeTaken) / (1000 * 60);

    // // Log failed results if any
    // if (failedCount > 0) {
    //   try {
    //     const formattedDate = new Date().toISOString().split(".")[0];
    //     await db
    //       .collection("error-log")
    //       .doc(formattedDate)
    //       .set({
    //         error: failedResults,
    //         created_at: new Date().toISOString(),
    //         amount: amount * 12,
    //         id: formattedDate,
    //       });
    //   } catch (error) {
    //     console.error("Failed to log errors:", error);
    //   }
    // }

    // Generate queue for fiction and nonfiction
    // Run fiction generation first, then nonfiction
    const fictionResults = await generateForGenre(
      ArticleType.FICTION,
      amount,
      reqUrl,
      userAgent
    );
    const nonfictionResults = await generateForGenre(
      ArticleType.NONFICTION,
      amount,
      reqUrl,
      userAgent
    );

    // Combine results from both genres
    const combinedResults = fictionResults.concat(nonfictionResults);

    // Count failed results
    const failedCount = combinedResults.filter(
      (result) => typeof result === "string"
    ).length;
    const successCount = combinedResults.filter(
      (result) => typeof result !== "string"
    ).length;
    const failedReasons = combinedResults.filter(
      (result) => typeof result === "string"
    );
    // calculate taken time
    const timeTakenMinutes = (Date.now() - timeTaken) / 1000 / 60;

    // Log failed results
    if (failedCount > 0) {
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split(".")[0];
      const errorLogRef = db.collection("error-log").doc(formattedDate);
      await errorLogRef.set({
        error: failedReasons,
        created_at: new Date().toISOString(),
        amount: amount * 6 * 2,
        id: formattedDate,
      });
    }

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
          color: 0x0099ff,
        },
      ],
      color: 0x0099ff,
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
async function generateForGenre(
  type: ArticleType,
  amountPerGenre: number,
  reqUrl: string,
  userAgent: string
) {
  // const randomGenre = await randomSelectGenre({ type });

  // const generatedTopic = await generateTopic({
  //   type: type,
  //   genre: randomGenre.genre,
  //   subgenre: randomGenre.subgenre,
  //   amountPerGenre: amountPerGenre,
  // });

  const cefrLevels = [
    ArticleBaseCefrLevel.A1,
    ArticleBaseCefrLevel.A2,
    ArticleBaseCefrLevel.B1,
    ArticleBaseCefrLevel.B2,
    ArticleBaseCefrLevel.C1,
    ArticleBaseCefrLevel.C2,
  ];

  const results = [];

  // Process each CEFR level sequentially
  for (const level of cefrLevels) {
    // Step 1: Randomly select a genre for this CEFR level
    const randomGenre = await randomSelectGenre({ type });

    // Step 2: Generate topics based on the selected genre
    const generatedTopic = await generateTopic({
      type: type,
      genre: randomGenre.genre,
      subgenre: randomGenre.subgenre,
      amountPerGenre: amountPerGenre,
    });

    // Step 3: Queue tasks for each topic in this CEFR level
    for (const topic of generatedTopic.topics) {
      const result = await queue(
        type,
        randomGenre.genre,
        randomGenre.subgenre,
        topic,
        level,
        reqUrl,
        userAgent
      );
      results.push(result);
    }
  }

  // const results = await Promise.all(
  //   cefrLevels.map(async (level) => {
  //     // Step 1: Randomly select a genre for this CEFR level
  //     const randomGenre = await randomSelectGenre({ type });

  //     // Step 2: Generate topics based on the selected genre
  //     const generatedTopic = await generateTopic({
  //       type,
  //       genre: randomGenre.genre,
  //       subgenre: randomGenre.subgenre,
  //       amountPerGenre,
  //     });

  //     // Step 3: Queue tasks for each topic in this CEFR level
  //     return Promise.all(
  //       generatedTopic.topics.map((topic) =>
  //         queue(type, randomGenre.genre, randomGenre.subgenre, topic, level)
  //       )
  //     );
  //   })
  // );

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
  cefrLevel: ArticleBaseCefrLevel,
  reqUrl: string,
  userAgent: string,
  maxRetries: number = 5
) {
  let attempts = 0;
  let lastError: unknown = null;

  while (attempts < maxRetries) {
    try {
      //console.log(`Attempt ${attempts + 1}/${maxRetries} to generate article`);
      // Generate article and evaluate rating
      const ref = db.collection("new-articles").doc();
      const articleId = ref.id;

      const {
        article: generatedArticle,
        rating,
        cefrlevel,
        raLevel,
      } = await evaluateArticle(type, genre, subgenre, topic, cefrLevel);

      // Generate Image with retry
      await generateImage({
        imageDesc: generatedArticle.imageDesc,
        articleId,
      });

      const createdAt = new Date().toISOString();
      await ref.set({
        average_rating: rating,
        cefr_level: cefrlevel,
        created_at: createdAt,
        genre,
        image_description: generatedArticle.imageDesc,
        passage: generatedArticle.passage,
        ra_level: raLevel,
        read_count: 0,
        subgenre,
        summary: generatedArticle.summary,
        title: generatedArticle.title,
        type,
        id: articleId,
      });

      // Sequential execution for question generation
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

      // Save generated data to Firestore
      await addQuestionsToCollection(articleId, "mc-questions", mcq.questions);
      await addQuestionsToCollection(articleId, "sa-questions", saq.questions);
      await addQuestionsToCollection(articleId, "la-questions", [laq]);
      await addWordList(articleId, wordList.word_list, createdAt);

      // Generate audio (Sequential execution)
      await generateAudio({ passage: generatedArticle.passage, articleId });
      await generateAudioForWord({ wordList: wordList.word_list, articleId });

      // const [mcq, saq, laq, wordList] = await Promise.all([
      //   generateMCQuestion({
      //     type,
      //     cefrlevel: cefrLevel,
      //     passage: generatedArticle.passage,
      //     title: generatedArticle.title,
      //     summary: generatedArticle.summary,
      //     imageDesc: generatedArticle.imageDesc,
      //   }),
      //   generateSAQuestion({
      //     type,
      //     cefrlevel: cefrLevel,
      //     passage: generatedArticle.passage,
      //     title: generatedArticle.title,
      //     summary: generatedArticle.summary,
      //     imageDesc: generatedArticle.imageDesc,
      //   }),
      //   generateLAQuestion({
      //     type,
      //     cefrlevel: cefrLevel,
      //     passage: generatedArticle.passage,
      //     title: generatedArticle.title,
      //     summary: generatedArticle.summary,
      //     imageDesc: generatedArticle.imageDesc,
      //   }),
      //   generateWordList({
      //     passage: generatedArticle.passage,
      //   }),
      // ]);

      //console.log("Article generation successful!");
      return articleId;
    } catch (error) {
      console.error(
        `Error during article generation (Attempt ${attempts + 1}):`,
        error
      );
      lastError = error;
    }

    attempts++;
    const delay = Math.pow(2, attempts) * 1000;
    //console.log(`Retrying in ${delay / 1000} seconds...`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  console.error("Failed to generate article after max retries.");

  let errorMessage = "Unknown error occurred";
  if (lastError instanceof Error) {
    errorMessage = lastError.message;
  } else if (typeof lastError === "string") {
    errorMessage = lastError;
  } else if (lastError) {
    errorMessage = JSON.stringify(lastError);
  }

  await sendDiscordWebhook({
    title: "Queue Generation Failed",
    embeds: [
      {
        description: { message: errorMessage },
        color: 0xff0000,
      },
    ],
    reqUrl,
    userAgent,
  });

  return null;
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
        title: generatedArticle.title,
        summary: generatedArticle.summary,
        type,
        image_description: generatedArticle.imageDesc,
        passage: generatedArticle.passage,
        cefrLevel,
      });
      const { raLevel, cefrLevel: cefr_level } = calculateLevel(
        generatedArticle.passage,
        cefrLevel
      );

      console.log(
        `CEFR ${cefrLevel}, Evaluated Rating: ${evaluatedRating.rating}, Evaluated CEFR: ${cefr_level}, Evaluated raLevel: ${raLevel}`
      );

      if (evaluatedRating.rating > 2) {
        return {
          article: generatedArticle,
          rating: evaluatedRating.rating,
          cefrlevel: cefr_level,
          raLevel,
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

export async function generateUserArticle(req: NextRequest) {
  let articleId: string = "";
  let userId: string = "";

  try {
    //console.log("Starting user article generation...");

    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      //console.log("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    userId = session.user.id;
    //console.log(`User ID: ${userId}`);

    // Get user data from Prisma to fetch license_id
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        licenseOnUsers: {
          include: {
            license: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let author = "Unknown Author";

    // Get school name from the latest active license
    const latestLicense = user.licenseOnUsers[0]; // Get the first license
    if (latestLicense?.license) {
      author = latestLicense.license.schoolName || "Unknown School";
    }

    // Parse request body
    const body: GenerateArticleRequest = await req.json();
    const { type, genre, subgenre, topic, cefrLevel, wordCount } = body;
    //console.log("Request parameters:", {
    //  type,
    //  genre,
    //  subgenre,
    //  topic,
    //  cefrLevel,
    //  wordCount,
    //});

    // Validate required fields
    if (!type || !genre || !topic || !cefrLevel) {
      //console.log("Missing required fields:", {
      //  type,
      //  genre,
      //  topic,
      //  cefrLevel,
      //});
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert string values to enums
    const articleType =
      type.toLowerCase() === "fiction"
        ? ArticleType.FICTION
        : ArticleType.NONFICTION;

    const cefrLevelEnum = cefrLevel as ArticleBaseCefrLevel;
    //console.log(`Article type: ${articleType}, CEFR level: ${cefrLevelEnum}`);

    // Generate article
    //console.log("Generating article...");
    const generatedArticle = await generateArticle({
      type: articleType,
      genre,
      subgenre: subgenre || "",
      topic,
      cefrLevel: cefrLevelEnum,
    });
    //console.log("Article generated successfully");

    // Evaluate rating
    //console.log("Evaluating article rating...");
    const evaluatedRating = await evaluateRating({
      title: generatedArticle.title,
      summary: generatedArticle.summary,
      type: articleType,
      image_description: generatedArticle.imageDesc,
      passage: generatedArticle.passage,
      cefrLevel: cefrLevelEnum,
    });
    //console.log(`Article rating: ${evaluatedRating.rating}`);

    // Calculate levels
    //console.log("Calculating levels...");
    const { raLevel, cefrLevel: calculatedCefrLevel } = calculateLevel(
      generatedArticle.passage,
      cefrLevelEnum
    );
    //console.log(
    //  `Calculated CEFR level: ${calculatedCefrLevel}, RA level: ${raLevel}`
    //);

    // Create article using Prisma
    const article = await prisma.article.create({
      data: {
        type: articleType,
        genre,
        subGenre: subgenre || "",
        title: generatedArticle.title,
        summary: generatedArticle.summary,
        passage: generatedArticle.passage,
        imageDescription: generatedArticle.imageDesc,
        cefrLevel: calculatedCefrLevel,
        raLevel,
        rating: evaluatedRating.rating,
        authorId: userId,
        isPublic: false, // Set as private by default for user-generated articles
      },
    });

    articleId = article.id;

    //console.log(`Saving article to database with ID: ${articleId}`);
    //console.log(`Word count: ${generatedArticle.passage.split(" ").length}, Target: ${wordCount}`);
    //console.log(`Author: ${author}`);

    // Generate additional content
    //console.log("Generating additional content...");

    // Generate Image
    //console.log("Generating image...");
    await generateImage({
      imageDesc: generatedArticle.imageDesc,
      articleId: articleId,
    });
    //console.log("Image generated successfully");

    // Generate Questions
    //console.log("Generating questions...");
    const [mcq, saq, laq] = await Promise.all([
      generateMCQuestion({
        type: articleType,
        cefrlevel: cefrLevelEnum,
        passage: generatedArticle.passage,
        title: generatedArticle.title,
        summary: generatedArticle.summary,
        imageDesc: generatedArticle.imageDesc,
      }),
      generateSAQuestion({
        type: articleType,
        cefrlevel: cefrLevelEnum,
        passage: generatedArticle.passage,
        title: generatedArticle.title,
        summary: generatedArticle.summary,
        imageDesc: generatedArticle.imageDesc,
      }),
      generateLAQuestion({
        type: articleType,
        cefrlevel: cefrLevelEnum,
        passage: generatedArticle.passage,
        title: generatedArticle.title,
        summary: generatedArticle.summary,
        imageDesc: generatedArticle.imageDesc,
      }),
    ]);
    //console.log("Questions generated successfully");

    // Save questions to database using Prisma
    //console.log("Saving questions...");

    // Transform and validate questions before saving
    const transformedMCQuestions = mcq.questions
      .map((q: any) => {
        // Create options array with correct answer and distractors
        const options = [
          q.correct_answer,
          q.distractor_1,
          q.distractor_2,
          q.distractor_3,
        ].filter(Boolean); // Remove any undefined values

        if (options.length !== 4) return null; // Must have exactly 4 options

        // Shuffle the options
        const shuffledOptions = [...options].sort(() => Math.random() - 0.5);

        return {
          question: q.question,
          options: shuffledOptions,
          answer: q.correct_answer, // Keep the correct answer as text
          textualEvidence: q.textual_evidence || "",
          articleId: articleId,
        };
      })
      .filter(
        (q): q is NonNullable<typeof q> =>
          q !== null &&
          q.question &&
          q.options &&
          q.options.length === 4 &&
          q.answer
      );

    const transformedSAQuestions = saq.questions
      .map((q: any) => ({
        question: q.question,
        answer: q.suggested_answer || q.answer, // Handle both formats
        articleId: articleId,
      }))
      .filter((q: any) => q.question && q.answer);

    const questionPromises = [];

    // Save multiple choice questions if valid
    if (transformedMCQuestions.length > 0) {
      questionPromises.push(
        prisma.multipleChoiceQuestion.createMany({
          data: transformedMCQuestions,
        })
      );
    }

    // Save short answer questions if valid
    if (transformedSAQuestions.length > 0) {
      questionPromises.push(
        prisma.shortAnswerQuestion.createMany({
          data: transformedSAQuestions,
        })
      );
    }

    // Save long answer question if valid
    if (laq.question) {
      questionPromises.push(
        prisma.longAnswerQuestion.create({
          data: {
            question: laq.question,
            articleId: articleId,
          },
        })
      );
    }

    // Execute all question saves
    if (questionPromises.length > 0) {
      await Promise.all(questionPromises);
    }
    //console.log("Questions saved successfully");

    // Generate Word List
    //console.log("Generating word list...");
    const wordList = await generateWordList({
      passage: generatedArticle.passage,
    });
    //console.log("Word list generated successfully");

    // Generate translations
    //console.log("Generating translations...");
    const [translatedSummary, translatedPassage] = await Promise.all([
      generateTranslatedSummary({
        summary: generatedArticle.summary,
      }),
      generateTranslatedPassage({
        passage: generatedArticle.passage,
      }),
    ]);
    //console.log("Translations generated successfully");

    // Note: We don't update the article with word list here anymore
    // because generateAudioForWord will save the complete words with timepoints

    // Generate Audio and get timepoints
    //console.log("Generating audio...");
    await generateAudio({
      passage: generatedArticle.passage,
      articleId: articleId,
      isUserGenerated: true,
      userId: userId,
    });

    const wordsWithTimePoints = await generateAudioForWord({
      wordList: wordList.word_list,
      articleId: articleId,
      isUserGenerated: true,
      userId: userId,
    });
    //console.log("Audio generated successfully");

    // Update article with translations
    await prisma.article.update({
      where: { id: articleId },
      data: {
        translatedSummary: translatedSummary,
        translatedPassage: translatedPassage,
      },
    });

    // Get the updated article with timepoints
    const updatedArticle = await prisma.article.findUnique({
      where: { id: articleId },
      include: {
        multipleChoiceQuestions: true,
        shortAnswerQuestions: true,
        longAnswerQuestions: true,
      },
    });

    if (!updatedArticle) {
      throw new Error("Article was created but not found in database");
    }

    // Return the generated article
    //console.log("Returning generated article response");
    return NextResponse.json({
      article: {
        id: articleId,
        type: articleType,
        genre,
        subgenre: subgenre || "",
        title: generatedArticle.title,
        summary: generatedArticle.summary,
        passage: generatedArticle.passage,
        image_description: generatedArticle.imageDesc,
        cefr_level: calculatedCefrLevel,
        ra_level: raLevel,
        average_rating: evaluatedRating.rating,
        audioUrl: `${articleId}.mp3`,
        audioUrlWords: `${articleId}.mp3`,
        created_at: updatedArticle.createdAt.toISOString(),
        timepoints: updatedArticle.sentences || [],
        translatedPassage: translatedPassage,
        translatedSummary: translatedSummary,
        read_count: 0,
        isPublic: false,
        author, // Include author in response
        words: wordsWithTimePoints, // Include words with timepoints and definitions
      },
    });
  } catch (error) {
    console.error("Error generating user article:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    // Cleanup on error
    if (articleId) {
      //console.log("Starting cleanup process...");
      await cleanupFailedPrismaGeneration(articleId);
    }

    return NextResponse.json(
      {
        error: "Failed to generate article",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function approveUserArticle(req: NextRequest) {
  try {
    //console.log("Starting article approval process...");

    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      //console.log("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    //console.log(`User ID: ${userId}`);

    // Parse request body
    const { articleId } = await req.json();
    if (!articleId) {
      return NextResponse.json(
        { error: "Article ID is required" },
        { status: 400 }
      );
    }

    //console.log(`Approving article: ${articleId}`);

    // Get the user's generated article using Prisma
    const article = await prisma.article.findUnique({
      where: {
        id: articleId,
        authorId: userId, // Ensure the article belongs to the requesting user
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    //console.log("Article found, starting approval process...", article);

    // Update article to make it public (approved)
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: {
        isPublic: true,
        updatedAt: new Date(),
      },
    });

    //console.log("Article approval process completed successfully");

    return NextResponse.json({
      message: "Article approved successfully",
      articleId: articleId,
      isPublic: updatedArticle.isPublic,
    });
  } catch (error) {
    console.error("Error approving article:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    return NextResponse.json(
      {
        error: "Failed to approve article",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function getUserGeneratedArticles(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's generated articles using Prisma
    const articles = await prisma.article.findMany({
      where: {
        authorId: userId,
      },
      include: {
        multipleChoiceQuestions: true,
        shortAnswerQuestions: true,
        longAnswerQuestions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to match the expected format
    const transformedArticles = articles.map((article) => ({
      id: article.id,
      type: article.type,
      genre: article.genre,
      subgenre: article.subGenre,
      title: article.title,
      summary: article.summary,
      passage: article.passage,
      imageDesc: article.imageDescription,
      cefr_level: article.cefrLevel,
      raLevel: article.raLevel,
      rating: article.rating,
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
      translatedSummary: article.translatedSummary,
      translatedPassage: article.translatedPassage,
      sentences: article.sentences,
      words: article.words,
      status: article.isPublic ? "approved" : "draft", // Map isPublic to status
      multipleChoiceQuestions: article.multipleChoiceQuestions,
      shortAnswerQuestions: article.shortAnswerQuestions,
      longAnswerQuestions: article.longAnswerQuestions,
    }));

    return NextResponse.json({ articles: transformedArticles });
  } catch (error) {
    console.error("Error fetching user articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}

export async function updateUserArticle(
  req: NextRequest,
  { params }: Context
): Promise<NextResponse> {
  try {
    const articleId = params?.articleId;

    if (!articleId) {
      return NextResponse.json(
        { error: "articleId is required" },
        { status: 400 }
      );
    }
    //console.log(`Starting article update for ID: ${articleId}`);

    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      //console.log("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    //console.log(`User ID: ${userId}`);

    // Parse request body
    const { title, passage, summary, imageDesc } = await req.json();
    if (!title || !passage || !summary || !imageDesc) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the existing article using Prisma
    const existingArticle = await prisma.article.findUnique({
      where: {
        id: articleId,
        authorId: userId, // Ensure the article belongs to the requesting user
      },
    });

    if (!existingArticle) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const normalizedCefrLevel = existingArticle.cefrLevel
      ?.replace("+", "")
      ?.toLowerCase();

    if (!normalizedCefrLevel) {
      return NextResponse.json(
        { error: "CEFR level not found in article data" },
        { status: 400 }
      );
    }
    //console.log(
    //  `Normalized CEFR level: ${normalizedCefrLevel} (from ${existingArticle.cefrLevel})`
    //);

    const { raLevel, cefrLevel: calculatedCefrLevel } = calculateLevel(
      passage,
      normalizedCefrLevel
    );

    // 3. Update article data using Prisma
    await prisma.article.update({
      where: { id: articleId },
      data: {
        title,
        passage,
        summary,
        imageDescription: imageDesc,
        cefrLevel: calculatedCefrLevel,
        raLevel,
        updatedAt: new Date(),
      },
    });
    //console.log("Article data updated in database");

    // 4. Delete existing questions using Prisma
    //console.log("Deleting existing questions...");
    await Promise.all([
      prisma.multipleChoiceQuestion.deleteMany({
        where: { articleId },
      }),
      prisma.shortAnswerQuestion.deleteMany({
        where: { articleId },
      }),
      prisma.longAnswerQuestion.deleteMany({
        where: { articleId },
      }),
    ]);

    // Generate new questions
    //console.log("Generating new questions...");
    const [mcq, saq, laq] = await Promise.all([
      generateMCQuestion({
        type: existingArticle.type as ArticleType,
        cefrlevel: normalizedCefrLevel as ArticleBaseCefrLevel,
        passage: passage,
        title: title,
        summary: summary,
        imageDesc: imageDesc,
      }),
      generateSAQuestion({
        type: existingArticle.type as ArticleType,
        cefrlevel: normalizedCefrLevel as ArticleBaseCefrLevel,
        passage: passage,
        title: title,
        summary: summary,
        imageDesc: imageDesc,
      }),
      generateLAQuestion({
        type: existingArticle.type as ArticleType,
        cefrlevel: normalizedCefrLevel as ArticleBaseCefrLevel,
        passage: passage,
        title: title,
        summary: summary,
        imageDesc: imageDesc,
      }),
    ]);

    // Transform and validate questions before saving (same as generateUserArticle)
    const transformedMCQuestions = mcq.questions
      .map((q: any) => {
        // Create options array with correct answer and distractors
        const options = [
          q.correct_answer,
          q.distractor_1,
          q.distractor_2,
          q.distractor_3,
        ].filter(Boolean); // Remove any undefined values

        if (options.length !== 4) return null; // Must have exactly 4 options

        // Shuffle the options
        const shuffledOptions = [...options].sort(() => Math.random() - 0.5);

        return {
          question: q.question,
          options: shuffledOptions,
          answer: q.correct_answer, // Keep the correct answer as text
          textualEvidence: q.textual_evidence || "",
          articleId: articleId,
        };
      })
      .filter(
        (q): q is NonNullable<typeof q> =>
          q !== null &&
          q.question &&
          q.options &&
          q.options.length === 4 &&
          q.answer
      );

    const transformedSAQuestions = saq.questions
      .map((q: any) => ({
        question: q.question,
        answer: q.suggested_answer || q.answer, // Handle both formats
        articleId: articleId,
      }))
      .filter((q: any) => q.question && q.answer);

    const questionPromises = [];

    // Save multiple choice questions if valid
    if (transformedMCQuestions.length > 0) {
      questionPromises.push(
        prisma.multipleChoiceQuestion.createMany({
          data: transformedMCQuestions,
        })
      );
    }

    // Save short answer questions if valid
    if (transformedSAQuestions.length > 0) {
      questionPromises.push(
        prisma.shortAnswerQuestion.createMany({
          data: transformedSAQuestions,
        })
      );
    }

    // Save long answer question if valid
    if (laq.question) {
      questionPromises.push(
        prisma.longAnswerQuestion.create({
          data: {
            question: laq.question,
            articleId: articleId,
          },
        })
      );
    }

    // Execute all question saves
    if (questionPromises.length > 0) {
      await Promise.all(questionPromises);
    }
    //console.log("Questions saved successfully");

    // Generate new word list
    //console.log("Generating new word list...");
    const wordList = await generateWordList({
      passage: passage,
    });

    // Generate translations
    //console.log("Generating translations...");
    const [translatedSummary, translatedPassage] = await Promise.all([
      generateTranslatedSummary({
        summary: summary,
      }),
      generateTranslatedPassage({
        passage: passage,
      }),
    ]);
    //console.log("Translations generated successfully");

    // Delete old audio files before generating new ones
    //console.log("Deleting old audio files...");
    await cleanupAudioFiles(articleId, userId);

    // Generate new audio only (not images)
    //console.log("Generating new audio...");
    await generateAudio({
      passage: passage,
      articleId: articleId,
      isUserGenerated: true,
      userId: userId,
    });

    // Generate word audio separately since it returns data
    const wordsWithTimePoints = await generateAudioForWord({
      wordList: wordList.word_list,
      articleId: articleId,
      isUserGenerated: true,
      userId: userId,
    });

    // Update article with translations and word data
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: {
        translatedSummary: translatedSummary,
        translatedPassage: translatedPassage,
      },
    });

    //console.log("Article update completed successfully");

    return NextResponse.json({
      message: "Article updated successfully",
      article: {
        id: articleId,
        type: existingArticle.type,
        genre: existingArticle.genre,
        subgenre: existingArticle.subGenre,
        title: title,
        summary: summary,
        passage: passage,
        image_description: imageDesc,
        cefr_level: calculatedCefrLevel,
        ra_level: raLevel,
        average_rating: existingArticle.rating,
        audioUrl: `${articleId}.mp3`,
        audioUrlWords: `${articleId}.mp3`,
        created_at: existingArticle.createdAt.toISOString(),
        updated_at: updatedArticle.updatedAt.toISOString(),
        timepoints: updatedArticle.sentences || [],
        translatedPassage: translatedPassage,
        translatedSummary: translatedSummary,
        read_count: 0,
        isPublic: existingArticle.isPublic,
        words: wordsWithTimePoints,
      },
    });
  } catch (error) {
    console.error("Error updating article:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    return NextResponse.json(
      {
        error: "Failed to update article",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function cleanupAudioFiles(articleId: string, userId?: string) {
  try {
    // Import Firebase Admin Storage
    const { getStorage } = await import("firebase-admin/storage");
    // ระบุ bucket name โดยตรง
    const bucket = getStorage().bucket(
      "artifacts.reading-advantage.appspot.com"
    );

    // Audio file paths for articles
    const audioFiles = [
      `tts/${articleId}.mp3`,
      `audios-words/${articleId}.mp3`,
    ];

    for (const filePath of audioFiles) {
      try {
        const file = bucket.file(filePath);
        const [exists] = await file.exists();
        if (exists) {
          await file.delete();
          //console.log(`Deleted audio file: ${filePath}`);
        }
      } catch (fileError) {
        // File might not exist, continue
        //console.log(`Could not delete audio file: ${filePath}`);
      }
    }

    //console.log("Audio files cleanup completed");
  } catch (storageError) {
    console.error("Error cleaning up audio files:", storageError);
  }
}

async function cleanupStorageFiles(articleId: string, userId?: string) {
  try {
    // Import Firebase Admin Storage
    const { getStorage } = await import("firebase-admin/storage");
    // ระบุ bucket name โดยตรง
    const bucket = getStorage().bucket(
      "artifacts.reading-advantage.appspot.com"
    );

    // File paths for user-generated content and regular content
    const basePaths = [
      // Regular paths
      `images/${articleId}`,
      `tts/${articleId}`,
      // User-generated paths (if userId provided)
      ...(userId
        ? [
            `users/${userId}/images/${articleId}`,
            `users/${userId}/tts/${articleId}`,
          ]
        : []),
    ];

    const fileExtensions = [".png", ".mp3"];

    for (const basePath of basePaths) {
      for (const ext of fileExtensions) {
        try {
          const filePath = basePath + ext;
          const file = bucket.file(filePath);
          const [exists] = await file.exists();
          if (exists) {
            await file.delete();
            //console.log(`Deleted file: ${filePath}`);
          }
        } catch (fileError) {
          // File might not exist, continue
          //console.log(`Could not delete file: ${basePath}${ext}`);
        }
      }

      // Also try to delete directories
      try {
        const [files] = await bucket.getFiles({ prefix: `${basePath}/` });
        if (files.length > 0) {
          const deletePromises = files.map((file) => file.delete());
          await Promise.all(deletePromises);
          //console.log(
          //  `Deleted ${files.length} files in directory: ${basePath}/`
          //);
        }
      } catch (dirError) {
        //console.log(`Could not delete directory: ${basePath}/`);
      }
    }
  } catch (storageError) {
    console.error("Error cleaning up storage files:", storageError);
  }
}

async function cleanupFailedPrismaGeneration(articleId: string) {
  try {
    //console.log(`Cleaning up failed generation for article: ${articleId}`);

    // Delete article and all related records from database using Prisma
    await prisma.$transaction(async (tx) => {
      // Delete questions first (due to foreign key constraints)
      await tx.multipleChoiceQuestion.deleteMany({
        where: { articleId },
      });

      await tx.shortAnswerQuestion.deleteMany({
        where: { articleId },
      });

      await tx.longAnswerQuestion.deleteMany({
        where: { articleId },
      });

      // Delete the article itself
      await tx.article.delete({
        where: { id: articleId },
      });
    });

    //console.log("Deleted article and questions from database");

    // Delete files from Cloud Storage bucket
    await cleanupStorageFiles(articleId);

    //console.log("Cleanup completed successfully");
  } catch (cleanupError) {
    console.error("Error during cleanup:", cleanupError);
    // Log cleanup error but don't throw to avoid masking original error
  }
}
