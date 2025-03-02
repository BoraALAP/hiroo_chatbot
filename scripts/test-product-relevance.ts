import dotenv from 'dotenv';
import { createProductRelevanceChecker } from '../src/agents/productRelevanceAgent';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Check for required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_OPENAI_API_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing environment variable: ${envVar}`);
    process.exit(1);
  }
}

async function testProductRelevance() {
  console.log('Testing product relevance checker...\n');
  
  // Initialize product relevance checker
  const checkProductRelevance = createProductRelevanceChecker(
    process.env.NEXT_PUBLIC_OPENAI_API_KEY!
  );
  
  // Test questions
  const questions = [
    "How can I customize my career page design?",
    "Where can I see my logo when I upload it to career page?",
    "How do I change the colors on my career page?",
    "What settings are available for career page customization?",
    "How to edit my company profile on the career page?",
    "What is the weather like today?",
    "Who won the last Super Bowl?",
    "What is the capital of France?",
    "How do I make pancakes?",
    "When was the Declaration of Independence signed?"
  ];
  
  for (const question of questions) {
    console.log(`Testing question: "${question}"`);
    
    const isProductRelated = await checkProductRelevance(question);
    
    console.log(`Is product related: ${isProductRelated ? 'YES' : 'NO'}\n`);
  }
}

// Run the test
testProductRelevance().catch(console.error); 