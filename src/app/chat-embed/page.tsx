'use client';

import { useEffect, useState } from 'react';
import { useChat } from 'ai/react';
import Chat from '@/components/Chat';

export default function ChatEmbedPage() {
  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState({
    position: 'bottom-right',
    primaryColor: '#0070f3',
    greeting: 'Hello! How can I help you today?',
    title: 'Chat Support'
  });

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    initialMessages: [
      {
        id: 'greeting',
        role: 'assistant',
        content: config.greeting,
      },
    ],
  });

  // Listen for messages from parent window
  useEffect(() => {
    setMounted(true);
    
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      const allowedOrigins = process.env.NEXT_PUBLIC_ALLOWED_ORIGINS?.split(',') || [];
      if (!allowedOrigins.includes(event.origin) && event.origin !== window.location.origin) {
        console.warn(`Rejected message from unauthorized origin: ${event.origin}`);
        return;
      }
      
      // Support both message types for backward compatibility
      if ((event.data.type === 'CHAT_OPENED' || event.data.type === 'CHATBOT_CONFIG') && event.data.config) {
        setConfig(event.data.config);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Notify parent about height changes
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === document.body) {
          window.parent.postMessage({
            type: 'RESIZE_IFRAME',
            height: document.body.scrollHeight
          }, '*');
        }
      }
    });
    
    resizeObserver.observe(document.body);
    
    return () => {
      window.removeEventListener('message', handleMessage);
      resizeObserver.disconnect();
    };
  }, []);

  if (!mounted) return null;

  // Use the existing Chat component if it has the necessary functionality
  // Otherwise, use our custom implementation
  if (typeof Chat === 'function') {
    return (
      <div className="h-screen w-full flex flex-col">
        <style jsx global>{`
          :root {
            --primary-color: ${config.primaryColor};
          }
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          }
        `}</style>
        <Chat />
      </div>
    );
  }

  // Fallback to our custom implementation
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`max-w-[80%] p-3 rounded-2xl animate-fadeIn break-words ${
              message.role === 'assistant' 
                ? 'self-start bg-gray-100 text-black rounded-bl-sm' 
                : 'self-end bg-gray-200 text-black rounded-br-sm'
            }`}
          >
            <div className="leading-relaxed">
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="self-start max-w-[80%] p-3 rounded-2xl bg-gray-100 text-black rounded-bl-sm">
            <div className="flex items-center gap-1 p-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.32s]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.16s]"></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="flex p-3 border-t border-gray-200 bg-white">
        <input
          className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm outline-none focus:border-gray-400 transition-colors"
          value={input}
          placeholder="Type your message..."
          onChange={handleInputChange}
        />
        <button 
          type="submit" 
          className="w-10 h-10 ml-2 rounded-full flex items-center justify-center cursor-pointer transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: config.primaryColor }}
          disabled={isLoading || !input.trim()}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="white"/>
          </svg>
        </button>
      </form>
    </div>
  );
} 