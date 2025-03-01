import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';

/**
 * Creates a standalone question chain that removes unnecessary words and context
 * to make the question more direct and easier for retrieval
 */
export function createStandaloneQuestionChain(llm: ChatOpenAI) {
  const template = `Given a question, convert it to a standalone question that is concise and focused.
  Remove any unnecessary context, pleasantries, or explanations.
  The standalone question should be clear and directly ask for the information needed.

  Original Question: {question}
  Previous conversation history (if any): {history}

  Standalone Question:`;

  const prompt = PromptTemplate.fromTemplate(template);
  
  return prompt
    .pipe(llm)
    .pipe(new StringOutputParser());
}

/**
 * Creates a question rephrasing chain that improves the question for better retrieval
 * by adding relevant keywords and making it more specific
 */
export function createQuestionRephrasingChain(llm: ChatOpenAI) {
  const template = `Rephrase the following question to make it more effective for retrieval from a knowledge base.
  Add relevant keywords that might appear in the answer and make the question more specific.
  
  Original Question: {question}
  
  Rephrased Question:`;

  const prompt = PromptTemplate.fromTemplate(template);
  
  return prompt
    .pipe(llm)
    .pipe(new StringOutputParser());
}

/**
 * Creates a query decomposition chain that breaks down complex questions
 * into simpler sub-questions for better retrieval
 */
export function createQueryDecompositionChain(llm: ChatOpenAI) {
  const template = `Break down the following complex question into 2-3 simpler sub-questions that would help answer the original question.
  Each sub-question should be focused on a specific aspect of the original question.
  
  Original Question: {question}
  
  Sub-questions:`;

  const prompt = PromptTemplate.fromTemplate(template);
  
  return prompt
    .pipe(llm)
    .pipe(new StringOutputParser());
}

/**
 * Creates a combined question processing chain that applies multiple processing steps
 * to optimize the question for retrieval
 */
export function createCombinedQuestionProcessingChain(llm: ChatOpenAI) {
  const standaloneChain = createStandaloneQuestionChain(llm);
  
  // This chain first converts to a standalone question, then processes the result
  return RunnableSequence.from([
    {
      processedQuestion: async (input: { question: string, history: string }) => {
        const standaloneQuestion = await standaloneChain.invoke({ 
          question: input.question,
          history: input.history
        });
        return standaloneQuestion.trim();
      },
      originalQuestion: (input: { question: string, history: string }) => input.question,
    },
    // You can add additional processing here if needed
    (input) => {
      return {
        processedQuestion: input.processedQuestion,
        originalQuestion: input.originalQuestion,
      };
    },
  ]);
}

/**
 * Utility function to test different question processing chains
 */
export async function testQuestionProcessing(
  question: string, 
  llm: ChatOpenAI,
  history: [],
) {
  const standaloneChain = createStandaloneQuestionChain(llm);
  const rephrasingChain = createQuestionRephrasingChain(llm);
  const decompositionChain = createQueryDecompositionChain(llm);
  
  console.log("Original Question:", question);
  
  const standaloneQuestion = await standaloneChain.invoke({ question, history });
  console.log("Standalone Question:", standaloneQuestion);
  
  const rephrasedQuestion = await rephrasingChain.invoke({ question });
  console.log("Rephrased Question:", rephrasedQuestion);
  
  const subQuestions = await decompositionChain.invoke({ question });
  console.log("Sub-questions:", subQuestions);
  
  return {
    original: question,
    standalone: standaloneQuestion,
    rephrased: rephrasedQuestion,
    subQuestions: subQuestions,
  };
} 