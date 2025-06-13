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
import { generateAudioForWord } from "../utils/generators/audio-words-generator";
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
  let articleRef: any = null;
  let userId: string = "";

  try {
    console.log("Starting user article generation...");

    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    userId = session.user.id;
    console.log(`User ID: ${userId}`);

    // Parse request body
    const body: GenerateArticleRequest = await req.json();
    const { type, genre, subgenre, topic, cefrLevel, wordCount } = body;
    console.log("Request parameters:", {
      type,
      genre,
      subgenre,
      topic,
      cefrLevel,
      wordCount,
    });

    // Validate required fields
    if (!type || !genre || !topic || !cefrLevel) {
      console.log("Missing required fields:", {
        type,
        genre,
        topic,
        cefrLevel,
      });
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
    console.log(`Article type: ${articleType}, CEFR level: ${cefrLevelEnum}`);

    // Generate article
    console.log("Generating article...");
    const generatedArticle = await generateArticle({
      type: articleType,
      genre,
      subgenre: subgenre || "",
      topic,
      cefrLevel: cefrLevelEnum,
    });
    console.log("Article generated successfully");

    // Evaluate rating
    console.log("Evaluating article rating...");
    const evaluatedRating = await evaluateRating({
      title: generatedArticle.title,
      summary: generatedArticle.summary,
      type: articleType,
      image_description: generatedArticle.imageDesc,
      passage: generatedArticle.passage,
      cefrLevel: cefrLevelEnum,
    });
    console.log(`Article rating: ${evaluatedRating.rating}`);

    // Calculate levels
    console.log("Calculating levels...");
    const { raLevel, cefrLevel: calculatedCefrLevel } = calculateLevel(
      generatedArticle.passage,
      cefrLevelEnum
    );
    console.log(
      `Calculated CEFR level: ${calculatedCefrLevel}, RA level: ${raLevel}`
    );

    // Create article document
    articleRef = db
      .collection("users")
      .doc(userId)
      .collection("generated-articles")
      .doc();

    const articleData = {
      id: articleRef.id,
      title: generatedArticle.title,
      passage: generatedArticle.passage,
      summary: generatedArticle.summary,
      imageDesc: generatedArticle.imageDesc,
      type: articleType,
      genre,
      subgenre: subgenre || "",
      topic,
      cefr_level: calculatedCefrLevel,
      raLevel,
      wordCount: generatedArticle.passage.split(" ").length,
      targetWordCount: wordCount,
      rating: evaluatedRating.rating,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log(`Saving article to Firestore with ID: ${articleRef.id}`);
    console.log(`Word count: ${articleData.wordCount}, Target: ${wordCount}`);

    // Save to Firestore
    await articleRef.set(articleData);
    console.log("Article saved successfully to Firestore");

    // Generate additional content
    console.log("Generating additional content...");

    // Generate Image
    console.log("Generating image...");
    await generateImage({
      imageDesc: generatedArticle.imageDesc,
      articleId: articleRef.id,
    });
    console.log("Image generated successfully");

    // Generate Questions
    console.log("Generating questions...");
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
    console.log("Questions generated successfully");

    // Generate Word List
    console.log("Generating word list...");
    const wordList = await generateWordList({
      passage: generatedArticle.passage,
    });
    console.log("Word list generated successfully");

    // Save questions and word list to user's article subcollections
    console.log("Saving questions and word list...");
    await Promise.all([
      addUserQuestionsToCollection(
        userId,
        articleRef.id,
        "mc-questions",
        mcq.questions
      ),
      addUserQuestionsToCollection(
        userId,
        articleRef.id,
        "sa-questions",
        saq.questions
      ),
      addUserQuestionsToCollection(userId, articleRef.id, "la-questions", [
        laq,
      ]),
      addUserWordList(
        userId,
        articleRef.id,
        wordList.word_list,
        articleData.createdAt
      ),
    ]);
    console.log("Questions and word list saved successfully");

    // Generate Audio
    console.log("Generating audio...");
    await Promise.all([
      generateAudio({
        passage: generatedArticle.passage,
        articleId: articleRef.id,
        isUserGenerated: true,
        userId: userId,
      }),
      generateAudioForWord({
        wordList: wordList.word_list,
        articleId: articleRef.id,
        isUserGenerated: true,
        userId: userId,
      }),
    ]);
    console.log("Audio generated successfully");

    // Return the generated article
    console.log("Returning generated article response");
    return NextResponse.json({
      id: articleRef.id,
      title: generatedArticle.title,
      passage: generatedArticle.passage,
      summary: generatedArticle.summary,
      imageDesc: generatedArticle.imageDesc,
      rating: evaluatedRating.rating,
      cefrLevel: calculatedCefrLevel,
      raLevel,
      wordCount: articleData.wordCount,
    });
  } catch (error) {
    console.error("Error generating user article:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    // Cleanup on error
    if (articleRef && userId) {
      console.log("Starting cleanup process...");
      await cleanupFailedGeneration(userId, articleRef.id);
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
    console.log("Starting article approval process...");

    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    console.log(`User ID: ${userId}`);

    // Parse request body
    const { articleId } = await req.json();
    if (!articleId) {
      return NextResponse.json(
        { error: "Article ID is required" },
        { status: 400 }
      );
    }

    console.log(`Approving article: ${articleId}`);

    // Get the user's generated article
    const userArticleRef = db
      .collection("users")
      .doc(userId)
      .collection("generated-articles")
      .doc(articleId);

    const userArticleDoc = await userArticleRef.get();
    if (!userArticleDoc.exists) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const articleData = userArticleDoc.data();
    if (!articleData) {
      return NextResponse.json(
        { error: "Article data is invalid" },
        { status: 400 }
      );
    }

    console.log("Article found, starting approval process...");

    // 1. Copy article to new-articles collection (excluding wordList)
    const newArticleRef = db.collection("new-articles").doc(articleId);
    const newArticleData = {
      id: articleId,
      title: articleData.title,
      passage: articleData.passage,
      summary: articleData.summary,
      image_description: articleData.imageDesc,
      type: articleData.type,
      genre: articleData.genre,
      subgenre: articleData.subgenre,
      topic: articleData.topic,
      cefr_level: articleData.cefrLevel,
      ra_level: articleData.raLevel,
      average_rating: articleData.rating,
      read_count: 0,
      created_at: articleData.createdAt,
      updated_at: new Date().toISOString(),
      ...(articleData.timepoints && { timepoints: articleData.timepoints }),
    };

    await newArticleRef.set(newArticleData);
    console.log("Article copied to new-articles collection");

    // 2. Copy questions subcollections
    const questionTypes = ["mc-questions", "sa-questions", "la-questions"];

    for (const questionType of questionTypes) {
      const userQuestionsRef = userArticleRef.collection(questionType);
      const userQuestionsSnapshot = await userQuestionsRef.get();

      if (!userQuestionsSnapshot.empty) {
        const newQuestionsRef = newArticleRef.collection(questionType);
        const batch = db.batch();

        userQuestionsSnapshot.docs.forEach((doc) => {
          const newQuestionRef = newQuestionsRef.doc(doc.id);
          batch.set(newQuestionRef, doc.data());
        });

        await batch.commit();
        console.log(`Copied ${questionType} to new-articles`);
      }
    }

    // 3. Move word list to main word-list collection
    const userWordListRef = userArticleRef
      .collection("word-list")
      .doc(articleId);
    const userWordListDoc = await userWordListRef.get();

    if (userWordListDoc.exists) {
      const wordListData = userWordListDoc.data();
      if (wordListData) {
        const mainWordListRef = db.collection("word-list").doc(articleId);
        await mainWordListRef.set(wordListData);
        console.log("Word list moved to main collection");
      }
    }

    // 4. Update user's article status to approved
    await userArticleRef.update({
      status: "approved",
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log("Article approval process completed successfully");

    return NextResponse.json({
      message: "Article approved successfully",
      articleId: articleId,
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

    // Get user's generated articles
    const articlesRef = db
      .collection("users")
      .doc(userId)
      .collection("generated-articles");

    const snapshot = await articlesRef.orderBy("createdAt", "desc").get();

    const articles = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ articles });
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
    console.log(`Starting article update for ID: ${articleId}`);

    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log("Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    console.log(`User ID: ${userId}`);

    // Parse request body
    const { title, passage, summary, imageDesc } = await req.json();
    if (!title || !passage || !summary || !imageDesc) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the existing article
    const articleRef = db
      .collection("users")
      .doc(userId)
      .collection("generated-articles")
      .doc(articleId);

    const articleDoc = await articleRef.get();
    if (!articleDoc.exists) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const existingData = articleDoc.data();
    if (!existingData) {
      return NextResponse.json(
        { error: "Article data is invalid" },
        { status: 400 }
      );
    }

    console.log(
      "Existing article found, starting update process...",
      existingData
    );

    // 1. Clean up existing bucket files
    console.log("Cleaning up existing bucket files...");
    await cleanupStorageFiles(articleId, userId);

    // 2. Recalculate levels based on new passage
    console.log("Recalculating levels...");
    const normalizedCefrLevel = existingData.cefrLevel
      .replace("+", "")
      .toLowerCase();
    console.log(
      `Normalized CEFR level: ${normalizedCefrLevel} (from ${existingData.cefrLevel})`
    );

    const { raLevel, cefrLevel: calculatedCefrLevel } = calculateLevel(
      passage,
      normalizedCefrLevel
    );

    // 3. Re-evaluate rating
    console.log("Re-evaluating rating...");
    const evaluatedRating = await evaluateRating({
      title: title,
      summary: summary,
      type: existingData.type,
      image_description: imageDesc,
      passage: passage,
      cefrLevel: existingData.cefrLevel,
    });

    // 4. Update article data
    const updatedData = {
      title,
      passage,
      summary,
      imageDesc,
      cefr_level: calculatedCefrLevel,
      raLevel,
      wordCount: passage.split(" ").length,
      rating: evaluatedRating.rating,
      updatedAt: new Date().toISOString(),
    };

    await articleRef.update(updatedData);
    console.log("Article data updated in Firestore");

    // 5. Regenerate all content
    console.log("Regenerating content...");

    // Delete existing subcollections
    const subcollections = [
      "mc-questions",
      "sa-questions",
      "la-questions",
      "word-list",
    ];
    for (const subcollectionName of subcollections) {
      const subcollectionRef = articleRef.collection(subcollectionName);
      const snapshot = await subcollectionRef.get();

      const deletePromises = snapshot.docs.map((doc) => doc.ref.delete());
      await Promise.all(deletePromises);
      console.log(`Deleted existing ${subcollectionName}`);
    }

    // Generate new image
    console.log("Generating new image...");
    await generateImage({
      imageDesc: imageDesc,
      articleId: articleId,
    });

    // Generate new questions
    console.log("Generating new questions...");
    const [mcq, saq, laq] = await Promise.all([
      generateMCQuestion({
        type: existingData.type,
        cefrlevel: normalizedCefrLevel as ArticleBaseCefrLevel,
        passage: passage,
        title: title,
        summary: summary,
        imageDesc: imageDesc,
      }),
      generateSAQuestion({
        type: existingData.type,
        cefrlevel: normalizedCefrLevel as ArticleBaseCefrLevel,
        passage: passage,
        title: title,
        summary: summary,
        imageDesc: imageDesc,
      }),
      generateLAQuestion({
        type: existingData.type,
        cefrlevel: normalizedCefrLevel as ArticleBaseCefrLevel,
        passage: passage,
        title: title,
        summary: summary,
        imageDesc: imageDesc,
      }),
    ]);

    // Generate new word list
    console.log("Generating new word list...");
    const wordList = await generateWordList({
      passage: passage,
    });

    // Save new questions and word list
    console.log("Saving new questions and word list...");
    await Promise.all([
      addUserQuestionsToCollection(
        userId,
        articleId,
        "mc-questions",
        mcq.questions
      ),
      addUserQuestionsToCollection(
        userId,
        articleId,
        "sa-questions",
        saq.questions
      ),
      addUserQuestionsToCollection(userId, articleId, "la-questions", [laq]),
      addUserWordList(
        userId,
        articleId,
        wordList.word_list,
        updatedData.updatedAt
      ),
    ]);

    // Generate new audio
    console.log("Generating new audio...");
    await Promise.all([
      generateAudio({
        passage: passage,
        articleId: articleId,
        isUserGenerated: true,
        userId: userId,
      }),
      generateAudioForWord({
        wordList: wordList.word_list,
        articleId: articleId,
        isUserGenerated: true,
        userId: userId,
      }),
    ]);

    console.log("Article update completed successfully");

    return NextResponse.json({
      message: "Article updated successfully",
      articleId: articleId,
      ...updatedData,
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
            console.log(`Deleted file: ${filePath}`);
          }
        } catch (fileError) {
          // File might not exist, continue
          console.log(`Could not delete file: ${basePath}${ext}`);
        }
      }

      // Also try to delete directories
      try {
        const [files] = await bucket.getFiles({ prefix: `${basePath}/` });
        if (files.length > 0) {
          const deletePromises = files.map((file) => file.delete());
          await Promise.all(deletePromises);
          console.log(
            `Deleted ${files.length} files in directory: ${basePath}/`
          );
        }
      } catch (dirError) {
        console.log(`Could not delete directory: ${basePath}/`);
      }
    }
  } catch (storageError) {
    console.error("Error cleaning up storage files:", storageError);
  }
}

async function cleanupFailedGeneration(userId: string, articleId: string) {
  try {
    console.log(`Cleaning up failed generation for article: ${articleId}`);

    // 1. Delete article document and all subcollections from Firestore
    const articleRef = db
      .collection("users")
      .doc(userId)
      .collection("generated-articles")
      .doc(articleId);

    // Delete subcollections
    const subcollections = [
      "mc-questions",
      "sa-questions",
      "la-questions",
      "word-list",
    ];

    for (const subcollectionName of subcollections) {
      const subcollectionRef = articleRef.collection(subcollectionName);
      const snapshot = await subcollectionRef.get();

      const deletePromises = snapshot.docs.map((doc) => doc.ref.delete());
      await Promise.all(deletePromises);

      console.log(`Deleted ${subcollectionName} subcollection`);
    }

    // Delete the main article document
    await articleRef.delete();
    console.log("Deleted article document");

    // 2. Delete files from Cloud Storage bucket
    await cleanupStorageFiles(articleId);

    console.log("Cleanup completed successfully");
  } catch (cleanupError) {
    console.error("Error during cleanup:", cleanupError);
    // Log cleanup error but don't throw to avoid masking original error
  }
}

async function addUserQuestionsToCollection(
  userId: string,
  articleId: string,
  collectionName: string,
  questions: any[]
) {
  const collectionRef = db
    .collection("users")
    .doc(userId)
    .collection("generated-articles")
    .doc(articleId)
    .collection(collectionName);

  const promises = questions.map((question) => collectionRef.add(question));
  await Promise.all(promises);
}

async function addUserWordList(
  userId: string,
  articleId: string,
  wordList: any[],
  createdAt: string
) {
  const wordListRef = db
    .collection("users")
    .doc(userId)
    .collection("generated-articles")
    .doc(articleId)
    .collection("word-list")
    .doc(articleId);

  await wordListRef.set({
    word_list: wordList,
    articleId,
    id: articleId,
    created_at: createdAt,
  });
}
