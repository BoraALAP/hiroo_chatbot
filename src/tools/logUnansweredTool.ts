import { DynamicTool } from "langchain/tools";
import { logUnanswered } from "../agents/logUnanswered";

export const logUnansweredTool = new DynamicTool({
  name: "log_unanswered_question",
  description: "Log the user's original question and extracted email to the database. Input should be JSON with 'question' and 'email' fields.",
  func: async (input: string) => {
    try {
      // Make sure parsing is robust
      let parsedInput;
      try {
        parsedInput = JSON.parse(input);
      } catch (e) {
        // If not valid JSON, try to extract question and email manually
        console.error("Failed to parse JSON input for logUnansweredTool:", e);
        return "Error: Input must be valid JSON with question and email fields";
      }

      const { question, email } = parsedInput;
      
      if (!question) {
        return "Error: Missing 'question' field in input";
      }
      
      // Log the question and email
      return await logUnanswered(question, email || null);
    } catch (error) {
      console.error("Error in logUnansweredTool:", error);
      return "An error occurred while logging the unanswered question";
    }
  }
});