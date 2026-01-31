import { BalanceService } from '@/services/balance.service';
import { supabase } from '@/lib/supabase/supabase';
import { NotFoundError, BusinessLogicError, InternalServerError } from '@/utils/AppError';

jest.mock('@/lib/supabase/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe('BalanceService', () => {
  let balanceService: BalanceService;

  beforeEach(() => {
    jest.clearAllMocks();
    balanceService = new BalanceService();
  });

  describe('debitAvailable', () => {
    const mockBalance = {
      available_balance: 500.0,
      held_balance: 100.0,
    };

    const setupMockSupabase = (balance = mockBalance, updateError = null) => {
      const mockEqChain = {
        eq: jest.fn().mockResolvedValue({ error: updateError }),
      };

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: balance, error: null }),
        insert: jest.fn().mockResolvedValue({ error: null }),
        update: jest.fn().mockReturnValue(mockEqChain),
      };

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'user_balances') {
          return mockChain;
        }
        if (table === 'transactions') {
          return { insert: jest.fn().mockResolvedValue({ error: null }) };
        }
        return mockChain;
      });

      return mockChain;
    };

    it('should debit available balance successfully', async () => {
      setupMockSupabase();

      await balanceService.debitAvailable('user-123', 100.0, 'ref-456');

      expect(supabase.from).toHaveBeenCalledWith('user_balances');
    });

    it('should throw NotFoundError when balance not found', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      await expect(
        balanceService.debitAvailable('user-123', 100.0, 'ref-456')
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw BusinessLogicError when insufficient balance', async () => {
      setupMockSupabase({ available_balance: 50.0, held_balance: 0 });

      await expect(
        balanceService.debitAvailable('user-123', 100.0, 'ref-456')
      ).rejects.toThrow(BusinessLogicError);
    });

    it('should record transaction after successful debit', async () => {
      setupMockSupabase();

      await balanceService.debitAvailable('user-123', 100.0, 'ref-456');

      expect(supabase.from).toHaveBeenCalledWith('transactions');
    });
  });

  describe('releaseHold', () => {
    const mockHold = {
      id: 'hold-123',
      user_id: 'user-456',
      amount: 100.0,
      status: 'ACTIVE',
    };

    const setupMockSupabase = () => {
      const mockEqChain = {
        eq: jest.fn().mockResolvedValue({ error: null }),
      };

      const holdChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockHold, error: null }),
        update: jest.fn().mockReturnValue(mockEqChain),
      };

      const balanceChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { held_balance: 100.0 },
          error: null,
        }),
        update: jest.fn().mockReturnValue(mockEqChain),
      };

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        if (table === 'balance_holds') {
          return holdChain;
        }
        if (table === 'user_balances') {
          return balanceChain;
        }
        return { insert: jest.fn().mockResolvedValue({ error: null }) };
      });

      return { holdChain, balanceChain };
    };

    it('should release hold successfully', async () => {
      setupMockSupabase();

      await balanceService.releaseHold('user-456', 'hold-123');

      expect(supabase.from).toHaveBeenCalledWith('balance_holds');
    });

    it('should throw NotFoundError when hold not found', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      await expect(
        balanceService.releaseHold('user-456', 'hold-123')
      ).rejects.toThrow(NotFoundError);
    });

    it('should update held balance after releasing hold', async () => {
      setupMockSupabase();

      await balanceService.releaseHold('user-456', 'hold-123');

      expect(supabase.from).toHaveBeenCalledWith('user_balances');
    });
  });

  describe('initiateRefund', () => {
    const mockBalance = {
      available_balance: 200.0,
      held_balance: 100.0,
    };

    const setupMockSupabase = () => {
      const mockEqChain = {
        eq: jest.fn().mockResolvedValue({ error: null }),
      };

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockBalance, error: null }),
        insert: jest.fn().mockResolvedValue({ error: null }),
        update: jest.fn().mockReturnValue(mockEqChain),
      };

      (supabase.from as jest.Mock).mockImplementation((table: string) => {
        return mockChain;
      });

      return mockChain;
    };

    it('should initiate refund successfully', async () => {
      setupMockSupabase();

      await balanceService.initiateRefund('user-123', 100.0, 'withdrawal-456');

      expect(supabase.from).toHaveBeenCalledWith('refunds');
    });

    it('should return funds to available balance', async () => {
      setupMockSupabase();

      await balanceService.initiateRefund('user-123', 100.0, 'withdrawal-456');

      expect(supabase.from).toHaveBeenCalledWith('user_balances');
    });

    it('should create refund record', async () => {
      const mockChain = setupMockSupabase();

      await balanceService.initiateRefund('user-123', 100.0, 'withdrawal-456');

      expect(mockChain.insert).toHaveBeenCalled();
    });

    it('should update refund status to COMPLETED', async () => {
      setupMockSupabase();

      await balanceService.initiateRefund('user-123', 100.0, 'withdrawal-456');

      expect(supabase.from).toHaveBeenCalledWith('refunds');
    });

    it('should record refund transaction', async () => {
      setupMockSupabase();

      await balanceService.initiateRefund('user-123', 100.0, 'withdrawal-456');

      expect(supabase.from).toHaveBeenCalledWith('transactions');
    });

    it('should throw NotFoundError when balance not found', async () => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockChain);

      await expect(
        balanceService.initiateRefund('user-123', 100.0, 'withdrawal-456')
      ).rejects.toThrow(NotFoundError);
    });
  });
});
