import { createClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';

/**
 * Interface for the knowledge base search result
 */
export interface KnowledgeBaseResult {
  content: string;
  score: number;
}

/**
 * Creates a knowledge base agent that searches for relevant information
 * @param supabaseUrl Supabase URL
 * @param supabaseKey Supabase API key
 * @param openAIApiKey OpenAI API key
 * @param embeddingsModel Embeddings model to use (defaults to text-embedding-3-small)
 * @returns An object with initialize and search functions
 */
export const createKnowledgeBase = () => {
  let vectorStore: SupabaseVectorStore | null = null;
  let initialized = false;

  /**
   * Initialize the knowledge base with the necessary credentials
   */
  const initialize = async (
    supabaseUrl: string,
    supabaseKey: string,
    openAIApiKey: string,
    embeddingsModel: string = 'text-embedding-3-small'
  ): Promise<boolean> => {
    try {
      // Create Supabase client
      const client = createClient(supabaseUrl, supabaseKey);

      // Initialize OpenAI embeddings
      const embeddings = new OpenAIEmbeddings({
        openAIApiKey,
        model: embeddingsModel,
      });

      // Initialize Supabase vector store
      vectorStore = await SupabaseVectorStore.fromExistingIndex(embeddings, {
        client,
        tableName: 'documents',
        queryName: 'match_documents',
      });

      initialized = true;
      console.log('Knowledge base initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing knowledge base:', error);
      return false;
    }
  };

  /**
   * Search the knowledge base for relevant information
   * @param question The question to search for
   * @param similarityThreshold Minimum similarity score to consider a result relevant
   * @param maxResults Maximum number of results to return
   * @returns The combined content of relevant documents, or null if no relevant documents found
   */
  const search = async (
    question: string,
    similarityThreshold: number = 0.7,
    maxResults: number = 5
  ): Promise<string | null> => {
    if (!initialized || !vectorStore) {
      console.error('Knowledge base not initialized');
      return null;
    }

    try {
      console.log(`Searching knowledge base for: "${question}" with threshold ${similarityThreshold}`);
      
      // Search for relevant documents
      const results = await vectorStore.similaritySearchWithScore(
        question,
        maxResults
      );
      
      console.log(`Raw search results (${results.length}):`);
      results.forEach(([doc, score], index) => {
        console.log(`  ${index + 1}. Score: ${score.toFixed(4)} - ${doc.pageContent.substring(0, 100)}...`);
      });

      // Filter results by similarity threshold
      const relevantResults = results
        .filter(([, score]) => score >= similarityThreshold)
        .map(([doc, score]) => ({
          content: doc.pageContent,
          score,
        }));

      console.log(`Found ${relevantResults.length} relevant documents after filtering (threshold: ${similarityThreshold})`);

      if (relevantResults.length === 0) {
        return null;
      }

      // Combine the content of all relevant documents
      const combinedContent = relevantResults
        .map((result) => result.content)
        .join('\n\n');

      return combinedContent;
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      return null;
    }
  };

  return {
    initialize,
    search,
  };
}; 