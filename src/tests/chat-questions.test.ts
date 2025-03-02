import { createQuestionSimplifier } from '../agents/questionSimplifier';
import { createKnowledgeBase } from '../agents/knowledgeBaseAgent';
import { createProductRelevanceChecker } from '../agents/productRelevanceAgent';
import { createResponseGenerator } from '../agents/responseGeneratorAgent';
import { createOrchestrator } from '../agents/orchestrator';

// Mock dependencies
jest.mock('../agents/questionSimplifier', () => ({
  createQuestionSimplifier: jest.fn(),
}));

jest.mock('../agents/knowledgeBaseAgent', () => ({
  createKnowledgeBase: jest.fn(),
}));

jest.mock('../agents/productRelevanceAgent', () => ({
  createProductRelevanceChecker: jest.fn(),
}));

jest.mock('../agents/responseGeneratorAgent', () => ({
  createResponseGenerator: jest.fn(),
}));

describe('Chat Questions Tests', () => {
  // Setup mocks
  const mockSimplifyQuestion = jest.fn();
  const mockSearch = jest.fn();
  const mockCheckProductRelevance = jest.fn();
  const mockGenerateResponse = jest.fn();
  const mockInitialize = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock question simplifier
    (createQuestionSimplifier as jest.Mock).mockReturnValue(mockSimplifyQuestion);
    
    // Mock knowledge base
    (createKnowledgeBase as jest.Mock).mockReturnValue({
      initialize: mockInitialize,
      search: mockSearch,
    });
    
    // Mock product relevance checker
    (createProductRelevanceChecker as jest.Mock).mockReturnValue(mockCheckProductRelevance);
    
    // Mock response generator
    (createResponseGenerator as jest.Mock).mockReturnValue(mockGenerateResponse);
    
    // Default mock implementations
    mockInitialize.mockResolvedValue(true);
    mockSimplifyQuestion.mockImplementation((question) => Promise.resolve(`Simplified: ${question}`));
    mockSearch.mockResolvedValue(null); // Default to no knowledge base results
    mockCheckProductRelevance.mockResolvedValue(false); // Default to not product-related
    mockGenerateResponse.mockImplementation((question) => Promise.resolve(`Response to: ${question}`));
  });
  
  test('Question: "How can I create a career page?"', async () => {
    // Setup specific mocks for this test
    mockSearch.mockResolvedValueOnce('Career pages can be created in the Admin section under "Pages".');
    
    // Create orchestrator
    const orchestrator = createOrchestrator();
    await orchestrator.initialize('fake-api-key', 'fake-supabase-url', 'fake-supabase-key');
    
    // Process the message
    const result = await orchestrator.processMessage('How can I create a career page?');
    
    // Verify the flow
    expect(mockSimplifyQuestion).toHaveBeenCalledWith('How can I create a career page?');
    expect(mockSearch).toHaveBeenCalledWith('Simplified: How can I create a career page?');
    expect(mockGenerateResponse).toHaveBeenCalled();
    
    // Verify we didn't need to check product relevance since KB had an answer
    expect(mockCheckProductRelevance).not.toHaveBeenCalled();
    
    // Verify the response contains information from the knowledge base
    expect(result.response.content).toContain('Response to: How can I create a career page?');
    expect(result.waitingForEmail).toBe(false);
    expect(result.lastQuestionId).toBeNull();
  });
  
  test('Question: "How can I upgrade my membership?"', async () => {
    // Setup specific mocks for this test
    mockSearch.mockResolvedValueOnce(null); // No KB results
    mockCheckProductRelevance.mockResolvedValueOnce(true); // It's product-related
    
    // Mock the email collection functions
    const mockAddUnansweredQuestion = jest.fn().mockResolvedValue(123); // Return question ID
    const mockGenerateEmailRequestMessage = jest.fn().mockReturnValue(
      "I don't have specific information about that yet. Would you like to provide your email address?"
    );
    
    // Override the createEmailCollector mock
    jest.mock('../agents/emailCollectionAgent', () => ({
      createEmailCollector: jest.fn().mockReturnValue({
        addUnansweredQuestion: mockAddUnansweredQuestion,
        generateEmailRequestMessage: mockGenerateEmailRequestMessage,
        // Add other required methods with empty implementations
        isValidEmail: jest.fn(),
        updateQuestionWithEmail: jest.fn(),
        generateEmailConfirmationMessage: jest.fn(),
        generateInvalidEmailMessage: jest.fn(),
      }),
    }));
    
    // Create orchestrator
    const orchestrator = createOrchestrator();
    await orchestrator.initialize('fake-api-key', 'fake-supabase-url', 'fake-supabase-key');
    
    // Process the message
    const result = await orchestrator.processMessage('How can I upgrade my membership?');
    
    // Verify the flow
    expect(mockSimplifyQuestion).toHaveBeenCalledWith('How can I upgrade my membership?');
    expect(mockSearch).toHaveBeenCalledWith('Simplified: How can I upgrade my membership?');
    expect(mockCheckProductRelevance).toHaveBeenCalled();
    
    // Verify we're waiting for an email
    expect(result.waitingForEmail).toBe(true);
    expect(result.lastQuestionId).not.toBeNull();
    expect(result.response.content).toContain("Would you like to provide your email address?");
  });
}); 