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
  chatTitle?: string;
  chatSubtitle?: string;
}

export default function Chat({
  initialGreeting = "How can I help you today?",
  chatTitle = "Product Support",
  chatSubtitle = "Ask me anything about our product"
}: ChatProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatChain, setChatChain] = useState<ChatChain | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
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
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div 
          className={`absolute bottom-16 right-0 bg-white rounded-lg shadow-xl overflow-hidden flex flex-col ${
            isExpanded 
              ? 'fixed top-4 left-4 right-4 bottom-16 w-auto h-auto' 
              : 'w-96 sm:w-120 h-120'
          }`}
        >
          {/* Chat header */}
          <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
            <div>
              <h3 className="font-medium">{chatTitle}</h3>
              <p className="text-sm opacity-75">{chatSubtitle}</p>
            </div>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white hover:bg-blue-700 p-2 rounded-full transition-colors"
              aria-label={isExpanded ? "Minimize chat" : "Expand chat"}
            >
              {isExpanded ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
          
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
            isExtended={isExpanded}
          />
        </div>
      )}
    </div>
  );
} 