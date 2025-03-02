import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MessageType {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatMessageProps {
  message: MessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isLoading = message.content === '...';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-[#00015E] text-white'
            : 'bg-gray-800 text-gray-200 border border-gray-700'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2 h-6">
            <div className="animate-pulse flex space-x-1">
              <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
              <div className="h-2 w-2 bg-blue-400 rounded-full animation-delay-200"></div>
              <div className="h-2 w-2 bg-blue-400 rounded-full animation-delay-400"></div>
            </div>
          </div>
        ) : (
          <div className="whitespace-pre-wrap">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
} 