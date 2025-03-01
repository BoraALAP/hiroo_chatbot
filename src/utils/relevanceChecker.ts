import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { Document } from '@langchain/core/documents';

/**
 * Checks if search results are relevant to the user's question
 * @param llm The language model to use
 * @param question The user's question
 * @param results The search results to check
 * @returns A boolean indicating whether the results are relevant
 */
export const checkResultsRelevance = async (
  llm: ChatOpenAI,
  question: string, 
  results: Document[]
): Promise<boolean> => {
  // If no results, they're definitely not relevant
  if (!results || results.length === 0) return false;
  
  try {
    // Use the LLM to determine if the results are relevant to the question
    const relevancePrompt = ChatPromptTemplate.fromTemplate(`
      You are an AI assistant helping to determine if search results are relevant to a user's question.
      
      User Question: {question}
      
      Search Results:
      {results}
      
      Are these search results relevant to answering the user's specific question? 
      Answer with only "yes" if the results directly address the user's question.
      Answer with only "no" if the results are unrelated or don't provide a clear answer to the specific question.
    `);
    
    const resultsText = results.map(r => r.pageContent).join("\n\n");
    
    const relevanceChain = RunnableSequence.from([
      relevancePrompt,
      llm,
      new StringOutputParser(),
    ]);
    
    const relevanceResponse = await relevanceChain.invoke({
      question: question,
      results: resultsText
    });
    
    console.log("Relevance assessment:", relevanceResponse);
    
    // If the response contains "no", the results are not relevant
    return !relevanceResponse.toLowerCase().includes("no");
  } catch (error) {
    console.error("Error checking results relevance:", error);
    // Default to assuming results are relevant if we can't check
    return true;
  }
}; 