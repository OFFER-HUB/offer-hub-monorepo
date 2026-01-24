/**
 * @fileoverview Task types for backend API
 * @author Offer Hub Team
 */

export interface TaskRecord {
  id: string;
  project_id: string;
  freelancer_id: string;
  client_id: string;
  completed: boolean;
  outcome_description?: string;
  on_chain_tx_hash?: string;
  on_chain_task_id?: number;
  rating?: number;
  rating_comment?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRecordDTO {
  project_id: string;
  freelancer_id: string;
  completed: boolean;
  outcome_description?: string;
}

export interface TaskRecordResponse {
  id: string;
  project_id: string;
  freelancer_id: string;
  client_id: string;
  completed: boolean;
  outcome_description?: string;
  on_chain_tx_hash?: string;
  on_chain_task_id?: number;
  created_at: string;
  updated_at: string;
}

export interface BlockchainTaskResult {
  transactionHash: string;
  taskId: number;
  timestamp: number;
  ledger: number;
}

export interface UpdateTaskRatingDTO {
  rating: number;
  comment?: string;
}