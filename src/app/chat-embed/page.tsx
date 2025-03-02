"use client";

import { useEffect, useState } from 'react';
import Chat from '@/components/Chat';

export default function ChatEmbed() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    // Listen for messages from parent window
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security (in production, you should check against allowed origins)
      // if (event.origin !== 'https://your-allowed-domain.com') return;
      
      const { type, config: messageConfig } = event.data;
      
      if ((type === 'CHAT_OPENED' || type === 'CHATBOT_CONFIG') && messageConfig && messageConfig.greeting) {
        setGreeting(messageConfig.greeting);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Notify parent that we're ready
    if (window.parent) {
      window.parent.postMessage({ type: 'CHAT_EMBED_READY' }, '*');
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div className="h-screen flex flex-col">
      <Chat initialGreeting={greeting} />
    </div>
  );
} 