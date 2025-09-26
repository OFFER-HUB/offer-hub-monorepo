import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HighQualityModelService } from '../high-quality-model.service';
import { ChatOpenAI } from '@langchain/openai';

// Mock LangChain components
jest.mock('@langchain/openai', () => ({
  ChatOpenAI: jest.fn().mockImplementation(() => ({
    bind: jest.fn().mockReturnThis(),
    invoke: jest.fn().mockResolvedValue('Mocked response from LangChain'),
  })),
}));

describe('HighQualityModelService', () => {
  let service: HighQualityModelService;

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'OPENAI_API_KEY') return 'test-api-key';
      return null;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('executePromptChain', () => {
    it('should execute a prompt chain successfully', async () => {
      const mockInput = {
        systemPrompt: 'You are a helpful assistant.',
        userPrompt: 'Tell me about AI.',
      };

      const result = await service.executePromptChain(mockInput);
      
      expect(result).toHaveProperty('output');
      expect(result).toHaveProperty('tokenUsage');
      expect(result).toHaveProperty('modelName');
      expect(result).toHaveProperty('latencyMs');
      expect(result.output).toBe('Mocked response from LangChain');
    });

    it('should use custom parameters when provided', async () => {
      const mockInput = {
        systemPrompt: 'You are a helpful assistant.',
        userPrompt: 'Tell me about AI.',
        maxTokens: 1000,
        temperature: 0.5,
      };

      const result = await service.executePromptChain(mockInput);
      
      expect(result).toHaveProperty('output');
      // In a real test, we would verify that the model was called with the correct parameters
    });

    it('should throw an error when token limit is exceeded', async () => {
      // Create a very long prompt that would exceed token limits
      const longPrompt = 'a'.repeat(50000);
      
      const mockInput = {
        systemPrompt: 'You are a helpful assistant.',
        userPrompt: longPrompt,
      };

      await expect(service.executePromptChain(mockInput)).rejects.toThrow(/token count/);
    });
  });

  describe('initialization', () => {
    it('should throw an error if OPENAI_API_KEY is not defined', async () => {
      mockConfigService.get.mockReturnValueOnce(undefined);
      
      expect(() => {
        const testingModule = Test.createTestingModule({
          providers: [
            HighQualityModelService,
            {
              provide: ConfigService,
              useValue: mockConfigService,
            },
          ],
        }).compile();
      }).rejects.toThrow();
    });
  });
});
