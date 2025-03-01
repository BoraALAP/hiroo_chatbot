'use client';

import { useEffect, useState } from 'react';
import Chat from '@/components/Chat';

export default function ChatEmbedPage() {
  const [config, setConfig] = useState({
    position: 'bottom-right',
    primaryColor: '#0070f3',
    greeting: 'How can I help you today?',
    title: 'Product Support',
    subtitle: 'Ask me anything about our product'
  });

  useEffect(() => {
    // Listen for messages from the parent window
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'CHATBOT_CONFIG') {
        setConfig(event.data.config);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

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