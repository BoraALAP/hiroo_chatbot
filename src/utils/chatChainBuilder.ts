import { ChatOpenAI } from '@langchain/openai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { Runnable } from '@langchain/core/runnables';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { BaseMessage } from '@langchain/core/messages';

// Import from new file structure
import { createStandaloneQuestionChain, formatChatHistoryForProcessing } from './questionProcessor';
import { createQuestionReasonablenessChain, addUnansweredQuestion, updateQuestionAssessment } from './unansweredQuestions';
import { checkResultsRelevance } from './relevanceChecker';
import { createMainPromptTemplate, createNoInfoResponseChain, createContextResponseChain } from './responseGenerators';
import { isProductRelated } from './productRelevanceChecker';

// Define the type for our chat chain
export type ChatChain = RunnableSequence<{
  question: string;
  chatHistory?: BaseMessage[];
}, string>;

// Define the type for the question processing chain
type QuestionProcessingChain = Runnable<{
  question: string;
  history: string | string[];
}, string>;

/**
 * Creates the main chat chain
 * @param llm The language model to use
 * @param vectorStore The vector store for retrieving documents
 * @returns A chat chain for processing user questions
 */
export const createChatChain = (
  llm: ChatOpenAI,
  vectorStore: SupabaseVectorStore
): ChatChain => {
  // Initialize question processing chain
  const questionProcessingChain = createStandaloneQuestionChain(llm) as QuestionProcessingChain;
  
  // Create the main prompt template
  const promptTemplate = createMainPromptTemplate();
  
  // Create response generation chains
  const noInfoChain = createNoInfoResponseChain(llm);
  const contextResponseChain = createContextResponseChain(llm);
  
  // Create the chain
  const chain = RunnableSequence.from([
    {
      // Process input once and make it available to both question and context
      processedInput: async (input: { question: string; chatHistory?: BaseMessage[] }) => {
        try {
          // Get chat history if available
          const chatHistory = input.chatHistory || [];
          
          // Process the question to make it more effective for retrieval
          // Include chat history for context if available
          let processedQuestion = input.question;
          
          if (chatHistory.length > 0) {
            // If we have chat history, use it to process the question with context
            console.log("Processing question with chat history context");
            
            // Format chat history for the processing chain
            const formattedHistory = formatChatHistoryForProcessing(chatHistory);
            
            // Process the question with history context
            processedQuestion = await questionProcessingChain.invoke({ 
              question: `${formattedHistory}\n\nCurrent question: ${input.question}`,
              history: formattedHistory
            });
          } else {
            // Process the question without history
            processedQuestion = await questionProcessingChain.invoke({ 
              question: input.question,
              history: []
            });
          }
          
          console.log("Original question:", input.question);
          console.log("Processed question:", processedQuestion);
          
          return {
            originalQuestion: input.question,
            processedQuestion: processedQuestion,
            chatHistory: chatHistory
          };
        } catch (error) {
          console.error("Error processing question:", error);
          return {
            originalQuestion: input.question,
            processedQuestion: input.question, // Fallback to original if processing fails
            chatHistory: input.chatHistory || []
          };
        }
      }
    },
    {
      question: (input) => input.processedInput.originalQuestion, // Use original for final prompt
      context: async (input) => {
        try {
          // Use the already processed question for vector search
          const processedQuestion = input.processedInput.processedQuestion;
          const originalQuestion = input.processedInput.originalQuestion;
          const chatHistory = input.processedInput.chatHistory;
          
          // Search for similar documents using the processed question
          console.log("Searching for documents with query:", processedQuestion);
          const results = await vectorStore.similaritySearch(processedQuestion, 2);
          console.log("Search results:", results ? results.length : 0, "documents found");
          
          // Check if there are no results or if results are not relevant
          if (!results || results.length === 0 || !(await checkResultsRelevance(llm, originalQuestion, results))) {
            console.log("No results found or results not relevant, tracking as unanswered question");
            
            try {
              // Get the reasonableness assessment and check if it's product-related
              console.log("Assessing question reasonableness and relevance");
              const reasonablenessChain = createQuestionReasonablenessChain(llm);
              const assessment = await reasonablenessChain.invoke({ 
                question: processedQuestion
              });
              console.log("Reasonableness assessment:", assessment);
              
              // Check if the assessment indicates the question is reasonable and product-related
              const isReasonable = assessment.isReasonable;
              console.log("isReasonable:", isReasonable);
              
              // Check if the reason indicates it's product-related
              const reason = assessment.reason.toLowerCase();
              if (isProductRelated(reason)) {
                // Add to unanswered questions database
                console.log("Question is reasonable and product-related, adding to unanswered questions database");
                const questionId = await addUnansweredQuestion(
                  originalQuestion,
                  processedQuestion,
                  // You can add user ID here if available
                );
                
                console.log('Added unanswered question:', {
                  id: questionId,
                  question: originalQuestion,
                  processed: processedQuestion,
                  assessment
                });
                
                // Update the assessment in the database
                if (questionId) {
                  console.log("Updating question assessment in database");
                  const success = await updateQuestionAssessment(questionId, assessment);
                  if (success) {
                    console.log(`Successfully updated assessment for question ID ${questionId}`);
                  } else {
                    console.error(`Failed to update assessment for question ID ${questionId}`);
                  }
                }
                
                // Generate a response for when no information is found
                // Include chat history for context if available
                if (chatHistory && chatHistory.length > 0) {
                  // Use chat history to generate a more contextual response
                  return await generateNoInfoResponseWithHistory(noInfoChain, originalQuestion, chatHistory);
                } else {
                  return await noInfoChain.invoke({
                    question: originalQuestion,
                    history: chatHistory
                  });
                }
              } else {
                console.log("Question is not reasonable or not product-related, not adding to database");
                if (!isReasonable) {
                  console.log("Question is not reasonable");
                }
                if (!isProductRelated(reason)) {
                  console.log("Question is not product-related");
                }
                
                return "I couldn't find specific information to answer your question. This question doesn't appear to be directly related to our product or services. Is there something specific about our platform that you'd like to know?";
              }
            } catch (error) {
              console.error('Error tracking unanswered question:', error);
              console.error('Error details:', error instanceof Error ? error.message : String(error));
              return "I couldn't find specific information to answer your question. There was an issue processing your request. Please try asking in a different way.";
            }
          }
          
          // Combine the content from the retrieved documents and generate a response
          const resultsContent = results.map(doc => doc.pageContent).join('\n\n');
          
          // Generate a response based on the retrieved documents
          // Include chat history for context if available
          if (chatHistory && chatHistory.length > 0) {
            // Use chat history to generate a more contextual response
            return await generateContextResponseWithHistory(
              contextResponseChain, 
              originalQuestion, 
              chatHistory, 
              resultsContent
            );
          } else {
            return await contextResponseChain.invoke({
              question: originalQuestion,
              context: resultsContent,
              history: chatHistory
            });
          }
        } catch (error) {
          console.error('Error retrieving context:', error);
          return "Error retrieving information.";
        }
      },
      chatHistory: (input) => input.processedInput.chatHistory || [],
    },
    promptTemplate,
    llm,
    new StringOutputParser(),
  ]) as ChatChain;
  
  return wrapChainWithPostProcessing(chain, questionProcessingChain, llm);
};

/**
 * Generates a response for no information found, using chat history for context
 * @param chain The chain to use for response generation
 * @param question The current question
 * @param chatHistory The chat history
 * @returns Generated response
 */
const generateNoInfoResponseWithHistory = async (
  chain: Runnable<Record<string, unknown>, string>,
  question: string,
  chatHistory: BaseMessage[]
): Promise<string> => {
  // Format chat history for the prompt
  const formattedHistory = formatChatHistoryForProcessing(chatHistory);
  
  // Generate response with chat history context
  return await chain.invoke({
    question: question,
    history: formattedHistory
  });
};

/**
 * Generates a response based on context, using chat history for additional context
 * @param chain The chain to use for response generation
 * @param question The current question
 * @param chatHistory The chat history
 * @param context The context from retrieved documents
 * @returns Generated response
 */
const generateContextResponseWithHistory = async (
  chain: Runnable<Record<string, unknown>, string>,
  question: string,
  chatHistory: BaseMessage[],
  context: string
): Promise<string> => {
  // Format chat history for the prompt
  const formattedHistory = formatChatHistoryForProcessing(chatHistory);
  
  // Generate response with context and chat history
  return await chain.invoke({
    question: question,
    context: context,
    history: formattedHistory
  });
};

/**
 * Wraps a chain with post-processing to check if the response answers the question
 * @param chain The chain to wrap
 * @param questionProcessingChain The question processing chain
 * @param llm The language model to use
 * @returns A wrapped chain with post-processing
 */
const wrapChainWithPostProcessing = (
  chain: ChatChain,
  questionProcessingChain: QuestionProcessingChain,
  llm: ChatOpenAI
): ChatChain => {
  return RunnableSequence.from([
    {
      response: async (input: { question: string; chatHistory?: BaseMessage[] }) => {
        // Get the response from the original chain
        const response = await chain.invoke(input);
        
        // Check if the response indicates no information was found
        if (response.includes("I don't know") || 
            response.includes("I don't have") || 
            response.includes("I couldn't find") ||
            response.includes("I don't have specific information") ||
            response.includes("based on the context provided") ||
            response.includes("our knowledge base doesn't contain")) {
          
          console.log("Response indicates no information was found, tracking as unanswered question");
          
          try {
            // Process the question for tracking
            const processedQuestion = await questionProcessingChain.invoke({ 
              question: input.question,
              history: input.chatHistory ? formatChatHistoryForProcessing(input.chatHistory) : ""
            });
            
            // Get reasonableness assessment
            const reasonablenessChain = createQuestionReasonablenessChain(llm);
            const assessment = await reasonablenessChain.invoke({ 
              question: input.question,
              processedQuestion: processedQuestion 
            });
            
            // Check if reasonable and product-related
            if (assessment.isReasonable) {
              const reason = assessment.reason.toLowerCase();
              if (isProductRelated(reason)) {
                // Add to unanswered questions database
                const questionId = await addUnansweredQuestion(
                  input.question,
                  processedQuestion
                );
                
                if (questionId) {
                  await updateQuestionAssessment(questionId, assessment);
                }
                
                console.log("Added to unanswered questions database:", input.question);
                
                // Enhance the response with a note that the question has been logged
                return response + "\n\nYour question has been logged for our team to review and improve our knowledge base.";
              }
            }
          } catch (error) {
            console.error("Error tracking unanswered question in wrapped chain:", error);
          }
        }
        
        return response;
      }
    },
    (input) => input.response
  ]) as ChatChain;
}; 