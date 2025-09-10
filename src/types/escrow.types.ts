export interface StartDisputePayload {
  contractId: string;
  signer: string;
  reason: string;
}

export interface DisputeResponse {
  status: "SUCCESS" | "ERROR";
  message: string;
  transactionId?: string;
}

export interface UpdateEscrowPayload {
  contractId: string;
  signer: string;
  milestones?: Milestone[];
  amounts?: number[];
  parameters?: Record<string, unknown>;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: "pending" | "completed" | "overdue";
}

export interface EscrowUpdateResponse {
  status: "SUCCESS" | "ERROR";
  message: string;
  transactionId?: string;
  contractId?: string;
}

export interface InitializeContractPayload {
  clientId: string;
  freelancerId: string;
  amount: number;
  description: string;
  milestones?: Milestone[];
}

export interface ReleaseFundsPayload {
  contractId: string;
  signer: string;
  amount: number;
  milestoneId?: string;
}

export interface TransactionResponse {
  status: "SUCCESS" | "ERROR";
  message: string;
  transactionId?: string;
  data?: Record<string, unknown>;
}
