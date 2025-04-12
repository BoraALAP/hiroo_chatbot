import { createClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from '@langchain/core/documents';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const openAIApiKey = process.env.OPENAI_API_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

if (!openAIApiKey) {
  throw new Error('Missing OpenAI API key. Please set the NEXT_PUBLIC_OPENAI_API_KEY environment variable.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Function to clear existing documents from the vector store
async function clearExistingDocuments() {
  try {
    console.log('Clearing existing documents from the vector store...');
    
    // Delete all records from the documents table
    const { error } = await supabase
      .from('documents')
      .delete()
      .neq('id', 0); // This will match all records
    
    if (error) {
      console.error('Error clearing documents:', error);
      return false;
    }
    
    console.log('Successfully cleared existing documents');
    return true;
  } catch (error) {
    console.error('Error in clearExistingDocuments:', error);
    return false;
  }
}

// Initialize OpenAI embeddings
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: openAIApiKey,
  modelName: process.env.NEXT_PUBLIC_EMBEDDINGS_MODEL || 'text-embedding-3-small',
  dimensions: 1536,
  stripNewLines: true,
});

// Function to read documents from a directory
async function readDocumentsFromDirectory(directoryPath: string): Promise<{ filePath: string; content: string }[]> {
  const documents: { filePath: string; content: string }[] = [];
  
  try {
    const files = fs.readdirSync(directoryPath);
    
    for (const file of files) {
      if (file.endsWith('.md') || file.endsWith('.txt')) {
        const filePath = path.join(directoryPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        documents.push({
          filePath,
          content,
        });
      }
    }
  } catch (error) {
    console.error('Error reading documents:', error);
  }
  
  return documents;
}

// Function to sanitize text for embedding
function sanitizeTextForEmbedding(text: string): string {
  if (!text || text.trim().length === 0) {
    return " "; // Return a space instead of empty string
  }
  
  // Replace multiple newlines with a single space
  let sanitized = text.replace(/\n+/g, ' ');
  
  // Replace multiple spaces with a single space
  sanitized = sanitized.replace(/\s+/g, ' ');
  
  // Trim the text
  sanitized = sanitized.trim();
  
  // Ensure the text is not too long (OpenAI has token limits)
  if (sanitized.length > 8000) {
    sanitized = sanitized.substring(0, 8000);
  }
  
  return sanitized;
}

// Function to process and embed documents
async function processAndEmbedDocuments(documents: { filePath: string; content: string }[]) {
  try {
    for (const doc of documents) {
      console.log(`Processing document: ${path.basename(doc.filePath)}`);
      
      // Extract filename without extension to use as a topic identifier
      const filename = path.basename(doc.filePath, path.extname(doc.filePath));
      const topicName = filename.replace(/-/g, ' ').trim();
      
      // Keep the entire document contents together for small documents
      // This preserves context better than aggressive chunking
      let docs: Document[];
      
      if (doc.content.length < 2000) {
        // For small documents, keep as a single chunk with enhanced metadata
        docs = [
          new Document({
            pageContent: doc.content,
            metadata: { 
              source: path.basename(doc.filePath),
              topic: topicName,
              document_type: 'full_document'
            }
          })
        ];
      } else if (doc.filePath.endsWith('.md')) {
        // For larger markdown documents, use more appropriate chunking
        const markdownSplitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
          chunkSize: 1000,    // Larger chunks to preserve more context
          chunkOverlap: 200,  // More overlap between chunks
        });
        
        // Extract the document title from the first heading
        const titleMatch = doc.content.match(/^# (.+)$/m);
        const documentTitle = titleMatch ? titleMatch[1].trim() : topicName;
        
        // Split the markdown document
        docs = await markdownSplitter.createDocuments(
          [doc.content],
          [{ 
            source: path.basename(doc.filePath),
            topic: topicName,
            title: documentTitle
          }]
        );
        
        // Process each chunk to improve metadata
        docs = docs.map((d, index) => {
          const metadata = { ...d.metadata };
          
          // Try to extract header information from the chunk
          const headerMatch = d.pageContent.match(/^(#{1,6})\s+(.+)$/m);
          if (headerMatch) {
            const headerLevel = headerMatch[1].length;
            const headerText = headerMatch[2].trim();
            metadata[`header_level_${headerLevel}`] = headerText;
            
            // Add the header to the pageContent to help with retrieval
            if (index === 0 && !d.pageContent.startsWith("# ")) {
              d.pageContent = `# ${documentTitle}\n\n${d.pageContent}`;
            }
          } else if (index === 0) {
            // Ensure the first chunk has the title
            d.pageContent = `# ${documentTitle}\n\n${d.pageContent}`;
          }
          
          metadata.chunk_index = index;
          return new Document({
            pageContent: d.pageContent,
            metadata: metadata,
          });
        });
      } else {
        // For non-markdown documents, use standard chunking
        const textSplitter = new RecursiveCharacterTextSplitter({
          chunkSize: 1500,
          chunkOverlap: 200,
        });
        docs = await textSplitter.createDocuments(
          [doc.content], 
          [{ 
            source: path.basename(doc.filePath),
            topic: topicName
          }]
        );
      }
      
      console.log(`Split into ${docs.length} chunks`);
      
      // Sanitize document content to prevent empty strings and clean up text
      docs = docs.filter(doc => doc.pageContent.trim().length > 0).map(doc => {
        return new Document({
          pageContent: sanitizeTextForEmbedding(doc.pageContent),
          metadata: doc.metadata
        });
      });
      
      if (docs.length === 0) {
        console.log(`No valid content found in document: ${path.basename(doc.filePath)}`);
        continue;
      }
      
      // Process documents in smaller batches to avoid API limitations
      // Reduce batch size to avoid overwhelming the API
      const batchSize = 3; // Further reduced from 5 to 3
      
      for (let i = 0; i < docs.length; i += batchSize) {
        const batch = docs.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(docs.length / batchSize);
        
        console.log(`Processing batch ${batchNumber}/${totalBatches}`);
        
        // Add retry logic with exponential backoff
        let retryCount = 0;
        const maxRetries = 3;
        let success = false;
        
        // Add a timeout to prevent getting stuck
        const processBatchWithTimeout = async (timeoutMs = 60000) => {
          return new Promise<void>(async (resolve, reject) => {
            // Set a timeout to prevent getting stuck
            const timeoutId = setTimeout(() => {
              console.error(`Batch ${batchNumber}/${totalBatches} processing timed out after ${timeoutMs/1000} seconds`);
              reject(new Error(`Timeout after ${timeoutMs/1000} seconds`));
            }, timeoutMs);
            
            try {
              while (!success && retryCount <= maxRetries) {
                try {
                  // Add a small delay between batches to avoid overwhelming the API
                  if (i > 0) {
                    const delay = 1000 + (retryCount * 1000); // Increase delay with each retry
                    console.log(`Waiting ${delay}ms before processing next batch...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                  }
                  
                  // Store documents in Supabase
                  await SupabaseVectorStore.fromDocuments(batch, embeddings, {
                    client: supabase,
                    tableName: 'documents',
                    queryName: 'match_documents',
                  });
                  
                  console.log(`Successfully processed batch ${batchNumber}/${totalBatches}`);
                  success = true;
                  clearTimeout(timeoutId);
                  resolve();
                  break;
                } catch (batchError) {
                  retryCount++;
                  console.error(`Error processing batch ${batchNumber}/${totalBatches} (Attempt ${retryCount}/${maxRetries + 1}):`, batchError);
                  
                  if (retryCount <= maxRetries) {
                    const backoffTime = 2000 * Math.pow(2, retryCount - 1); // Exponential backoff
                    console.log(`Retrying in ${backoffTime / 1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, backoffTime));
                  } else {
                    console.log(`Failed to process batch after ${maxRetries + 1} attempts. Processing documents individually...`);
                    // Process documents one by one with individual error handling
                    for (let index = 0; index < batch.length; index++) {
                      const singleDoc = batch[index];
                      try {
                        // Add a small delay between individual document processing
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        // Process with timeout for individual documents
                        await Promise.race([
                          SupabaseVectorStore.fromDocuments([singleDoc], embeddings, {
                            client: supabase,
                            tableName: 'documents',
                            queryName: 'match_documents',
                          }),
                          new Promise((_, reject) => setTimeout(() => reject(new Error('Individual document timeout')), 30000))
                        ]);
                        
                        console.log(`Successfully processed document ${index + 1}/${batch.length} from batch ${batchNumber}`);
                      } catch (singleError) {
                        console.error(`Failed to process document ${index + 1}/${batch.length} from batch ${batchNumber}:`, singleError);
                        console.error(`Skipping document with content: "${singleDoc.pageContent.substring(0, 100)}..."`);
                      }
                    }
                    
                    clearTimeout(timeoutId);
                    resolve(); // Resolve even if some individual documents failed
                    break;
                  }
                }
              }
            } catch (error) {
              clearTimeout(timeoutId);
              reject(error);
            }
          });
        };
        
        try {
          // Process batch with a timeout
          await processBatchWithTimeout();
        } catch (timeoutError: unknown) {
          if (timeoutError instanceof Error) {
            console.error(`Batch processing error: ${timeoutError.message}`);
          } else {
            console.error(`Batch processing error: Unknown error occurred`);
          }
          console.log(`Skipping problematic batch ${batchNumber}/${totalBatches} and continuing...`);
        }
        
        // Add a progress indicator
        console.log(`Overall progress: ${Math.min(100, Math.round((batchNumber / totalBatches) * 100))}% complete`);
      }
      
      console.log(`Embedded document: ${path.basename(doc.filePath)}`);
    }
    
    console.log('All documents processed and embedded successfully!');
  } catch (error) {
    console.error('Error processing and embedding documents:', error);
  }
}

// Main function
async function main() {
  try {
    console.log("Starting document embedding process...");
    console.log(`Using OpenAI API Key: ${openAIApiKey ? "✓ Found" : "✗ Missing"}`);
    console.log(`Using Supabase URL: ${supabaseUrl ? "✓ Found" : "✗ Missing"}`);
    console.log(`Using Supabase Key: ${supabaseKey ? "✓ Found" : "✗ Missing"}`);
    console.log(`Using Embeddings Model: ${process.env.NEXT_PUBLIC_EMBEDDINGS_MODEL || 'text-embedding-3-small'}`);
    
    const documentsDir = process.argv[2] || './documents';
    const shouldClearExisting = process.argv[3] === '--clear' || process.argv[3] === '-c';
    
    if (shouldClearExisting) {
      const cleared = await clearExistingDocuments();
      if (!cleared) {
        console.log('Failed to clear existing documents. Proceeding with caution...');
      }
    } else {
      console.log('Warning: Running without clearing existing documents. This may result in duplicates.');
      console.log('To clear existing documents, run with the --clear or -c flag.');
    }
    
    if (!fs.existsSync(documentsDir)) {
      console.error(`Directory "${documentsDir}" does not exist.`);
      process.exit(1);
    }
    
    console.log(`Reading documents from "${documentsDir}"...`);
    const documents = await readDocumentsFromDirectory(documentsDir);
    
    if (documents.length === 0) {
      console.log('No documents found.');
      process.exit(0);
    }
    
    console.log(`Found ${documents.length} documents:`);
    documents.forEach((doc, index) => {
      console.log(`  ${index + 1}. ${path.basename(doc.filePath)} (${Math.round(doc.content.length / 1024 * 100) / 100} KB)`);
    });
    
    console.log("\nProcessing and embedding documents...");
    await processAndEmbedDocuments(documents);
    
    console.log("\nDocument embedding process completed successfully!");
  } catch (error) {
    console.error("Fatal error during document embedding process:", error);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error("Unhandled error:", error);
  process.exit(1);
}); 