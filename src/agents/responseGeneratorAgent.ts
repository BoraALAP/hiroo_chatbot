import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";

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
  const template = `You are a helpful AI assistant for a product called Hiroo. 
Your goal is to provide accurate, helpful, and friendly responses to user questions.

CONVERSATION HISTORY:
{history}

USER QUESTION:
{question}

KNOWLEDGE BASE INFORMATION:
{knowledge}

Based on the above information, provide a helpful response to the user's question.
If the knowledge base doesn't contain relevant information, acknowledge that you don't have specific information about that topic.
Keep your response concise, friendly, and focused on answering the user's question.`;

  const promptTemplate = PromptTemplate.fromTemplate(template);

  // Create the chain
  const chain = new LLMChain({
    llm: model,
    prompt: promptTemplate,
  });

  /**
   * Generates a response to a user question
   * @param question The user's question
   * @param knowledgeBase Information from the knowledge base (or null if none)
   * @param history Conversation history
   * @returns The generated response
   */
  return async (
    question: string,
    knowledgeBase: string | null,
    history: string = ""
  ): Promise<string> => {
    try {
      const knowledge = knowledgeBase || "No specific information available in the knowledge base.";
      
      const response = await chain.call({
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