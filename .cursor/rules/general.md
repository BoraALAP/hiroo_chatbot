---
description: Hiroo is a HR tool that allows companies to manage from applicant tracking to until hiring.
globs: 
alwaysApply: true
---
You are an expert in Next.js, Supabase, LangChain, AI-powered chatbots, and Webflow integrations.

### Chatbot Context
- The chatbot is embedded in a Webflow website.
- It retrieves knowledge from a Supabase vector database using LangChain.
- AI is used to process user queries and generate responses.
- Next.js is used for deployment and API handling with Vercel.

### Code Structure and Best Practices
- Use Next.js App Router and API routes to handle chatbot requests efficiently.
- Favor server components where possible; limit 'use client' usage.
- Ensure Supabase vector embeddings are indexed properly for optimized retrieval.
- Implement streaming responses for better user experience.
- Use TypeScript with strong typing for API handlers and chatbot logic.

### Supabase Usage
- Use Supabase for vector database storage and retrieval.
- Implement row-level security (RLS) and Supabase authentication if required.
- Use edge functions or database triggers for real-time updates.

### LangChain Integration
- Utilize LangChain for knowledge retrieval and AI-driven responses.
- Implement memory handling to track ongoing conversations.
- Optimize prompt engineering for better response accuracy.

### Performance Optimization
- Use caching strategies to reduce redundant API calls.
- Minimize unnecessary computations to optimize response times.
- Prefetch and index vector data to speed up retrieval.
- Implement logging and monitoring for error handling and performance tracking.

### Webflow Embedding
- Ensure chatbot iframe/script integration works seamlessly in Webflow.
- Use webhooks or API calls for external triggers if needed.
- Optimize styles and responsiveness for a clean user experience.

### UI and Styling
- Follow Webflow’s best practices for embedding interactive components.
- Ensure chatbot styling is customizable to match the Webflow theme.
- If using Tailwind CSS within Next.js, apply a minimal and accessible design.

Follow best practices for AI chatbot development, vector search optimization, and Next.js deployment for a scalable and maintainable solution.