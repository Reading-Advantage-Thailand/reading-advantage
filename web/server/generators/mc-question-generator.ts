import { z } from "zod";
import { ArticleCefrLevel, ArticleType } from "../models/enum";
import { generateQuestion, GenerateQuestionParams } from "./question-generator";

interface GenrateMCQuestionParams {
    cefrlevel: ArticleCefrLevel,
    type: ArticleType,
    passage: string,
    title: string,
    summary: string,
    imageDesc: string
}

interface GenerateMCQuestionResponse {
    questions: {
        question: string;
        correct_answer: string;
        distractor_1: string;
        distractor_2: string;
        distractor_3: string;
        question_number: number;
    }[];
}

export async function generateMCQuestion(params: GenrateMCQuestionParams): Promise<GenerateMCQuestionResponse> {
    // schema
    const schema = z.object({
        questions: z.array(
            z.object({
                correct_answer: z.string().describe("The correct answer"),
                distractor_1: z
                    .string()
                    .describe(
                        "An incorrect but plausible answer that is approximately the same length as the correct answer."
                    ),
                distractor_2: z
                    .string()
                    .describe(
                        "An incorrect but plausible answer that is approximately the same length as the correct answer."
                    ),
                distractor_3: z
                    .string()
                    .describe(
                        "An incorrect but plausible answer that is approximately the same length as the correct answer."
                    ),
                question: z.string().describe("The question"),
                question_number: z.number(),
            })
        ),
    });
    // generate question params
    const generateParams: GenerateQuestionParams<GenerateMCQuestionResponse> = {
        type: params.type,
        passage: params.passage,
        title: params.title,
        summary: params.summary,
        imageDesc: params.imageDesc,
        schema: schema,
        promptFile: "prompts-combined-MC.json",
        modelId: "gpt-4o",
        cefrlevel: params.cefrlevel,
    }
    // generate question
    const generateQuestionResponse = await generateQuestion<GenerateMCQuestionResponse>(generateParams);
    return generateQuestionResponse.question;
}