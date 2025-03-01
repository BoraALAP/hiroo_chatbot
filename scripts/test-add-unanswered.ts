import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testAddUnansweredQuestion() {
  console.log('Testing add_unanswered_question function...');

  // Check for required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    process.exit(1);
  }

  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test data
    const testQuestion = "What is the price of your premium plan?";
    const processedQuestion = "price premium plan";
    
    console.log('Calling add_unanswered_question with:', { 
      question_text: testQuestion,
      processed_question_text: processedQuestion
    });

    // Call the function directly
    const { data, error } = await supabase.rpc('add_unanswered_question', {
      question_text: testQuestion,
      processed_question_text: processedQuestion,
      user_identifier: null
    });

    if (error) {
      console.error('Error calling add_unanswered_question:', error);
      console.error('Error details:', error.message, error.details, error.hint);
      process.exit(1);
    }

    console.log('Successfully added test question!');
    console.log('Returned ID:', data);
    
    // Now verify by fetching the question
    console.log('\nVerifying by fetching the question from the database...');
    const { data: questions, error: fetchError } = await supabase
      .from('unanswered_questions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (fetchError) {
      console.error('Error fetching questions:', fetchError);
      process.exit(1);
    }
    
    console.log('Latest question in database:', questions && questions.length > 0 ? questions[0] : 'No questions found');
    
  } catch (error) {
    console.error('Error in test script:', error);
    process.exit(1);
  }
}

// Run the test
testAddUnansweredQuestion().catch(console.error); 