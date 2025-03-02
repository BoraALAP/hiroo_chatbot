import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";

/**
 * Creates a question simplifier function that simplifies user questions to enhance search accuracy
 * @param apiKey OpenAI API key
 * @param modelName Model name to use (defaults to gpt-4-turbo)
 * @returns A function that simplifies questions
 */
export const createQuestionSimplifier = (
  apiKey: string,
  modelName: string = "gpt-4-turbo"
) => {
  // Initialize the model with a low temperature for deterministic responses
  const model = new ChatOpenAI({
    openAIApiKey: apiKey,
    modelName,
    temperature: 0.1,
  });

  // Create a prompt template for question simplification
  const template = `You are an AI assistant that simplifies complex questions into simpler, more searchable forms.
Your task is to rewrite the question to make it clearer and more direct, focusing on the core information need.
Remove unnecessary details but preserve the essential meaning.

Original question: {question}

Simplified question:`;

  const promptTemplate = PromptTemplate.fromTemplate(template);

  // Create the chain
  const chain = new LLMChain({
    llm: model,
    prompt: promptTemplate,
  });

  /**
   * Simplifies a given question to enhance search accuracy
   * @param question The question to simplify
   * @returns The simplified question, or the original if simplification fails
   */
  return async (question: string): Promise<string> => {
    try {
      console.log("Original question:", question);
      
      const response = await chain.call({
        question,
      });
      
      const simplifiedQuestion = response.text.trim();
      console.log("Simplified question:", simplifiedQuestion);
      
      return simplifiedQuestion;
    } catch (error) {
      console.error("Error simplifying question:", error);
      // Return the original question if simplification fails
      return question;
    }
  };
}; 