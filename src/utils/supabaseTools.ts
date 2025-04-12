import { createClient } from '@supabase/supabase-js';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { OpenAIEmbeddings } from '@langchain/openai';
import { DynamicTool } from '@langchain/core/tools';


// Initialize Supabase client
const initSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

// Initialize OpenAI embeddings
const initEmbeddings = () => {
  const openAIApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  const embeddingsModel = process.env.NEXT_PUBLIC_EMBEDDINGS_MODEL || 'text-embedding-3-small';
  
  if (!openAIApiKey) {
    throw new Error('Missing OpenAI API key');
  }
  
  return new OpenAIEmbeddings({
    openAIApiKey,
    model: embeddingsModel,
  });
};

// Initialize Supabase vector store
const initVectorStore = () => {
  const client = initSupabaseClient();
  const embeddings = initEmbeddings();
  
  return new SupabaseVectorStore(embeddings, {
    client,
    tableName: 'documents',
    queryName: 'match_documents',
  });
};

// Create search tool with arrow function
const createSearchSupabaseTool = (similarityThreshold = 0.75) => {
  const vectorStore = initVectorStore();
  
  return new DynamicTool({
    name: 'searchSupabase',
    description: 'Search the Supabase vector database for information related to a query',
    func: async (query: string): Promise<string> => {
      try {
        // Search for documents with similarity scores
        const results = await vectorStore.similaritySearchWithScore(query, 5);
        
        // Filter results by similarity threshold
        const relevantResults = results.filter(([, score]) => score >= similarityThreshold);
        
        if (relevantResults.length === 0) {
          return JSON.stringify({ found: false, message: 'No relevant information found' });
        }
        
        // Format results for the agent
        const formattedResults = relevantResults.map(([doc, score]) => ({
          content: doc.pageContent,
          score: score,
          metadata: doc.metadata
        }));
        
        return JSON.stringify({ 
          found: true, 
          results: formattedResults,
          message: `Found ${relevantResults.length} relevant documents` 
        });
      } catch (error) {
        console.error('Error searching Supabase:', error);
        return JSON.stringify({ 
          found: false, 
          message: 'Error searching knowledge base',
          error: (error as Error).message
        });
      }
    }
  });
};

// Create log unanswered tool with arrow function
const createLogUnansweredTool = () => {
  const client = initSupabaseClient();
  
  return new DynamicTool({
    name: 'logUnanswered',
    description: 'Log an unanswered question to Supabase with optional email for follow-up',
    func: async (input: string): Promise<string> => {
      try {
        const data = JSON.parse(input);
        const { question, processedQuestion, email } = data;
        
        if (!question) {
          return JSON.stringify({ 
            success: false, 
            message: 'Missing required field: question'
          });
        }
        
        // Insert the unanswered question into Supabase
        const { data: insertedData, error } = await client
          .from('unanswered_questions')
          .insert([{ 
            question, 
            processed_question: processedQuestion || question, 
            email: email || null,
            status: 'pending',
            answer_sent: false
          }])
          .select('id');
        
        if (error) {
          console.error('Error logging unanswered question:', error);
          return JSON.stringify({ 
            success: false, 
            message: 'Failed to log unanswered question',
            error: error.message
          });
        }
        
        if (!insertedData || insertedData.length === 0) {
          return JSON.stringify({ 
            success: false, 
            message: 'No data returned after inserting unanswered question'
          });
        }
        
        return JSON.stringify({ 
          success: true, 
          questionId: insertedData[0].id,
          message: 'Successfully logged unanswered question' 
        });
      } catch (error) {
        console.error('Error parsing input or logging question:', error);
        return JSON.stringify({ 
          success: false, 
          message: 'Error processing unanswered question',
          error: (error as Error).message
        });
      }
    }
  });
};

// Create update question email tool with arrow function
const createUpdateQuestionEmailTool = () => {
  const client = initSupabaseClient();
  
  return new DynamicTool({
    name: 'updateQuestionEmail',
    description: 'Update an unanswered question with the user\'s email address',
    func: async (input: string): Promise<string> => {
      try {
        const data = JSON.parse(input);
        const { questionId, email } = data;
        
        if (!questionId || !email) {
          return JSON.stringify({ 
            success: false, 
            message: 'Missing required fields: questionId or email'
          });
        }
        
        // Update the question with email
        const { error } = await client
          .from('unanswered_questions')
          .update({
            email,
            updated_at: new Date().toISOString()
          })
          .eq('id', questionId);
        
        if (error) {
          console.error('Error updating question with email:', error);
          return JSON.stringify({ 
            success: false, 
            message: 'Failed to update question with email',
            error: error.message
          });
        }
        
        return JSON.stringify({ 
          success: true, 
          message: 'Successfully updated question with email' 
        });
      } catch (error) {
        console.error('Error parsing input or updating question:', error);
        return JSON.stringify({ 
          success: false, 
          message: 'Error processing email update',
          error: (error as Error).message
        });
      }
    }
  });
};

// Export individual tools and a convenient function to get all tools
export const searchSupabaseTool = createSearchSupabaseTool();
export const logUnansweredTool = createLogUnansweredTool();
export const updateQuestionEmailTool = createUpdateQuestionEmailTool();

export const getSupabaseTools = () => [
  searchSupabaseTool,
  logUnansweredTool,
  updateQuestionEmailTool
]; 