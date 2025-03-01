# Help Center Chatbot

A powerful AI-powered chatbot for help centers that can be embedded in Webflow websites. This chatbot uses LangChain, OpenAI, and Supabase to provide accurate answers to user questions based on your product documentation.

## Features

- 🤖 AI-powered chatbot using LangChain and OpenAI
- 🔍 Vector search for accurate document retrieval
- 💾 Supabase integration for storing and querying embeddings
- 🌐 Easy to embed in Webflow or any website
- 📱 Fully responsive design
- 🎨 Customizable UI
- ⚡ Client-side processing for faster responses

## Prerequisites

- Node.js 18+ and npm
- OpenAI API key
- Supabase account and project

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/help-center-chatbot.git
cd help-center-chatbot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory with the following variables:

```
# OpenAI API Key
NEXT_PUBLIC_OPENAI_API_KEY=your-openai-api-key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: Model configuration
NEXT_PUBLIC_AI_MODEL=gpt-4-turbo
NEXT_PUBLIC_EMBEDDINGS_MODEL=text-embedding-3-small
```

### 4. Set up Supabase

1. Create a new Supabase project
2. Enable the Vector extension in the SQL editor by running:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
3. Run the SQL commands from `supabase/setup.sql` in the Supabase SQL editor to:
   - Create the documents table with vector support
   - Create the similarity search function
   - Create an index for faster similarity searches

Alternatively, you can use our automated setup script:

```bash
npm run setup-db
```

This script will:
- Connect to your Supabase instance using the credentials in your `.env.local` file
- Execute all the necessary SQL commands to set up the vector store
- If the `exec_sql` function doesn't exist, it will provide instructions to create it first

For more information on setting up Supabase with LangChain, refer to the [official documentation](https://python.langchain.com/docs/integrations/vectorstores/supabase/).

### 5. Add your documents

Place your markdown or text documents in the `documents` directory. These will be used to train the chatbot.

### 6. Embed your documents

Run the embedding script to process your documents and store them in Supabase:

```bash
npm run embed
```

For markdown documents with headers, you can use our enhanced embedding script that preserves header structure as metadata:

```bash
npm run embed:headers
```

This script uses LangChain's document processing capabilities to:
- Split documents based on markdown headers
- Preserve header hierarchy in metadata
- Improve retrieval relevance by maintaining document structure

### 7. Run the development server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your chatbot in action.

## Architecture

This chatbot uses a client-side architecture for better performance:

- **Direct LangChain Integration**: The Chat component uses LangChain directly in the browser, eliminating the need for API routes.
- **Supabase Vector Store**: Documents are stored and retrieved using Supabase's vector store capabilities.
- **Markdown Processing**: Enhanced document processing preserves header structure for better context retrieval.

## Deployment

### Deploying to Vercel

1. Push your code to a GitHub repository
2. Create a new project in Vercel
3. Connect your GitHub repository
4. Add your environment variables
5. Deploy

### Embedding in Webflow

1. Deploy your Next.js application
2. Add the following script to your Webflow site's custom code section:

```html
<script src="https://your-deployed-url.vercel.app/embed.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    window.HelpCenterChatbot.init({
      position: 'bottom-right',
      primaryColor: '#0070f3',
      greeting: 'Hi there! How can I help you today?'
    });
  });
</script>
```

## Customization

You can customize the chatbot by modifying the following files:

- `src/components/Chat.tsx`: Main chatbot component
- `src/components/ChatMessage.tsx`: Message styling
- `src/components/ChatInput.tsx`: Input field styling

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Unanswered Questions Tracking

This chatbot includes a feature to track questions that couldn't be answered because the information wasn't found in the knowledge base. This helps you identify gaps in your documentation and improve your knowledge base over time.

### How it works

1. When a user asks a question that can't be answered from the existing documents, the question is stored in a database.
2. An AI agent assesses if the question is reasonable and should be added to the knowledge base.
3. Administrators can review these questions in the admin dashboard at `/admin/unanswered`.
4. Once content is added to address a question, it can be marked as "Added to KB" in the admin interface.

### Setup

To set up the unanswered questions tracking:

```bash
# Set up the unanswered questions table in Supabase
npm run setup-unanswered

# Test the question reasonableness assessment
npm run test-reasonableness
```

### Admin Dashboard

Access the admin dashboard at `/admin/unanswered` to:
- View all unanswered questions
- See AI assessments of question reasonableness
- Mark questions as added to the knowledge base once content has been created

This feature helps you continuously improve your chatbot by identifying and filling knowledge gaps.
