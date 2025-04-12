import { DynamicTool } from "langchain/tools";
import { extractEmailChain } from "../agents/extractEmail";

export const extractEmailTool = new DynamicTool({
  name: "extract_email",
  description: "Extract email address from user message. ALWAYS use this tool BEFORE using log_unanswered_question.",
  func: async (message: string) => {
    console.log("extract email tool");
    const res =  await extractEmailChain.invoke({ message });
    console.log("extract email tool", res);
    return res;
  }
});