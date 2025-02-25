import { ArticleBaseCefrLevel, ArticleType } from "@/server/models/enum";
import { generateArticle } from "./article-generator";
import { generateMCQuestion } from "./mc-question-generator";
import { generateSAQuestion } from "./sa-question-generator";
import { generateLAQuestion } from "./la-question-generator";

export async function generateChapterOutline({
  topic,
  chapterNumber,
  cefrLevel,
}: {
  topic: string;
  chapterNumber: number;
  cefrLevel: ArticleBaseCefrLevel;
}) {
  return {
    chapterNumber,
    title: `Chapter ${chapterNumber}: Key Event`,
    summary: `This chapter covers major developments in ${topic}.`,
  };
}

export async function generateStoryArticle({
  type,
  genre,
  subgenre,
  topic,
  cefrLevel,
  chapterNumber,
  previousContent = "",
  wordCountLimit,
}: {
  type: ArticleType;
  genre: string;
  subgenre: string;
  topic: string;
  cefrLevel: ArticleBaseCefrLevel;
  chapterNumber: number;
  previousContent?: string;
  wordCountLimit: number;
}) {
  const generatedArticle = await generateArticle({
    type,
    genre,
    subgenre,
    topic,
    cefrLevel,
    previousContent,
  });


  const words = generatedArticle.passage.split(" ");
  const trimmedContent = words.slice(0, wordCountLimit).join(" ");

  const [mcq, saq, laq] = await Promise.all([
    generateMCQuestion({
      cefrlevel: cefrLevel,
      type,
      passage: trimmedContent,
      title: generatedArticle.title,
      summary: generatedArticle.summary,
      imageDesc: generatedArticle.imageDesc,
    }),
    generateSAQuestion({
      cefrlevel: cefrLevel,
      type,
      passage: trimmedContent,
      title: generatedArticle.title,
      summary: generatedArticle.summary,
      imageDesc: generatedArticle.imageDesc,
    }),
    generateLAQuestion({
      cefrlevel: cefrLevel,
      type,
      passage: trimmedContent,
      title: generatedArticle.title,
      summary: generatedArticle.summary,
      imageDesc: generatedArticle.imageDesc,
    }),
  ]);

  return {
    chapterNumber,
    title: generatedArticle.title,
    summary: generatedArticle.summary,
    content: trimmedContent,
    analysis: {
      wordCount: trimmedContent.split(" ").length,
      complexity: cefrLevel,
    },
    mcq: mcq.questions.map((q) => ({
      question: q.question,
      options: [
        q.correct_answer,
        q.distractor_1,
        q.distractor_2,
        q.distractor_3,
      ].sort(() => Math.random() - 0.5),
      answer: q.correct_answer,
      textual_evidence: q.textual_evidence,
    })),
    saq: saq.questions.map((q) => ({
      question: q.question,
      answer: q.suggested_answer,
    })),
    laq: [{ question: laq }],
  };
}
