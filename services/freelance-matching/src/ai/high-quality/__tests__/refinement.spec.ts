import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HighQualityModelService, RefinementRequest } from '../high-quality-model.service';
import { Match } from '../../../match/match.service';

// Mock LangChain components
jest.mock('@langchain/openai', () => ({
  ChatOpenAI: jest.fn().mockImplementation(() => ({
    bind: jest.fn().mockReturnThis(),
    invoke: jest.fn().mockResolvedValue('Mocked response from LangChain'),
  })),
}));

// Mock JsonOutputParser
jest.mock('@langchain/core/output_parsers', () => {
  const original = jest.requireActual('@langchain/core/output_parsers');
  return {
    ...original,
    JsonOutputParser: jest.fn().mockImplementation(() => ({
      invoke: jest.fn().mockImplementation((text) => {
        // This mock will be overridden in individual tests
        return [];
      }),
    })),
  };
});

describe('HighQualityModelService - Refinement', () => {
  let service: HighQualityModelService;
  let mockJsonOutputParser;

  // Sample test data
  const mockMatches: Match[] = [
    { id: 'match-1', similarity: 0.95, score: 95 },
    { id: 'match-2', similarity: 0.85, score: 85 },
    { id: 'match-3', similarity: 0.75, score: 75 },
  ];

  const mockRequest: RefinementRequest = {
    sourceType: 'freelancer',
    sourceId: 'user-123',
    matches: mockMatches,
    limit: 3,
  };

  const mockRefinedMatches = [
    { 
      id: 'match-2', 
      similarity: 0.85, 
      score: 85, 
      adjustedScore: 90, 
      explanation: 'Better match based on skills' 
    },
    { 
      id: 'match-1', 
      similarity: 0.95, 
      score: 95, 
      adjustedScore: 85, 
      explanation: 'High similarity but less relevant experience' 
    },
    { 
      id: 'match-3', 
      similarity: 0.75, 
      score: 75, 
      adjustedScore: 65, 
      explanation: 'Lower relevance overall' 
    },
  ];

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'OPENAI_API_KEY') return 'test-api-key';
      return null;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Reset the JsonOutputParser mock
    mockJsonOutputParser = {
      invoke: jest.fn().mockResolvedValue(mockRefinedMatches),
    };
    
    jest.mock('@langchain/core/output_parsers', () => ({
      ...jest.requireActual('@langchain/core/output_parsers'),
      JsonOutputParser: jest.fn().mockImplementation(() => mockJsonOutputParser),
    }));
    
    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        HighQualityModelService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = testingModule.get<HighQualityModelService>(HighQualityModelService);
    
    // Override the chain invoke method for testing
    (service as any).createJsonParsingChain = jest.fn().mockImplementation(() => ({
      invoke: mockJsonOutputParser.invoke,
    }));
  });

  it('should refine matches and return sorted results', async () => {
    // Mock the JSON parser to return valid refined matches
    mockJsonOutputParser.invoke.mockResolvedValueOnce(mockRefinedMatches);
    
    const result = await service.refineMatches(mockRequest);
    
    expect(result).toHaveProperty('matches');
    expect(result).toHaveProperty('latencyMs');
    expect(result).toHaveProperty('tokenUsage');
    expect(result.matches).toHaveLength(3);
    
    // Check if matches are sorted by adjustedScore (descending)
    expect(result.matches[0].adjustedScore).toBeGreaterThanOrEqual(result.matches[1].adjustedScore);
    expect(result.matches[1].adjustedScore).toBeGreaterThanOrEqual(result.matches[2].adjustedScore);
    
    // Check if explanations are included
    expect(result.matches[0].explanation).toBeDefined();
    expect(typeof result.matches[0].explanation).toBe('string');
  });

  it('should handle invalid JSON responses gracefully', async () => {
    // Mock a parsing error
    mockJsonOutputParser.invoke.mockRejectedValueOnce(new Error('Invalid JSON'));
    
    const result = await service.refineMatches(mockRequest);
    
    // Should fall back to original matches with default explanations
    expect(result.matches).toHaveLength(3);
    expect(result.matches[0].explanation).toContain('Could not generate explanation');
    expect(result.matches[0].adjustedScore).toBe(result.matches[0].score);
  });

  it('should handle non-array responses gracefully', async () => {
    // Mock a non-array response
    mockJsonOutputParser.invoke.mockResolvedValueOnce({ error: 'Not an array' });
    
    const result = await service.refineMatches(mockRequest);
    
    // Should fall back to original matches with default explanations
    expect(result.matches).toHaveLength(3);
    expect(result.matches[0].explanation).toContain('Could not generate explanation');
  });

  it('should handle missing fields in response objects', async () => {
    // Mock response with missing fields
    const incompleteMatches = [
      { id: 'match-1' }, // Missing other fields
      { similarity: 0.8, adjustedScore: 82 }, // Missing id and explanation
      { id: 'match-3', similarity: 0.7, score: 70, adjustedScore: 75 }, // Missing explanation
    ];
    
    mockJsonOutputParser.invoke.mockResolvedValueOnce(incompleteMatches);
    
    const result = await service.refineMatches(mockRequest);
    
    // Should fill in missing fields with defaults
    expect(result.matches).toHaveLength(3);
    expect(result.matches[0].id).toBe('match-1');
    expect(result.matches[0].adjustedScore).toBe(0); // Default value
    expect(result.matches[1].id).toBe(''); // Default value
    expect(result.matches[2].explanation).toBe('No explanation provided'); // Default value
  });

  it('should respect the limit parameter', async () => {
    // Create a request with a smaller limit
    const limitedRequest = { ...mockRequest, limit: 2 };
    
    const result = await service.refineMatches(limitedRequest);
    
    // Should only process the first 2 matches
    expect(result.matches).toHaveLength(2);
  });

  it('should handle token limit exceeded errors', async () => {
    // Override the estimateTokenCount method to simulate token limit exceeded
    (service as any).estimateTokenCount = jest.fn().mockReturnValue(10000);
    
    await expect(service.refineMatches(mockRequest)).rejects.toThrow(/token count/);
  });
});
