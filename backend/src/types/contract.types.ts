/**
 * @fileoverview Contract types for backend API
 * @author Offer Hub Team
 */

export type ContractType = 'project' | 'service';
export type EscrowStatus = 'pending' | 'funded' | 'released' | 'disputed';

export interface Contract {
  id: string;
  contract_type: ContractType;
  project_id?: string | null;
  service_request_id?: string | null;
  freelancer_id: string;
  client_id: string;
  contract_on_chain_id: string;
  escrow_status: EscrowStatus;
  amount_locked: number;
  created_at: string;
  updated_at?: string;
}

export interface CreateContractDTO {
  contract_type: ContractType;
  project_id?: string | null;
  service_request_id?: string | null;
  freelancer_id: string;
  client_id: string;
  contract_on_chain_id: string;
  amount_locked: number;
}

export interface UpdateContractDTO {
  escrow_status?: EscrowStatus;
  amount_locked?: number;
}

export interface UserInfo {
  id: string;
  name?: string;
  username?: string;
  email?: string;
  avatar_url?: string;
}

export interface ContractWithUsers extends Contract {
  freelancer?: UserInfo | null;
  client?: UserInfo | null;
}
