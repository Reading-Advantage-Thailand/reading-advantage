import { generateText } from "ai";
import { ArticleCefrLevel, ArticleType } from "../models/enum";
import { openai } from "@ai-sdk/openai";

interface GenerateTopicParams {
    type: ArticleType,
    genre: string,
    subgenre: string,
    amountPerGenre: number,
}

interface GenerateTopicResponse {
    topics: string[];
}

export async function generateTopic(params: GenerateTopicParams): Promise<GenerateTopicResponse> {
    const prompts = {
        fiction: `Please provide ${params.amountPerGenre} reading passage topics in the ${params.type} ${params.genre} genre and ${params.subgenre} subgenre. Output as a JSON array.`,
        nonfiction: `Please provide ${params.amountPerGenre} reading passage topics in the ${params.type} ${params.genre} genre and ${params.subgenre} subgenre. Output as a JSON array.`,
    }
    try {
        const response = await generateText({
            model: openai("gpt-3.5-turbo"),
            prompt: prompts[params.type],
        });
        return {
            topics: JSON.parse(response.text),
        };
    } catch (error) {
        throw new Error(`failed to generate topics: ${error}`);
    }
}