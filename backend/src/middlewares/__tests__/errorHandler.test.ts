import { Request, Response, NextFunction } from 'express';
import { ErrorHandlerMiddleware, errorHandlerMiddleware, setupGlobalErrorHandlers } from '../errorHandler.middleware';
import { 
  ValidationError, 
  DatabaseError, 
  BusinessLogicError, 
  AuthenticationError, 
  AuthorizationError,
  NotFoundError,
  BadRequestError
} from '../../utils/AppError';
import { ErrorCodes, ErrorSeverity } from '../../types/errors.types';

// Mock console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

describe('ErrorHandlerMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let errorHandler: ErrorHandlerMiddleware;

  beforeEach(() => {
    // Reset mocks
    mockRequest = {
      url: '/api/test',
      method: 'POST',
      headers: {
        'user-agent': 'test-agent',
        'x-request-id': 'test-request-id'
      },
      params: { id: '123' },
      query: { page: '1' },
      body: { test: 'data' },
      ip: '127.0.0.1',
      get: jest.fn((header: string) => {
        if (header === 'User-Agent') return 'test-agent';
        return undefined;
      })
    } as any; // Use any to bypass TypeScript strictness for testing

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();

    errorHandler = ErrorHandlerMiddleware.getInstance();

    // Mock console methods
    console.error = jest.fn();
    console.warn = jest.fn();
    console.log = jest.fn();
  });

  afterEach(() => {
    // Restore console methods
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.log = originalConsoleLog;
  });

  describe('handle', () => {
    it('should handle ValidationError correctly', () => {
      const validationError = new ValidationError('Validation failed', [
        { field: 'email', value: 'invalid', reason: 'Invalid email format', code: 'INVALID_EMAIL' }
      ]);

      errorHandler.handle(
        validationError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(422);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          type: ErrorCodes.VALIDATION_ERROR,
          message: 'Validation failed',
          details: validationError.details,
          code: ErrorCodes.VALIDATION_ERROR,
          timestamp: expect.any(String)
        }
      });
    });

    it('should handle DatabaseError correctly', () => {
      const databaseError = new DatabaseError('Database connection failed', { code: 'ECONNREFUSED' });

      errorHandler.handle(
        databaseError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          type: ErrorCodes.DATABASE_ERROR,
          message: 'Database connection failed',
          details: { code: 'ECONNREFUSED' },
          code: ErrorCodes.DATABASE_ERROR,
          timestamp: expect.any(String)
        }
      });
    });

    it('should handle BusinessLogicError correctly', () => {
      const businessError = new BusinessLogicError('User not found', 'USER_NOT_FOUND');

      errorHandler.handle(
        businessError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          type: 'USER_NOT_FOUND',
          message: 'User not found',
          details: undefined,
          code: 'USER_NOT_FOUND',
          timestamp: expect.any(String)
        }
      });
    });

    it('should handle AuthenticationError correctly', () => {
      const authError = new AuthenticationError('Token expired');

      errorHandler.handle(
        authError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          type: ErrorCodes.AUTHENTICATION_ERROR,
          message: 'Token expired',
          details: undefined,
          code: ErrorCodes.AUTHENTICATION_ERROR,
          timestamp: expect.any(String)
        }
      });
    });

    it('should handle AuthorizationError correctly', () => {
      const authzError = new AuthorizationError('Insufficient permissions');

      errorHandler.handle(
        authzError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          type: ErrorCodes.AUTHORIZATION_ERROR,
          message: 'Insufficient permissions',
          details: undefined,
          code: ErrorCodes.AUTHORIZATION_ERROR,
          timestamp: expect.any(String)
        }
      });
    });

    it('should handle generic Error correctly', () => {
      const genericError = new Error('Something went wrong');

      errorHandler.handle(
        genericError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          type: ErrorCodes.UNKNOWN_ERROR,
          message: 'Something went wrong',
          details: undefined,
          code: ErrorCodes.UNKNOWN_ERROR,
          timestamp: expect.any(String)
        }
      });
    });

    it('should handle string errors correctly', () => {
      const stringError = 'String error message';

      errorHandler.handle(
        stringError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          type: ErrorCodes.STRING_ERROR,
          message: 'String error message',
          details: undefined,
          code: ErrorCodes.STRING_ERROR,
          timestamp: expect.any(String)
        }
      });
    });

    it('should handle unknown error types correctly', () => {
      const unknownError = { custom: 'error' };

      errorHandler.handle(
        unknownError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: {
          type: ErrorCodes.UNKNOWN_ERROR_TYPE,
          message: 'Internal server error',
          details: unknownError,
          code: ErrorCodes.UNKNOWN_ERROR_TYPE,
          timestamp: expect.any(String)
        }
      });
    });

    it('should include development details when NODE_ENV is development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const validationError = new ValidationError('Test error');

      errorHandler.handle(
        validationError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(responseCall.error).toHaveProperty('stack');
      expect(responseCall.error).toHaveProperty('url');
      expect(responseCall.error).toHaveProperty('method');
      expect(responseCall.error).toHaveProperty('context');

      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });

    it('should not include development details when NODE_ENV is production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const validationError = new ValidationError('Test error');

      errorHandler.handle(
        validationError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(responseCall.error).not.toHaveProperty('stack');
      expect(responseCall.error).not.toHaveProperty('url');
      expect(responseCall.error).not.toHaveProperty('method');
      expect(responseCall.error).not.toHaveProperty('context');

      // Restore environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('isOperational', () => {
    it('should return true for operational errors (status < 500)', () => {
      const validationError = new ValidationError('Test');
      const notFoundError = new NotFoundError('Test');
      const badRequestError = new BadRequestError('Test');

      expect(errorHandler.isOperational(validationError)).toBe(true);
      expect(errorHandler.isOperational(notFoundError)).toBe(true);
      expect(errorHandler.isOperational(badRequestError)).toBe(true);
    });

    it('should return false for programming errors (status >= 500)', () => {
      const databaseError = new DatabaseError('Test');
      const genericError = new Error('Test');

      expect(errorHandler.isOperational(databaseError)).toBe(false);
      expect(errorHandler.isOperational(genericError)).toBe(false);
    });
  });

  describe('logError', () => {
    it('should log critical errors with error emoji', () => {
      const criticalError = new DatabaseError('Critical database error');

      // Clear previous calls
      (console.error as jest.Mock).mockClear();

      errorHandler.logError(criticalError);

      expect(console.error).toHaveBeenCalledWith(
        '🚨 CRITICAL ERROR:',
        expect.stringContaining('Critical database error')
      );
    });

    it('should log high severity errors with error emoji', () => {
      const highError = new AuthenticationError('Authentication failed');

      // Clear previous calls
      (console.error as jest.Mock).mockClear();

      errorHandler.logError(highError);

      expect(console.error).toHaveBeenCalledWith(
        '❌ HIGH SEVERITY ERROR:',
        expect.stringContaining('Authentication failed')
      );
    });

    it('should log medium severity errors with warning emoji', () => {
      const mediumError = new BusinessLogicError('User not found');

      // Clear previous calls
      (console.warn as jest.Mock).mockClear();

      errorHandler.logError(mediumError);

      expect(console.warn).toHaveBeenCalledWith(
        '⚠️ MEDIUM SEVERITY ERROR:',
        expect.stringContaining('User not found')
      );
    });

    it('should log low severity errors with info emoji', () => {
      const lowError = new ValidationError('Validation failed');

      // Clear previous calls
      (console.log as jest.Mock).mockClear();

      errorHandler.logError(lowError);

      expect(console.log).toHaveBeenCalledWith(
        'ℹ️ LOW SEVERITY ERROR:',
        expect.stringContaining('Validation failed')
      );
    });
  });

  describe('getSeverityFromErrorCode', () => {
    it('should return correct severity for validation errors', () => {
      const validationError = new ValidationError('Test');
      expect(errorHandler['getSeverityFromErrorCode'](ErrorCodes.VALIDATION_ERROR)).toBe(ErrorSeverity.LOW);
      expect(errorHandler['getSeverityFromErrorCode'](ErrorCodes.INVALID_EMAIL)).toBe(ErrorSeverity.LOW);
    });

    it('should return correct severity for business logic errors', () => {
      expect(errorHandler['getSeverityFromErrorCode'](ErrorCodes.BUSINESS_LOGIC_ERROR)).toBe(ErrorSeverity.MEDIUM);
      expect(errorHandler['getSeverityFromErrorCode'](ErrorCodes.USER_NOT_FOUND)).toBe(ErrorSeverity.MEDIUM);
    });

    it('should return correct severity for authentication errors', () => {
      expect(errorHandler['getSeverityFromErrorCode'](ErrorCodes.AUTHENTICATION_ERROR)).toBe(ErrorSeverity.HIGH);
      expect(errorHandler['getSeverityFromErrorCode'](ErrorCodes.TOKEN_EXPIRED)).toBe(ErrorSeverity.HIGH);
    });

    it('should return correct severity for database errors', () => {
      expect(errorHandler['getSeverityFromErrorCode'](ErrorCodes.DATABASE_ERROR)).toBe(ErrorSeverity.CRITICAL);
      expect(errorHandler['getSeverityFromErrorCode'](ErrorCodes.INTERNAL_SERVER_ERROR)).toBe(ErrorSeverity.CRITICAL);
    });
  });

  describe('generateErrorId', () => {
    it('should generate unique error IDs', () => {
      const id1 = errorHandler['generateErrorId']();
      const id2 = errorHandler['generateErrorId']();

      expect(id1).toMatch(/^err_\d+_[a-z0-9]{9}$/);
      expect(id2).toMatch(/^err_\d+_[a-z0-9]{9}$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe('errorHandlerMiddleware function', () => {
    it('should call the singleton instance handle method', () => {
      const handleSpy = jest.spyOn(errorHandler, 'handle');

      errorHandlerMiddleware(
        new Error('Test'),
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(handleSpy).toHaveBeenCalledWith(
        expect.any(Error),
        mockRequest,
        mockResponse,
        mockNext
      );
    });
  });

  describe('setupGlobalErrorHandlers', () => {
    it('should setup process error handlers', () => {
      const originalOn = process.on;
      const mockOn = jest.fn();
      process.on = mockOn;

      setupGlobalErrorHandlers();

      expect(mockOn).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
      expect(mockOn).toHaveBeenCalledWith('unhandledRejection', expect.any(Function));

      // Restore original
      process.on = originalOn;
    });
  });

  describe('handleUncaughtException', () => {
    it('should log and exit in production', () => {
      const originalEnv = process.env.NODE_ENV;
      const originalExit = process.exit;
      process.env.NODE_ENV = 'production';
      process.exit = jest.fn() as any;

      const error = new Error('Uncaught exception');
      errorHandler.handleUncaughtException(error);

      expect(console.error).toHaveBeenCalledWith('💥 UNCAUGHT EXCEPTION:', error);
      expect(process.exit).toHaveBeenCalledWith(1);

      // Restore
      process.env.NODE_ENV = originalEnv;
      process.exit = originalExit;
    });

    it('should not exit in development', () => {
      const originalEnv = process.env.NODE_ENV;
      const originalExit = process.exit;
      process.env.NODE_ENV = 'development';
      process.exit = jest.fn() as any;

      const error = new Error('Uncaught exception');
      errorHandler.handleUncaughtException(error);

      expect(console.error).toHaveBeenCalledWith('💥 UNCAUGHT EXCEPTION:', error);
      expect(process.exit).not.toHaveBeenCalled();

      // Restore
      process.env.NODE_ENV = originalEnv;
      process.exit = originalExit;
    });
  });

  describe('handleUnhandledRejection', () => {
    it('should log unhandled rejections', () => {
      const reason = 'Promise rejected';
      const promise = Promise.resolve(); // Use resolved promise instead

      errorHandler.handleUnhandledRejection(reason, promise);

      expect(console.error).toHaveBeenCalledWith('💥 UNHANDLED PROMISE REJECTION:', reason);
      expect(console.error).toHaveBeenCalledWith('Promise:', promise);
    });
  });
});
