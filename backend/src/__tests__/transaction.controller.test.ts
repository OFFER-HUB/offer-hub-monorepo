/**
 * @fileoverview Tests for transaction controller
 * @author Offer Hub Team
 */

import { Request, Response, NextFunction } from 'express';
import { sendTransactionHandler } from '@/controllers/transaction.controller';
import { ValidationError, InternalServerError } from '@/utils/AppError';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Transaction Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    
    // Set up environment variables
    process.env.TRUSTLESSWORK_API_KEY = 'test-api-key';
    process.env.TRUSTLESSWORK_API_URL = 'https://test.api.com';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendTransactionHandler', () => {
    it('should successfully send a transaction with valid signedXdr', async () => {
      // Arrange
      const signedXdr = 'AAAAAAAAAABBBBBBBBBB';
      mockRequest.body = { signedXdr };
      
      const mockApiResponse = {
        data: {
          status: 'pending',
          hash: 'abc123hash'
        }
      };
      mockedAxios.post.mockResolvedValue(mockApiResponse);

      // Act
      await sendTransactionHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://test.api.com/helper/send-transaction',
        { signedXdr },
        { headers: { 'x-api-key': 'test-api-key' } }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Transaction sent successfully',
        data: {
          status: 'pending',
          hash: 'abc123hash'
        }
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should throw ValidationError when signedXdr is missing', async () => {
      // Arrange
      mockRequest.body = {};

      // Act
      await sendTransactionHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Validation failed');
    });

    it('should throw ValidationError when signedXdr is empty string', async () => {
      // Arrange
      mockRequest.body = { signedXdr: '   ' };

      // Act
      await sendTransactionHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should throw ValidationError when signedXdr is not a string', async () => {
      // Arrange
      mockRequest.body = { signedXdr: 12345 };

      // Act
      await sendTransactionHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should throw InternalServerError when API key is missing', async () => {
      // Arrange
      delete process.env.TRUSTLESSWORK_API_KEY;
      mockRequest.body = { signedXdr: 'AAAABBBB' };

      // Act
      await sendTransactionHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(InternalServerError);
      expect(error.message).toContain('Missing TrustlessWork API Key');
    });

    it('should handle external API errors gracefully', async () => {
      // Arrange
      mockRequest.body = { signedXdr: 'AAAABBBB' };
      const apiError = {
        response: {
          status: 400,
          data: {
            message: 'Invalid transaction format'
          }
        },
        isAxiosError: true
      };
      mockedAxios.post.mockRejectedValue(apiError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      // Act
      await sendTransactionHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error.message).toBe('Invalid transaction format');
      expect(error.statusCode).toBe(400);
    });

    it('should handle network errors', async () => {
      // Arrange
      mockRequest.body = { signedXdr: 'AAAABBBB' };
      const networkError = new Error('Network error');
      mockedAxios.post.mockRejectedValue(networkError);
      mockedAxios.isAxiosError.mockReturnValue(false);

      // Act
      await sendTransactionHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Assert
      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(InternalServerError);
    });
  });
});
