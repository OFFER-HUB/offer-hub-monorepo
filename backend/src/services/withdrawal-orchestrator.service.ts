import { createHmac } from 'crypto';
import { supabase } from '@/lib/supabase/supabase';
import {
  AirtmWebhookPayload,
  Withdrawal,
  WithdrawalStatus,
  WithdrawalEvent,
  WebhookProcessingResult,
  BalanceService,
} from '@/types/withdrawal.types';
import { WithdrawalStateMachine } from './withdrawal-state-machine.service';
import {
  BusinessLogicError,
  NotFoundError,
  AuthenticationError,
  InternalServerError,
} from '@/utils/AppError';

/**
 * Withdrawal Orchestrator Service
 * Handles Airtm webhook processing and withdrawal state management
 */
export class WithdrawalOrchestrator {
  private readonly stateMachine: WithdrawalStateMachine;
  private readonly balanceService: BalanceService;
  private readonly airtmWebhookSecret: string;

  constructor(balanceService: BalanceService, airtmWebhookSecret?: string) {
    this.stateMachine = new WithdrawalStateMachine();
    this.balanceService = balanceService;
    this.airtmWebhookSecret =
      airtmWebhookSecret || process.env.AIRTM_WEBHOOK_SECRET || '';
  }

  /**
   * Process Airtm payout webhook
   * Validates signature, updates withdrawal status, and handles success/failure
   */
  async processPayoutWebhook(webhookPayload: AirtmWebhookPayload): Promise<void> {
    // 1. Validate webhook signature
    this.validateWebhookSignature(webhookPayload);

    const { event, data, event_id } = webhookPayload;
    const { reference_id, transaction_id, status, failure_reason } = data;

    // 2. Find withdrawal by Airtm reference ID
    const withdrawal = await this.findWithdrawalByReferenceId(reference_id);

    if (!withdrawal) {
      throw new NotFoundError(
        `Withdrawal not found for reference ID: ${reference_id}`,
        'WITHDRAWAL_NOT_FOUND'
      );
    }

    // 3. Check for duplicate webhook (idempotency)
    const isDuplicate = await this.checkDuplicateWebhook(event_id, withdrawal.id);
    if (isDuplicate) {
      console.log(
        `Duplicate webhook received for withdrawal ${withdrawal.id}, event_id: ${event_id}`
      );
      return;
    }

    // 4. Map webhook event to withdrawal event
    const withdrawalEvent =
      WithdrawalStateMachine.mapWebhookEventToWithdrawalEvent(event);

    // 5. Validate state transition
    this.stateMachine.validateTransition(withdrawal.status, withdrawalEvent);

    // 6. Get next status
    const newStatus = this.stateMachine.getNextStatus(
      withdrawal.status,
      withdrawalEvent
    );

    // 7. Process based on event type
    try {
      if (event === 'payout.success') {
        await this.handleSuccessEvent(
          withdrawal,
          transaction_id,
          newStatus,
          event_id
        );
      } else if (event === 'payout.failed' || event === 'payout.cancelled') {
        await this.handleFailureEvent(
          withdrawal,
          transaction_id,
          newStatus,
          event_id,
          failure_reason
        );
      }

      // 8. Create audit log entry
      await this.createAuditLog(
        withdrawal.id,
        event,
        withdrawal.status,
        newStatus,
        {
          reference_id,
          transaction_id,
          webhook_event_id: event_id,
          failure_reason,
        }
      );
    } catch (error) {
      // Log the error and re-throw
      console.error('Error processing payout webhook:', error);
      throw new InternalServerError(
        'Failed to process payout webhook',
        error
      );
    }
  }

  /**
   * Validate webhook signature using HMAC
   */
  private validateWebhookSignature(payload: AirtmWebhookPayload): void {
    if (!this.airtmWebhookSecret) {
      throw new AuthenticationError(
        'Webhook secret not configured',
        'WEBHOOK_SECRET_MISSING'
      );
    }

    const { signature, ...payloadWithoutSignature } = payload;

    if (!signature) {
      throw new AuthenticationError(
        'Missing webhook signature',
        'MISSING_WEBHOOK_SIGNATURE'
      );
    }

    // Create expected signature
    const payloadString = JSON.stringify(payloadWithoutSignature);
    const expectedSignature = createHmac(
      'sha256',
      this.airtmWebhookSecret
    )
      .update(payloadString)
      .digest('hex');

    // Compare signatures using timing-safe comparison
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      throw new AuthenticationError(
        'Invalid webhook signature',
        'INVALID_WEBHOOK_SIGNATURE'
      );
    }
  }

  /**
   * Find withdrawal by Airtm reference ID
   */
  private async findWithdrawalByReferenceId(
    referenceId: string
  ): Promise<Withdrawal | null> {
    const { data, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('airtm_reference_id', referenceId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new InternalServerError(
        'Error fetching withdrawal',
        error
      );
    }

    return data as Withdrawal;
  }

  /**
   * Check if webhook has already been processed (idempotency)
   */
  private async checkDuplicateWebhook(
    eventId: string,
    withdrawalId: string
  ): Promise<boolean> {
    // Check if this event_id has already been processed
    const { data, error } = await supabase
      .from('withdrawal_audit_logs')
      .select('id')
      .eq('withdrawal_id', withdrawalId)
      .eq('metadata->>webhook_event_id', eventId)
      .maybeSingle();

    if (error) {
      throw new InternalServerError(
        'Error checking for duplicate webhook',
        error
      );
    }

    return !!data;
  }

  /**
   * Handle successful payout event
   */
  private async handleSuccessEvent(
    withdrawal: Withdrawal,
    transactionId: string,
    newStatus: WithdrawalStatus,
    eventId: string
  ): Promise<void> {
    // 1. Update withdrawal status
    const { error: updateError } = await supabase
      .from('withdrawals')
      .update({
        status: newStatus,
        airtm_transaction_id: transactionId,
        webhook_processed_at: new Date().toISOString(),
        webhook_event_id: eventId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', withdrawal.id);

    if (updateError) {
      throw new InternalServerError(
        'Failed to update withdrawal status',
        updateError
      );
    }

    // 2. Call BalanceService.debitAvailable() to finalize deduction
    await this.balanceService.debitAvailable(
      withdrawal.user_id,
      withdrawal.amount,
      withdrawal.id
    );

    // 3. Release hold (if applicable)
    // The hold ID would typically be stored when the withdrawal was initiated
    const holdId = await this.getHoldIdForWithdrawal(withdrawal.id);
    if (holdId) {
      await this.balanceService.releaseHold(withdrawal.user_id, holdId);
    }
  }

  /**
   * Handle failed payout event
   */
  private async handleFailureEvent(
    withdrawal: Withdrawal,
    transactionId: string,
    newStatus: WithdrawalStatus,
    eventId: string,
    failureReason?: string
  ): Promise<void> {
    // 1. Update withdrawal status
    const { error: updateError } = await supabase
      .from('withdrawals')
      .update({
        status: newStatus,
        airtm_transaction_id: transactionId,
        webhook_processed_at: new Date().toISOString(),
        webhook_event_id: eventId,
        failure_reason: failureReason || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', withdrawal.id);

    if (updateError) {
      throw new InternalServerError(
        'Failed to update withdrawal status',
        updateError
      );
    }

    // 2. Initiate refund process
    await this.balanceService.initiateRefund(
      withdrawal.user_id,
      withdrawal.amount,
      withdrawal.id
    );

    // 3. Transition to REFUNDING status
    await this.transitionToRefunding(withdrawal.id);
  }

  /**
   * Transition withdrawal to REFUNDING status
   */
  private async transitionToRefunding(withdrawalId: string): Promise<void> {
    const refundingStatus = WithdrawalStatus.REFUNDING;

    const { error } = await supabase
      .from('withdrawals')
      .update({
        status: refundingStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', withdrawalId);

    if (error) {
      throw new InternalServerError(
        'Failed to transition to REFUNDING status',
        error
      );
    }
  }

  /**
   * Create audit log entry
   */
  private async createAuditLog(
    withdrawalId: string,
    eventType: string,
    previousStatus: WithdrawalStatus,
    newStatus: WithdrawalStatus,
    metadata: Record<string, any>
  ): Promise<void> {
    const { error } = await supabase.from('withdrawal_audit_logs').insert({
      withdrawal_id: withdrawalId,
      event_type: eventType,
      previous_status: previousStatus,
      new_status: newStatus,
      metadata,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Failed to create audit log:', error);
      // Don't throw here - audit log failure shouldn't break the main flow
    }
  }

  /**
   * Get hold ID for a withdrawal (placeholder implementation)
   * In a real implementation, this would fetch from a holds table
   */
  private async getHoldIdForWithdrawal(
    withdrawalId: string
  ): Promise<string | null> {
    // This would typically query a holds table or the withdrawal record
    // For now, return null as the hold ID might be stored in the withdrawal record
    const { data, error } = await supabase
      .from('withdrawals')
      .select('hold_id')
      .eq('id', withdrawalId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.hold_id || null;
  }
}

// Import crypto for timingSafeEqual
import * as crypto from 'crypto';
