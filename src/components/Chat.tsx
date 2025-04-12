"use client";

import { useState, useEffect, FormEvent, useRef } from 'react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import { Message, createUserMessage, createAssistantMessage } from '@/utils/messageFunctions';


interface ChatProps {
  initialGreeting?: string;
}

export default function Chat({
  initialGreeting = "Hi there! I'm Hiroo's AI assistant. How can I help you with your HR needs today?"
}: ChatProps = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add initial greeting message when component mounts
  useEffect(() => {
    if (initialGreeting && messages.length === 0) {
      setMessages([
        createAssistantMessage(initialGreeting)
      ]);
    }
  }, [initialGreeting, messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    setMessages((prevMessages) => [...prevMessages, createUserMessage(userMessage)]);
    setIsLoading(true);

    try {
      // If waiting for email, handle that logic separately
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, history: messages.map((m) => m.content) }),
      });
  
      const data = await res.json();
      console.log(data, res);
      setMessages((prev) => [...prev, createAssistantMessage(data.output)]);
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
        {messages.map((message, index) => (
          <ChatMessage key={index} message={{
            id: message.id,
            role: message.role,
            content: message.content
          }} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat input */}
      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        placeholder={"Type your message..."}
      />
    </div>
  );
} 