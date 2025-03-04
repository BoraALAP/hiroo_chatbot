# Hiroo Chatbot

A chatbot for Hiroo that answers questions about the platform using LangChain and OpenAI.

## Features

- Question simplification to enhance search accuracy
- Knowledge base search using Supabase Vector Store
- Product relevance checking to filter out irrelevant questions
- Response generation based on knowledge base results
- Email collection for unanswered questions

## Architecture

The chatbot uses a simplified architecture with a single LangChain orchestrator that handles all operations:

1. **Question Simplification**: Simplifies user questions to enhance search accuracy
2. **Knowledge Base Search**: Searches for relevant information in the Supabase Vector Store
3. **Product Relevance Checking**: Determines if a question is reasonable and related to the product
4. **Response Generation**: Generates responses based on knowledge base results
5. **Email Collection**: Collects user emails for questions that can't be answered

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
