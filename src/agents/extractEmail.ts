import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

const prompt = PromptTemplate.fromTemplate(
  `You are an AI assistant tasked with extracting email addresses from user messages.

User message: {userMessage}

Instructions:
1. Extract any valid email address from the user's message
2. If multiple email addresses are found, select the most likely one the user wants to use
3. If no valid email address is found, leave the email field empty

If no valid email is found, return "null".
Message: {message} Email:{email}`
);


const llm = new ChatOpenAI({ modelName: process.env.NEXT_PUBLIC_AI_MODEL, temperature: 0, apiKey: process.env.OPENAI_API_KEY });

export const extractEmailChain = RunnableSequence.from([
  input => ({ message: input.message }),
  prompt,
  llm,
  new StringOutputParser(),
  (email: string) => (email.includes("@") ? email.trim() : null),
]);