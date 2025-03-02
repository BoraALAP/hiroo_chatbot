"use client";

import { useState, useEffect, FormEvent, useRef } from 'react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import { Message, createUserMessage } from '@/utils/chatMessageUtils';
import { createOrchestrator } from '@/agents/orchestrator';

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
  const [orchestrator, setOrchestrator] = useState<ReturnType<typeof createOrchestrator> | null>(null);

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
  }, [initialGreeting]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize orchestrator
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check for environment variables
        const openAIApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        const modelName = process.env.NEXT_PUBLIC_AI_MODEL || 'gpt-4-turbo';
        const embeddingsModel = process.env.NEXT_PUBLIC_EMBEDDINGS_MODEL || 'text-embedding-3-small';
        
        if (!openAIApiKey || !supabaseUrl || !supabaseKey) {
          setError("Missing environment variables. Please check your configuration.");
          return;
        }
        
        // Create and initialize orchestrator
        const newOrchestrator = createOrchestrator();
        const initialized = await newOrchestrator.initialize(
          openAIApiKey,
          supabaseUrl,
          supabaseKey,
          modelName,
          embeddingsModel
        );
        
        if (initialized) {
          setOrchestrator(newOrchestrator);
        } else {
          setError("Failed to initialize chat services. Please check your configuration.");
        }
      } catch (err) {
        console.error('Error initializing orchestrator:', err);
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
      if (!orchestrator) {
        throw new Error("Chat services not initialized. Please refresh the page and try again.");
      }
      
      // Process the message using the orchestrator
      const result = await orchestrator.processMessage(
        userMessage,
        messages,
        waitingForEmail,
        lastQuestionId
      );
      
      // Update state based on orchestrator response
      setWaitingForEmail(result.waitingForEmail);
      setLastQuestionId(result.lastQuestionId);
      
      // Add assistant response to chat
      setMessages((prevMessages) => [...prevMessages, result.response]);
    } catch (error) {
      console.error('Error processing message:', error);
      setError((error as Error).message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-[100vh] flex flex-col bg-white overflow-hidden">
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
      <div className="flex-1 p-4 overflow-y-auto space-y-4 chat-messages-container flex flex-col justify-end">
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
        placeholder={waitingForEmail ? "Enter your email address..." : "Type your message..."}
      />
    </div>
  );
} 