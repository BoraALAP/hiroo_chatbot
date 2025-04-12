import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

const prompt = PromptTemplate.fromTemplate(
  `Simplify this question to make it clearer and more direct, focusing on the core information need. 

Remove unnecessary details but preserve the essential meaning.

Also check if the question is related to Hiroo.

ABOUT HIROO:
Hiroo is a Saas product that helps companies with their HR needs. Hiring, Applicant Tracking, Employee Management, etc.

Question: {question}
Simplified:`
  );



const llm = new ChatOpenAI({ modelName: process.env.NEXT_PUBLIC_AI_MODEL, temperature: 0, apiKey: process.env.OPENAI_API_KEY });

export const simplifyChain = RunnableSequence.from([
  input => ({ question: input.question }),
  prompt,
  llm,
  new StringOutputParser(),
]);