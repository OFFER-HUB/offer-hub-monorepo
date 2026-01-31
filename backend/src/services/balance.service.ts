import { supabase } from '@/lib/supabase/supabase';
import {
  Balance,
  BalanceTransaction,
  CreditReference,
  DebitReference,
  HoldReference,
  ReleaseReference,
  SUPPORTED_CURRENCIES,
  TransactionFilters,
  TransactionHistoryResult,
} from '@/types/balance.types';
import { BalanceService as IBalanceService } from '@/types/withdrawal.types';
import { logger } from '@/utils/logger';
import { validateUUID } from '@/utils/validation';
import {
  BadRequestError,
  BusinessLogicError,
  InternalServerError,
  NotFoundError,
  InsufficientFundsError,
  ValidationError,
} from '@/utils/AppError';

/**
 * Balance Service
 * Manages user balances, holds, debits, and refunds
 */
export class BalanceService implements IBalanceService {
  private assertValidUserId(userId: string): void {
    if (!validateUUID(userId)) {
      throw new BadRequestError('Invalid user ID format');
    }
  }

  private assertValidAmount(amount: number): void {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new ValidationError('Amount must be greater than 0');
    }
  }

  private assertValidCurrency(currency: string): void {
    if (!SUPPORTED_CURRENCIES.includes(currency as any)) {
      throw new ValidationError(`Unsupported currency: ${currency}`);
    }
  }

  private assertValidReference(reference: { id: string; type: string }): void {
    if (!reference?.id || !reference?.type) {
      throw new ValidationError('Invalid reference');
    }
  }

  /**
   * Credit available balance
   */
  async creditAvailable(
    userId: string,
    amount: number,
    currency: string,
    reference: CreditReference,
    description = ''
  ): Promise<Balance> {
    this.assertValidUserId(userId);
    this.assertValidAmount(amount);
    this.assertValidCurrency(currency);
    this.assertValidReference(reference);

    const { data, error } = await supabase.rpc('credit_available_balance', {
      p_user_id: userId,
      p_amount: amount,
      p_currency: currency,
      p_ref_id: reference.id,
      p_ref_type: reference.type,
      p_description: description,
    });

    if (error) {
      logger.error('[BalanceService] creditAvailable error', error);
      throw new InternalServerError('Failed to credit balance', error);
    }

    return data as Balance;
  }

  /**
   * Get user balances
   */
  async getUserBalances(
    userId: string,
    currency?: string
  ): Promise<Array<{ currency: string; available: string; held: string; total: string }>> {
    this.assertValidUserId(userId);
    if (currency) {
      this.assertValidCurrency(currency);
    }

    let query = supabase
      .from('balances')
      .select('currency, available, held')
      .eq('user_id', userId);

    if (currency) {
      query = query.eq('currency', currency);
    }

    const { data, error } = await query;

    if (error) {
      throw new InternalServerError('Failed to fetch balances', error);
    }

    const balances = (data || []) as Array<{ currency: string; available: number; held: number }>;
    return balances.map((balance) => {
      const available = Number(balance.available || 0);
      const held = Number(balance.held || 0);
      return {
        currency: balance.currency,
        available: available.toFixed(2),
        held: held.toFixed(2),
        total: (available + held).toFixed(2),
      };
    });
  }

  /**
   * Settle balance between two users
   */
  async settleBalance(
    fromUserId: string,
    toUserId: string,
    amount: number,
    currency: string,
    reference: HoldReference,
    description = ''
  ): Promise<{ fromBalance: Balance; toBalance: Balance }> {
    this.assertValidUserId(fromUserId);
    this.assertValidUserId(toUserId);
    this.assertValidAmount(amount);
    this.assertValidCurrency(currency);
    this.assertValidReference(reference);

    if (fromUserId === toUserId) {
      throw new ValidationError('Cannot settle balance to the same user');
    }

    const { data, error } = await supabase.rpc('settle_balance', {
      p_from_user_id: fromUserId,
      p_to_user_id: toUserId,
      p_amount: amount,
      p_currency: currency,
      p_ref_id: reference.id,
      p_ref_type: reference.type,
      p_description: description || `Settlement for ${reference.type} ${reference.id}`,
    });

    if (error) {
      logger.error('[BalanceService] settleBalance error', error);
      throw new BusinessLogicError('Failed to settle balance', 'SETTLE_BALANCE_FAILED');
    }

    return data as { fromBalance: Balance; toBalance: Balance };
  }

  /**
   * Debit available balance
   * Called when a withdrawal is successfully processed
   */
  async debitAvailable(
    userId: string,
    amount: number,
    referenceId: string
  ): Promise<void>;
  async debitAvailable(
    userId: string,
    amount: number,
    currency: string,
    reference: DebitReference,
    description?: string
  ): Promise<Balance>;
  async debitAvailable(
    userId: string,
    amount: number,
    currencyOrReferenceId: string,
    reference?: DebitReference,
    description = ''
  ): Promise<Balance | void> {
    // New RPC-based signature
    if (reference) {
      const currency = currencyOrReferenceId;
      this.assertValidUserId(userId);
      this.assertValidAmount(amount);
      this.assertValidCurrency(currency);
      this.assertValidReference(reference);

      const { data, error } = await supabase.rpc('debit_available_balance', {
        p_user_id: userId,
        p_amount: amount,
        p_currency: currency,
        p_ref_id: reference.id,
        p_ref_type: reference.type,
        p_description: description,
      });

      if (error) {
        logger.error('[BalanceService] debitAvailable error', error);
        throw new InsufficientFundsError(
          'Insufficient available balance',
          { userId, currency, requestedAmount: amount }
        );
      }

      return data as Balance;
    }

    // Legacy flow (no currency provided)
    const referenceId = currencyOrReferenceId;
    // Fetch current balance
    const { data: balance, error: fetchError } = await supabase
      .from('user_balances')
      .select('available_balance, held_balance')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new NotFoundError(
          `Balance not found for user: ${userId}`,
          'BALANCE_NOT_FOUND'
        );
      }
      throw new InternalServerError('Error fetching user balance', fetchError);
    }

    // Validate sufficient balance
    if (balance.available_balance < amount) {
      throw new BusinessLogicError(
        'Insufficient available balance',
        'INSUFFICIENT_BALANCE'
      );
    }

    // Update balance - deduct from available
    const { error: updateError } = await supabase
      .from('user_balances')
      .update({
        available_balance: balance.available_balance - amount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      throw new InternalServerError('Error debiting available balance', updateError);
    }

    // Record transaction
    await this.recordTransaction({
      user_id: userId,
      type: 'DEBIT',
      amount,
      reference_id: referenceId,
      description: 'Withdrawal processed successfully',
    });
  }

  /**
   * Hold balance
   */
  async holdBalance(
    userId: string,
    amount: number,
    currency: string,
    reference: HoldReference,
    description = ''
  ): Promise<Balance> {
    this.assertValidUserId(userId);
    this.assertValidAmount(amount);
    this.assertValidCurrency(currency);
    this.assertValidReference(reference);

    const { data, error } = await supabase.rpc('hold_balance', {
      p_user_id: userId,
      p_amount: amount,
      p_currency: currency,
      p_ref_id: reference.id,
      p_ref_type: reference.type,
      p_description: description,
    });

    if (error) {
      logger.error('[BalanceService] holdBalance error', error);
      throw new InsufficientFundsError(
        'Insufficient available balance',
        { userId, currency, requestedAmount: amount }
      );
    }

    return data as Balance;
  }

  /**
   * Release balance
   */
  async releaseBalance(
    userId: string,
    amount: number,
    currency: string,
    reference: ReleaseReference,
    description = ''
  ): Promise<Balance> {
    this.assertValidUserId(userId);
    this.assertValidAmount(amount);
    this.assertValidCurrency(currency);
    this.assertValidReference(reference);

    const { data, error } = await supabase.rpc('release_balance', {
      p_user_id: userId,
      p_amount: amount,
      p_currency: currency,
      p_ref_id: reference.id,
      p_ref_type: reference.type,
      p_description: description,
    });

    if (error) {
      logger.error('[BalanceService] releaseBalance error', error);
      throw new BusinessLogicError('Insufficient held balance', 'INSUFFICIENT_HELD');
    }

    return data as Balance;
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(
    userId: string,
    filters: TransactionFilters
  ): Promise<TransactionHistoryResult> {
    this.assertValidUserId(userId);

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    let query = supabase
      .from('balance_transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (filters.currency) {
      this.assertValidCurrency(filters.currency);
      query = query.eq('currency', filters.currency);
    }

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.from) {
      query = query.gte('created_at', filters.from);
    }

    if (filters.to) {
      query = query.lte('created_at', filters.to);
    }

    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const { data, error, count } = await query.range(start, end);

    if (error) {
      throw new InternalServerError('Failed to fetch transaction history', error);
    }

    const total = count ?? 0;

    return {
      transactions: (data || []) as BalanceTransaction[],
      pagination: {
        page,
        limit,
        total,
        pages: limit > 0 ? Math.ceil(total / limit) : 0,
      },
    };
  }

  /**
   * Release a hold on balance
   * Called after successful withdrawal to release the held amount
   */
  async releaseHold(userId: string, holdId: string): Promise<void> {
    // Fetch the hold
    const { data: hold, error: fetchError } = await supabase
      .from('balance_holds')
      .select('*')
      .eq('id', holdId)
      .eq('user_id', userId)
      .eq('status', 'ACTIVE')
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new NotFoundError(
          `Active hold not found: ${holdId}`,
          'HOLD_NOT_FOUND'
        );
      }
      throw new InternalServerError('Error fetching hold', fetchError);
    }

    // Update hold status to RELEASED
    const { error: updateError } = await supabase
      .from('balance_holds')
      .update({
        status: 'RELEASED',
        released_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', holdId);

    if (updateError) {
      throw new InternalServerError('Error releasing hold', updateError);
    }

    // Update user balance - reduce held balance
    const { data: balance, error: balanceError } = await supabase
      .from('user_balances')
      .select('held_balance')
      .eq('user_id', userId)
      .single();

    if (balanceError) {
      throw new InternalServerError('Error fetching balance', balanceError);
    }

    const { error: balanceUpdateError } = await supabase
      .from('user_balances')
      .update({
        held_balance: Math.max(0, balance.held_balance - hold.amount),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (balanceUpdateError) {
      throw new InternalServerError('Error updating held balance', balanceUpdateError);
    }
  }

  /**
   * Initiate a refund
   * Called when a withdrawal fails - returns funds to user's available balance
   */
  async initiateRefund(
    userId: string,
    amount: number,
    withdrawalId: string
  ): Promise<void> {
    // Fetch current balance
    const { data: balance, error: fetchError } = await supabase
      .from('user_balances')
      .select('available_balance, held_balance')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw new NotFoundError(
          `Balance not found for user: ${userId}`,
          'BALANCE_NOT_FOUND'
        );
      }
      throw new InternalServerError('Error fetching user balance', fetchError);
    }

    // Create refund record
    const { error: refundError } = await supabase.from('refunds').insert({
      user_id: userId,
      withdrawal_id: withdrawalId,
      amount,
      status: 'PENDING',
      created_at: new Date().toISOString(),
    });

    if (refundError) {
      throw new InternalServerError('Error creating refund record', refundError);
    }

    // Release hold and return funds to available balance
    const { error: updateError } = await supabase
      .from('user_balances')
      .update({
        available_balance: balance.available_balance + amount,
        held_balance: Math.max(0, balance.held_balance - amount),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      throw new InternalServerError('Error processing refund', updateError);
    }

    // Update refund status to COMPLETED
    const { error: refundUpdateError } = await supabase
      .from('refunds')
      .update({
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('withdrawal_id', withdrawalId);

    if (refundUpdateError) {
      throw new InternalServerError('Error updating refund status', refundUpdateError);
    }

    // Record transaction
    await this.recordTransaction({
      user_id: userId,
      type: 'REFUND',
      amount,
      reference_id: withdrawalId,
      description: 'Refund for failed withdrawal',
    });
  }

  /**
   * Record a transaction
   */
  private async recordTransaction(transaction: {
    user_id: string;
    type: string;
    amount: number;
    reference_id: string;
    description: string;
  }): Promise<void> {
    const { error } = await supabase.from('transactions').insert({
      ...transaction,
      created_at: new Date().toISOString(),
    });

    if (error) {
      // Log but don't throw - transaction recording shouldn't break the main flow
      console.error('Error recording transaction:', error);
    }
  }
}

export const balanceService = new BalanceService();
