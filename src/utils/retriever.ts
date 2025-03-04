import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from '@langchain/openai';
import { createClient } from '@supabase/supabase-js';

// Minimum similarity score threshold for documents to be considered relevant
const SIMILARITY_THRESHOLD = 0.75;

const openAIApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const embeddingsModel = process.env.NEXT_PUBLIC_EMBEDDINGS_MODEL || 'text-embedding-3-small';

const embeddings = new OpenAIEmbeddings({
  openAIApiKey,
  model: embeddingsModel,
});

const client = createClient(supabaseUrl!, supabaseKey!);

const vectorStore = new SupabaseVectorStore(embeddings, {
  client,
  tableName: 'documents',
  queryName: 'match_documents',
}); 

/**
 * Retrieves documents similar to the query and filters them based on similarity score
 * @param query The query to search for
 * @param threshold Optional similarity threshold (0-1), defaults to SIMILARITY_THRESHOLD
 * @param maxResults Optional maximum number of results to return, defaults to 5
 * @returns Array of documents with their similarity scores
 */
const retriever = async (query: string, threshold = SIMILARITY_THRESHOLD, maxResults = 5) => {
  // Get documents with similarity scores
  const results = await vectorStore.similaritySearchWithScore(query, maxResults * 2);
  
  // Filter results by similarity threshold and sort by score (highest first)
  const filteredResults = results
    .filter(([, score]) => score >= threshold)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxResults);
  
  console.log(`Retrieved ${filteredResults.length} documents with similarity scores above ${threshold}`);
  
  // Log similarity scores for debugging
  filteredResults.forEach(([doc, score], index) => {
    console.log(`Document ${index + 1}: Score ${score.toFixed(4)}, Content: ${doc.pageContent.substring(0, 100)}...`);
  });
  
  return filteredResults;
};

/**
 * Checks if any retrieved documents meet the similarity threshold
 * @param query The query to check
 * @param threshold Optional similarity threshold (0-1), defaults to SIMILARITY_THRESHOLD
 * @returns Boolean indicating if any relevant documents were found
 */
export const hasSimilarDocuments = async (query: string, threshold = SIMILARITY_THRESHOLD): Promise<boolean> => {
  const results = await vectorStore.similaritySearchWithScore(query, 1);
  
  if (results.length === 0) {
    return false;
  }
  
  const [, score] = results[0];
  const hasRelevantDocs = score >= threshold;
  
  console.log(`Similarity check for "${query}": ${hasRelevantDocs ? 'Relevant' : 'Not relevant'} (score: ${score.toFixed(4)})`);
  
  return hasRelevantDocs;
};

export default retriever;