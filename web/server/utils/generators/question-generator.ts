import { ArticleBaseCefrLevel, ArticleType } from "../../models/enum";
import { z } from "zod";
import { readJsonFile } from "../read-json";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import path from "path";

export interface GenerateQuestionParams<T> {
  cefrlevel: ArticleBaseCefrLevel;
  type: ArticleType;
  passage: string;
  title: string;
  summary: string;
  imageDesc: string;
  promptFile: string;
  modelId: string;
  schema: z.ZodType<T>;
}

export interface GenerateQuestionResponse<T> {
  question: T;
}

interface PromptFileType {
  fiction: {
    A1: {
      level: string;
      system_prompt: string;
      user_prompt: string;
    };
    A2: {
      level: string;
      system_prompt: string;
      user_prompt: string;
    };
    B1: {
      level: string;
      system_prompt: string;
      user_prompt: string;
    };
    B2: {
      level: string;
      system_prompt: string;
      user_prompt: string;
    };
    C1: {
      level: string;
      system_prompt: string;
      user_prompt: string;
    };
    C2: {
      level: string;
      system_prompt: string;
      user_prompt: string;
    };
  };
  nonfiction: {
    A1: {
      level: string;
      system_prompt: string;
      user_prompt: string;
    };
    A2: {
      level: string;
      system_prompt: string;
      user_prompt: string;
    };
    B1: {
      level: string;
      system_prompt: string;
      user_prompt: string;
    };
    B2: {
      level: string;
      system_prompt: string;
      user_prompt: string;
    };
    C1: {
      level: string;
      system_prompt: string;
      user_prompt: string;
    };
    C2: {
      level: string;
      system_prompt: string;
      user_prompt: string;
    };
  };
}

export async function generateQuestion<T>(
  params: GenerateQuestionParams<T>
): Promise<GenerateQuestionResponse<T>> {
  try {
    const dataFilePath = path.join(process.cwd(), "data", params.promptFile);
    const prompt = readJsonFile<PromptFileType>(dataFilePath);
    const { system_prompt, user_prompt } =
      prompt[params.type][params.cefrlevel];
    const userPrompt = `${user_prompt}\n\nPassage: ${params.passage}\nTitle: ${params.title}\nSummary: ${params.summary}\nImage Description: ${params.imageDesc}`;
    // console.log(`${params.cefrlevel} generating ${params.promptFile} model ID: ${params.modelId} type: ${params.type} CEFR level: ${params.cefrlevel}`);
    // console.log(`user prompt: ${userPrompt}`);
    // console.log(`system prompt: ${system_prompt}`);
    const { object: question } = await generateObject({
      model: openai(params.modelId),
      schema: params.schema,
      system: system_prompt,
      prompt: userPrompt,
      maxTokens: 4000,
    });
    return {
      question,
    };
  } catch (error) {
    console.log(error);
    throw `failed to generate ${params.promptFile
      .replace(".json", "")
      .replace("prompts-combined-", "")} question: ${error}`;
  }
}
