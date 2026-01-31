import {
  WithdrawalStatus,
  WithdrawalEvent,
  WithdrawalStateMachine as IWithdrawalStateMachine,
} from '@/types/withdrawal.types';
import { BusinessLogicError } from '@/utils/AppError';

/**
 * Withdrawal State Machine
 * Manages valid state transitions for withdrawals
 */
export class WithdrawalStateMachine implements IWithdrawalStateMachine {
  /**
   * State transition matrix
   * Defines valid transitions from each status based on events
   */
  private static readonly TRANSITIONS: Partial<
    Record<WithdrawalStatus, Partial<Record<WithdrawalEvent, WithdrawalStatus>>>
  > = {
    [WithdrawalStatus.PENDING]: {
      [WithdrawalEvent.PROCESS]: WithdrawalStatus.PROCESSING,
      [WithdrawalEvent.FAIL]: WithdrawalStatus.WITHDRAWAL_FAILED,
    },
    [WithdrawalStatus.PROCESSING]: {
      [WithdrawalEvent.SUCCESS]: WithdrawalStatus.WITHDRAWAL_SUCCEEDED,
      [WithdrawalEvent.FAIL]: WithdrawalStatus.WITHDRAWAL_FAILED,
    },
    [WithdrawalStatus.WITHDRAWAL_SUCCEEDED]: {
      // Terminal state - no transitions allowed
    },
    [WithdrawalStatus.WITHDRAWAL_FAILED]: {
      [WithdrawalEvent.REFUND]: WithdrawalStatus.REFUNDING,
    },
    [WithdrawalStatus.REFUNDING]: {
      [WithdrawalEvent.REFUND_COMPLETE]: WithdrawalStatus.REFUNDED,
    },
    [WithdrawalStatus.REFUNDED]: {
      // Terminal state - no transitions allowed
    },
  };

  /**
   * Check if a state transition is valid
   */
  canTransition(
    currentStatus: WithdrawalStatus,
    event: WithdrawalEvent
  ): boolean {
    const transitions = WithdrawalStateMachine.TRANSITIONS[currentStatus];
    if (!transitions) {
      return false;
    }
    return event in transitions;
  }

  /**
   * Get the next status for a given current status and event
   * Returns null if transition is invalid
   */
  getNextStatus(
    currentStatus: WithdrawalStatus,
    event: WithdrawalEvent
  ): WithdrawalStatus {
    const transitions = WithdrawalStateMachine.TRANSITIONS[currentStatus];
    if (!transitions) {
      throw new BusinessLogicError(
        `Invalid current status: ${currentStatus}`,
        'INVALID_WITHDRAWAL_STATUS'
      );
    }

    const nextStatus = transitions[event];
    if (!nextStatus) {
      throw new BusinessLogicError(
        `Cannot transition from ${currentStatus} with event ${event}`,
        'INVALID_STATE_TRANSITION'
      );
    }

    return nextStatus;
  }

  /**
   * Validate a state transition and throw if invalid
   */
  validateTransition(
    currentStatus: WithdrawalStatus,
    event: WithdrawalEvent
  ): void {
    if (!this.canTransition(currentStatus, event)) {
      throw new BusinessLogicError(
        `Invalid state transition from ${currentStatus} with event ${event}`,
        'INVALID_STATE_TRANSITION'
      );
    }
  }

  /**
   * Map Airtm webhook event to WithdrawalEvent
   */
  static mapWebhookEventToWithdrawalEvent(
    webhookEvent: string
  ): WithdrawalEvent {
    switch (webhookEvent) {
      case 'payout.success':
        return WithdrawalEvent.SUCCESS;
      case 'payout.failed':
      case 'payout.cancelled':
        return WithdrawalEvent.FAIL;
      default:
        throw new BusinessLogicError(
          `Unknown webhook event: ${webhookEvent}`,
          'UNKNOWN_WEBHOOK_EVENT'
        );
    }
  }
}
