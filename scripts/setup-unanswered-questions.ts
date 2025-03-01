import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function setupUnansweredQuestionsTable() {
  console.log('Setting up unanswered questions table...');

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
    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), 'supabase', 'unanswered_questions.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: sqlContent
    });

    if (error) {
      console.error('Error executing SQL:', error);
      process.exit(1);
    }

    console.log('Unanswered questions table setup completed successfully!');
    console.log('Result:', data);
  } catch (error) {
    console.error('Error setting up unanswered questions table:', error);
    process.exit(1);
  }
}

// Run the setup
setupUnansweredQuestionsTable().catch(console.error); 