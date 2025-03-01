-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create a table for storing documents and their embeddings
CREATE TABLE IF NOT EXISTS documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  metadata JSONB,
  embedding VECTOR(1536),  -- Adjust dimension based on your embedding model
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a function to match documents based on embedding similarity
-- This function signature matches what LangChain expects
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 5,
  filter JSONB DEFAULT '{}'
)
RETURNS TABLE (
  id BIGINT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM
    documents
  WHERE
    documents.metadata @> filter
  ORDER BY
    documents.embedding <=> query_embedding
  LIMIT
    match_count;
END;
$$;

-- Create a function to create the documents table if it doesn't exist
CREATE OR REPLACE FUNCTION create_documents_table_if_not_exists()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'documents') THEN
    CREATE TABLE documents (
      id BIGSERIAL PRIMARY KEY,
      content TEXT NOT NULL,
      metadata JSONB,
      embedding VECTOR(1536),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END;
$$;

-- Create an index for faster similarity searches
CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100); 