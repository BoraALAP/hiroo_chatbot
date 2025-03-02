import dotenv from 'dotenv';
import { createOrchestrator } from '../src/agents/orchestrator';
import { Message } from '../src/utils/chatMessageUtils';

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

async function testEmailCollection() {
  console.log('Testing email collection functionality...\n');
  
  // Initialize orchestrator
  const orchestrator = createOrchestrator();
  
  // Initialize state
  const history: Message[] = [];
  let waitingForEmail = false;
  let lastQuestionId: number | null = null;
  
  // Initialize the orchestrator
  const initialized = await orchestrator.initialize(
    process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  if (!initialized) {
    console.error('Failed to initialize orchestrator');
    process.exit(1);
  }
  
  console.log('Orchestrator initialized successfully\n');
  
  // Test 1: Ask a product-related question that should trigger email collection
  const question1 = "Where can I see my logo when I upload it to career page?";
  console.log(`User: ${question1}`);
  
  const result1 = await orchestrator.processMessage(
    question1,
    history,
    waitingForEmail,
    lastQuestionId
  );
  
  console.log(`Assistant: ${result1.response.content}`);
  console.log(`Waiting for email: ${result1.waitingForEmail}`);
  console.log(`Last question ID: ${result1.lastQuestionId}`);
  
  // Update state
  history.push({ role: 'user', content: question1, id: Date.now().toString() });
  history.push(result1.response);
  waitingForEmail = result1.waitingForEmail;
  lastQuestionId = result1.lastQuestionId;
  
  // Test 2: Decline to provide email
  if (waitingForEmail) {
    const response1 = "No, I don't want to give my email";
    console.log(`\nUser: ${response1}`);
    
    const result2 = await orchestrator.processMessage(
      response1,
      history,
      waitingForEmail,
      lastQuestionId
    );
    
    console.log(`Assistant: ${result2.response.content}`);
    console.log(`Waiting for email: ${result2.waitingForEmail}`);
    
    // Update state
    history.push({ role: 'user', content: response1, id: Date.now().toString() });
    history.push(result2.response);
    waitingForEmail = result2.waitingForEmail;
    lastQuestionId = result2.lastQuestionId;
  }
  
  // Test 3: Ask another product-related question
  const question2 = "How do I change my subscription plan?";
  console.log(`\nUser: ${question2}`);
  
  const result3 = await orchestrator.processMessage(
    question2,
    history,
    waitingForEmail,
    lastQuestionId
  );
  
  console.log(`Assistant: ${result3.response.content}`);
  console.log(`Waiting for email: ${result3.waitingForEmail}`);
  console.log(`Last question ID: ${result3.lastQuestionId}`);
  
  // Update state
  history.push({ role: 'user', content: question2, id: Date.now().toString() });
  history.push(result3.response);
  waitingForEmail = result3.waitingForEmail;
  lastQuestionId = result3.lastQuestionId;
  
  // Test 4: Provide a new question instead of an email
  if (waitingForEmail) {
    const response2 = "Can you tell me about pricing instead?";
    console.log(`\nUser: ${response2}`);
    
    const result4 = await orchestrator.processMessage(
      response2,
      history,
      waitingForEmail,
      lastQuestionId
    );
    
    console.log(`Assistant: ${result4.response.content}`);
    console.log(`Waiting for email: ${result4.waitingForEmail}`);
    
    // Update state
    history.push({ role: 'user', content: response2, id: Date.now().toString() });
    history.push(result4.response);
    waitingForEmail = result4.waitingForEmail;
    lastQuestionId = result4.lastQuestionId;
  }
  
  // Test 5: Ask another product-related question to trigger email collection again
  const question3 = "How can I customize my career page design?";
  console.log(`\nUser: ${question3}`);
  
  const result5 = await orchestrator.processMessage(
    question3,
    history,
    waitingForEmail,
    lastQuestionId
  );
  
  console.log(`Assistant: ${result5.response.content}`);
  console.log(`Waiting for email: ${result5.waitingForEmail}`);
  console.log(`Last question ID: ${result5.lastQuestionId}`);
  
  // Update state
  history.push({ role: 'user', content: question3, id: Date.now().toString() });
  history.push(result5.response);
  waitingForEmail = result5.waitingForEmail;
  lastQuestionId = result5.lastQuestionId;
  
  // Test 6: Provide an email embedded in a longer message
  if (waitingForEmail) {
    const response3 = "My email is test@example.com, thanks I will be waiting for your message";
    console.log(`\nUser: ${response3}`);
    
    const result6 = await orchestrator.processMessage(
      response3,
      history,
      waitingForEmail,
      lastQuestionId
    );
    
    console.log(`Assistant: ${result6.response.content}`);
    console.log(`Waiting for email: ${result6.waitingForEmail}`);
    
    // Update state
    history.push({ role: 'user', content: response3, id: Date.now().toString() });
    history.push(result6.response);
    waitingForEmail = result6.waitingForEmail;
    lastQuestionId = result6.lastQuestionId;
  }
  
  console.log('\nEmail collection test completed!');
}

// Run the test
testEmailCollection().catch(console.error); 