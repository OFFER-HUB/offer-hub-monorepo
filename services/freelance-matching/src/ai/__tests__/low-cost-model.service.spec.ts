import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LowCostModelService } from '../low-cost-model.service';
import { HfInference } from '@huggingface/inference';

// Mock the HfInference class
jest.mock('@huggingface/inference', () => {
  return {
    HfInference: jest.fn().mockImplementation(() => ({
      featureExtraction: jest.fn(),
    })),
  };
});

describe('LowCostModelService', () => {
  let service: LowCostModelService;
  let mockHfInference: jest.Mocked<HfInference>;

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'HF_API_KEY') return 'test-api-key';
      return null;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        LowCostModelService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = testingModule.get<LowCostModelService>(LowCostModelService);
    mockHfInference = new HfInference('') as jest.Mocked<HfInference>;
    // Access the private hf property
    (service as any).hf = mockHfInference;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateEmbedding', () => {
    it('should return embedding array when result is an array', async () => {
      const mockEmbedding = [0.1, 0.2, 0.3, 0.4];
      mockHfInference.featureExtraction = jest.fn().mockResolvedValue(mockEmbedding);

      const result = await service.generateEmbedding('test text');
      
      expect(mockHfInference.featureExtraction).toHaveBeenCalledWith({
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        inputs: 'test text',
      });
      expect(result).toEqual(mockEmbedding);
    });

    it('should handle object response with data property', async () => {
      const mockEmbedding = [0.1, 0.2, 0.3, 0.4];
      mockHfInference.featureExtraction = jest.fn().mockResolvedValue({
        data: mockEmbedding,
      });

      const result = await service.generateEmbedding('test text');
      
      expect(result).toEqual(mockEmbedding);
    });

    it('should throw error on unexpected response format', async () => {
      mockHfInference.featureExtraction = jest.fn().mockResolvedValue('invalid format');

      await expect(service.generateEmbedding('test text')).rejects.toThrow(
        'Unexpected response format from Hugging Face API'
      );
    });

    it('should throw error when API call fails', async () => {
      mockHfInference.featureExtraction = jest.fn().mockRejectedValue(
        new Error('API error')
      );

      await expect(service.generateEmbedding('test text')).rejects.toThrow(
        'Failed to generate embedding: API error'
      );
    });
  });

  describe('calculateSimilarity', () => {
    it('should calculate cosine similarity correctly', () => {
      const vecA = [1, 2, 3];
      const vecB = [4, 5, 6];
      
      // Manually calculated expected result:
      // dot product = 1*4 + 2*5 + 3*6 = 4 + 10 + 18 = 32
      // magA = sqrt(1^2 + 2^2 + 3^2) = sqrt(14) ≈ 3.74
      // magB = sqrt(4^2 + 5^2 + 6^2) = sqrt(77) ≈ 8.77
      // similarity = 32 / (3.74 * 8.77) ≈ 0.975
      
      const result = service.calculateSimilarity(vecA, vecB);
      expect(result).toBeCloseTo(0.975, 3);
    });

    it('should throw error when vectors have different dimensions', () => {
      const vecA = [1, 2, 3];
      const vecB = [4, 5];
      
      expect(() => service.calculateSimilarity(vecA, vecB)).toThrow(
        'Vectors must have the same dimensions'
      );
    });
  });
});
