import { DynamicTool } from "langchain/tools";
import { searchSupabase } from "../agents/searchSupabase";

export const searchTool = new DynamicTool({
  name: "search_knowledge_base",
  description: "Searches the product knowledge base using a simplified query.",
  func: async (query: string) => {
    const result = await searchSupabase(query);
    return result || "no_result";
  }
});