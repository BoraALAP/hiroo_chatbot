import { ChatOpenAI } from '@langchain/openai';
import dotenv from 'dotenv';
import { 
  createQuestionReasonablenessChain, 
  getPendingQuestions, 
  updateQuestionAssessment 
} from '../src/utils/unansweredQuestions';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function assessUnansweredQuestions() {
  console.log('Starting assessment of unanswered questions...');

  // Check for required environment variables
  const openAIApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!openAIApiKey) {
    console.error('Missing OpenAI API key. Please set NEXT_PUBLIC_OPENAI_API_KEY.');
    process.exit(1);
  }
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    process.exit(1);
  }

  // Initialize LLM
  const llm = new ChatOpenAI({
    openAIApiKey: openAIApiKey,
    modelName: process.env.NEXT_PUBLIC_AI_MODEL || 'gpt-4-turbo',
    temperature: 0.2,
  });

  // Create reasonableness assessment chain
  const reasonablenessChain = createQuestionReasonablenessChain(llm);

  try {
    // Get pending questions
    console.log('Fetching pending questions...');
    const pendingQuestions = await getPendingQuestions(10); // Limit to 10 questions at a time
    
    if (pendingQuestions.length === 0) {
      console.log('No pending questions found.');
      return;
    }
    
    console.log(`Found ${pendingQuestions.length} pending questions.`);
    
    // Process each question
    for (const question of pendingQuestions) {
      console.log(`\nProcessing question ID ${question.id}: "${question.processed_question}"`);
      
      // Skip questions that already have an assessment
      if (question.is_reasonable !== undefined) {
        console.log(`Question ID ${question.id} already has an assessment. Skipping.`);
        continue;
      }
      
      // Assess reasonableness
      console.log('Assessing reasonableness...');
      const assessment = await reasonablenessChain.invoke({ 
        question: question.processed_question,
         
      });
      
      console.log(`Assessment result: ${assessment.isReasonable ? 'Reasonable' : 'Not Reasonable'}`);
      console.log(`Reason: ${assessment.reason}`);
      
      // Update the question in the database
      console.log('Updating question assessment in database...');
      const success = await updateQuestionAssessment(question.id, assessment);
      
      if (success) {
        console.log(`Successfully updated assessment for question ID ${question.id}`);
      } else {
        console.error(`Failed to update assessment for question ID ${question.id}`);
      }
    }
    
    console.log('\nAssessment process completed.');
    
  } catch (error) {
    console.error('Error in assessment process:', error);
    process.exit(1);
  }
}

// Run the assessment
assessUnansweredQuestions().catch(console.error); 