import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { LowCostModelService } from '../low-cost-model.service';
import { PrismaService } from '../../prisma/prisma.service';
import { performance } from 'perf_hooks';

describe('PreFilter Benchmarks', () => {
  let service: LowCostModelService;
  let prismaService: PrismaService;

  // Mock data
  const mockEmbedding = Array(1536).fill(0).map(() => Math.random() * 2 - 1); // Random unit vector
  const mockFreelancerResults = Array(50).fill(0).map((_, i) => ({
    id: `user-${i}`,
    similarity: 0.9 - (i * 0.01), // Decreasing similarity
  }));
  const mockProjectResults = Array(50).fill(0).map((_, i) => ({
    id: `project-${i}`,
    similarity: 0.95 - (i * 0.01), // Decreasing similarity
  }));

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      providers: [
        LowCostModelService,
        {
          provide: PrismaService,
          useValue: {
            $queryRawUnsafe: jest.fn().mockImplementation((query, vector, limit) => {
              // Return mock data based on the query
              if (query.includes('FreelancerEmbedding')) {
                return Promise.resolve(mockFreelancerResults);
              } else {
                return Promise.resolve(mockProjectResults);
              }
            }),
          },
        },
      ],
    }).compile();

    service = testingModule.get<LowCostModelService>(LowCostModelService);
    prismaService = testingModule.get<PrismaService>(PrismaService);
  });

  it('should prefilter freelancers with latency < 100ms', async () => {
    const startTime = performance.now();
    
    const results = await service.preFilter(mockEmbedding, 'freelancer');
    
    const endTime = performance.now();
    const latency = endTime - startTime;
    
    expect(results.length).toBeLessThanOrEqual(50);
    expect(latency).toBeLessThan(100); // Ensure latency is under 100ms
    expect(results[0].similarity).toBeGreaterThan(results[results.length - 1].similarity); // Verify sorting
    
    console.log(`Freelancer prefilter latency: ${latency.toFixed(2)}ms`);
  });

  it('should prefilter projects with latency < 100ms', async () => {
    const startTime = performance.now();
    
    const results = await service.preFilter(mockEmbedding, 'project');
    
    const endTime = performance.now();
    const latency = endTime - startTime;
    
    expect(results.length).toBeLessThanOrEqual(50);
    expect(latency).toBeLessThan(100); // Ensure latency is under 100ms
    expect(results[0].similarity).toBeGreaterThan(results[results.length - 1].similarity); // Verify sorting
    
    console.log(`Project prefilter latency: ${latency.toFixed(2)}ms`);
  });

  it('should handle different limit values', async () => {
    const results10 = await service.preFilter(mockEmbedding, 'freelancer', 10);
    const results25 = await service.preFilter(mockEmbedding, 'freelancer', 25);
    const results100 = await service.preFilter(mockEmbedding, 'freelancer', 100);
    
    expect(results10.length).toBeLessThanOrEqual(10);
    expect(results25.length).toBeLessThanOrEqual(25);
    expect(results100.length).toBeLessThanOrEqual(50); // Should still be capped at 50
  });

  it('should handle database errors gracefully', async () => {
    jest.spyOn(prismaService, '$queryRawUnsafe').mockRejectedValueOnce(new Error('Database error'));
    
    await expect(service.preFilter(mockEmbedding, 'freelancer')).rejects.toThrow('Failed to pre-filter candidates');
  });
});
