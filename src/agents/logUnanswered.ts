

import { createClient } from "@/lib/supabase/server";


export async function logUnanswered(question: string, email: string): Promise<string> {
    
    const supabase = await createClient();

    const { data,error } = await supabase
    .from("unanswered_questions")
    .insert([{ question, email }]);

    if (error) {
      console.error("Error logging unanswered question:", error);
      return "I couldn’t log your question. Please try again later.";
    }
    console.log("Logged unanswered question:", data);

    return email
      ? "Thanks! We've saved your question and will follow up by email."
      : "I couldn’t find an answer. Would you like to share your email so we can follow up?";
  }
    