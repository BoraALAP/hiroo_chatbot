# Supabase Vector Store Setup Guide

This guide provides detailed instructions for setting up a Supabase vector store for use with LangChain in the Help Center Chatbot.

## Prerequisites

- A Supabase account (free tier works fine)
- Your OpenAI API key for generating embeddings
- Basic knowledge of SQL and database concepts

## Setup Options

You have two options for setting up the Supabase vector store:

### Option 1: Automated Setup (Recommended)

1. Ensure your `.env.local` file contains the correct Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_OPENAI_API_KEY=your-openai-api-key
   ```

2. Run the automated setup script:
   ```bash
   npm run setup-db
   ```

3. If prompted to create the `exec_sql` function, follow these steps:
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Create a new query
   - Paste the provided SQL code for the `exec_sql` function
   - Run the query
   - Run the setup script again: `npm run setup-db`

### Option 2: Manual Setup

1. Create a new Supabase project from the [Supabase dashboard](https://app.supabase.com/)

2. Enable the Vector extension:
   - Go to the SQL Editor in your Supabase project
   - Create a new query
   - Run the following SQL:
     ```sql
     CREATE EXTENSION IF NOT EXISTS vector;
     ```

3. Create the documents table and functions:
   - Go to the SQL Editor in your Supabase project
   - Create a new query
   - Open the file `supabase/setup.sql` from this project
   - Copy and paste the entire contents into the SQL Editor
   - Run the query

## Database Schema

The setup creates the following:

### Tables

- `documents`: Stores document chunks and their vector embeddings
  - `id`: UUID primary key
  - `content`: Text content of the document chunk
  - `metadata`: JSON object with metadata (source, page numbers, etc.)
  - `embedding`: Vector representation of the content

### Functions

- `match_documents`: Performs similarity search on document embeddings
  - Parameters:
    - `query_embedding`: The vector embedding of the search query
    - `match_count`: Number of results to return (default: 10)
    - `filter`: Optional JSON object for filtering results

## Client-Side Integration

This chatbot uses a client-side architecture for better performance:

- **Direct LangChain Integration**: The Chat component uses LangChain directly in the browser, eliminating the need for API routes.
- **Supabase Vector Store**: Documents are stored and retrieved using Supabase's vector store capabilities.
- **Markdown Processing**: Enhanced document processing preserves header structure for better context retrieval.

This approach offers several advantages:
- **Better Performance**: Eliminates network round-trips to API routes
- **Improved Context**: Preserves document structure through header metadata
- **More Direct**: Uses LangChain's capabilities directly without unnecessary abstraction
- **Better Maintainability**: Simplifies the codebase by removing API routes

## Testing the Setup

After completing the setup, you can test if everything is working correctly:

```bash
npm run test-vector
```

This will:
1. Connect to your Supabase instance
2. Create a test embedding
3. Perform a similarity search
4. Display the results

If successful, you should see a message indicating that the vector store is working correctly.

## Troubleshooting

### Common Issues

1. **"relation 'documents' does not exist"**
   - The documents table hasn't been created. Run the setup script or manually execute the SQL in `supabase/setup.sql`.

2. **"function match_documents does not exist"**
   - The match_documents function hasn't been created. Run the setup script or manually execute the SQL in `supabase/setup.sql`.

3. **"extension 'vector' is not available"**
   - Your Supabase instance doesn't have the vector extension enabled. Contact Supabase support if you can't enable it.

4. **"permission denied for schema public"**
   - Your Supabase user doesn't have the necessary permissions. Make sure you're using the correct credentials.

5. **"Missing OpenAI API key"**
   - Make sure you've set the `NEXT_PUBLIC_OPENAI_API_KEY` environment variable in your `.env.local` file.

### Getting Help

If you encounter issues not covered here:
1. Check the [Supabase documentation](https://supabase.com/docs)
2. Check the [LangChain documentation](https://js.langchain.com/docs/integrations/vectorstores/supabase)
3. Open an issue in the project repository

## Next Steps

After setting up the vector store:

1. Add your documents to the `documents` directory
2. Run the embedding script to process and store your documents:
   ```bash
   npm run embed
   ```
   
   For markdown documents with headers, use our enhanced embedding script:
   ```bash
   npm run embed:headers
   ```
   
   The enhanced script provides better retrieval by:
   - Preserving document structure based on headers
   - Storing header information as metadata
   - Enabling more contextual responses

3. Start the development server:
   ```bash
   npm run dev
   ```

## Advanced Configuration

### Customizing the Vector Store

You can customize the vector store by modifying the `supabase/setup.sql` file:

- Change the vector dimensions (default: 1536 for OpenAI embeddings)
- Modify the similarity search function
- Add additional indexes for better performance

Remember to run the setup script again after making changes.

### Using Different Embedding Models

If you want to use a different embedding model:

1. Update the `NEXT_PUBLIC_EMBEDDINGS_MODEL` in your `.env.local` file
2. Modify the vector dimensions in `supabase/setup.sql` to match your model's output
3. Run the setup script again 