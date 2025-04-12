
import { OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@/lib/supabase/server";

// Document type from LangChain for typing
interface DocWithPageContent {
  pageContent: string;
  metadata: Record<string, unknown>;
}

export async function searchSupabase(query: string): Promise<Array<{ content: string; score: number; metadata: Record<string, unknown> }>> {
  console.log("search supabase chain");
    const supabase = await createClient();
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const SIMILARITY_THRESHOLD = 0.70;
    const MAX_RESULTS = 10;

    const vectorStore = new SupabaseVectorStore(embeddings, {
      client:supabase,
      tableName: 'documents',
      queryName: 'match_documents',
    }); 

  

    const vectorResults = await vectorStore.similaritySearchWithScore(
      query,
      MAX_RESULTS
    );

    console.log("vector results",vectorResults);
    

    const filteredResults = vectorResults
    .filter(([, score]) => score >= SIMILARITY_THRESHOLD)
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_RESULTS);

    

    const result= filteredResults.map(([doc, score]: [DocWithPageContent, number]) => ({ 
      content: doc.pageContent, 
      score,  
      metadata: doc.metadata 
    }));

    console.log("db result",result);
    return result;
  }