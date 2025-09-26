import { Test, TestingModule } from '@nestjs/testing';
import { MatchResolver } from '../match.resolver';
import { MatchService } from '../../../match/match.service';
import { MatchRequestInput } from '../match.types';
import { MatchEntityType } from '../match.types';

describe('MatchResolver', () => {
  let resolver: MatchResolver;
  let matchService: MatchService;

  // Mock data
  const mockMatches = [
    { id: 'match-1', similarity: 0.95, score: 95 },
    { id: 'match-2', similarity: 0.85, score: 85 },
  ];

  const mockPremiumMatches = [
    { 
      id: 'match-1', 
      similarity: 0.95, 
      score: 95, 
      explanation: 'Great match based on skills', 
      adjustedScore: 98 
    },
    { 
      id: 'match-2', 
      similarity: 0.85, 
      score: 85, 
      explanation: 'Good match with relevant experience', 
      adjustedScore: 88 
    },
  ];

  const mockMatchService = {
    getMatches: jest.fn().mockImplementation((request) => {
      const requestId = `test-${Date.now()}`;
      const latencyMs = 42;
      
      // Return premium matches if usePremium is true
      if (request.usePremium) {
        return Promise.resolve({
          matches: mockPremiumMatches,
          latencyMs,
          requestId,
        });
      }
      
      // Otherwise return regular matches
      return Promise.resolve({
        matches: mockMatches,
        latencyMs,
        requestId,
      });
    }),
  };

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        MatchResolver,
        {
          provide: MatchService,
          useValue: mockMatchService,
        },
      ],
    }).compile();

    resolver = testingModule.get<MatchResolver>(MatchResolver);
    matchService = testingModule.get<MatchService>(MatchService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getMatches', () => {
    it('should return matches for a freelancer', async () => {
      const request: MatchRequestInput = {
        type: MatchEntityType.FREELANCER,
        id: 'user-123',
        limit: 10,
      };

      const result = await resolver.getMatches(request);

      expect(result).toHaveProperty('matches');
      expect(result).toHaveProperty('latencyMs');
      expect(result).toHaveProperty('requestId');
      expect(result.matches).toHaveLength(2);
      expect(matchService.getMatches).toHaveBeenCalledWith({
        type: 'freelancer',
        id: 'user-123',
        limit: 10,
        usePremium: false, // Default value
      });
    });

    it('should return premium matches when usePremium is true', async () => {
      const request: MatchRequestInput = {
        type: MatchEntityType.PROJECT,
        id: 'project-456',
        limit: 5,
        usePremium: true,
      };

      const result = await resolver.getMatches(request);

      expect(result).toHaveProperty('matches');
      expect(result.matches).toHaveLength(2);
      expect(result.matches[0]).toHaveProperty('explanation');
      expect(result.matches[0]).toHaveProperty('adjustedScore');
      expect(matchService.getMatches).toHaveBeenCalledWith({
        type: 'project',
        id: 'project-456',
        limit: 5,
        usePremium: true,
      });
    });

    it('should pass text parameter when provided', async () => {
      const request: MatchRequestInput = {
        type: MatchEntityType.FREELANCER,
        id: 'user-123',
        text: 'Sample project description',
      };

      await resolver.getMatches(request);

      expect(matchService.getMatches).toHaveBeenCalledWith({
        type: 'freelancer',
        id: 'user-123',
        text: 'Sample project description',
        usePremium: false,
      });
    });
  });
});
