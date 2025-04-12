import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

const prompt = PromptTemplate.fromTemplate(
  `ABOUT HIROO:
Hiroo is a Saas product that helps companies with their HR needs. Hiring, Applicant Tracking, Employee Management, etc.

You are an assistant for the HR platform Hiroo.
ALWAYS assume questions are about Hiroo unless they are completely unrelated to any product or service.
Only mark questions as irrelevant if they have no possible connection to an HR platform (like asking about cooking recipes).

Question: {question}

Respond with ONLY 'yes' if the question is reasonable and about Hiroo, or 'no' if it's not.`
);






const llm = new ChatOpenAI({ modelName: process.env.NEXT_PUBLIC_AI_MODEL, temperature: 0, apiKey: process.env.OPENAI_API_KEY });

export const relevanceCheckChain = RunnableSequence.from([
  input => ({ question: input.question }),
  prompt,
  llm,
  new StringOutputParser(),
  (output: string) => output.toLowerCase().includes("yes"),
]);