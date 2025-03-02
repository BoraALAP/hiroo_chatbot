import { addUnansweredQuestion, updateQuestionWithEmail } from '@/utils/unansweredQuestions';

/**
 * Creates an email collection utility for handling unanswered questions
 * @returns An object with email validation and handling functions
 */
export const createEmailCollector = () => {
  /**
   * Validates if a string is a valid email address
   * @param email The email to validate
   * @returns True if the email is valid, false otherwise
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Extracts an email address from a longer message if present
   * @param message The message that might contain an email
   * @returns The extracted email or null if none found
   */
  const extractEmailFromMessage = (message: string): string | null => {
    // This regex looks for email patterns in a longer text
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const matches = message.match(emailRegex);
    
    if (matches && matches.length > 0) {
      return matches[0]; // Return the first email found
    }
    
    return null;
  };

  /**
   * Checks if the user's response indicates they don't want to provide an email
   * @param response The user's response
   * @returns True if the user is declining to provide an email
   */
  const isDeclineEmail = (response: string): boolean => {
    const lowerResponse = response.toLowerCase().trim();
    const declinePatterns = [
      'no',
      'nope',
      'no thanks',
      'no thank you',
      'i don\'t want',
      'don\'t want',
      'decline',
      'skip',
      'not now',
      'later',
      'i\'d rather not',
      'i would rather not',
      'don\'t need',
      'no need',
      'not interested',
      'no email',
      'don\'t ask',
      'stop asking',
      'continue',
      'move on',
      'next question',
      'let\'s continue'
    ];
    
    return declinePatterns.some(pattern => lowerResponse.includes(pattern));
  };

  /**
   * Adds a question to the unanswered questions database
   * @param question The question to add
   * @param originalQuestion The original question (if different from the simplified version)
   * @returns The ID of the added question, or null if there was an error
   */
  const addUnansweredQuestionToDb = async (
    question: string,
    originalQuestion: string
  ): Promise<number | null> => {
    try {
      return await addUnansweredQuestion(question, originalQuestion);
    } catch (error) {
      console.error('Error adding unanswered question:', error);
      return null;
    }
  };

  /**
   * Updates a question with the user's email
   * @param questionId The ID of the question to update
   * @param email The user's email
   * @returns True if the update was successful, false otherwise
   */
  const updateQuestionWithEmailInDb = async (
    questionId: number,
    email: string
  ): Promise<boolean> => {
    try {
      await updateQuestionWithEmail(questionId, email);
      return true;
    } catch (error) {
      console.error('Error updating question with email:', error);
      return false;
    }
  };

  /**
   * Generates a message asking for the user's email
   * @param answerText The answer text to include in the message
   * @returns The message asking for the user's email
   */
  const generateEmailRequestMessage = (answerText: string): string => {
    return `${answerText} Would you like to provide your email address so we can notify you when we have an answer to your question? (You can type 'skip' if you prefer not to share your email.)`;
  };

  /**
   * Generates a confirmation message after receiving a valid email
   * @returns The confirmation message
   */
  const generateEmailConfirmationMessage = (email: string): string => {
    return `Thank you! We've saved your email (${email}) and will notify you when we have an answer to your question.`;
  };

  /**
   * Generates an error message for an invalid email
   * @returns The error message
   */
  const generateInvalidEmailMessage = (): string => {
    return "That doesn't look like a valid email address. Please provide a valid email so we can notify you when we have an answer, or type 'skip' to continue without providing an email.";
  };

  /**
   * Generates a message acknowledging the user's decision to not provide an email
   * @returns The acknowledgment message
   */
  const generateEmailDeclinedMessage = (): string => {
    return "No problem. Let's continue with our conversation. Is there anything else I can help you with?";
  };

  return {
    isValidEmail,
    isDeclineEmail,
    extractEmailFromMessage,
    addUnansweredQuestion: addUnansweredQuestionToDb,
    updateQuestionWithEmail: updateQuestionWithEmailInDb,
    generateEmailRequestMessage,
    generateEmailConfirmationMessage,
    generateInvalidEmailMessage,
    generateEmailDeclinedMessage,
  };
}; 