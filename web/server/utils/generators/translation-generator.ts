import { generateObject } from "ai";
import { google, googleModel } from "@/utils/google";
import { z } from "zod";

interface TranslateSummaryParams {
  summary: string;
}

interface TranslatePassageParams {
  passage: string;
}

export type TranslatedSummaryResponse = {
  cn: string;
  en: string;
  th: string;
  tw: string;
  vi: string;
};

export type TranslatedPassageResponse = {
  cn: string[];
  en: string[];
  th: string[];
  tw: string[];
  vi: string[];
};

export async function generateTranslatedSummary(
  params: TranslateSummaryParams
): Promise<TranslatedSummaryResponse> {
  try {
    const userPrompt = `Translate the following summary into Simplified Chinese (cn), Traditional Chinese (tw), Thai (th), and Vietnamese (vi). Keep the English version (en) as is: ${params.summary}`;

    const schema = z.object({
      cn: z.string().describe("Simplified Chinese translation of the summary"),
      en: z.string().describe("English version of the summary (original)"),
      th: z.string().describe("Thai translation of the summary"),
      tw: z.string().describe("Traditional Chinese translation of the summary"),
      vi: z.string().describe("Vietnamese translation of the summary"),
    });

    const { object: response } = await generateObject({
      model: google(googleModel),
      schema,
      system: "You are a professional translator. Translate the given text accurately while maintaining the original meaning and tone.",
      prompt: userPrompt,
    });

    return response;
  } catch (error) {
    console.error("Error generating translated summary:", error);
    // Return default structure with original text in English
    return {
      cn: params.summary,
      en: params.summary,
      th: params.summary,
      tw: params.summary,
      vi: params.summary,
    };
  }
}

export async function generateTranslatedPassage(
  params: TranslatePassageParams
): Promise<TranslatedPassageResponse> {
  try {
    // Split passage into sentences for better translation handling
    const sentences = params.passage
      .split(/[.!?]+/)
      .filter(sentence => sentence.trim().length > 0)
      .map(sentence => sentence.trim() + (sentence.endsWith('.') || sentence.endsWith('!') || sentence.endsWith('?') ? '' : '.'));

    const userPrompt = `Translate the following passage into Simplified Chinese (cn), Traditional Chinese (tw), Thai (th), and Vietnamese (vi). Keep the English version (en) as is. Return each sentence as a separate array element. Passage: ${params.passage}`;

    const schema = z.object({
      cn: z.array(z.string()).describe("Simplified Chinese translation of each sentence"),
      en: z.array(z.string()).describe("English version of each sentence (original)"),
      th: z.array(z.string()).describe("Thai translation of each sentence"),
      tw: z.array(z.string()).describe("Traditional Chinese translation of each sentence"),
      vi: z.array(z.string()).describe("Vietnamese translation of each sentence"),
    });

    const { object: response } = await generateObject({
      model: google(googleModel),
      schema,
      system: "You are a professional translator. Translate the given passage sentence by sentence accurately while maintaining the original meaning and tone. Return each sentence as a separate array element.",
      prompt: userPrompt,
    });

    return response;
  } catch (error) {
    console.error("Error generating translated passage:", error);
    // Return default structure with original text in English
    const sentences = params.passage
      .split(/[.!?]+/)
      .filter(sentence => sentence.trim().length > 0)
      .map(sentence => sentence.trim() + (sentence.endsWith('.') || sentence.endsWith('!') || sentence.endsWith('?') ? '' : '.'));
    
    return {
      cn: sentences,
      en: sentences,
      th: sentences,
      tw: sentences,
      vi: sentences,
    };
  }
}