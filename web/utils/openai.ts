import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const openaiModel = "gpt-4o-mini";

const openaiImages = "dall-e-3";

export { openai, openaiModel, openaiImages };
