/**
 * Withdrawal types for the Offer-Hub platform
 * Includes Airtm webhook integration and state management
 */

export enum WithdrawalStatus {
  // Processing flow
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMMITTED = 'COMMITTED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',

  // Initiation flow
  CREATED = 'CREATED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  WITHDRAWAL_CREATED = 'WITHDRAWAL_CREATED',
  WITHDRAWAL_PENDING_VERIFICATION = 'WITHDRAWAL_PENDING_VERIFICATION',

  // Outcome flow
  WITHDRAWAL_SUCCEEDED = 'WITHDRAWAL_SUCCEEDED',
  WITHDRAWAL_FAILED = 'WITHDRAWAL_FAILED',
  WITHDRAWAL_CANCELED = 'WITHDRAWAL_CANCELED',
  WITHDRAWAL_COMPLETED = 'WITHDRAWAL_COMPLETED',
  WITHDRAWAL_REFUNDED = 'WITHDRAWAL_REFUNDED',

  // Refund flow
  REFUNDING = 'REFUNDING',
  REFUNDED = 'REFUNDED',
}

export enum WithdrawalEvent {
  SUBMIT = 'SUBMIT',
  PROCESS = 'PROCESS',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  REFUND = 'REFUND',
  REFUND_COMPLETE = 'REFUND_COMPLETE',
}

export interface Withdrawal {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: WithdrawalStatus;
  destination_email?: string | null;
  airtm_reference_id: string | null;
  airtm_transaction_id: string | null;
  external_payout_id?: string | null;
  webhook_processed_at: string | null;
  webhook_event_id: string | null;
  failure_reason: string | null;
  cancellation_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalAuditLog {
  id: string;
  withdrawal_id: string;
  event_type: string;
  previous_status: WithdrawalStatus | null;
  new_status: WithdrawalStatus;
  metadata: Record<string, any>;
  created_at: string;
}

export interface AirtmWebhookPayload {
  event: 'payout.success' | 'payout.failed' | 'payout.cancelled';
  data: {
    reference_id: string;
    transaction_id: string;
    status: 'completed' | 'failed' | 'cancelled';
    amount: number;
    currency: string;
    failure_reason?: string;
    completed_at?: string;
    failed_at?: string;
  };
  signature: string;
  timestamp: string;
  event_id: string;
}

export interface WebhookProcessingResult {
  success: boolean;
  withdrawalId: string;
  previousStatus: WithdrawalStatus;
  newStatus: WithdrawalStatus;
  isDuplicate: boolean;
}

export interface BalanceService {
  debitAvailable(userId: string, amount: number, referenceId: string): Promise<void>;
  releaseHold(userId: string, holdId: string): Promise<void>;
  initiateRefund(userId: string, amount: number, withdrawalId: string): Promise<void>;
}

export interface WithdrawalStateMachine {
  canTransition(currentStatus: WithdrawalStatus, event: WithdrawalEvent): boolean;
  getNextStatus(currentStatus: WithdrawalStatus, event: WithdrawalEvent): WithdrawalStatus;
  validateTransition(currentStatus: WithdrawalStatus, event: WithdrawalEvent): void;
}
