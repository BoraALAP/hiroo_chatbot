import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to check for duplicate documents
async function checkDuplicateDocuments() {
  try {
    console.log('Checking for duplicate documents in the vector store...');
    
    // Query to find duplicate content
    // Using raw SQL query to avoid TypeScript errors with group by
    const { data, error } = await supabase
      .rpc('query_duplicate_documents');
    
    if (error) {
      console.error('Error checking for duplicates:', error);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('No duplicate documents found.');
      return;
    }
    
    console.log(`Found ${data.length} duplicate document contents:`);
    data.forEach((item: { content: string; count: number }, index: number) => {
      console.log(`${index + 1}. Content appears ${item.count} times: "${item.content.substring(0, 50)}..."`);
    });
    
    // Get total document count
    const { count, error: countError } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error getting document count:', countError);
    } else {
      console.log(`Total documents in the store: ${count}`);
    }
  } catch (error) {
    console.error('Error in checkDuplicateDocuments:', error);
  }
}

// Function to remove duplicate documents
async function removeDuplicateDocuments() {
  try {
    console.log('Removing duplicate documents from the vector store...');
    
    // This is a complex operation that requires a custom SQL query
    // We'll use Supabase's rpc function to execute a custom SQL function
    
    // First, check if the function exists
    const { data: functionExists, error: functionCheckError } = await supabase
      .rpc('function_exists', { function_name: 'remove_duplicate_documents' });
    
    if (functionCheckError) {
      console.error('Error checking if function exists:', functionCheckError);
      return false;
    }
    
    if (!functionExists) {
      console.log('Creating SQL function to remove duplicates...');
      
      // Create the function to remove duplicates
      const createFunctionQuery = `
        CREATE OR REPLACE FUNCTION remove_duplicate_documents()
        RETURNS integer AS $$
        DECLARE
          removed integer;
        BEGIN
          WITH duplicates AS (
            SELECT id, content,
              ROW_NUMBER() OVER (PARTITION BY content ORDER BY id) as row_num
            FROM documents
          )
          DELETE FROM documents
          WHERE id IN (
            SELECT id FROM duplicates WHERE row_num > 1
          );
          
          GET DIAGNOSTICS removed = ROW_COUNT;
          RETURN removed;
        END;
        $$ LANGUAGE plpgsql;
      `;
      
      const { error: createFunctionError } = await supabase.rpc('exec_sql', { sql: createFunctionQuery });
      
      if (createFunctionError) {
        console.error('Error creating function:', createFunctionError);
        console.log('Attempting alternative approach...');
        
        // Alternative approach: Use a direct SQL query through the REST API
        // This is less ideal but can work if the function creation fails
        return await manuallyRemoveDuplicates();
      }
    }
    
    // Call the function to remove duplicates
    const { data: removedCount, error: removeError } = await supabase
      .rpc('remove_duplicate_documents');
    
    if (removeError) {
      console.error('Error removing duplicates:', removeError);
      return false;
    }
    
    console.log(`Successfully removed ${removedCount} duplicate documents`);
    return true;
  } catch (error) {
    console.error('Error in removeDuplicateDocuments:', error);
    return false;
  }
}

// Alternative approach if the SQL function doesn't work
async function manuallyRemoveDuplicates() {
  try {
    console.log('Using alternative approach to remove duplicates...');
    
    // First, identify duplicates
    const { data, error } = await supabase
      .from('documents')
      .select('content, id')
      .order('id', { ascending: true });
    
    if (error) {
      console.error('Error fetching documents:', error);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.log('No documents found.');
      return true;
    }
    
    // Find duplicate IDs to remove
    const contentMap = new Map();
    const idsToRemove = [];
    
    for (const doc of data) {
      if (contentMap.has(doc.content)) {
        idsToRemove.push(doc.id);
      } else {
        contentMap.set(doc.content, doc.id);
      }
    }
    
    if (idsToRemove.length === 0) {
      console.log('No duplicates found using manual approach.');
      return true;
    }
    
    console.log(`Found ${idsToRemove.length} duplicates to remove.`);
    
    // Remove duplicates in batches to avoid query size limitations
    const batchSize = 100;
    let removedCount = 0;
    
    for (let i = 0; i < idsToRemove.length; i += batchSize) {
      const batch = idsToRemove.slice(i, i + batchSize);
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .in('id', batch);
      
      if (deleteError) {
        console.error(`Error deleting batch ${i / batchSize + 1}:`, deleteError);
      } else {
        removedCount += batch.length;
        console.log(`Removed batch ${i / batchSize + 1} (${batch.length} documents)`);
      }
    }
    
    console.log(`Successfully removed ${removedCount} duplicate documents manually`);
    return true;
  } catch (error) {
    console.error('Error in manuallyRemoveDuplicates:', error);
    return false;
  }
}

// Main function
async function main() {
  const command = process.argv[2] || 'check';
  
  try {
    if (command === 'check') {
      await checkDuplicateDocuments();
    } else if (command === 'remove') {
      const success = await removeDuplicateDocuments();
      if (success) {
        console.log('Duplicate removal completed successfully.');
      } else {
        console.log('Failed to remove duplicates.');
      }
    } else {
      console.log('Invalid command. Use "check" to check for duplicates or "remove" to remove them.');
    }
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 