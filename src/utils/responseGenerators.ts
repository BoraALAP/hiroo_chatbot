import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';

/**
 * Creates a chain for generating responses when no information is found
 * @param llm The language model to use
 * @returns A chain for generating no-information responses
 */
export const createNoInfoResponseChain = (llm: ChatOpenAI) => {
  const noInfoPrompt = ChatPromptTemplate.fromTemplate(`
    You are a helpful customer support agent for Hiroo.
    
    Previous conversation history (if any):
    {history}
    
    The user asked: "{question}"
    
    We don't have specific information about this in our knowledge base, but it appears to be a reasonable question about our product.
    
    Please provide a helpful, honest response that:
    1. Acknowledges we don't have specific information about this yet
    2. Provides general guidance if possible
    3. Mentions that their question has been logged for our team to address
    4. Suggests where they might find more information (like our website or help center)
    5. NEVER fabricate specific details, prices, phone numbers, email addresses, or URLs
    6. NEVER make up specific steps, procedures, or features that aren't mentioned in the context
    7. DO NOT include any signature, name, or "[Your Name]" at the end of your response
    8. End your response in a friendly way, but without a signature line
    
    Keep your response concise, friendly and helpful.
  `);
  
  return RunnableSequence.from([
    noInfoPrompt,
    llm,
    new StringOutputParser(),
  ]);
};

/**
 * Creates a chain for generating responses based on retrieved documents
 * @param llm The language model to use
 * @returns A chain for generating responses from context
 */
export const createContextResponseChain = (llm: ChatOpenAI) => {
  const responsePrompt = ChatPromptTemplate.fromTemplate(`
    You are a helpful customer support agent for Hiroo.
    
    Previous conversation history (if any):
    {history}
    
    The user asked: "{question}"
    
    Here is information from our knowledge base that might help answer the question:
    
    {context}
    
    Please provide a helpful response based on this information that:
    1. Directly answers the user's question using ONLY the information provided
    2. Is concise, friendly, and helpful
    3. NEVER fabricates specific details, prices, phone numbers, email addresses, or URLs that aren't in the context
    4. If the context doesn't fully answer the question, acknowledge the limitations of your information
    5. Format the response in a clear, readable way
    6. DO NOT include any signature, name, or "[Your Name]" at the end of your response
    7. End your response in a friendly way, but without a signature line
    
    If the information doesn't answer the user's question at all, say: "I don't have specific information about this in our knowledge base."
  `);
  
  return RunnableSequence.from([
    responsePrompt,
    llm,
    new StringOutputParser(),
  ]);
};

/**
 * Creates the main prompt template for the chat
 * @returns A prompt template for the main chat
 */
export const createMainPromptTemplate = () => {
  return ChatPromptTemplate.fromTemplate(`
    You are a helpful customer support agent for Hiroo, a product-focused company. 
    
    Previous conversation history (if any):
    {chatHistory}
    
    Use the following context to answer the user's question.
    
    Guidelines:
    1. Only provide information that is supported by the context
    2. If the context doesn't contain the answer, acknowledge the limitations of your information
    3. Be concise, friendly, and helpful
    4. NEVER fabricate specific details, prices, phone numbers, email addresses, or URLs that aren't in the context
    5. Format your response in a clear, readable way
    6. If you're unsure about something, be honest about it
    7. DO NOT include any signature, name, or "[Your Name]" at the end of your response
    8. End your response in a friendly way, but without a signature line

    Context: {context}

    User Question: {question}
  `);
}; 