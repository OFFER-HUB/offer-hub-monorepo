/**
 * @fileoverview Project types for backend API
 * @author Offer Hub Team
 */

/**
 * Enum aligned with DB enum `project_status`
 */
export enum ProjectStatus {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

/**
 * Project entity (camelCase)
 */
export interface Project {
  id: string;
  clientId: string;
  freelancerId?: string | null;

  title: string;
  description: string;
  category?: string | null;

  budgetAmount: number;
  currency: string;

  status: ProjectStatus;
  deadline?: string | null;

  onChainTxHash?: string | null;

  createdAt: string;
  updatedAt: string;

  skills: string[];
}

export interface CreateProjectDTO {
  clientId: string;
  freelancerId?: string | null;

  title: string;
  description: string;
  category?: string | null;

  budgetAmount: number;
  currency?: string;

  status?: ProjectStatus;
  deadline?: string | null;
  onChainTxHash?: string | null;

  skills?: string[];
}

export interface UpdateProjectDTO {
  freelancerId?: string | null;

  title?: string;
  description?: string;
  category?: string | null;

  budgetAmount?: number;
  currency?: string;

  status?: ProjectStatus;
  deadline?: string | null;
  onChainTxHash?: string | null;

  skills?: string[];
}

export interface ProjectFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  clientId?: string;
  freelancerId?: string;
  minBudget?: number;
  maxBudget?: number;
}

/**
 * DB row shapes (snake_case)
 * Useful for Supabase select() results.
 */
export interface ProjectRow {
  id: string;
  client_id: string;
  freelancer_id: string | null;
  title: string;
  description: string;
  category: string | null;
  budget_amount: number;
  currency: string;
  status: ProjectStatus;
  deadline: string | null;
  on_chain_tx_hash: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectSkillRow {
  skill_name: string;
  status?: string;
  client_id?: string;
  minBudget?: number;
  maxBudget?: number;

}
