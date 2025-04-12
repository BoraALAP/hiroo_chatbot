import { Document } from '@langchain/core/documents';

// Define message types
export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};


export const formatHistoryForLLM = (history: Message[]): string => {
  if (history.length === 0) return "No previous conversation.";
  
  return history
    .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n\n');
};

 // Define the function to combine documents
export const combineDocs = (docs: Document[]): string => {
  return docs.map((doc) => doc.pageContent).join('\n\n');
};



/**
 * Creates a user message object
 */
export const createUserMessage = (content: string): Message => {
  return {
    id: Date.now().toString(),
    role: 'user',
    content,
  };
};

/**
 * Creates an assistant message object
 */
export const createAssistantMessage = (content: string): Message => {
  return {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content,
  };
}; 

