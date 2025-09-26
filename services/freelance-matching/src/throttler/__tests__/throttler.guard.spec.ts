import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerGuard } from '../throttler.guard';
import { ThrottlerException } from '../throttler.exception';
import { GqlExecutionContext } from '@nestjs/graphql';

describe('ThrottlerGuard', () => {
  let guard: ThrottlerGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        ThrottlerGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = testingModule.get<ThrottlerGuard>(ThrottlerGuard);
    reflector = testingModule.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('getIp', () => {
    it('should extract IP from HTTP request', () => {
      const mockRequest = {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
        ip: '127.0.0.1',
      };

      const mockContext = {
        getType: () => 'http',
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      const ip = (guard as any).getIp(mockContext);
      expect(ip).toBe('192.168.1.1');
    });

    it('should extract IP from GraphQL context', () => {
      const mockRequest = {
        headers: {
          'x-forwarded-for': '192.168.1.2',
        },
        ip: '127.0.0.1',
      };

      // Mock GqlExecutionContext.create
      jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
        getContext: () => ({ req: mockRequest }),
      } as any);

      const mockContext = {
        getType: () => 'graphql',
      } as unknown as ExecutionContext;

      const ip = (guard as any).getIp(mockContext);
      expect(ip).toBe('192.168.1.2');
    });

    it('should fallback to request.ip if x-forwarded-for is not present', () => {
      const mockRequest = {
        headers: {},
        ip: '127.0.0.1',
      };

      const mockContext = {
        getType: () => 'http',
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;

      const ip = (guard as any).getIp(mockContext);
      expect(ip).toBe('127.0.0.1');
    });
  });

  describe('getRequestResponse', () => {
    it('should get request and response from HTTP context', () => {
      const mockRequest = {};
      const mockResponse = {};

      const mockContext = {
        getType: () => 'http',
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      } as unknown as ExecutionContext;

      const result = (guard as any).getRequestResponse(mockContext);
      expect(result.req).toBe(mockRequest);
      expect(result.res).toBe(mockResponse);
    });

    it('should get request and response from GraphQL context', () => {
      const mockRequest = {};
      const mockResponse = {};

      // Mock GqlExecutionContext.create
      jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
        getContext: () => ({ req: mockRequest, res: mockResponse }),
      } as any);

      const mockContext = {
        getType: () => 'graphql',
      } as unknown as ExecutionContext;

      const result = (guard as any).getRequestResponse(mockContext);
      expect(result.req).toBe(mockRequest);
      expect(result.res).toBe(mockResponse);
    });
  });

  describe('getTrackerName', () => {
    it('should return "graphql" for GraphQL context', () => {
      const mockContext = {
        getType: () => 'graphql',
      } as unknown as ExecutionContext;

      const trackerName = (guard as any).getTrackerName(mockContext);
      expect(trackerName).toBe('graphql');
    });

    it('should return "default" for HTTP context', () => {
      const mockContext = {
        getType: () => 'http',
      } as unknown as ExecutionContext;

      const trackerName = (guard as any).getTrackerName(mockContext);
      expect(trackerName).toBe('default');
    });
  });

  describe('throwThrottlingException', () => {
    it('should throw a ThrottlerException with correct ttl and limit', () => {
      const ttl = 60000;
      const limit = 100;

      try {
        (guard as any).throwThrottlingException(ttl, limit);
        fail('Expected ThrottlerException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ThrottlerException);
        expect(error.getResponse().ttl).toBe(ttl);
        expect(error.getResponse().limit).toBe(limit);
      }
    });
  });
});
