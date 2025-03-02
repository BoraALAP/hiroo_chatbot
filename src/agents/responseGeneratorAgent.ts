import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";


/**
 * Creates a response generator that generates responses to user questions
 * @param apiKey OpenAI API key
 * @param modelName Model name to use (defaults to gpt-4-turbo)
 * @returns A function that generates responses
 */
export const createResponseGenerator = (
  apiKey: string,
  modelName: string = "gpt-4-turbo"
) => {
  // Initialize the model with a moderate temperature for more natural responses
  const model = new ChatOpenAI({
    openAIApiKey: apiKey,
    modelName,
    temperature: 0.7,
  });

  // Create a prompt template for response generation
  const productResponseTemplate = `You are a helpful AI assistant for a product called Hiroo. 
Your goal is to provide accurate, helpful, and friendly responses to user questions about Hiroo.

CONVERSATION HISTORY:
{history}

USER QUESTION:
{question}

KNOWLEDGE BASE INFORMATION:
{knowledge}

Based on the above information, provide a helpful response to the user's question.
If the knowledge base doesn't contain relevant information, acknowledge that you don't have specific information about that topic.
Keep your response concise, friendly, and focused on answering the user's question.`;

  const nonProductResponseTemplate = `You are an AI assistant for a product called Hiroo.
You've determined that the following question is not related to Hiroo:

USER QUESTION:
{question}

Generate a polite response that:
1. Acknowledges that the question is not related to Hiroo
2. Explains that you're focused on helping with Hiroo-related questions
3. Offers to help with Hiroo-related questions instead
4. Varies your wording to sound natural (don't use the exact same phrasing every time)

Keep your response concise and friendly.`;

  const productPromptTemplate = PromptTemplate.fromTemplate(productResponseTemplate);
  const nonProductPromptTemplate = PromptTemplate.fromTemplate(nonProductResponseTemplate);

  // Create the chains
  const productChain = productPromptTemplate.pipe(model);
  const nonProductChain = nonProductPromptTemplate.pipe(model);

  /**
   * Generates a response to a user question
   * @param question The user's question
   * @param knowledgeBase Information from the knowledge base (or null if none)
   * @param history Conversation history
   * @param isProductRelated Whether the question is product-related
   * @returns The generated response
   */
  return async (
    question: string,
    knowledgeBase: string | null,
    history: string = "",
    isProductRelated: boolean = true
  ): Promise<string> => {
    try {
      // If the question is not product-related, use the non-product chain
      if (!isProductRelated) {
        const response = await nonProductChain.invoke({
          question
        });
        return response.text.trim();
      }
      
      const knowledge = knowledgeBase || "No specific information available in the knowledge base.";
      
      const response = await productChain.invoke({
        question,
        knowledge,
        history,
      });
      
      return response.text.trim();
    } catch (error) {
      console.error("Error generating response:", error);
      return "I'm sorry, I encountered an error while processing your request. Please try again later.";
    }
  };
}; 