import z from "zod";
import path from "path";
import { readJsonFile } from "../read-json";
import { generateObject } from "ai";
import { ArticleBaseCefrLevel, ArticleType } from "../../models/enum";
import { openai, openaiModel } from "@/utils/openai";
import { google, googleModel } from "@/utils/google";

export interface GenerateArticleParams {
  type: ArticleType;
  genre: string;
  subgenre: string;
  topic: string;
  cefrLevel: ArticleBaseCefrLevel;
}

export interface GenerateArticleResponse {
  passage: string;
  title: string;
  summary: string;
  imageDesc: string;
}

type CefrLevelPromptType = {
  type: ArticleType;
  levels: CefrLevelType[];
};

type CefrLevelType = {
  level: string;
  systemPrompt: string;
  modelId: string;
  userPromptTemplate: string;
};

// schema
const schema = z.object({
  planning: z.string().describe("Planning for the passage: passage-specific strategies for vocabulary and grammar according to the CEFR level; and a detailed outline (plan) of the passage."
  title: z.string().describe("An interesting title for the article written to the CEFR level"),
  passage: z.string().describe("The main content of the article"),
  summary: z.string().describe("A one-sentence summary of the article written to the CEFR level"),
  imageDesc: z
    .string()
    .describe(
      "A detailed description of an image to go along with the passage"
    ),
});

export async function generateArticle(
  params: GenerateArticleParams
): Promise<GenerateArticleResponse> {
  const dataFilePath = path.join(
    process.cwd(),
    "data",
    "cefr-level-prompts.json"
  );

  // read prompts from file
  const prompts = readJsonFile<CefrLevelPromptType[]>(dataFilePath);

  // find the level config
  const levelConfig = prompts
    .find((item) => item.type === params.type)
    ?.levels.find((lvl) => lvl.level === params.cefrLevel);

  if (!levelConfig) {
    throw new Error(`level config not found for ${params.cefrLevel}`);
  }

  const userPrompt = levelConfig.userPromptTemplate
    .replace("{genre}", params.genre)
    .replace("{subgenre}", params.subgenre)
    .replace("{topic}", params.topic);

  // generate article
  try {
    console.log(
      `${params.cefrLevel} generating article model ID: ${googleModel} type: ${params.type}`
    );

    const { object: article } = await generateObject({
      model: google(googleModel),
      //model: openai(openaiModel),
      schema: schema,
      system: levelConfig.systemPrompt,
      prompt: userPrompt,
      seed: Math.floor(Math.random() * 1000),
      temperature: 1,
    });

    return article;
  } catch (error) {
    throw `failed to generate article: ${error}`;
  }
}
