import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

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
  const template = `You are an AI assistant that determines if a question is related to the Hiroo product or service.

ABOUT HIROO:
Hiroo is a platform that helps companies create career pages, job boards, and manage job postings and applications.

YOUR TASK:
Analyze the question and determine if it is asking about:
- Hiroo as a product or service
- Features or functionality of Hiroo
- Pricing or plans for Hiroo
- Usage or implementation of Hiroo
- Technical support for Hiroo
- Career pages, job boards, or recruitment tools (which are relevant to Hiroo's domain)

GUIDELINES:
- Questions about career pages, job postings, company profiles, and related features are considered relevant if they could reasonably be answered in the context of Hiroo.
- Questions about general recruitment, hiring processes, or job seeking may be relevant if they relate to Hiroo's functionality.
- Questions that are clearly outside Hiroo's domain should be classified as not relevant.

EXAMPLES OF NON-RELEVANT QUESTIONS:
- Philosophical questions (e.g., "What is the meaning of life?")
- General knowledge questions unrelated to recruitment or Hiroo (e.g., "How tall is Mount Everest?")
- Personal advice unrelated to careers or Hiroo (e.g., "Should I break up with my partner?")
- Questions about unrelated products or services

Question: {question}

Is this question related to Hiroo or its domain of career pages and recruitment? Answer with only "yes" or "no".`;

  const promptTemplate = PromptTemplate.fromTemplate(template);

  // Create the chain
  const chain = promptTemplate.pipe(model);

  /**
   * Checks if a question is related to a product
   * @param question The question to check
   * @returns True if the question is product-related, false otherwise
   */
  return async (question: string): Promise<boolean> => {
    try {
      console.log("Checking if question is product-related:", question);
      
      const response = await chain.invoke({
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