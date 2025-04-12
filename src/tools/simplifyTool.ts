import { DynamicTool } from "langchain/tools";
import { simplifyChain } from "../agents/simplifyQuestions";

export const simplifyTool = new DynamicTool({
  name: "simplify_question",
  description: "Simplifies a question for semantic search.",
  func: async (input: string) => {
    return await simplifyChain.invoke({ question: input });
  }
});