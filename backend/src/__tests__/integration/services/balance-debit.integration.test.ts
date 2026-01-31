/**
 * @fileoverview Integration tests for Balance Service - debitAvailable method
 * @author Offer Hub Team
 */

// Mock Supabase to avoid requiring environment variables
jest.mock('@/lib/supabase/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn()
  }
}));

import { balanceService } from '@/services/balance.service';
import { supabase } from '@/lib/supabase/supabase';
import { ValidationError, BadRequestError, InternalServerError, InsufficientFundsError } from '@/utils/AppError';

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('BalanceService - debitAvailable Integration Tests', () => {
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockRef = { id: 'withdrawal-123', type: 'withdrawal' as const };

  const mockBalanceBefore = {
    id: 'bal-123',
    user_id: mockUserId,
    currency: 'USD',
    available: 100.00000000,
    held: 0.00000000,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const mockBalanceAfter = {
    ...mockBalanceBefore,
    available: 50.00000000,
    updated_at: '2024-01-01T01:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Debit Operations', () => {
    it('should successfully debit available balance', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: mockBalanceAfter,
        error: null,
      });

      const result = await balanceService.debitAvailable(
        mockUserId,
        50.00,
        'USD',
        mockRef,
        'Withdrawal to bank account'
      );

      expect(mockSupabase.rpc).toHaveBeenCalledWith('debit_available_balance', {
        p_user_id: mockUserId,
        p_amount: 50.00,
        p_currency: 'USD',
        p_ref_id: mockRef.id,
        p_ref_type: mockRef.type,
        p_description: 'Withdrawal to bank account',
      });

      expect(result).toEqual(mockBalanceAfter);
      expect(result.available).toBe(50.00000000);
    });

    it('should handle withdrawal reference type', async () => {
      const withdrawalRef = { id: 'wd-456', type: 'withdrawal' as const };
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: { ...mockBalanceAfter, available: 75.00000000 },
        error: null,
      });

      const result = await balanceService.debitAvailable(
        mockUserId,
        25.00,
        'USD',
        withdrawalRef
      );

      expect(result.available).toBe(75.00000000);
    });

    it('should handle payment reference type', async () => {
      const paymentRef = { id: 'pay-789', type: 'payment' as const };
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: { ...mockBalanceAfter, available: 90.00000000 },
        error: null,
      });

      const result = await balanceService.debitAvailable(
        mockUserId,
        10.00,
        'USD',
        paymentRef,
        'Payment for service'
      );

      expect(result.available).toBe(90.00000000);
    });

    it('should handle fee reference type', async () => {
      const feeRef = { id: 'fee-101', type: 'fee' as const };
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: { ...mockBalanceAfter, available: 99.00000000 },
        error: null,
      });

      const result = await balanceService.debitAvailable(
        mockUserId,
        1.00,
        'USD',
        feeRef,
        'Platform fee'
      );

      expect(result.available).toBe(99.00000000);
    });

    it('should work with XLM currency', async () => {
      const xlmBalance = {
        ...mockBalanceAfter,
        currency: 'XLM',
        available: 150.00000000,
      };

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: xlmBalance,
        error: null,
      });

      const result = await balanceService.debitAvailable(
        mockUserId,
        50.00,
        'XLM',
        mockRef
      );

      expect(result.currency).toBe('XLM');
      expect(result.available).toBe(150.00000000);
    });
  });

  describe('Validation and Error Handling', () => {
    it('should reject negative amounts', async () => {
      await expect(
        balanceService.debitAvailable(mockUserId, -10, 'USD', mockRef)
      ).rejects.toThrow(ValidationError);

      expect(mockSupabase.rpc).not.toHaveBeenCalled();
    });

    it('should reject zero amounts', async () => {
      await expect(
        balanceService.debitAvailable(mockUserId, 0, 'USD', mockRef)
      ).rejects.toThrow(ValidationError);

      expect(mockSupabase.rpc).not.toHaveBeenCalled();
    });

    it('should reject invalid user IDs', async () => {
      await expect(
        balanceService.debitAvailable('invalid-uuid', 50, 'USD', mockRef)
      ).rejects.toThrow(BadRequestError);

      expect(mockSupabase.rpc).not.toHaveBeenCalled();
    });

    it('should reject unsupported currencies', async () => {
      await expect(
        balanceService.debitAvailable(mockUserId, 50, 'EUR', mockRef)
      ).rejects.toThrow(ValidationError);

      expect(mockSupabase.rpc).not.toHaveBeenCalled();
    });

    it('should handle insufficient funds error from database', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: {
          message: 'Insufficient funds: required 150, but only 100 available',
        },
      });

      await expect(
        balanceService.debitAvailable(mockUserId, 150, 'USD', mockRef)
      ).rejects.toThrow(InsufficientFundsError);

      const error = await balanceService.debitAvailable(
        mockUserId,
        150,
        'USD',
        mockRef
      ).catch((e: any) => e);

      expect(error.errorCode).toBe('INSUFFICIENT_FUNDS');
      expect(error.details).toMatchObject({
        userId: mockUserId,
        currency: 'USD',
        requestedAmount: 150,
      });
    });

    it('should handle user with no balance record', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: {
          message: 'Insufficient funds: user has no balance record for currency USD',
        },
      });

      await expect(
        balanceService.debitAvailable(mockUserId, 50, 'USD', mockRef)
      ).rejects.toThrow(InsufficientFundsError);
    });

    it('should handle database errors gracefully', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: {
          message: 'Database connection timeout',
        },
      });

      await expect(
        balanceService.debitAvailable(mockUserId, 50, 'USD', mockRef)
      ).rejects.toThrow(InternalServerError);
    });

    it('should handle missing data response', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(
        balanceService.debitAvailable(mockUserId, 50, 'USD', mockRef)
      ).rejects.toThrow(InternalServerError);
    });
  });

  describe('Concurrency and Edge Cases', () => {
    it('should handle exact balance match (available === amount)', async () => {
      const zeroBalance = {
        ...mockBalanceAfter,
        available: 0.00000000,
      };

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: zeroBalance,
        error: null,
      });

      const result = await balanceService.debitAvailable(
        mockUserId,
        100.00,
        'USD',
        mockRef
      );

      expect(result.available).toBe(0.00000000);
    });

    it('should handle very small amounts', async () => {
      const smallDebitBalance = {
        ...mockBalanceAfter,
        available: 99.99999999,
      };

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: smallDebitBalance,
        error: null,
      });

      const result = await balanceService.debitAvailable(
        mockUserId,
        0.00000001,
        'USD',
        mockRef
      );

      expect(result.available).toBe(99.99999999);
    });

    it('should handle empty description', async () => {
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: mockBalanceAfter,
        error: null,
      });

      await balanceService.debitAvailable(mockUserId, 50, 'USD', mockRef);

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'debit_available_balance',
        expect.objectContaining({
          p_description: '',
        })
      );
    });

    it('should handle large amounts', async () => {
      const largeDebitBalance = {
        ...mockBalanceAfter,
        available: 0.00000000,
      };

      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: largeDebitBalance,
        error: null,
      });

      const result = await balanceService.debitAvailable(
        mockUserId,
        1000000.00,
        'USD',
        mockRef
      );

      expect(result.available).toBe(0.00000000);
    });
  });

  describe('Logging and Correlation IDs', () => {
    it('should log operation start and success', async () => {
      const { logger } = require('@/utils/logger');
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: mockBalanceAfter,
        error: null,
      });

      await balanceService.debitAvailable(mockUserId, 50, 'USD', mockRef);

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('[BalanceService] Starting debitAvailable')
      );
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('[BalanceService] Success')
      );
    });

    it('should log errors with correlation ID', async () => {
      const { logger } = require('@/utils/logger');
      (mockSupabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      try {
        await balanceService.debitAvailable(mockUserId, 50, 'USD', mockRef);
      } catch (error) {
        // Expected to throw
      }

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('[BalanceService] RPC Error'),
        expect.anything()
      );
    });
  });
});
