"use client";

import { useState, useEffect, FormEvent, useRef } from 'react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';

import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser, StructuredOutputParser } from "@langchain/core/output_parsers";
import { 
  simplifyQuestionPrompt,
  productRelevancePrompt,
  responsePrompt,
  emailExtractionPrompt
} from '@/agents/templates';

import retriever from '@/utils/retriever';
import { RunnableSequence } from '@langchain/core/runnables';

import { combineDocs, createUserMessage, createAssistantMessage, Message, formatHistoryForLLM } from '@/utils/supportFunctions';
import { addUnansweredQuestion, updateQuestionWithEmail } from '@/utils/unansweredQuestions';

interface ChatProps {
  initialGreeting?: string;
}

export default function Chat({
  initialGreeting = "How can I help you today? I'm here to assist you with any questions you have."
}: ChatProps = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [waitingForEmail, setWaitingForEmail] = useState(false);
  const [lastQuestionId, setLastQuestionId] = useState<number | null>(null);
  const [model, setModel] = useState<ChatOpenAI | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [emailAttempts, setEmailAttempts] = useState(0);

  // Add initial greeting message when component mounts
  useEffect(() => {
    if (initialGreeting && messages.length === 0) {
      setMessages([
        {
          id: 'greeting',
          role: 'assistant',
          content: initialGreeting
        }
      ]);
    }
  }, [initialGreeting, messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize LangChain components
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check for environment variables
        const openAIApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const modelName = process.env.NEXT_PUBLIC_AI_MODEL || 'gpt-4-turbo';
        
        if (!openAIApiKey || !supabaseUrl || !supabaseKey) {
          setError("Missing environment variables. Please check your configuration.");
          return;
        }
        
        // Initialize the model
        const chatModel = new ChatOpenAI({
          openAIApiKey,
          modelName,
          temperature: 0.1,
        });
        setModel(chatModel);
        
        setInitialized(true);
        console.log('Chat components initialized successfully');
      } catch (err) {
        console.error('Error initializing chat components:', err);
        setError("Failed to initialize chat services. Please check your configuration.");
      }
    };
    
    initialize();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setError(null); // Clear any previous errors

    // Add user message to chat
    const userMessageObj = createUserMessage(userMessage);
    setMessages((prevMessages) => [...prevMessages, userMessageObj]);
    setIsLoading(true);

    try {
      if (!initialized || !model) {
        throw new Error("Chat services not initialized. Please refresh the page and try again.");
      }

      // If waiting for email, process the email input
      if (waitingForEmail && lastQuestionId !== null) {
        console.log("Processing email input for question ID:", lastQuestionId);
        await processEmailInput(userMessage);
        setIsLoading(false);
        return;
      }
      
      // Create parser for product relevance
      const outputParser = StructuredOutputParser.fromNamesAndDescriptions({
        reasonable: "Whether the question is reasonable and related to Hiroo (true/false)",
        reason: "The reason for the determination"
      });
      
      // Step 1: Simplify the question
      const simplifyQuestionChain = RunnableSequence.from([
        simplifyQuestionPrompt,
        model,
        new StringOutputParser()
      ]);
      
      // Step 2: Check product relevance
      const productRelevanceChain = RunnableSequence.from([
        productRelevancePrompt,
        model,
        outputParser
      ]);
      
      // Step 3: Generate response
      const responseChain = RunnableSequence.from([
        responsePrompt, 
        model, 
        new StringOutputParser()
      ]);

      // Step 1: Simplify the question
      const simpleQuestion = await simplifyQuestionChain.invoke({
        question: userMessage,
        history: formatHistoryForLLM(messages),
        formattingInstructions: ""
      });
      console.log("Simplified question:", simpleQuestion);
      
      // Step 2: Retrieve documents
      const result = await retriever(simpleQuestion);
      console.log("Retrieved documents:", result);
      
      if (result.length === 0) {
        // No relevant documents found, check if question is reasonable
        console.log("No relevant documents found, checking if question is reasonable");
        
        const relevanceResponse = await productRelevanceChain.invoke({
          question: simpleQuestion,
          formattingInstructions: outputParser.getFormatInstructions()
        });
        
        console.log("Product relevance check:", relevanceResponse);

        // Check if the question is reasonable - handle both "true" and "yes" formats
        const isReasonable = 
          relevanceResponse.reasonable.toLowerCase() === "true" || 
          relevanceResponse.reasonable.toLowerCase() === "yes";
        
        if (isReasonable) {
          // Question is reasonable but we don't have an answer
          console.log("Question is reasonable, adding to unanswered questions");
          
          // Add to unanswered questions database
          const questionId = await addUnansweredQuestion(userMessage, simpleQuestion);
          console.log("Added unanswered question with ID:", questionId);
          
          if (!questionId) {
            console.error("Failed to add unanswered question");
            
            const assistantMessage = createAssistantMessage(
              "I'm sorry, but I don't have that information right now. There was an error recording your question. Please try again later."
            );
            
            setMessages((prevMessages) => [...prevMessages, assistantMessage]);
          } else {
            // Ask for email address
            const assistantMessage = createAssistantMessage(
              "I don't have that information right now, but I'd be happy to look into it for you. If you'd like, you can provide your email address and I'll send you an answer once I have it. Or you can simply continue the conversation without providing an email."
            );
            
            setMessages((prevMessages) => [...prevMessages, assistantMessage]);
            
            // Set state to wait for email
            setWaitingForEmail(true);
            setLastQuestionId(questionId);
            setEmailAttempts(0);
            console.log("Waiting for email, question ID:", questionId);
          }
        } else { 
          // Question is not reasonable or not related to Hiroo
          console.log("Question is not reasonable or not related to Hiroo");
          console.log("Reason:", relevanceResponse.reason);
          
          const assistantMessage = createAssistantMessage(
            "I'm sorry, but I don't have information about that topic. Is there something else I can help you with related to Hiroo's products or services?"
          );
          
          setMessages((prevMessages) => [...prevMessages, assistantMessage]);
        }
      } else {
        // We have relevant documents, generate a response
        console.log("Relevant documents found, generating response");
        
        // Combine the documents
        const knowledgeBaseResults = combineDocs(result.map(([doc]) => doc));
        
        // Generate response
        const responseText = await responseChain.invoke({
          question: simpleQuestion,
          knowledgeBase: knowledgeBaseResults,
          history: formatHistoryForLLM(messages)
        });
        
        // Add assistant response to chat
        const assistantMessage = createAssistantMessage(responseText);
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      setError((error as Error).message || 'An unexpected error occurred');
      
      // Add error message to chat
      const errorMessage = createAssistantMessage(
        "I'm sorry, I encountered an error while processing your request. Please try again."
      );
      
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Process email input
  const processEmailInput = async (userInput: string) => {
    console.log("Processing email input:", userInput);
    console.log("Question ID:", lastQuestionId);
    console.log("Email attempt #:", emailAttempts + 1);
    
    // Increment email attempts
    setEmailAttempts(prev => prev + 1);
    
    try {
      // Create a structured output parser for email extraction
      const emailParser = StructuredOutputParser.fromNamesAndDescriptions({
        email: "The extracted email address from the user message, or empty string if none found",
        confidence: "High, Medium, or Low confidence in the extracted email"
      });
      
      // Use LLM to extract email from the message
      const emailExtractor = RunnableSequence.from([
        {
          userMessage: (input: string) => input,
          format_instructions: () => emailParser.getFormatInstructions()
        },
        emailExtractionPrompt,
        model!,
        emailParser
      ]);
      
      const extractionResult = await emailExtractor.invoke(userInput);
      console.log("Email extraction result:", extractionResult);
      
      // Check if we have a valid email with at least medium confidence
      if (extractionResult.email && extractionResult.email.includes('@') && lastQuestionId) {
        const extractedEmail = extractionResult.email.trim();
        console.log("Extracted email:", extractedEmail, "with confidence:", extractionResult.confidence);
        
        // Update the question with the email
        const updated = await updateQuestionWithEmail(lastQuestionId, extractedEmail);
        console.log("Email update result:", updated);
        
        if (updated) {
          const assistantMessage = createAssistantMessage(
            `Thank you for providing your email (${extractedEmail}). We'll update our records and send you an answer. Is there anything else I can help you with?`
          );
          
          setMessages((prevMessages) => [...prevMessages, assistantMessage]);
          
          // Reset email collection state after successful update
          setWaitingForEmail(false);
          setLastQuestionId(null);
          setEmailAttempts(0);
        } else {
          console.error("Failed to update question with email");
          
          // If we've tried too many times, give up
          if (emailAttempts >= 2) {
            const assistantMessage = createAssistantMessage(
              "I'm having trouble saving your email. Let's continue our conversation without it. Is there anything else I can help you with?"
            );
            
            setMessages((prevMessages) => [...prevMessages, assistantMessage]);
            
            // Reset email collection state after too many attempts
            setWaitingForEmail(false);
            setLastQuestionId(null);
            setEmailAttempts(0);
          } else {
            const assistantMessage = createAssistantMessage(
              "I'm sorry, there was an error saving your email. Could you try again with just your email address?"
            );
            
            setMessages((prevMessages) => [...prevMessages, assistantMessage]);
            // Keep waiting for email
          }
        }
      } else {
        // No email found in the message
        console.log("No valid email found in the message");
        
        // Check for skip command
        if (userInput.toLowerCase().includes('skip')) {
          const assistantMessage = createAssistantMessage(
            "No problem. Let's continue our conversation. Is there anything else I can help you with?"
          );
          
          setMessages((prevMessages) => [...prevMessages, assistantMessage]);
          
          // Reset email collection state
          setWaitingForEmail(false);
          setLastQuestionId(null);
          setEmailAttempts(0);
        } else if (waitingForEmail) {
          // If we've tried too many times, give up
          if (emailAttempts >= 2) {
            const assistantMessage = createAssistantMessage(
              "Let's continue our conversation without an email. Is there anything else I can help you with?"
            );
            
            setMessages((prevMessages) => [...prevMessages, assistantMessage]);
            
            // Reset email collection state after too many attempts
            setWaitingForEmail(false);
            setLastQuestionId(null);
            setEmailAttempts(0);
          } else {
            const assistantMessage = createAssistantMessage(
              "I couldn't find a valid email address in your message. Please provide just your email address (e.g., example@domain.com) or type 'skip' to continue without providing an email."
            );
            
            setMessages((prevMessages) => [...prevMessages, assistantMessage]);
            // Keep waiting for email
          }
        } else {
          // User chose not to provide an email or something went wrong
          const assistantMessage = createAssistantMessage(
            "No problem. Let's continue our conversation. Is there anything else I can help you with?"
          );
          
          setMessages((prevMessages) => [...prevMessages, assistantMessage]);
          
          // Reset email collection state
          setWaitingForEmail(false);
          setLastQuestionId(null);
          setEmailAttempts(0);
        }
      }
    } catch (error) {
      console.error("Error processing email:", error);
      
      // If we've tried too many times, give up
      if (emailAttempts >= 2) {
        const assistantMessage = createAssistantMessage(
          "I'm having trouble processing your input. Let's continue our conversation without an email. Is there anything else I can help you with?"
        );
        
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
        
        // Reset email collection state after too many attempts
        setWaitingForEmail(false);
        setLastQuestionId(null);
        setEmailAttempts(0);
      } else {
        const assistantMessage = createAssistantMessage(
          "I'm sorry, there was an error processing your input. Could you try again with just your email address?"
        );
        
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
        // Keep waiting for email
      }
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white pb-20">
      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 text-sm border border-red-200">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-bold">Something went wrong</p>
              <p className="mt-1">{error}</p>
              <p className="mt-2 text-xs">Please try again or refresh the page if the problem persists.</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Chat messages */}
      <div className="flex-1 p-4 h-full overflow-y-auto space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat input */}
      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        placeholder={waitingForEmail ? "Enter your email address or type 'skip'..." : "Type your message..."}
      />
    </div>
  );
} 