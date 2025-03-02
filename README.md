# Hiroo Chatbot

A Next.js-based chatbot application that uses OpenAI's GPT models and a Supabase vector database to provide relevant answers to user questions.

## Architecture

The chatbot uses a functional agent-based architecture:

- **Orchestrator**: Coordinates the flow of conversation and delegates to specialized agents
- **Question Simplifier**: Simplifies complex questions for better search results
- **Knowledge Base Agent**: Searches the vector database for relevant information
- **Product Relevance Agent**: Determines if a question is related to products
- **Response Generator Agent**: Creates human-like responses based on available information
- **Email Collection Agent**: Handles collection of user emails when needed

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Set up the database:
   ```
   npm run setup-db
   ```
5. Embed documents:
   ```
   npm run embed
   ```

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Testing

### Manual Tests

You can test the chatbot functionality using the test scripts:

```bash
# Test general chat functionality
npm run test-chat-questions

# Test email collection functionality
npm run test-email-collection
```

The email collection test verifies that:
- Users can decline to provide their email
- Users can continue the conversation after being asked for an email
- The system properly handles valid email inputs

Example questions that should work:
- "How can I create a career page?"
- "How can I upgrade my membership?"

## Admin Tools

### Unanswered Questions

The system can track questions that couldn't be answered well:

1. Set up the unanswered questions table:
   ```
   npm run setup-unanswered
   ```

2. Add a test unanswered question:
   ```
   npm run test-add-unanswered
   ```

3. Assess unanswered questions for reasonableness:
   ```
   npm run assess-questions
   ```

### Document Management

1. Check for duplicate documents:
   ```
   npm run check-duplicates
   ```

2. Remove duplicate documents:
   ```
   npm run remove-duplicates
   ```

## Deployment

The application can be deployed to Vercel or any other Next.js-compatible hosting service.
