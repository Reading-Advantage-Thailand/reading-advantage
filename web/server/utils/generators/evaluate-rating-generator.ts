import path from "path";
import { readJsonFile } from "../read-json";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { generateObject } from "ai";
import { ArticleBaseCefrLevel, ArticleType } from "../../models/enum";
import { ArticleCefrLevel } from "../../models/article";

export interface EvaluateRatingParams {
    type: ArticleType;
    genre: string;
    subgenre: string;
    cefrLevel: ArticleBaseCefrLevel | ArticleCefrLevel
    title: string,
    summary: string,
    passage: string,
    image_description: string,
}

export interface EvaluateRatingResponse {
    rating: number;
}

interface CefrLevelEvaluationPromptType {
    level: string;
    systemPrompt: string;
}

export async function evaluateRating(params: EvaluateRatingParams): Promise<EvaluateRatingResponse> {
    const dataFilePath = path.join(process.cwd(), "data", "cefr-level-evaluation-prompts.json");

    // read prompts from file
    const prompt = readJsonFile<CefrLevelEvaluationPromptType[]>(dataFilePath);

    try {
        const { object: evaluated } = await generateObject({
            model: openai("gpt-4o-mini"),
            schema: z.object({
                rating: z.number(),
            }),
            system: prompt.find((p) => p.level === params.cefrLevel)?.systemPrompt,
            prompt: JSON.stringify({
                title: params.title,
                summary: params.summary,
                type: params.type,
                subgenre: params.subgenre,
                passage: params.passage,
                image: params.image_description,
            }),
        });

        return {
            rating: evaluated.rating,
        };
    } catch (error) {
        throw new Error("failed to evaluate rating");
    }
}