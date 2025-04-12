# Hiroo Chatbot

A custom AI chatbot built with Next.js, LangChain, OpenAI, and Supabase for the Hiroo platform.

## Architecture

The chatbot uses a streamlined architecture built on LangChain's components:

### Core Components

1. **Chatbot Orchestrator (`src/utils/chatbotOrchestrator.ts`)**
   - Central orchestrator that processes user questions
   - Handles question simplification, relevance checking, and response generation
   - Interacts with Supabase Vector Store for knowledge retrieval

2. **Chat Component (`src/components/Chat.tsx`)**
   - React component that provides the chat interface
   - Manages conversation state and history
   - Collects emails for unanswered questions

3. **Support Functions (`src/utils/supportFunctions.ts`)**
   - Helper functions for message formatting
   - Document handling utilities

### Flow

1. User submits a question
2. Question is simplified to improve search accuracy
3. System checks if the question is relevant to Hiroo
4. Knowledge base is searched for relevant information
5. Response is generated based on the search results
6. If no relevant information is found, the system offers to collect the user's email for follow-up

## Development

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
   OPENAI_API_KEY=your_openai_key
   ```
4. Run the development server: `npm run dev`

### Adding to the Knowledge Base

To add documents to the knowledge base:

1. Format your documents appropriately
2. Use the Supabase admin tools to upload to the vector store
3. Ensure metadata is correctly structured

### Customization

- Modify prompt templates in `chatbotOrchestrator.ts` to change AI behavior
- Adjust model parameters for different response characteristics
- Customize the UI components as needed

## Future Improvements

- Implement authentication flows
- Add additional search capabilities
- Enhance email collection and ticketing system
- Implement analytics for question tracking

## Features

- Question simplification to enhance search accuracy
- Knowledge base search using Supabase Vector Store
- Product relevance checking to filter out irrelevant questions
- Response generation based on knowledge base results
- Email collection for unanswered questions

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   ```

## Usage

### Basic Usage

```typescript
import { createLangchainOrchestrator } from './src/agents/langchainOrchestrator';
import { Message, createUserMessage } from './src/utils/chatMessageUtils';

// Create the orchestrator
const orchestrator = createLangchainOrchestrator();

// Initialize the orchestrator
await orchestrator.initialize(
  process.env.OPENAI_API_KEY!,
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Example conversation history
const history: Message[] = [];

// Process a user message
const userMessage = 'What is Hiroo?';
const userMessageObj = createUserMessage(userMessage);
history.push(userMessageObj);

const result = await orchestrator.processMessage(userMessage, history);
history.push(result.response);

console.log(result.response.content);
```

### Handling Unanswered Questions

The orchestrator will automatically handle unanswered questions by:

1. Checking if the question is reasonable and product-related
2. If reasonable, adding it to the unanswered questions database
3. Asking the user if they want to provide an email for follow-up

```typescript
// If waiting for email
if (result.waitingForEmail && result.lastQuestionId) {
  const emailInput = 'user@example.com';
  const emailMessageObj = createUserMessage(emailInput);
  history.push(emailMessageObj);

  const emailResult = await orchestrator.processMessage(
    emailInput,
    history,
    true,
    result.lastQuestionId
  );
  
  history.push(emailResult.response);
  console.log(emailResult.response.content);
}
```

## Example

See `src/examples/langchainExample.ts` for a complete example of how to use the orchestrator.

To run the example:

```
npx ts-node src/examples/langchainExample.ts
```

## Templates

The chatbot uses the following templates for LLM prompts:

- **Question Simplification**: Simplifies user questions to enhance search accuracy
- **Product Relevance**: Determines if a question is reasonable and related to the product
- **Response Generation**: Generates responses based on knowledge base results

These templates are defined in `src/agents/templates.ts` and can be customized as needed.

## License

MIT
