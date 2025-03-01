import { ChatOpenAI } from '@langchain/openai';
import dotenv from 'dotenv';
import { createQuestionReasonablenessChain } from '../src/utils/unansweredQuestions';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Sample questions to test
const testQuestions = [
  {
    original: "What are your pricing plans?",
    processed: "What are the pricing plans for Hiroo?"
  },
  {
    original: "How do I reset my password?",
    processed: "How can I reset my password on the Hiroo platform?"
  },
  {
    original: "Can you tell me John Smith's account balance?",
    processed: null
  },
  {
    original: "Why is the sky blue?",
    processed: null
  },
  {
    original: "How do I integrate your API with my application?",
    processed: "How do I integrate the Hiroo API with my application?"
  },
  {
    original: "F*** this product, it's terrible!",
    processed: null
  },
  {
    original: "My name is Jane and I live at 123 Main St. Can you help me?",
    processed: "How can I get help with the Hiroo platform?"
  },
  {
    original: "What security measures do you have in place to protect user data?",
    processed: "What security measures does Hiroo have to protect user data?"
  },
  {
    original: "The system is not working for me right now. Can you fix it?",
    processed: "How can I troubleshoot issues with the Hiroo platform?"
  },
  {
    original: "What's the meaning of life?",
    processed: null
  }
];

async function runTests() {
  // Check for OpenAI API key
  const openAIApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!openAIApiKey) {
    console.error("Missing OpenAI API key. Please set the NEXT_PUBLIC_OPENAI_API_KEY environment variable.");
    process.exit(1);
  }

  // Initialize chat model
  const llm = new ChatOpenAI({
    openAIApiKey: openAIApiKey,
    modelName: process.env.NEXT_PUBLIC_AI_MODEL || 'gpt-3.5-turbo',
    temperature: 0.2,
  });

  // Create the reasonableness assessment chain
  const reasonablenessChain = createQuestionReasonablenessChain(llm);

  console.log("Testing question reasonableness assessment...\n");

  // Test each question
  for (const [index, questionPair] of testQuestions.entries()) {
    console.log(`\n----- Test Question ${index + 1} -----`);
    console.log(`Original Question: "${questionPair.original}"`);
    if (questionPair.processed) {
      console.log(`Processed Question: "${questionPair.processed}"`);
    } else {
      console.log(`Processed Question: None`);
    }
    
    try {
      const assessment = await reasonablenessChain.invoke({ 
        question: questionPair.original,
        processedQuestion: questionPair.processed || undefined
      });
      console.log(`Reasonable: ${assessment.isReasonable ? 'YES' : 'NO'}`);
      console.log(`Reason: ${assessment.reason}`);
    } catch (error) {
      console.error(`Error assessing question: ${error}`);
    }
    
    console.log("-".repeat(40));
  }
}

// Run the tests
runTests().catch(console.error); 