import { ChatOpenAI} from "@langchain/openai";

export const llmModel = new ChatOpenAI({
    model: "gpt-5-mini",
    maxTokens: undefined,
    timeout: undefined,
    maxRetries: 2,
    apiKey: process.env.OPENAI_API_KEY,
});