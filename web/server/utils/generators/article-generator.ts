import z from "zod";
import path from "path";
import { readJsonFile } from "../read-json";
import { generateObject } from "ai";
import { ArticleBaseCefrLevel, ArticleType } from "../../models/enum";
import openai from "@/utils/openai";
import google from "@/utils/google";

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
  title: z.string().describe("An interesting title for the article"),
  passage: z.string().describe("The main content of the article"),
  summary: z.string().describe("A one-sentence summary of the article"),
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
      `${params.cefrLevel} generating article model ID: gemini-2.0-flash-exp type: ${params.type}`
    );
    const { object: article } = await generateObject({
      model: google("gemini-2.0-flash-exp"),
      schema: schema,
      system: levelConfig.systemPrompt,
      prompt: userPrompt,
    });
    return {
      passage: article.passage,
      title: article.title,
      summary: article.summary,
      imageDesc: article.imageDesc,
    };
  } catch (error) {
    throw `failed to generate article: ${error}`;
  }
}
