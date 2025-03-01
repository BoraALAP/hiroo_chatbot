import { createClient } from '@supabase/supabase-js';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';

// Define interfaces for the unanswered question
export interface UnansweredQuestion {
  id: number;
  processed_question: string;
  is_reasonable?: boolean;
  reason?: string;
  status: 'pending' | 'reviewed' | 'added_to_kb';
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ReasonablenessAssessment {
  isReasonable: boolean;
  reason: string;
}

/**
 * Creates a chain to assess if a question is reasonable
 */
export function createQuestionReasonablenessChain(llm: ChatOpenAI) {
  const template = `You are an AI assistant tasked with determining if a user's question is reasonable and should be added to a knowledge base.
  
  A reasonable question is one that:
  1. Is clear and understandable
  2. Is related to the product or service
  3. Could be answered with factual information
  4. Is not offensive, harmful, or nonsensical
  5. Is not a personal question about the AI
  
  User Question: {question}
  
  First, determine if this question is reasonable based on the criteria above.
  Then, provide a brief reason for your determination.
  
  Output your answer in the following format:
  Reasonable: [Yes/No]
  Reason: [Brief explanation]`;

  const prompt = PromptTemplate.fromTemplate(template);
  
  const chain = RunnableSequence.from([
    prompt,
    llm,
    new StringOutputParser(),
  ]);
  
  return {
    invoke: async ({ 
      question, 
      processedQuestion 
    }: { 
      question: string, 
      processedQuestion?: string 
    }): Promise<ReasonablenessAssessment> => {
      try {
        // Prioritize the processed question if available, otherwise fall back to the original
        const questionToUse = processedQuestion || question;
        
        const result = await chain.invoke({ 
          question: questionToUse
        });
        
        // Parse the result
        const reasonableMatch = result.match(/Reasonable:\s*(Yes|No)/i);
        const reasonMatch = result.match(/Reason:\s*(.*?)(\n|$)/);
        
        const isReasonable = reasonableMatch ? reasonableMatch[1].toLowerCase() === 'yes' : false;
        const reason = reasonMatch ? reasonMatch[1].trim() : 'No reason provided';
        
        return {
          isReasonable,
          reason
        };
      } catch (error) {
        console.error('Error assessing question reasonableness:', error);
        return {
          isReasonable: false,
          reason: 'Error processing question'
        };
      }
    }
  };
}

/**
 * Adds an unanswered question to the database
 */
export async function addUnansweredQuestion(
  question: string,
  processedQuestion?: string,
  userId?: string
): Promise<number | null> {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return null;
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    
    // Add the question to the database
    const { data, error } = await supabaseClient
      .from('unanswered_questions')
      .insert([
        {
          question,
          processed_question: processedQuestion,
          user_id: userId,
          status: 'pending'
        }
      ])
      .select('id');
    
    if (error) {
      console.error('Error adding unanswered question:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.error('No data returned after inserting unanswered question');
      return null;
    }
    
    return data[0].id;
  } catch (error) {
    console.error('Error in addUnansweredQuestion:', error);
    return null;
  }
}

/**
 * Updates the assessment for an unanswered question
 */
export async function updateQuestionAssessment(
  questionId: number,
  assessment: ReasonablenessAssessment
): Promise<boolean> {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return false;
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    
    // Update the question assessment
    const { error } = await supabaseClient
      .from('unanswered_questions')
      .update({
        is_reasonable: assessment.isReasonable,
        reason: assessment.reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', questionId);
    
    if (error) {
      console.error('Error updating question assessment:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateQuestionAssessment:', error);
    return false;
  }
}

/**
 * Gets all unanswered questions
 */
export async function getUnansweredQuestions(): Promise<UnansweredQuestion[]> {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return [];
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    
    // Get all unanswered questions
    const { data, error } = await supabaseClient
      .from('unanswered_questions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting unanswered questions:', error);
      return [];
    }
    
    return data as UnansweredQuestion[];
  } catch (error) {
    console.error('Error in getUnansweredQuestions:', error);
    return [];
  }
}

/**
 * Updates the status of an unanswered question
 */
export async function updateQuestionStatus(
  questionId: number,
  status: 'pending' | 'reviewed' | 'added_to_kb'
): Promise<boolean> {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return false;
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    
    // Update the question status
    const { error } = await supabaseClient
      .from('unanswered_questions')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', questionId);
    
    if (error) {
      console.error('Error updating question status:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateQuestionStatus:', error);
    return false;
  }
}

/**
 * Marks a question as added to the knowledge base
 * @param questionId The ID of the question to mark
 * @returns A boolean indicating success or failure
 */
export async function markQuestionAddedToKB(questionId: number): Promise<boolean> {
  try {
    // Use the updateQuestionStatus function to mark the question as added to KB
    const success = await updateQuestionStatus(questionId, 'added_to_kb');
    
    if (success) {
      console.log(`Question ID ${questionId} marked as added to knowledge base`);
    } else {
      console.error(`Failed to mark question ID ${questionId} as added to knowledge base`);
    }
    
    return success;
  } catch (error) {
    console.error('Error in markQuestionAddedToKB:', error);
    return false;
  }
}

/**
 * Gets all pending unanswered questions
 * @param limit Optional maximum number of questions to return
 * @returns An array of pending unanswered questions
 */
export async function getPendingQuestions(limit?: number): Promise<UnansweredQuestion[]> {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return [];
    }
    
    const supabaseClient = createClient(supabaseUrl, supabaseKey);
    
    // Build the query
    let query = supabaseClient
      .from('unanswered_questions')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    // Apply limit if provided
    if (limit && limit > 0) {
      query = query.limit(limit);
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error('Error getting pending questions:', error);
      return [];
    }
    
    return data as UnansweredQuestion[];
  } catch (error) {
    console.error('Error in getPendingQuestions:', error);
    return [];
  }
} 