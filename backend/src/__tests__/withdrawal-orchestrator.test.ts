import { WithdrawalOrchestrator } from '@/services/withdrawal-orchestrator.service';
import { WithdrawalStateMachine } from '@/services/withdrawal-state-machine.service';
import { BalanceService } from '@/services/balance.service';
import {
  AirtmWebhookPayload,
  WithdrawalStatus,
  WithdrawalEvent,
  BalanceService as IBalanceService,
} from '@/types/withdrawal.types';
import { supabase } from '@/lib/supabase/supabase';
import { createHmac } from 'crypto';

// Mock Supabase
jest.mock('@/lib/supabase/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Mock crypto
jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  timingSafeEqual: jest.fn(),
}));

import * as crypto from 'crypto';

describe('WithdrawalOrchestrator', () => {
  let orchestrator: WithdrawalOrchestrator;
  let mockBalanceService: jest.Mocked<IBalanceService>;
  const webhookSecret = 'test-webhook-secret';

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock balance service
    mockBalanceService = {
      debitAvailable: jest.fn().mockResolvedValue(undefined),
      releaseHold: jest.fn().mockResolvedValue(undefined),
      initiateRefund: jest.fn().mockResolvedValue(undefined),
    };

    orchestrator = new WithdrawalOrchestrator(mockBalanceService, webhookSecret);
  });

  describe('processPayoutWebhook', () => {
    const mockWithdrawal = {
      id: 'withdrawal-123',
      user_id: 'user-456',
      amount: 100.5,
      currency: 'USD',
      status: WithdrawalStatus.PROCESSING,
      airtm_reference_id: 'airtm-ref-789',
      airtm_transaction_id: null,
      webhook_processed_at: null,
      webhook_event_id: null,
      failure_reason: null,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    };

    const createMockPayload = (
      event: string,
      status: string,
      failureReason?: string
    ): AirtmWebhookPayload => {
      const payload: any = {
        event,
        data: {
          reference_id: 'airtm-ref-789',
          transaction_id: 'txn-999',
          status,
          amount: 100.5,
          currency: 'USD',
          ...(failureReason && { failure_reason: failureReason }),
          ...(status === 'completed' && { completed_at: '2026-01-31T12:00:00Z' }),
          ...(status === 'failed' && { failed_at: '2026-01-31T12:00:00Z' }),
        },
        timestamp: '2026-01-31T12:00:00Z',
        event_id: `evt-${Date.now()}`,
      };

      // Generate signature
      const payloadString = JSON.stringify(payload);
      payload.signature = createHmac('sha256', webhookSecret)
        .update(payloadString)
        .digest('hex');

      return payload as AirtmWebhookPayload;
    };

    const setupMockSupabase = (
      withdrawal: typeof mockWithdrawal | null = mockWithdrawal,
      auditLogExists = false
    ) => {
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: withdrawal, error: null }),
        maybeSingle: jest.fn().mockResolvedValue({
          data: auditLogExists ? { id: 'audit-123' } : null,
          error: null,
        }),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockChain);
      return mockChain;
    };

    describe('Success Scenarios', () => {
      it('should process successful payout webhook and update withdrawal status', async () => {
        const payload = createMockPayload('payout.success', 'completed');
        setupMockSupabase();

        // Mock timingSafeEqual to return true (valid signature)
        (crypto.timingSafeEqual as jest.Mock).mockReturnValue(true);

        await orchestrator.processPayoutWebhook(payload);

        // Verify withdrawal was updated
        expect(supabase.from).toHaveBeenCalledWith('withdrawals');

        // Verify balance service was called
        expect(mockBalanceService.debitAvailable).toHaveBeenCalledWith(
          'user-456',
          100.5,
          'withdrawal-123'
        );

        // Verify audit log was created
        expect(supabase.from).toHaveBeenCalledWith('withdrawal_audit_logs');
      });

      it('should release hold after successful payout', async () => {
        const payload = createMockPayload('payout.success', 'completed');
        const mockChain = setupMockSupabase();

        // Mock hold_id retrieval
        mockChain.select.mockImplementation((columns: string) => {
          if (columns === 'hold_id') {
            return {
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: { hold_id: 'hold-789' },
                error: null,
              }),
            };
          }
          return mockChain;
        });

        (crypto.timingSafeEqual as jest.Mock).mockReturnValue(true);

        await orchestrator.processPayoutWebhook(payload);

        expect(mockBalanceService.releaseHold).toHaveBeenCalledWith(
          'user-456',
          'hold-789'
        );
      });

      it('should handle duplicate webhooks idempotently', async () => {
        const payload = createMockPayload('payout.success', 'completed');
        setupMockSupabase(mockWithdrawal, true); // auditLogExists = true

        (crypto.timingSafeEqual as jest.Mock).mockReturnValue(true);

        await orchestrator.processPayoutWebhook(payload);

        // Should not update withdrawal or call balance service for duplicate
        expect(mockBalanceService.debitAvailable).not.toHaveBeenCalled();
      });
    });

    describe('Failure Scenarios', () => {
      it('should process failed payout webhook and initiate refund', async () => {
        const payload = createMockPayload(
          'payout.failed',
          'failed',
          'Insufficient funds in sender account'
        );
        setupMockSupabase();

        (crypto.timingSafeEqual as jest.Mock).mockReturnValue(true);

        await orchestrator.processPayoutWebhook(payload);

        // Verify refund was initiated
        expect(mockBalanceService.initiateRefund).toHaveBeenCalledWith(
          'user-456',
          100.5,
          'withdrawal-123'
        );
      });

      it('should process cancelled payout webhook', async () => {
        const payload = createMockPayload(
          'payout.cancelled',
          'cancelled',
          'User cancelled the transaction'
        );
        setupMockSupabase();

        (crypto.timingSafeEqual as jest.Mock).mockReturnValue(true);

        await orchestrator.processPayoutWebhook(payload);

        expect(mockBalanceService.initiateRefund).toHaveBeenCalledWith(
          'user-456',
          100.5,
          'withdrawal-123'
        );
      });

      it('should update withdrawal status to WITHDRAWAL_FAILED', async () => {
        const payload = createMockPayload('payout.failed', 'failed', 'Bank rejected');
        setupMockSupabase();

        (crypto.timingSafeEqual as jest.Mock).mockReturnValue(true);

        await orchestrator.processPayoutWebhook(payload);

        // Verify update was called
        expect(supabase.from).toHaveBeenCalledWith('withdrawals');
      });
    });

    describe('Signature Validation', () => {
      it('should throw error for invalid webhook signature', async () => {
        const payload = createMockPayload('payout.success', 'completed');
        payload.signature = 'invalid-signature';

        (crypto.timingSafeEqual as jest.Mock).mockReturnValue(false);

        await expect(
          orchestrator.processPayoutWebhook(payload)
        ).rejects.toThrow('Invalid webhook signature');
      });

      it('should throw error for missing signature', async () => {
        const payload = createMockPayload('payout.success', 'completed');
        payload.signature = '';

        await expect(
          orchestrator.processPayoutWebhook(payload)
        ).rejects.toThrow('Missing webhook signature');
      });

      it('should throw error when webhook secret is not configured', async () => {
        const orchestratorWithoutSecret = new WithdrawalOrchestrator(
          mockBalanceService,
          ''
        );
        const payload = createMockPayload('payout.success', 'completed');

        await expect(
          orchestratorWithoutSecret.processPayoutWebhook(payload)
        ).rejects.toThrow('Webhook secret not configured');
      });
    });

    describe('Withdrawal Lookup', () => {
      it('should throw error when withdrawal not found', async () => {
        const payload = createMockPayload('payout.success', 'completed');
        setupMockSupabase(null);

        (crypto.timingSafeEqual as jest.Mock).mockReturnValue(true);

        await expect(
          orchestrator.processPayoutWebhook(payload)
        ).rejects.toThrow('Withdrawal not found for reference ID');
      });
    });

    describe('State Transition Validation', () => {
      it('should throw error for invalid state transition', async () => {
        const completedWithdrawal = {
          ...mockWithdrawal,
          status: WithdrawalStatus.WITHDRAWAL_SUCCEEDED,
        };
        const payload = createMockPayload('payout.success', 'completed');
        setupMockSupabase(completedWithdrawal);

        (crypto.timingSafeEqual as jest.Mock).mockReturnValue(true);

        await expect(
          orchestrator.processPayoutWebhook(payload)
        ).rejects.toThrow('Invalid state transition');
      });
    });

    describe('Audit Log Creation', () => {
      it('should create audit log entry with correct data', async () => {
        const payload = createMockPayload('payout.success', 'completed');
        setupMockSupabase();

        (crypto.timingSafeEqual as jest.Mock).mockReturnValue(true);

        await orchestrator.processPayoutWebhook(payload);

        // Verify audit log insert was called
        expect(supabase.from).toHaveBeenCalledWith('withdrawal_audit_logs');
      });
    });
  });

  describe('WithdrawalStateMachine', () => {
    let stateMachine: WithdrawalStateMachine;

    beforeEach(() => {
      stateMachine = new WithdrawalStateMachine();
    });

    describe('canTransition', () => {
      it('should allow valid transitions', () => {
        expect(
          stateMachine.canTransition(
            WithdrawalStatus.PENDING,
            WithdrawalEvent.PROCESS
          )
        ).toBe(true);

        expect(
          stateMachine.canTransition(
            WithdrawalStatus.PROCESSING,
            WithdrawalEvent.SUCCESS
          )
        ).toBe(true);

        expect(
          stateMachine.canTransition(
            WithdrawalStatus.PROCESSING,
            WithdrawalEvent.FAIL
          )
        ).toBe(true);

        expect(
          stateMachine.canTransition(
            WithdrawalStatus.WITHDRAWAL_FAILED,
            WithdrawalEvent.REFUND
          )
        ).toBe(true);
      });

      it('should deny invalid transitions', () => {
        expect(
          stateMachine.canTransition(
            WithdrawalStatus.WITHDRAWAL_SUCCEEDED,
            WithdrawalEvent.SUCCESS
          )
        ).toBe(false);

        expect(
          stateMachine.canTransition(
            WithdrawalStatus.PENDING,
            WithdrawalEvent.SUCCESS
          )
        ).toBe(false);

        expect(
          stateMachine.canTransition(
            WithdrawalStatus.REFUNDED,
            WithdrawalEvent.REFUND
          )
        ).toBe(false);
      });
    });

    describe('getNextStatus', () => {
      it('should return correct next status', () => {
        expect(
          stateMachine.getNextStatus(
            WithdrawalStatus.PENDING,
            WithdrawalEvent.PROCESS
          )
        ).toBe(WithdrawalStatus.PROCESSING);

        expect(
          stateMachine.getNextStatus(
            WithdrawalStatus.PROCESSING,
            WithdrawalEvent.SUCCESS
          )
        ).toBe(WithdrawalStatus.WITHDRAWAL_SUCCEEDED);

        expect(
          stateMachine.getNextStatus(
            WithdrawalStatus.PROCESSING,
            WithdrawalEvent.FAIL
          )
        ).toBe(WithdrawalStatus.WITHDRAWAL_FAILED);
      });

      it('should throw for invalid transitions', () => {
        expect(() => {
          stateMachine.getNextStatus(
            WithdrawalStatus.WITHDRAWAL_SUCCEEDED,
            WithdrawalEvent.SUCCESS
          );
        }).toThrow('Cannot transition from');
      });
    });

    describe('mapWebhookEventToWithdrawalEvent', () => {
      it('should map payout.success to SUCCESS', () => {
        expect(
          WithdrawalStateMachine.mapWebhookEventToWithdrawalEvent('payout.success')
        ).toBe(WithdrawalEvent.SUCCESS);
      });

      it('should map payout.failed to FAIL', () => {
        expect(
          WithdrawalStateMachine.mapWebhookEventToWithdrawalEvent('payout.failed')
        ).toBe(WithdrawalEvent.FAIL);
      });

      it('should map payout.cancelled to FAIL', () => {
        expect(
          WithdrawalStateMachine.mapWebhookEventToWithdrawalEvent('payout.cancelled')
        ).toBe(WithdrawalEvent.FAIL);
      });

      it('should throw for unknown events', () => {
        expect(() => {
          WithdrawalStateMachine.mapWebhookEventToWithdrawalEvent('unknown.event');
        }).toThrow('Unknown webhook event');
      });
    });
  });
});
