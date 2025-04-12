import { DynamicTool } from "langchain/tools";
import { relevanceCheckChain } from "../agents/checkRelevance";

export const relevanceTool = new DynamicTool({
  name: "check_relevance",
  description: "Checks if the question is about our product.",
  func: async (input: string) => {
    const relevant = await relevanceCheckChain.invoke({ question: input });
    return relevant ? "yes" : "no";
  }
});