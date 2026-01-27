/**
 * @fileoverview Balance Service for managing user funds
 */

import { supabase } from "../lib/supabase/supabase";
import {
  InternalServerError,
  ValidationError,
  BadRequestError,
  BusinessLogicError,
  InsufficientFundsError
} from "../utils/AppError";
import { validateUUID } from "../utils/validation";
import {
  Balance,
  Currency,
  CreditReference,
  DebitReference,
  HoldReference,
  ReleaseReference,
  SUPPORTED_CURRENCIES,
  TransactionFilters,
  TransactionHistoryResult,
  TRANSACTION_TYPES,
  TransactionType
} from "../types/balance.types";
import { logger } from "../utils/logger";

export class BalanceService {
  /**
   * Adds funds to a user's available balance.
   * * @param userId - The user to credit
   * @param amount - Amount to credit (must be positive)
   * @param currency - Currency code (USD, XLM)
   * @param reference - Source of the credit
   * @param description - Optional description
   * @returns Updated Balance object
   */
  async creditAvailable(
    userId: string,
    amount: number,
    currency: string,
    reference: CreditReference,
    description?: string
  ): Promise<Balance> {
    const correlationId = crypto.randomUUID();

    try {
      logger.info(
        `[BalanceService] Starting creditAvailable ${correlationId} - User: ${userId}, Amount: ${amount} ${currency}`
      );

      // 1. Validation
      if (!validateUUID(userId)) {
        throw new BadRequestError("Invalid user ID format");
      }

      if (amount <= 0) {
        throw new ValidationError("Amount must be positive");
      }

      if (!SUPPORTED_CURRENCIES.includes(currency as Currency)) {
        throw new ValidationError(`Currency ${currency} is not supported`);
      }

      if (!reference.id || !reference.type) {
        throw new ValidationError("Invalid reference data");
      }

      // 2. Atomic Transaction (via RPC)
      // We rely on a database function to lock the row, update balance,
      // AND insert the log in one go.
      const { data, error } = await supabase.rpc('credit_available_balance', {
        p_user_id: userId,
        p_amount: amount,
        p_currency: currency,
        p_ref_id: reference.id,
        p_ref_type: reference.type,
        p_description: description || ''
      });

      if (error) {
        logger.error(`[BalanceService] RPC Error ${correlationId}`, error);
        throw new InternalServerError(`Balance credit failed: ${error.message}`);
      }

      if (!data) {
        throw new InternalServerError("Balance update failed: No data returned");
      }

      logger.info(`[BalanceService] Success ${correlationId} - New Balance: ${data.available}`);

      return data as Balance;

    } catch (err: any) {
      if (err instanceof ValidationError || err instanceof BadRequestError || err instanceof InternalServerError) {
        throw err;
      }
      throw new InternalServerError(`Unexpected error in balance service: ${err.message}`);
    }
  }

  /**
   * Transfers held funds from one user to another's available balance.
   * Used when a contract is completed successfully.
   * @param fromUserId - The user to transfer funds from (client)
   * @param toUserId - The user to transfer funds to (freelancer)
   * @param amount - Amount to transfer (must be positive)
   * @param currency - Currency code (USD, XLM)
   * @param reference - Reference to the contract
   * @returns Object containing both updated balance objects
   */
  async settleBalance(
    fromUserId: string,
    toUserId: string,
    amount: number,
    currency: string,
    reference: { id: string; type: 'contract' }
  ): Promise<{ fromBalance: Balance; toBalance: Balance }> {
    const correlationId = crypto.randomUUID();

    try {
      logger.info(
        `[BalanceService] Starting settleBalance ${correlationId} - From: ${fromUserId}, To: ${toUserId}, Amount: ${amount} ${currency}`
      );

      // 1. Validation
      if (!validateUUID(fromUserId)) {
        throw new BadRequestError("Invalid fromUser ID format");
      }

      if (!validateUUID(toUserId)) {
        throw new BadRequestError("Invalid toUser ID format");
      }

      if (fromUserId === toUserId) {
        throw new ValidationError("Cannot settle balance to the same user");
      }

      if (amount <= 0) {
        throw new ValidationError("Amount must be positive");
      }

      if (!SUPPORTED_CURRENCIES.includes(currency as Currency)) {
        throw new ValidationError(`Currency ${currency} is not supported. Supported currencies: ${SUPPORTED_CURRENCIES.join(', ')}`);
      }

      if (!reference.id || !reference.type) {
        throw new ValidationError("Invalid reference data");
      }

      // 2. Atomic Transaction (via RPC)
      // We rely on a database function to lock both rows, update balances,
      // AND insert the transaction logs in one go.
      const { data, error } = await supabase.rpc('settle_balance', {
        p_from_user_id: fromUserId,
        p_to_user_id: toUserId,
        p_amount: amount,
        p_currency: currency,
        p_ref_id: reference.id,
        p_ref_type: reference.type,
        p_description: `Settlement for contract ${reference.id}`
      });

      if (error) {
        logger.error(`[BalanceService] RPC Error ${correlationId}`, error);

        // Check if error is about insufficient funds
        if (error.message && error.message.includes('Insufficient held balance')) {
          throw new BusinessLogicError(
            error.message,
            'INSUFFICIENT_FUNDS'
          );
        }

        throw new InternalServerError(`Balance settlement failed: ${error.message}`);
      }

      if (!data) {
        throw new InternalServerError("Balance settlement failed: No data returned");
      }

      // 3. Parse and validate response structure
      if (!data.fromBalance || !data.toBalance) {
        throw new InternalServerError("Invalid response structure from settle_balance RPC");
      }

      logger.info(
        `[BalanceService] Success ${correlationId} - From Balance Held: ${data.fromBalance.held}, To Balance Available: ${data.toBalance.available}`
      );

      return {
        fromBalance: data.fromBalance as Balance,
        toBalance: data.toBalance as Balance
      };

    } catch (err: any) {
      if (err instanceof ValidationError || err instanceof BadRequestError || err instanceof InternalServerError || err instanceof BusinessLogicError) {
        throw err;
      }
      throw new InternalServerError(`Unexpected error in balance service: ${err.message}`);
    }
  }

  /**
   * Retrieves user balances by currency.
   * @param userId - The user ID to get balances for
   * @param currency - Optional currency filter (USD, XLM)
   * @returns Array of balance objects with formatted amounts
   */
  async getUserBalances(
    userId: string,
    currency?: string
  ): Promise<Array<{
    currency: string;
    available: string;
    held: string;
    total: string;
  }>> {
    const correlationId = crypto.randomUUID();

    try {
      logger.info(
        `[BalanceService] Starting getUserBalances ${correlationId} - User: ${userId}, Currency: ${currency || 'all'}`
      );

      // 1. Validation
      if (!validateUUID(userId)) {
        throw new BadRequestError("Invalid user ID format");
      }

      if (currency && !SUPPORTED_CURRENCIES.includes(currency as Currency)) {
        throw new ValidationError(`Currency ${currency} is not supported. Supported currencies: ${SUPPORTED_CURRENCIES.join(', ')}`);
      }

      // 2. Build query
      let query = supabase
        .from('balances')
        .select('currency, available, held')
        .eq('user_id', userId);

      // 3. Apply currency filter if provided
      if (currency) {
        query = query.eq('currency', currency);
      }

      // 4. Execute query
      const { data, error } = await query;

      if (error) {
        logger.error(`[BalanceService] Database Error ${correlationId}`, error);
        throw new InternalServerError(`Failed to retrieve balances: ${error.message}`);
      }

      // 5. Transform data to response format
      const balances = (data || []).map((balance) => {
        const available = Number(balance.available) || 0;
        const held = Number(balance.held) || 0;
        const total = available + held;

        return {
          currency: balance.currency,
          available: available.toFixed(2),
          held: held.toFixed(2),
          total: total.toFixed(2),
        };
      });

      logger.info(`[BalanceService] Success ${correlationId} - Found ${balances.length} balance(s)`);

      return balances;

    } catch (err: any) {
      if (err instanceof ValidationError || err instanceof BadRequestError || err instanceof InternalServerError) {
        throw err;
      }
      throw new InternalServerError(`Unexpected error in balance service: ${err.message}`);
    }
  }

  /**
   * Removes funds from a user's available balance.
   * Used when a withdrawal is completed or when funds are spent.
   * @param userId - The user to debit
   * @param amount - Amount to debit (must be positive)
   * @param currency - Currency code (USD, XLM)
   * @param reference - Source of the debit
   * @param description - Optional description
   * @returns Updated Balance object
   */
  async debitAvailable(
    userId: string,
    amount: number,
    currency: string,
    reference: DebitReference,
    description?: string
  ): Promise<Balance> {
    const correlationId = crypto.randomUUID();

    try {
      logger.info(
        `[BalanceService] Starting debitAvailable ${correlationId} - User: ${userId}, Amount: ${amount} ${currency}`
      );

      // 1. Validation
      if (!validateUUID(userId)) {
        throw new BadRequestError("Invalid user ID format");
      }

      if (amount <= 0) {
        throw new ValidationError("Amount must be positive");
      }

      if (!SUPPORTED_CURRENCIES.includes(currency as Currency)) {
        throw new ValidationError(`Currency ${currency} is not supported`);
      }

      if (!reference.id || !reference.type) {
        throw new ValidationError("Invalid reference data");
      }

      // 2. Atomic Transaction (via RPC)
      // We rely on a database function to lock the row, validate funds,
      // update balance, AND insert the log in one go.
      const { data, error } = await supabase.rpc('debit_available_balance', {
        p_user_id: userId,
        p_amount: amount,
        p_currency: currency,
        p_ref_id: reference.id,
        p_ref_type: reference.type,
        p_description: description || ''
      });

      if (error) {
        logger.error(`[BalanceService] RPC Error ${correlationId}`, error);

        // Check if error is about insufficient funds
        if (error.message && (
          error.message.toLowerCase().includes('insufficient') ||
          error.message.includes('no balance record')
        )) {
          throw new InsufficientFundsError(
            error.message,
            {
              userId,
              currency,
              requestedAmount: amount,
              correlationId
            }
          );
        }

        throw new InternalServerError(`Balance debit failed: ${error.message}`);
      }

      if (!data) {
        throw new InternalServerError("Balance update failed: No data returned");
      }

      logger.info(`[BalanceService] Success ${correlationId} - New Balance: ${data.available}`);

      return data as Balance;

    } catch (err: any) {
      if (
        err instanceof ValidationError ||
        err instanceof BadRequestError ||
        err instanceof InternalServerError ||
        err instanceof InsufficientFundsError
      ) {
        throw err;
      }
      throw new InternalServerError(`Unexpected error in balance service: ${err.message}`);
    }
  }

  /**
   * Holds funds from a user's available balance.
   * Used when initiating a withdrawal or other reserving action.
   * @param userId - The user to hold funds from
   * @param amount - Amount to hold (must be positive)
   * @param currency - Currency code (USD, XLM)
   * @param reference - Reference for the hold
   * @param description - Optional description
   * @returns Updated Balance object
   */
  async holdBalance(
    userId: string,
    amount: number,
    currency: string,
    reference: HoldReference,
    description?: string
  ): Promise<Balance> {
    const correlationId = crypto.randomUUID();

    try {
      logger.info(
        `[BalanceService] Starting holdBalance ${correlationId} - User: ${userId}, Amount: ${amount} ${currency}`
      );

      // 1. Validation
      if (!validateUUID(userId)) {
        throw new BadRequestError("Invalid user ID format");
      }

      if (amount <= 0) {
        throw new ValidationError("Amount must be positive");
      }

      if (!SUPPORTED_CURRENCIES.includes(currency as Currency)) {
        throw new ValidationError(`Currency ${currency} is not supported`);
      }

      if (!reference.id || !reference.type) {
        throw new ValidationError("Invalid reference data");
      }

      // 2. Atomic Transaction (via RPC)
      const { data, error } = await supabase.rpc('hold_balance', {
        p_user_id: userId,
        p_amount: amount,
        p_currency: currency,
        p_ref_id: reference.id,
        p_ref_type: reference.type,
        p_description: description || ''
      });

      if (error) {
        logger.error(`[BalanceService] RPC Error ${correlationId}`, error);

        if (error.message && (
          error.message.toLowerCase().includes('insufficient') ||
          error.message.includes('no balance record')
        )) {
          throw new InsufficientFundsError(
            error.message,
            {
              userId,
              currency,
              requestedAmount: amount,
              correlationId
            }
          );
        }

        throw new InternalServerError(`Balance hold failed: ${error.message}`);
      }

      if (!data) {
        throw new InternalServerError("Balance update failed: No data returned");
      }

      logger.info(`[BalanceService] Success ${correlationId} - New Balance: ${data.available} (Held: ${data.held})`);

      return data as Balance;

    } catch (err: any) {
      if (
        err instanceof ValidationError ||
        err instanceof BadRequestError ||
        err instanceof InternalServerError ||
        err instanceof InsufficientFundsError
      ) {
        throw err;
      }
      throw new InternalServerError(`Unexpected error in balance service: ${err.message}`);
    }
  }

  /**
   * Retrieves transaction history for a user with filtering and pagination.
   * @param userId - The user ID to get transaction history for
   * @param filters - Filter and pagination options
   * @returns Transaction history with pagination info
   */
  async getTransactionHistory(
    userId: string,
    filters: TransactionFilters
  ): Promise<TransactionHistoryResult> {
    const correlationId = crypto.randomUUID();

    try {
      logger.info(
        `[BalanceService] Starting getTransactionHistory ${correlationId} - User: ${userId}, Filters: ${JSON.stringify(filters)}`
      );

      // 1. Validation
      if (!validateUUID(userId)) {
        throw new BadRequestError("Invalid user ID format");
      }

      // Validate currency if provided
      if (filters.currency && !SUPPORTED_CURRENCIES.includes(filters.currency as Currency)) {
        throw new ValidationError(`Currency ${filters.currency} is not supported. Supported currencies: ${SUPPORTED_CURRENCIES.join(', ')}`);
      }

      // Validate transaction type if provided
      if (filters.type && !TRANSACTION_TYPES.includes(filters.type as TransactionType)) {
        throw new ValidationError(`Transaction type ${filters.type} is not supported. Supported types: ${TRANSACTION_TYPES.join(', ')}`);
      }

      // Validate date range
      if (filters.from && filters.to) {
        const fromDate = new Date(filters.from);
        const toDate = new Date(filters.to);

        if (isNaN(fromDate.getTime())) {
          throw new ValidationError('Invalid from date format');
        }

        if (isNaN(toDate.getTime())) {
          throw new ValidationError('Invalid to date format');
        }

        if (fromDate > toDate) {
          throw new ValidationError('from date must be before or equal to to date');
        }
      } else if (filters.from) {
        const fromDate = new Date(filters.from);
        if (isNaN(fromDate.getTime())) {
          throw new ValidationError('Invalid from date format');
        }
      } else if (filters.to) {
        const toDate = new Date(filters.to);
        if (isNaN(toDate.getTime())) {
          throw new ValidationError('Invalid to date format');
        }
      }

      // Validate pagination
      const page = filters.page !== undefined ? filters.page : 1;
      const limit = filters.limit !== undefined ? filters.limit : 20;

      if (page < 1) {
        throw new ValidationError('Page must be greater than 0');
      }

      if (limit < 1 || limit > 100) {
        throw new ValidationError('Limit must be between 1 and 100');
      }

      // 2. Build query
      let query = supabase
        .from('balance_transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      // Apply filters
      if (filters.currency) {
        query = query.eq('currency', filters.currency);
      }

      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.from) {
        query = query.gte('created_at', filters.from);
      }

      if (filters.to) {
        // Add one day to include the entire 'to' date
        const toDate = new Date(filters.to);
        toDate.setDate(toDate.getDate() + 1);
        query = query.lt('created_at', toDate.toISOString());
      }

      // Apply ordering (newest first)
      query = query.order('created_at', { ascending: false });

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      // 3. Execute query
      const { data, error, count } = await query;

      if (error) {
        logger.error(`[BalanceService] Database Error ${correlationId}`, error);
        throw new InternalServerError(`Failed to retrieve transaction history: ${error.message}`);
      }

      const total = count || 0;
      const pages = Math.ceil(total / limit);

      logger.info(
        `[BalanceService] Success ${correlationId} - Found ${data?.length || 0} transactions (Total: ${total})`
      );

      return {
        transactions: data || [],
        pagination: {
          page,
          limit,
          total,
          pages
        }
      };

    } catch (err: any) {
      if (
        err instanceof ValidationError ||
        err instanceof BadRequestError ||
        err instanceof InternalServerError
      ) {
        throw err;
      }
      throw new InternalServerError(`Unexpected error in balance service: ${err.message}`);
    }
  }


  /**
   * Moves funds from held balance back to available balance.
   * Used when a contract is cancelled and funds need to be released back to the client.
   * @param userId - The user whose funds will be released
   * @param amount - Amount to release (must be positive)
   * @param currency - Currency code (USD, XLM)
   * @param reference - Reference to the contract or escrow
   * @param description - Optional description
   * @returns Updated Balance object
   */
  async releaseBalance(
    userId: string,
    amount: number,
    currency: string,
    reference: ReleaseReference,
    description?: string
  ): Promise<Balance> {
    const correlationId = crypto.randomUUID();

    try {
      logger.info(
        `[BalanceService] Starting releaseBalance ${correlationId} - User: ${userId}, Amount: ${amount} ${currency}`
      );

      // 1. Validation
      if (!validateUUID(userId)) {
        throw new BadRequestError("Invalid user ID format");
      }

      if (amount <= 0) {
        throw new ValidationError("Amount must be positive");
      }

      if (!SUPPORTED_CURRENCIES.includes(currency as Currency)) {
        throw new ValidationError(`Currency ${currency} is not supported`);
      }

      if (!reference.id || !reference.type) {
        throw new ValidationError("Invalid reference data");
      }

      // 2. Atomic Transaction (via RPC)
      // We rely on a database function to lock the row, validate held funds,
      // move funds from held to available, AND insert the log in one go.
      const { data, error } = await supabase.rpc('release_balance', {
        p_user_id: userId,
        p_amount: amount,
        p_currency: currency,
        p_ref_id: reference.id,
        p_ref_type: reference.type,
        p_description: description || ''
      });

      if (error) {
        logger.error(`[BalanceService] RPC Error ${correlationId}`, error);

        // Check if error is about insufficient funds
        if (error.message && (
          error.message.includes('Insufficient held balance') ||
          error.message.includes('no balance record')
        )) {
          throw new BusinessLogicError(
            error.message,
            'INSUFFICIENT_HELD_FUNDS'
          );
        }

        throw new InternalServerError(`Balance release failed: ${error.message}`);
      }

      if (!data) {
        throw new InternalServerError("Balance update failed: No data returned");
      }

      logger.info(`[BalanceService] Success ${correlationId} - Available: ${data.available}, Held: ${data.held}`);

      return data as Balance;

    } catch (err: any) {
      if (
        err instanceof ValidationError ||
        err instanceof BadRequestError ||
        err instanceof InternalServerError ||
        err instanceof BusinessLogicError
      ) {
        throw err;
      }
      throw new InternalServerError(`Unexpected error in balance service: ${err.message}`);
    }
  }
}

export const balanceService = new BalanceService();
