import { createOrchestrator } from '../src/agents/orchestrator';
import { createUserMessage } from '../src/utils/chatMessageUtils';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Test questions
const QUESTIONS = [
  'How can I create a career page?',
  'How can I upgrade my membership?',
  'What is the best way to use the platform?',
  'what is the meaning of life?',
  'where can i see my logo when i upload it?'
];

async function runTest() {
  console.log('Starting chat system test...');
  
  // Check for required environment variables
  const openAIApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!openAIApiKey || !supabaseUrl || !supabaseKey) {
    console.error('Missing required environment variables. Please check your .env file.');
    process.exit(1);
  }
  
  // Create and initialize the orchestrator
  console.log('Initializing orchestrator...');
  const orchestrator = createOrchestrator();
  const initialized = await orchestrator.initialize(
    openAIApiKey,
    supabaseUrl,
    supabaseKey
  );
  
  if (!initialized) {
    console.error('Failed to initialize orchestrator. Check your credentials and try again.');
    process.exit(1);
  }
  
  console.log('Orchestrator initialized successfully.');
  
  // Process each question
  const messages = [];
  let waitingForEmail = false;
  let lastQuestionId = null;
  
  for (const question of QUESTIONS) {
    console.log('\n---------------------------------------------------');
    console.log(`Testing question: "${question}"`);
    
    // Add user message to conversation history
    const userMessage = createUserMessage(question);
    messages.push(userMessage);
    
    // Process the message
    console.log('Processing message...');
    const result = await orchestrator.processMessage(
      question,
      messages,
      waitingForEmail,
      lastQuestionId
    );
    
    // Update state
    waitingForEmail = result.waitingForEmail;
    lastQuestionId = result.lastQuestionId;
    messages.push(result.response);
    
    // Display results
    console.log('\nResponse:');
    console.log(result.response.content);
    console.log('\nWaiting for email:', waitingForEmail);
    console.log('Question ID:', lastQuestionId);
    
    // If waiting for email, simulate providing an email
    if (waitingForEmail) {
      console.log('\nProviding test email: test@example.com');
      
      // Process the email
      const emailResult = await orchestrator.processMessage(
        'test@example.com',
        messages,
        waitingForEmail,
        lastQuestionId
      );
      
      // Update state
      waitingForEmail = emailResult.waitingForEmail;
      lastQuestionId = emailResult.lastQuestionId;
      messages.push(emailResult.response);
      
      // Display results
      console.log('\nEmail response:');
      console.log(emailResult.response.content);
    }
  }
  
  console.log('\n---------------------------------------------------');
  console.log('Test completed successfully!');
}

// Run the test
runTest().catch(error => {
  console.error('Error running test:', error);
  process.exit(1);
}); 