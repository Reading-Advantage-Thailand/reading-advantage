import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const openaiModel = "gpt-4o-mini";

export { openai, openaiModel };
