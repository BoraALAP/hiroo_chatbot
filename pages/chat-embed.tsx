import { useEffect, useState } from 'react';
import { useChat } from 'ai/react';
import styles from '../styles/ChatEmbed.module.css';

export default function ChatEmbed() {
  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState({
    primaryColor: '#000000',
    greeting: 'Hello! How can I help you today?'
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
      
      if (event.data.type === 'CHAT_OPENED' && event.data.config) {
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

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messagesContainer}>
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`${styles.message} ${
              message.role === 'assistant' ? styles.assistantMessage : styles.userMessage
            }`}
          >
            <div className={styles.messageContent}>
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className={`${styles.message} ${styles.assistantMessage}`}>
            <div className={styles.typingIndicator}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <input
          className={styles.input}
          value={input}
          placeholder="Type your message..."
          onChange={handleInputChange}
        />
        <button 
          type="submit" 
          className={styles.sendButton}
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