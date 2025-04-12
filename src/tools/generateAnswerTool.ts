import { DynamicTool} from "langchain/tools";
import { generateFinalAnswerChain } from "../agents/generateFinalAnswer";

export const generateAnswerTool = new DynamicTool({
  name: "generate_final_answer",
  description: "Generates a friendly response from knowledge base and question.",
  func: async (input: string) => {
    const parsed = JSON.parse(input); // must be stringified JSON
    const { question, knowledge, history } = parsed;
    const result = await generateFinalAnswerChain.invoke({ question, knowledge, history });
    return result;
  }
});