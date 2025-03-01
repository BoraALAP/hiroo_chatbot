import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
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

async function setupDatabase() {
  try {
    // Read the setup SQL file
    const sqlPath = path.join(process.cwd(), 'supabase', 'setup.sql');
    if (!fs.existsSync(sqlPath)) {
      throw new Error('setup.sql file not found');
    }

    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    console.log('Executing SQL setup script...');
    
    try {
      // Execute the entire SQL file at once
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.error('Error executing SQL setup:', error.message);
        
        // If the error is about the exec_sql function not existing, we need to create it first
        if (error.message.includes('function exec_sql() does not exist')) {
          console.log('The exec_sql function does not exist. Please run the following SQL in the Supabase SQL editor:');
          const execSqlPath = path.join(process.cwd(), 'supabase', 'exec_sql.sql');
          if (fs.existsSync(execSqlPath)) {
            const execSql = fs.readFileSync(execSqlPath, 'utf-8');
            console.log(execSql);
          } else {
            console.log(`
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;
            `);
          }
        }
      } else {
        console.log('SQL setup executed successfully.');
      }
    } catch (error) {
      console.error('Error executing SQL setup:', error);
    }

    console.log('Database setup completed.');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

// Function to create SQL functions
async function createSQLFunctions() {
  try {
    console.log('Creating SQL functions...');
    
    // Function to check if another function exists
    const functionExistsQuery = `
      CREATE OR REPLACE FUNCTION function_exists(function_name TEXT)
      RETURNS BOOLEAN AS $$
      BEGIN
        RETURN EXISTS (
          SELECT 1
          FROM pg_proc
          WHERE proname = function_name
        );
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    // Function to query duplicate documents
    const queryDuplicatesQuery = `
      CREATE OR REPLACE FUNCTION query_duplicate_documents()
      RETURNS TABLE(content TEXT, count BIGINT) AS $$
      BEGIN
        RETURN QUERY
        SELECT d.content, COUNT(*) as count
        FROM documents d
        GROUP BY d.content
        HAVING COUNT(*) > 1;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    // Function to remove duplicate documents
    const removeDuplicatesQuery = `
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
    
    // Execute the queries
    const { error: error1 } = await supabase.rpc('exec_sql', { sql: functionExistsQuery });
    if (error1) {
      console.error('Error creating function_exists function:', error1);
    } else {
      console.log('Created function_exists function');
    }
    
    const { error: error2 } = await supabase.rpc('exec_sql', { sql: queryDuplicatesQuery });
    if (error2) {
      console.error('Error creating query_duplicate_documents function:', error2);
    } else {
      console.log('Created query_duplicate_documents function');
    }
    
    const { error: error3 } = await supabase.rpc('exec_sql', { sql: removeDuplicatesQuery });
    if (error3) {
      console.error('Error creating remove_duplicate_documents function:', error3);
    } else {
      console.log('Created remove_duplicate_documents function');
    }
    
    console.log('SQL functions created successfully');
  } catch (error) {
    console.error('Error creating SQL functions:', error);
  }
}

// Run the setup function
async function main() {
  try {
    console.log('Setting up database...');
    
    // Setup database tables
    await setupDatabase();
    
    // Create SQL functions
    await createSQLFunctions();
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

main().catch(console.error); 