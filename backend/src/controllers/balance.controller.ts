/**
 * @fileoverview Balance controller handling balance retrieval operations
 * @author Offer Hub Team
 */

import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@/types/auth.types";
import { balanceService } from "@/services/balance.service";
import { ValidationError, BadRequestError } from "@/utils/AppError";
import { buildListResponse, buildPaginatedResponse } from "@/utils/responseBuilder";
import {
  BalanceTransaction,
  SUPPORTED_CURRENCIES,
  TRANSACTION_TYPES,
  TransactionType,
} from "@/types/balance.types";
import { validateIntegerRange } from "@/utils/validation";

/**
 * GET /api/v1/balances
 * Retrieve authenticated user's balance breakdown by currency
 * 
 * Query Parameters:
 * - currency (optional): Filter by currency (USD, XLM)
 * 
 * Returns:
 * - 200 OK: Array of balance objects with currency, available, held, and total
 * - 400 Bad Request: Invalid currency parameter
 * - 401 Unauthorized: Missing or invalid JWT token (handled by middleware)
 */
export const getBalances = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Guard check: ensure user is authenticated (middleware should handle this, but TypeScript needs this)
    if (!req.user) {
      throw new BadRequestError("Authentication required");
    }

    const { currency } = req.query;
    const userId = req.user.id;

    // Validate currency if provided
    if (currency) {
      const currencyStr = typeof currency === 'string' ? currency : String(currency);
      
      if (!SUPPORTED_CURRENCIES.includes(currencyStr as any)) {
        throw new ValidationError(
          `Invalid currency: ${currencyStr}. Supported currencies: ${SUPPORTED_CURRENCIES.join(', ')}`
        );
      }

      // Get balances with currency filter
      const balances = await balanceService.getUserBalances(userId, currencyStr);
      
      return res.status(200).json(
        buildListResponse(balances, "Balances retrieved successfully")
      );
    }

    // Get all balances
    const balances = await balanceService.getUserBalances(userId);
    
    return res.status(200).json(
      buildListResponse(balances, "Balances retrieved successfully")
    );
  } catch (error: any) {
    next(error);
  }
};

/**
 * GET /api/v1/balances/transactions
 * Retrieve authenticated user's balance transaction history
 * 
 * Query Parameters:
 * - currency (optional): Filter by currency (USD, XLM)
 * - type (optional): Filter by transaction type (credit, debit, hold, release, settle_in, settle_out)
 * - from (optional): Start date filter (YYYY-MM-DD)
 * - to (optional): End date filter (YYYY-MM-DD)
 * - page (optional): Page number (default: 1)
 * - limit (optional): Items per page (default: 20, max: 100)
 * 
 * Returns:
 * - 200 OK: Paginated transaction history
 * - 400 Bad Request: Invalid parameters
 * - 401 Unauthorized: Missing or invalid JWT token (handled by middleware)
 */
export const getTransactionHistory = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Guard check: ensure user is authenticated
    if (!req.user) {
      throw new BadRequestError("Authentication required");
    }

    const userId = req.user.id;

    // Extract and parse query parameters
    const currency = req.query.currency as string | undefined;
    const type = req.query.type as string | undefined;
    const from = req.query.from as string | undefined;
    const to = req.query.to as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    // Validate currency if provided
    if (currency && !SUPPORTED_CURRENCIES.includes(currency as any)) {
      throw new ValidationError(
        `Invalid currency: ${currency}. Supported currencies: ${SUPPORTED_CURRENCIES.join(', ')}`
      );
    }

    // Validate transaction type if provided
    if (type && !TRANSACTION_TYPES.includes(type as TransactionType)) {
      throw new ValidationError(
        `Invalid transaction type: ${type}. Supported types: ${TRANSACTION_TYPES.join(', ')}`
      );
    }

    // Validate pagination parameters
    if (!validateIntegerRange(page, 1, 1000)) {
      throw new ValidationError("Page number must be between 1 and 1000");
    }

    if (!validateIntegerRange(limit, 1, 100)) {
      throw new ValidationError("Limit must be between 1 and 100");
    }

    // Call service
    const result = await balanceService.getTransactionHistory(userId, {
      currency,
      type: type as TransactionType | undefined,
      from,
      to,
      page,
      limit
    });

    // Format transactions for response
    const formattedTransactions = result.transactions.map((tx: BalanceTransaction) => ({
      id: tx.id,
      type: tx.type,
      amount: Number(tx.amount).toFixed(2),
      currency: tx.currency,
      reference_type: tx.reference_type,
      reference_id: tx.reference_id,
      balance_after: Number(tx.balance_after).toFixed(2),
      created_at: tx.created_at
    }));

    return res.status(200).json({
      success: true,
      data: {
        transactions: formattedTransactions,
        pagination: result.pagination
      }
    });
  } catch (error: any) {
    next(error);
  }
};
