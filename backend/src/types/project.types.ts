/**
 * @fileoverview Project type definitions for project management
 * @author Offer Hub Team
 */

export type ProjectStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  client_id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  budget_amount: number;
  status: ProjectStatus;
  freelancer_id?: string;
  on_chain_tx_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectDTO {
  client_id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  budget_amount: number;
  status?: ProjectStatus;
}

export interface UpdateProjectDTO {
  title?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  budget_amount?: number;
  status?: ProjectStatus;
}
