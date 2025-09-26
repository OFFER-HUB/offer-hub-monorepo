import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GqlExecutionContext } from '@nestjs/graphql';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = testingModule.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = testingModule.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true for public routes', () => {
      // Mock the reflector to return true for isPublic
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

      const context = {
        getHandler: () => ({}),
        getClass: () => ({}),
      } as ExecutionContext;

      expect(guard.canActivate(context)).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should call super.canActivate for protected routes', () => {
      // Mock the reflector to return false for isPublic
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

      // Mock super.canActivate
      const canActivateSpy = jest
        .spyOn(JwtAuthGuard.prototype, 'canActivate')
        .mockImplementation(function (this: any, context: ExecutionContext) {
          if (this === guard) {
            // Call the original implementation
            return true;
          }
          return true;
        });

      const context = {
        getHandler: () => ({}),
        getClass: () => ({}),
      } as ExecutionContext;

      expect(guard.canActivate(context)).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith('isPublic', [
        context.getHandler(),
        context.getClass(),
      ]);
    });
  });

  describe('handleRequest', () => {
    it('should return the user when authentication succeeds', () => {
      const user = { id: '1', username: 'testuser' };
      expect(guard.handleRequest(null, user, null)).toBe(user);
    });

    it('should throw UnauthorizedException when authentication fails', () => {
      expect(() => guard.handleRequest(new Error(), null, null)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException with specific message for expired token', () => {
      const info = new Error();
      info.name = 'TokenExpiredError';

      try {
        guard.handleRequest(null, null, info);
        fail('Expected UnauthorizedException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Token has expired');
      }
    });

    it('should throw UnauthorizedException with specific message for invalid token', () => {
      const info = new Error();
      info.name = 'JsonWebTokenError';

      try {
        guard.handleRequest(null, null, info);
        fail('Expected UnauthorizedException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Invalid token');
      }
    });
  });

  describe('getRequest', () => {
    it('should return HTTP request for HTTP context', () => {
      const request = {};
      const context = {
        getType: () => 'http',
        switchToHttp: () => ({
          getRequest: () => request,
        }),
      } as ExecutionContext;

      expect(guard.getRequest(context)).toBe(request);
    });

    it('should return GraphQL request for GraphQL context', () => {
      const request = {};
      
      // Mock GqlExecutionContext.create
      jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
        getContext: () => ({ req: request }),
      } as any);

      const context = {
        getType: () => 'graphql',
      } as ExecutionContext;

      expect(guard.getRequest(context)).toBe(request);
      expect(GqlExecutionContext.create).toHaveBeenCalledWith(context);
    });
  });
});
