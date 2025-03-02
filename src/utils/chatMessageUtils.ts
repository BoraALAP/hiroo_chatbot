// Define message types
export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
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