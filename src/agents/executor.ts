import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor } from "langchain/agents";
import { createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// Import tools from the separate tool files
import { simplifyTool } from "../tools/simplifyTool";
import { relevanceTool } from "../tools/relevanceTool";
import { searchTool } from "../tools/searchTool";
import { generateAnswerTool } from "../tools/generateAnswerTool";
import { extractEmailTool } from "../tools/extractEmailTool";
import { logUnansweredTool } from "../tools/logUnansweredTool";

export async function getAgentExecutor() {
  // Update tool descriptions to clarify the correct sequence
  const tools = [
    simplifyTool,
    relevanceTool,
    searchTool,
    generateAnswerTool,
    extractEmailTool,
    logUnansweredTool
  ];

  // Add logging wrapper to each tool
  tools.forEach(tool => {
    const originalFunc = tool.func;
    tool.func = async (input) => {
      console.log(`🔧 Tool Called: ${tool.name}`, { input });
      const result = await originalFunc(input);
      
      // Format the log output based on the result type
      if (tool.name === "search_knowledge_base" && result !== "no_result") {
        console.log(`📊 ${tool.name} found ${Array.isArray(result) ? result.length : 0} results`);
        if (Array.isArray(result) && result.length > 0) {
          console.log(`📊 Top result scores:`, result.slice(0, 3).map(r => r[1]));
        }
      } else {
        // Truncate long results for readability
        const logResult = typeof result === 'string' && result.length > 100 
          ? `${result.substring(0, 100)}...` 
          : result;
        console.log(`✅ ${tool.name} result:`, logResult);
      }
      
      return result;
    };
  });

  const model = new ChatOpenAI({ modelName: "gpt-4-turbo", temperature: 0 });

  // Update prompt to be more explicit about tool calling sequence
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", `You are an AI assistant for Hiroo, an HR platform that helps companies create career pages, 
job boards, and manage their recruiting process.

IMPORTANT INSTRUCTIONS:
1. ONLY answer questions using information from the knowledge base results provided to you.
2. If the knowledge base results don't contain relevant information, DO NOT make up an answer.
3. If you're unsure or don't have enough information, say: "I don't have specific information about that in my knowledge base. Would you like to leave your email so we can follow up?"
4. Every question should be interpreted as being about Hiroo unless clearly unrelated to any HR platform.
5. Respond in a helpful, professional tone.

TOOL SEQUENCE REQUIREMENTS:
- When handling email collection, ALWAYS use extract_email tool FIRST, then use log_unanswered_question with the extracted email.
- NEVER call log_unanswered_question directly with a raw message containing an email.
- The proper sequence for handling unanswered questions is:
  1. simplify_question
  2. search_knowledge_base
  3. If no results, ask for email
  4. When user provides email, use extract_email
  5. If user doesn't provide email, use log_unanswered_question with original question
  6. Then use log_unanswered_question with original question and extracted email`],
    ["placeholder", "{chat_history}"],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"],
  ]);

  const agent = await createToolCallingAgent({ llm: model, tools, prompt });
  
  // Create the executor with verbose mode enabled
  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    verbose: true,
  });

  // Add execution tracking
  const originalExecute = agentExecutor.invoke.bind(agentExecutor);
  agentExecutor.invoke = async (input) => {
    console.log("\n🤖 ===== AGENT EXECUTION STARTED =====");
    console.log(`📝 Input: "${input.input}"`);
    console.time("⏱️ Execution time");
    
    try {
      const result = await originalExecute(input);
      console.timeEnd("⏱️ Execution time");
      console.log("✅ Agent execution completed successfully");
      return result;
    } catch (error) {
      console.timeEnd("⏱️ Execution time");
      console.error("❌ Agent execution failed:", error);
      throw error;
    }
  };

  return agentExecutor;
}