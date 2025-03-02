import dotenv from 'dotenv';
import { createKnowledgeBase } from '../src/agents/knowledgeBaseAgent';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Check for required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_OPENAI_API_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing environment variable: ${envVar}`);
    process.exit(1);
  }
}

async function testKnowledgeBase() {
  console.log('Testing knowledge base search...\n');
  
  // Initialize knowledge base
  const knowledgeBase = createKnowledgeBase();
  
  const initialized = await knowledgeBase.initialize(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    process.env.NEXT_PUBLIC_OPENAI_API_KEY!
  );
  
  if (!initialized) {
    console.error('Failed to initialize knowledge base');
    process.exit(1);
  }
  
  console.log('Knowledge base initialized successfully\n');
  
  // Test questions
  const questions = [
    "How can I customize my career page design?",
    "Where can I see my logo when I upload it to career page?",
    "How do I change the colors on my career page?",
    "What settings are available for career page customization?",
    "How to edit my company profile on the career page?"
  ];
  
  // Test different thresholds
  const thresholds = [0.7, 0.6, 0.5, 0.4];
  
  for (const question of questions) {
    console.log(`\n=== Testing question: "${question}" ===\n`);
    
    for (const threshold of thresholds) {
      console.log(`\n--- With threshold: ${threshold} ---`);
      
      const result = await knowledgeBase.search(question, threshold);
      
      if (result) {
        console.log(`Found result with threshold ${threshold}:`);
        console.log(`${result.substring(0, 200)}...`);
      } else {
        console.log(`No result found with threshold ${threshold}`);
      }
    }
  }
}

// Run the test
testKnowledgeBase().catch(console.error); 