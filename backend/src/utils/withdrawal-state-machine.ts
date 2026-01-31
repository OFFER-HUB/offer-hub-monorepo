/**
 * @fileoverview Withdrawal State Machine for validating state transitions
 */

import { WithdrawalStatus } from '../types/withdrawal.types';

/**
 * Withdrawal State Machine
 * Enforces valid state transitions for withdrawal lifecycle
 */
export class WithdrawalStateMachine {
  /**
   * Map of valid state transitions
   * Each status maps to an array of valid next statuses
   */
  private static readonly VALID_TRANSITIONS: Partial<Record<WithdrawalStatus, WithdrawalStatus[]>> = {
    // Initiation flow
    [WithdrawalStatus.CREATED]: [
      WithdrawalStatus.PENDING_VERIFICATION,
      WithdrawalStatus.WITHDRAWAL_CANCELED,
      WithdrawalStatus.WITHDRAWAL_FAILED,
    ],
    [WithdrawalStatus.WITHDRAWAL_CREATED]: [
      WithdrawalStatus.PENDING_VERIFICATION,
      WithdrawalStatus.WITHDRAWAL_PENDING_VERIFICATION,
      WithdrawalStatus.WITHDRAWAL_CANCELED,
      WithdrawalStatus.WITHDRAWAL_FAILED,
      WithdrawalStatus.FAILED,
    ],
    [WithdrawalStatus.PENDING_VERIFICATION]: [
      WithdrawalStatus.WITHDRAWAL_COMPLETED,
      WithdrawalStatus.WITHDRAWAL_CANCELED,
      WithdrawalStatus.WITHDRAWAL_FAILED,
    ],
    [WithdrawalStatus.WITHDRAWAL_PENDING_VERIFICATION]: [
      WithdrawalStatus.WITHDRAWAL_COMPLETED,
      WithdrawalStatus.WITHDRAWAL_CANCELED,
      WithdrawalStatus.WITHDRAWAL_FAILED,
      WithdrawalStatus.FAILED,
    ],
    [WithdrawalStatus.WITHDRAWAL_COMPLETED]: [],
    [WithdrawalStatus.WITHDRAWAL_CANCELED]: [],
    [WithdrawalStatus.WITHDRAWAL_REFUNDED]: [],

    // Processing flow (Issue #958)
    [WithdrawalStatus.PENDING]: [
      WithdrawalStatus.PROCESSING,
      WithdrawalStatus.CANCELLED,
      WithdrawalStatus.WITHDRAWAL_FAILED,
      WithdrawalStatus.FAILED,
    ],
    [WithdrawalStatus.PROCESSING]: [
      WithdrawalStatus.COMMITTED,
      WithdrawalStatus.WITHDRAWAL_FAILED,
      WithdrawalStatus.FAILED,
    ],
    [WithdrawalStatus.COMMITTED]: [],
    [WithdrawalStatus.CANCELLED]: [],

    // Joint Statuses
    [WithdrawalStatus.FAILED]: [
      WithdrawalStatus.WITHDRAWAL_REFUNDED,
    ],
    [WithdrawalStatus.WITHDRAWAL_FAILED]: [
      WithdrawalStatus.WITHDRAWAL_REFUNDED,
    ],
  };

  /**
   * Checks if a state transition is valid
   * @param from - Current withdrawal status
   * @param to - Desired new status
   * @returns true if transition is allowed, false otherwise
   */
  static canTransition(from: WithdrawalStatus, to: WithdrawalStatus): boolean {
    const validNextStates = this.VALID_TRANSITIONS[from];
    if (!validNextStates) {
      return false;
    }
    return validNextStates.includes(to);
  }

  /**
   * Gets all valid next states for a given current state
   * @param currentStatus - Current withdrawal status
   * @returns Array of valid next statuses
   */
  static getValidTransitions(currentStatus: WithdrawalStatus): Array<WithdrawalStatus> {
    return this.VALID_TRANSITIONS[currentStatus] || [];
  }

  /**
   * Validates if cancellation is allowed from current state
   * @param currentStatus - Current withdrawal status
   * @returns true if cancellation is allowed
   */
  static canCancel(currentStatus: WithdrawalStatus): boolean {
    return this.canTransition(currentStatus, WithdrawalStatus.WITHDRAWAL_CANCELED) ||
      this.canTransition(currentStatus, WithdrawalStatus.CANCELLED);
  }

  /**
   * Validates if refund is allowed from current state
   * @param currentStatus - Current withdrawal status
   * @returns true if refund is allowed
   */
  static canRefund(currentStatus: WithdrawalStatus): boolean {
    return this.canTransition(currentStatus, WithdrawalStatus.WITHDRAWAL_REFUNDED);
  }
}
