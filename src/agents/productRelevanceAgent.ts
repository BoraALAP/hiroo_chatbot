import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";

/**
 * Creates a product relevance checker that determines if a question is related to a product
 * @param apiKey OpenAI API key
 * @param modelName Model name to use (defaults to gpt-4-turbo)
 * @returns A function that checks if a question is product-related
 */
export const createProductRelevanceChecker = (
  apiKey: string,
  modelName: string = "gpt-4-turbo"
) => {
  // Initialize the model with a low temperature for deterministic responses
  const model = new ChatOpenAI({
    openAIApiKey: apiKey,
    modelName,
    temperature: 0.1,
  });

  // Create a prompt template for product relevance checking
  const template = `You are an AI assistant that determines if a question is related to a product or service.
Your task is to analyze the question and determine if it is asking about:
- A product or service (like career pages, job boards, etc.)
- Features or functionality (like customization, design, settings, etc.)
- Pricing or plans
- Usage or implementation
- Technical support

Consider questions about career pages, job postings, company profiles, and related features as product-related.

Question: {question}

Is this question related to a product or service? Answer with only "yes" or "no".`;

  const promptTemplate = PromptTemplate.fromTemplate(template);

  // Create the chain
  const chain = new LLMChain({
    llm: model,
    prompt: promptTemplate,
  });

  /**
   * Checks if a question is related to a product
   * @param question The question to check
   * @returns True if the question is product-related, false otherwise
   */
  return async (question: string): Promise<boolean> => {
    try {
      console.log("Checking if question is product-related:", question);
      
      const response = await chain.call({
        question,
      });
      
      const result = response.text.trim().toLowerCase();
      const isProductRelated = result === "yes";
      
      console.log("Is product related:", isProductRelated);
      return isProductRelated;
    } catch (error) {
      console.error("Error checking product relevance:", error);
      // Default to false if there's an error
      return false;
    }
  };
}; 