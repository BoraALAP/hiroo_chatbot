import React from 'react';
import ReactMarkdown from 'react-markdown';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}>
      {/* Avatar for assistant */}
      {!isUser && (
        <div className="flex-shrink-0 mr-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a1 1 0 10-2 0c0 2.34 1.235 4.395 3.084 5.546A3 3 0 018.92 16.8l.31-.17A1 1 0 0010 15.8V14a1 1 0 10-2 0v1.06l-.74.42A1 1 0 016 14.8c.001-.179.009-.356.023-.531A3.97 3.97 0 018 13c2.125 0 3.964 1.326 4.688 3.192.207.532.532.832 1.084.832.466 0 .88-.259 1.086-.709A5.973 5.973 0 0116 13c0-1.232-.37-2.375-1-3.327V13a1 1 0 11-2 0V8.698c.271-.082.52-.224.736-.406A1 1 0 0015 7.495V7a3 3 0 00-3-3h-4a3 3 0 00-3 3v.495c0 .403.241.766.608.919.216.182.465.324.736.406V13a1 1 0 11-2 0V9.673c-.63.952-1 2.095-1 3.327 0 1.247.38 2.405 1.032 3.364.208.45.62.709 1.086.709.552 0 .877-.3 1.084-.832A4.001 4.001 0 0110 13c1.007 0 1.946.298 2.731.816a1 1 0 01.477.849v.674l-.31.17a3 3 0 01-1.616.33A5.989 5.989 0 0018 10z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
      
      <div className={`max-w-[85%] rounded-lg p-3 shadow-sm ${
        isUser 
          ? 'bg-blue-600 text-white rounded-tr-none' 
          : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
      }`}>
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
      
      {/* Avatar for user */}
      {isUser && (
        <div className="flex-shrink-0 ml-2">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMessage; 