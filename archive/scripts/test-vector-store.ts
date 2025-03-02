import { createClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Function to check and setup the database
async function setupDatabase(): Promise<boolean> {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // First, check if the documents table exists
    const { error: tableCheckError } = await supabase
      .from('documents')
      .select('id')
      .limit(1);
    
    // If the table doesn't exist, run the setup script
    if (tableCheckError && tableCheckError.message.includes('relation "documents" does not exist')) {
      console.log('Documents table does not exist. Setting up the database...');
      
      // Execute the setup script
      const setupScriptPath = path.join(process.cwd(), 'scripts', 'setup-database.ts');
      if (fs.existsSync(setupScriptPath)) {
        console.log('Running database setup script...');
        
        // Run the setup function
        return new Promise((resolve, reject) => {
          const setupProcess = spawn('npx', ['tsx', setupScriptPath], { stdio: 'inherit' });
          
          setupProcess.on('close', (code: number) => {
            if (code === 0) {
              console.log('Database setup completed successfully.');
              resolve(true);
            } else {
              console.error(`Database setup failed with code ${code}.`);
              resolve(false);
            }
          });
          
          setupProcess.on('error', (err: Error) => {
            console.error('Error running setup script:', err);
            reject(err);
          });
        });
      } else {
        console.error('setup-database.ts script not found');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error checking/setting up database:', error);
    return false;
  }
}

async function testVectorStore() {
  try {
    // Ensure the database is set up
    const isSetup = await setupDatabase();
    if (!isSetup) {
      console.error('Database setup failed. Cannot proceed with testing vector store.');
      return;
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const openAIApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables');
    }

    if (!openAIApiKey) {
      throw new Error('Missing OpenAI API key. Please set the NEXT_PUBLIC_OPENAI_API_KEY environment variable.');
    }

    console.log('Connecting to Supabase...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize OpenAI embeddings
    console.log('Initializing OpenAI embeddings...');
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: openAIApiKey,
      modelName: process.env.NEXT_PUBLIC_EMBEDDINGS_MODEL || 'text-embedding-3-small',
    });

    // Create a Supabase vector store instance
    console.log('Creating Supabase vector store instance...');
    const vectorStore = new SupabaseVectorStore(embeddings, {
      client: supabase,
      tableName: 'documents',
      queryName: 'match_documents',
    });

    // Test query
    const testQuery = 'What is the pricing for your product?';
    console.log(`Testing query: "${testQuery}"`);

    // Search for similar documents
    console.log('Searching for similar documents...');
    const results = await vectorStore.similaritySearch(testQuery, 3);

    // Display results
    console.log('\nSearch Results:');
    if (results.length === 0) {
      console.log('No results found.');
    } else {
      results.forEach((doc, i) => {
        console.log(`\nResult ${i + 1}:`);
        console.log(`Content: ${doc.pageContent.substring(0, 150)}...`);
        console.log('Metadata:', doc.metadata);
      });
    }

    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error testing vector store:', error);
  }
}

// Run the test
testVectorStore().catch(console.error); 