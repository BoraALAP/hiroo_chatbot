'use client';

import { useEffect, useState } from 'react';
import ChatWidget from '@/components/ChatWidget';

export default function WidgetPage() {
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

    // Notify parent that widget is ready
    if (window.parent) {
      window.parent.postMessage({ type: 'CHATBOT_READY' }, '*');
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div className="h-screen w-full">
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
          background: transparent;
        }
      `}</style>
      <ChatWidget 
        position={config.position as 'bottom-right' | 'bottom-left'}
        primaryColor={config.primaryColor}
        greeting={config.greeting}
        title={config.title}
        subtitle={config.subtitle}
      />
    </div>
  );
} 