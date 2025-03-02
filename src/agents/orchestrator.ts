import { createQuestionSimplifier } from './questionSimplifier';
import { createKnowledgeBase } from './knowledgeBaseAgent';
import { createProductRelevanceChecker } from './productRelevanceAgent';
import { createResponseGenerator } from './responseGeneratorAgent';
import { createEmailCollector } from './emailCollectionAgent';
import { Message, createAssistantMessage } from '@/utils/chatMessageUtils';

/**
 * Interface for the orchestrator's state
 */
interface OrchestratorState {
  initialized: boolean;
  simplifyQuestion: ReturnType<typeof createQuestionSimplifier>;
  knowledgeBase: ReturnType<typeof createKnowledgeBase>;
  checkProductRelevance: ReturnType<typeof createProductRelevanceChecker>;
  generateResponse: ReturnType<typeof createResponseGenerator>;
  emailCollector: ReturnType<typeof createEmailCollector>;
}

/**
 * Interface for the process message result
 */
interface ProcessMessageResult {
  response: Message;
  waitingForEmail: boolean;
  lastQuestionId: number | null;
}

/**
 * Creates an orchestrator that coordinates all the agents and manages the conversation flow
 * @returns An object with initialize and processMessage functions
 */
export const createOrchestrator = () => {
  // Initialize the state
  const state: OrchestratorState = {
    initialized: false,
    simplifyQuestion: null as unknown as ReturnType<typeof createQuestionSimplifier>,
    knowledgeBase: createKnowledgeBase(),
    checkProductRelevance: null as unknown as ReturnType<typeof createProductRelevanceChecker>,
    generateResponse: null as unknown as ReturnType<typeof createResponseGenerator>,
    emailCollector: createEmailCollector(),
  };

  /**
   * Initialize the orchestrator with the necessary credentials
   */
  const initialize = async (
    openAIApiKey: string,
    supabaseUrl: string,
    supabaseKey: string,
    modelName: string = 'gpt-4-turbo',
    embeddingsModel: string = 'text-embedding-3-small'
  ): Promise<boolean> => {
    try {
      // Initialize all agents
      state.simplifyQuestion = createQuestionSimplifier(openAIApiKey, modelName);
      
      const knowledgeBaseInitialized = await state.knowledgeBase.initialize(
        supabaseUrl,
        supabaseKey,
        openAIApiKey,
        embeddingsModel
      );
      
      state.checkProductRelevance = createProductRelevanceChecker(openAIApiKey, modelName);
      state.generateResponse = createResponseGenerator(openAIApiKey, modelName);
      
      state.initialized = knowledgeBaseInitialized;
      return state.initialized;
    } catch (error) {
      console.error('Error initializing orchestrator:', error);
      return false;
    }
  };

  /**
   * Process a user message and generate a response
   */
  const processMessage = async (
    userMessage: string,
    history: Message[] = [],
    waitingForEmail: boolean = false,
    lastQuestionId: number | null = null
  ): Promise<ProcessMessageResult> => {
    if (!state.initialized) {
      return {
        response: createAssistantMessage(
          "I'm sorry, the chat system is not properly initialized. Please try again later."
        ),
        waitingForEmail: false,
        lastQuestionId: null,
      };
    }

    // If waiting for email, process the email
    if (waitingForEmail) {
      return processEmailInput(userMessage, lastQuestionId);
    }

    // Normal question flow
    try {
      // Step 1: Simplify the question
      const simplifiedQuestion = await state.simplifyQuestion(userMessage);
      
      // Step 2: Search the knowledge base
      const knowledgeBaseResult = await state.knowledgeBase.search(simplifiedQuestion);
      
      // If knowledge base has an answer, generate a response
      if (knowledgeBaseResult) {
        const historyText = formatHistoryForLLM(history);
        const responseText = await state.generateResponse(
          userMessage,
          knowledgeBaseResult,
          historyText
        );
        
        return {
          response: createAssistantMessage(responseText),
          waitingForEmail: false,
          lastQuestionId: null,
        };
      }
      
      // Step 3: If no answer, check if product-related
      const isProductRelated = await state.checkProductRelevance(simplifiedQuestion);
      
      // Step 4: If product-related, collect email
      if (isProductRelated) {
        // Add to unanswered questions
        const questionId = await state.emailCollector.addUnansweredQuestion(
          simplifiedQuestion,
          userMessage
        );
        
        if (questionId) {
          const emailRequestMessage = state.emailCollector.generateEmailRequestMessage(
            "I don't have specific information about that yet. Our team is constantly updating our knowledge base."
          );
          
          return {
            response: createAssistantMessage(emailRequestMessage),
            waitingForEmail: true,
            lastQuestionId: questionId,
          };
        }
      }
      
      // Step 5: Generate a fallback response if not product-related or error adding question
      const historyText = formatHistoryForLLM(history);
      const fallbackResponse = await state.generateResponse(
        userMessage,
        null,
        historyText
      );
      
      return {
        response: createAssistantMessage(fallbackResponse),
        waitingForEmail: false,
        lastQuestionId: null,
      };
    } catch (error) {
      console.error('Error processing message:', error);
      return {
        response: createAssistantMessage(
          "I'm sorry, I encountered an error while processing your request. Please try again later."
        ),
        waitingForEmail: false,
        lastQuestionId: null,
      };
    }
  };

  /**
   * Process an email input from the user
   */
  const processEmailInput = async (
    userInput: string,
    lastQuestionId: number | null
  ): Promise<ProcessMessageResult> => {
    // Check if user is declining to provide an email
    if (state.emailCollector.isDeclineEmail(userInput)) {
      return {
        response: createAssistantMessage(
          state.emailCollector.generateEmailDeclinedMessage()
        ),
        waitingForEmail: false,
        lastQuestionId: null,
      };
    }
    
    // Try to extract an email from the message
    const extractedEmail = state.emailCollector.extractEmailFromMessage(userInput);
    
    // If we found a valid email in the message
    if (extractedEmail) {
      console.log(`Extracted email from message: ${extractedEmail}`);
      
      // Update question with the extracted email
      if (lastQuestionId) {
        const updated = await state.emailCollector.updateQuestionWithEmail(
          lastQuestionId,
          extractedEmail
        );
        
        if (updated) {
          return {
            response: createAssistantMessage(
              state.emailCollector.generateEmailConfirmationMessage(extractedEmail)
            ),
            waitingForEmail: false,
            lastQuestionId: null,
          };
        }
      }
    }
    
    // Check if user is asking a new question instead of providing an email
    if (userInput.length > 15 && (userInput.includes('?') || !extractedEmail)) {
      // Treat this as a new question and process it normally
      console.log('User appears to be asking a new question or continuing the conversation');
      
      // Process the new question
      const simplifiedQuestion = await state.simplifyQuestion(userInput);
      const knowledgeBaseResult = await state.knowledgeBase.search(simplifiedQuestion);
      
      if (knowledgeBaseResult) {
        const responseText = await state.generateResponse(
          userInput,
          knowledgeBaseResult,
          '' // No history for this case
        );
        
        return {
          response: createAssistantMessage(responseText),
          waitingForEmail: false,
          lastQuestionId: null,
        };
      } else {
        // If no answer in knowledge base, continue with normal flow
        // but reset the email waiting state
        const fallbackResponse = await state.generateResponse(
          userInput,
          null,
          '' // No history for this case
        );
        
        return {
          response: createAssistantMessage(fallbackResponse),
          waitingForEmail: false,
          lastQuestionId: null,
        };
      }
    }
    
    // If no email was extracted and it's not a new question, check if the entire input is a valid email
    if (!extractedEmail && state.emailCollector.isValidEmail(userInput)) {
      // Update question with email
      if (lastQuestionId) {
        const updated = await state.emailCollector.updateQuestionWithEmail(
          lastQuestionId,
          userInput
        );
        
        if (updated) {
          return {
            response: createAssistantMessage(
              state.emailCollector.generateEmailConfirmationMessage(userInput)
            ),
            waitingForEmail: false,
            lastQuestionId: null,
          };
        }
      }
    }
    
    // If we get here, no valid email was found
    return {
      response: createAssistantMessage(
        state.emailCollector.generateInvalidEmailMessage()
      ),
      waitingForEmail: true,
      lastQuestionId,
    };
  };

  /**
   * Format the conversation history for the LLM
   */
  const formatHistoryForLLM = (history: Message[]): string => {
    if (history.length === 0) return '';
    
    return history
      .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');
  };

  return {
    initialize,
    processMessage,
  };
}; 