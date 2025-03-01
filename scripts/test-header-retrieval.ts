import { createClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testHeaderRetrieval() {
  try {
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

    // Test queries
    const testQueries = [
      'What is your pricing plan?',
      'How can I get support?',
      'Is my data secure?'
    ];

    for (const query of testQueries) {
      console.log(`\n\nTesting query: "${query}"`);
      console.log('Searching for similar documents...');
      
      // Search for similar documents
      const results = await vectorStore.similaritySearch(query, 2);
      
      // Display results
      console.log('\nSearch Results:');
      if (results.length === 0) {
        console.log('No results found.');
      } else {
        results.forEach((doc, i) => {
          console.log(`\nResult ${i + 1}:`);
          console.log(`Content: ${doc.pageContent.substring(0, 150)}...`);
          
          // Display metadata with special focus on headers
          console.log('Metadata:');
          if (doc.metadata.header) {
            console.log(`  Header: ${doc.metadata.header}`);
            console.log(`  Level: ${doc.metadata.level}`);
          }
          console.log(`  Source: ${doc.metadata.source || 'Unknown'}`);
          
          // Display any other metadata
          Object.entries(doc.metadata).forEach(([key, value]) => {
            if (key !== 'header' && key !== 'level' && key !== 'source') {
              console.log(`  ${key}: ${JSON.stringify(value)}`);
            }
          });
        });
      }
    }

    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error testing header retrieval:', error);
  }
}

// Run the test
testHeaderRetrieval().catch(console.error); 