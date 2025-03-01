'use client';

import { useState, useEffect } from 'react';
import Chat from './Chat';

interface ChatWidgetProps {
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  greeting?: string;
  title?: string;
  subtitle?: string;
}

export default function ChatWidget({
  position = 'bottom-right',
  primaryColor = '#0070f3',
  greeting = 'How can I help you today?',
  title = 'Product Support',
  subtitle = 'Ask me anything about our product'
}: ChatWidgetProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Set loaded state after component mounts
    setIsLoaded(true);
  }, []);

  // Apply position styles
  const positionStyles = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  };

  if (!isLoaded) return null;

  return (
    <div className={`fixed ${positionStyles[position]} z-[9999]`}>
      <style jsx global>{`
        :root {
          --primary-color: ${primaryColor};
        }
      `}</style>
      <Chat 
        initialGreeting={greeting}
        chatTitle={title}
        chatSubtitle={subtitle}
      />
    </div>
  );
} 