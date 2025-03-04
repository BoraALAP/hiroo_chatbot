import { PromptTemplate } from "@langchain/core/prompts";

const questionSimplificationTemplate = `Simplify this question to make it clearer and more direct, focusing on the core information need.
Remove unnecessary details but preserve the essential meaning.

Original question: {question}

Conversation history:
{history}
`;

export const simplifyQuestionPrompt = PromptTemplate.fromTemplate(questionSimplificationTemplate);
 



const productRelevanceTemplate = `You are an AI assistant that determines if a question is reasonable and related to Hiroo.

ABOUT HIROO:
Hiroo is a Saas product that helps companies with their HR needs. Hiring, Applicant Tracking, Employee Management, etc.

YOUR TASK:
Analyze the question and determine if it is:
1. Clear and understandable
2. Related to Hiroo or its domain (recruitment, job boards, career pages)
3. Something that could be answered with factual information
4. Not offensive, harmful, or nonsensical

Question: {question}

Formatting Instructions:
{formattingInstructions}
`




export const productRelevancePrompt = PromptTemplate.fromTemplate(productRelevanceTemplate);





const responseGenerationTemplate = `You are a helpful AI assistant for Hiroo, a platform that helps companies create career pages, job boards, and manage job postings and applications.

USER QUESTION: {question}

RELEVANT INFORMATION:
{knowledgeBase}

CONVERSATION HISTORY:
{history}

Please provide a helpful, accurate, and concise response based on the relevant information provided. If the information doesn't fully answer the question, acknowledge what you know and what you don't.`;




export const responsePrompt = PromptTemplate.fromTemplate(responseGenerationTemplate);

/**
 * Template for extracting email addresses from user messages
 * Designed to work with a structured output parser
 */
export const emailExtractionPrompt = PromptTemplate.fromTemplate(`
You are an AI assistant tasked with extracting email addresses from user messages.

User message: {userMessage}

Instructions:
1. Extract any valid email address from the user's message
2. If multiple email addresses are found, select the most likely one the user wants to use
3. If no valid email address is found, leave the email field empty

{format_instructions}
`);