import React from 'react';
import ReactMarkdown from 'react-markdown';



interface ChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
  };
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isLoading = message.content === '...';
  
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-blue-200'
            : 'bg-gray-100 text-gray-800 border border-gray-200'
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
          <div className="whitespace-normal chat-message-content ">
            <ReactMarkdown
              components={{
                ul: (props) => <ul className="list-disc" {...props} />,
                ol: (props) => <ol className="list-decimal" {...props} />,
                li: (props) => <li className="marker:text-blue-500" {...props} />,
                p: (props) => <p className="mb-2 font-medium last:mb-0" {...props} />,
                a: (props) => <a className="text-blue-500 hover:underline" {...props} />,
                img: (props) => <img className="max-w-full h-auto" {...props} />,
                video: (props) => <video className="max-w-full h-auto" {...props} />,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
} 