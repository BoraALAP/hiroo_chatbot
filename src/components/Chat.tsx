"use client";

import { useState, useEffect, FormEvent, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { ChatOpenAI } from '@langchain/openai';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import { ChatChain, createChatChain } from '@/utils/chatChainBuilder';
import { HumanMessage, AIMessage } from '@langchain/core/messages';

// Define a message type
type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

interface ChatProps {
  initialGreeting?: string;
}

export default function Chat({
  initialGreeting = "How can I help you today?"
}: ChatProps = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatChain, setChatChain] = useState<ChatChain | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize Supabase and LangChain components
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Check for OpenAI API key
        const openAIApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
        if (!openAIApiKey) {
          setError("Missing OpenAI API key. Please set the NEXT_PUBLIC_OPENAI_API_KEY environment variable.");
          console.error("Missing OpenAI API key");
          return;
        }

        // Initialize Supabase client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        
        if (!supabaseUrl || !supabaseKey) {
          setError("Missing Supabase credentials. Please set the NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.");
          console.error('Missing Supabase environment variables');
          return;
        }
        
        const supabaseClient = createClient(supabaseUrl, supabaseKey);
        
        // Initialize OpenAI embeddings
        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: openAIApiKey,
          modelName: process.env.NEXT_PUBLIC_EMBEDDINGS_MODEL || 'text-embedding-3-small',
        });
        
        // Initialize Supabase vector store
        const vectorStore = new SupabaseVectorStore(embeddings, {
          client: supabaseClient,
          tableName: 'documents',
          queryName: 'match_documents',
        });
        
        // Initialize chat model
        const llm = new ChatOpenAI({
          openAIApiKey: openAIApiKey,
          modelName: process.env.NEXT_PUBLIC_AI_MODEL || 'gpt-4-turbo',
          temperature: 0.2,
        });
        
        // Create the chat chain using our utility function
        const chain = createChatChain(llm, vectorStore);
        
        setChatChain(chain);
      } catch (err) {
        console.error('Error initializing services:', err);
        setError("Failed to initialize chat services. Please check your configuration.");
      }
    };
    
    initializeServices();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!input.trim() || !chatChain) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };
    
    // Update messages state with the new user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    
    try {
      // Convert messages to LangChain format for chat history
      // Only include previous messages, not the current user message
      const previousMessages = messages.map(message => {
        if (message.role === 'user') {
          return new HumanMessage(message.content);
        } else {
          return new AIMessage(message.content);
        }
      });
      
      console.log("Sending chat history with", previousMessages.length, "messages");
      
      // Get response from LangChain with chat history
      const response = await chatChain.invoke({ 
        question: userMessage.content,
        chatHistory: previousMessages
      });
      
      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
      };
      
      setMessages([...updatedMessages, assistantMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error while processing your request. Please try again later.",
      };
      
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg overflow-hidden">
      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-100 text-red-800 text-sm">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* Chat messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-800 mt-4">
            <p>{initialGreeting}</p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        {isLoading && (
          <div className="flex justify-center">
            <div className="animate-pulse text-gray-800">Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat input */}
      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        
      />
    </div>
  );
} 