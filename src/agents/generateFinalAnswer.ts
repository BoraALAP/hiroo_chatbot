import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

const prompt = PromptTemplate.fromTemplate(`
Answer EXCLUSIVELY using the provided context information.
If the {knowledge} doesn't contain a clear answer to the question, respond with: 
"I don't have information about that in my knowledge base. Would you like to leave your email so we can follow up when we have an answer?"
NEVER use general knowledge to answer questions about Hiroo features or functionality.

USER QUESTION: {question}

RELEVANT INFORMATION:
{knowledge}

CONVERSATION HISTORY:
{history}
`);




const llm = new ChatOpenAI({ temperature: 0.8, modelName: process.env.NEXT_PUBLIC_AI_MODEL, apiKey: process.env.OPENAI_API_KEY });

export const generateFinalAnswerChain = RunnableSequence.from([
  (input: { question: string; knowledge: string; history?: string }) => {
    

    return {
      question: input.question,
      knowledge: input.knowledge,
      history: input.history,
    };
  },
  prompt,
  llm,
  new StringOutputParser(),
]);