import { generateObject } from "ai";
import { ArticleBaseCefrLevel, ArticleType } from "../../models/enum";
import { z } from "zod";
import { openai, openaiModel4o } from "@/utils/openai";

interface GenerateStoriesTopicParams {
  type: ArticleType;
  genre: string;
  subgenre: string;
  amountPerGenre: number;
}

export interface GenerateStoriesTopicResponse {
  topics: string[]; 
}

export async function generateStoriesTopic(
  params: GenerateStoriesTopicParams
): Promise<GenerateStoriesTopicResponse> {
  console.log(
    `Generating topics for ${params.type} ${params.genre} ${params.subgenre} with amount: ${params.amountPerGenre}`
  );

  const prompts = {
    fiction: `Please provide ${params.amountPerGenre} reading passage topics in the ${params.type} ${params.genre} genre and ${params.subgenre} subgenre appropriate for secondary school students. Output as a JSON array.`,
    nonfiction: `Please provide ${params.amountPerGenre} reading passage topics in the ${params.type} ${params.genre} genre and ${params.subgenre} subgenre appropriate for secondary school students. Output as a JSON array.`,
  };

  try {
    const response = await generateObject({
      model: openai(openaiModel4o),
      schema: z.object({
        topics: z
          .array(z.string())
          .describe("An array of topics")
          .length(params.amountPerGenre),
      }),
      prompt: prompts[params.type],
    });

    return {
      topics: response.object.topics,
    };
  } catch (error) {
    throw new Error(`Failed to generate topic: ${error}`);
  }
}
