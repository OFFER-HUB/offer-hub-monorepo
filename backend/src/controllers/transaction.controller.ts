/**
 * @fileoverview Transaction controller for sending signed transactions to Stellar network
 * @author Offer Hub Team
 */

import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { buildSuccessResponse } from '@/utils/responseBuilder';
import { ValidationError, InternalServerError, AppError } from '@/utils/AppError';
import { SendTransactionRequest, TransactionResult } from '@/types/transaction.types';

/**
 * Send a signed transaction to the Stellar network via TrustlessWork API
 * 
 * @route POST /api/transactions/send
 * @param req - Express request object with signedXdr in body
 * @param res - Express response object
 * @param next - Express next function for error handling
 * 
 * @returns {Promise<void>} JSON response with transaction hash and status
 * 
 * @example
 * Request body:
 * {
 *   "signedXdr": "AAAAAgAAAAC..."
 * }
 * 
 * Success response (200):
 * {
 *   "success": true,
 *   "message": "Transaction sent successfully",
 *   "data": {
 *     "status": "pending",
 *     "hash": "abc123..."
 *   }
 * }
 */
export const sendTransactionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Validate input
    const { signedXdr } = req.body as SendTransactionRequest;

    if (!signedXdr) {
      throw new ValidationError('Validation failed', [
        {
          field: 'signedXdr',
          value: signedXdr,
          reason: 'signedXdr is required',
          code: 'REQUIRED_FIELD'
        }
      ]);
    }

    if (typeof signedXdr !== 'string' || signedXdr.trim().length === 0) {
      throw new ValidationError('Validation failed', [
        {
          field: 'signedXdr',
          value: signedXdr,
          reason: 'signedXdr must be a non-empty string',
          code: 'INVALID_FORMAT'
        }
      ]);
    }

    // 2. Get API configuration
    const apiKey = process.env.TRUSTLESSWORK_API_KEY;
    const apiUrl = process.env.TRUSTLESSWORK_API_URL || 'https://dev.api.trustlesswork.com';

    if (!apiKey) {
      throw new InternalServerError('Server Misconfiguration: Missing TrustlessWork API Key');
    }

    // 3. Call TrustlessWork API
    try {
      const response = await axios.post(
        `${apiUrl}/helper/send-transaction`,
        { signedXdr },
        { headers: { 'x-api-key': apiKey } }
      );

      const { status, hash } = response.data;

      // 4. Return success response
      const result: TransactionResult = { status, hash };
      
      res.status(200).json(
        buildSuccessResponse(result, 'Transaction sent successfully')
      );
    } catch (error: any) {
      // Handle axios errors from external API
      if (axios.isAxiosError(error) && error.response) {
        throw new AppError(
          error.response.data?.message || 'External API Error',
          error.response.status,
          'EXTERNAL_API_ERROR',
          error.response.data
        );
      }
      throw new InternalServerError(
        'Failed to send transaction via TrustlessWork API',
        error.message
      );
    }
  } catch (error) {
    // 5. Pass error to error handling middleware
    next(error);
  }
};
