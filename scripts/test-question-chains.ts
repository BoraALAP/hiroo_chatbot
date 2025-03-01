import { ChatOpenAI } from '@langchain/openai';
import dotenv from 'dotenv';
import { 
  createStandaloneQuestionChain, 
  testQuestionProcessing
} from '../src/utils/questionChains';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Sample questions to test
const testQuestions = [
  "Hi there, I was wondering if you could tell me about your pricing plans? I'm looking for something affordable for my small business.",
  "Can you explain how your product handles data security and privacy? I'm concerned about keeping my customer information safe.",
  "I've been using your software for a while now and I'm having trouble with the export feature. It keeps crashing when I try to export large files. Is there a fix for this?",
  "What's the difference between the basic and premium plans?",
  "How do I reset my password if I forgot it?"
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

  console.log("Testing question processing chains...\n");

  // Test each question
  for (const [index, question] of testQuestions.entries()) {
    console.log(`\n----- Test Question ${index + 1} -----`);
    await testQuestionProcessing(question, llm, []);
    console.log("-".repeat(40));
  }

  // Test individual chains
  console.log("\n\nTesting standalone chain with a specific question:");
  const standaloneChain = createStandaloneQuestionChain(llm);
  const complexQuestion = "I've been a customer for years and I love your product, but I'm having an issue with billing. Can you tell me how to update my credit card information on my account?";
  
  const result = await standaloneChain.invoke({ question: complexQuestion, history: [] });
  console.log("Original:", complexQuestion);
  console.log("Processed:", result);
}

// Run the tests
runTests().catch(console.error); 