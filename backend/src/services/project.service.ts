import { supabase } from "@/lib/supabase/supabase";

import { CreateProjectDTO, UpdateProjectDTO, UpdateProjectResult, Project } from '@/types/project.type';
import {
  Project as ProjectModel,
  ProjectRow,
  ProjectSkillRow,
  ProjectStatus as ProjectStatusEnum,
} from "@/types/project.types";
import { InternalServerError } from "@/utils/AppError";
import { userService } from "./user.service";
import { escrowService } from "./escrow.service";
import type { ProjectFilters } from '@/types/project.types';

// Status values that allow updates
// Note: 'pending' is included for backward compatibility with existing data
const UPDATABLE_STATUSES = ['open', 'pending', 'in_progress'];

// Fields that cannot be modified via update endpoint
const PROTECTED_FIELDS = ['id', 'client_id', 'on_chain_tx_hash', 'created_at'];

// Valid status transitions
// open/pending -> in_progress -> completed/cancelled
// Direct transition from open/pending to completed is not allowed
const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  open: ['in_progress', 'cancelled'],
  pending: ['in_progress', 'cancelled'], // Same as 'open' for backward compatibility
  in_progress: ['completed', 'cancelled'],
};

export const createProject = async (data: CreateProjectDTO) => {
  const { data: project, error } = await supabase
    .from('projects')
    .insert([data])
    .select()
    .single();

  if (error) throw new InternalServerError(error.message);
  return project;
};

export const getAllProjects = async (filters: any) => {
  let query = supabase.from('projects').select('*');

  if (filters.category) query = query.eq('category', filters.category);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.budget_min) query = query.gte('budget', filters.budget_min);
  if (filters.budget_max) query = query.lte('budget', filters.budget_max);

  const { data, error } = await query;

  if (error) throw new InternalServerError(error.message);
  return data;
};

export const getProjectById = async (id: string) => {
  const { data: project, error } = await supabase
    .from('projects')
    .select(`*, users!projects_client_id_fkey(name)`)
    .eq('id', id)
    .single();

  if (error) throw new InternalServerError(error.message);
  return {
    ...project,
    client_name: project.users?.name || null,
  };
};

/**
 * Validates if a status transition is allowed
 * Status transitions: open -> in_progress -> completed/cancelled
 * Direct transition from open to completed is not allowed
 */
export const isValidStatusTransition = (currentStatus: string, newStatus: string): boolean => {
  if (currentStatus === newStatus) {
    return true; // No change is always valid
  }
  const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
};

/**
 * Checks if a freelancer is assigned to the project
 * A freelancer is considered assigned if there's a contract linking them to the project
 */
export const hasFreelancerAssigned = async (projectId: string): Promise<boolean> => {
  // Check if project has a freelancer_id directly
  const { data: project } = await supabase
    .from('projects')
    .select('freelancer_id')
    .eq('id', projectId)
    .single();

  if (project?.freelancer_id) {
    return true;
  }

  // Also check if there's an active contract for this project
  const { data: contract } = await supabase
    .from('contracts')
    .select('id')
    .eq('project_id', projectId)
    .limit(1)
    .single();

  return !!contract;
};

/**
 * Updates a project with validation
 * - Only project owner can update
 * - Updates only allowed when status is 'open' or 'in_progress'
 * - Budget cannot be modified if freelancer is assigned
 * - Protected fields (client_id, id, on_chain_tx_hash) cannot be modified
 */
export const updateProject = async (
  projectId: string,
  updates: UpdateProjectDTO,
  clientId: string
): Promise<UpdateProjectResult> => {
  // Fetch existing project
  const { data: existing, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error || !existing) {
    return { success: false, status: 404, message: 'Project not found' };
  }

  // Validate ownership - only project owner can update
  if (existing.client_id !== clientId) {
    return { success: false, status: 403, message: 'Only the project owner can update this project' };
  }

  // Validate project status allows updates
  if (!UPDATABLE_STATUSES.includes(existing.status)) {
    return {
      success: false,
      status: 400,
      message: `Cannot update project with status '${existing.status}'. Updates only allowed when status is 'open' or 'in_progress'`,
    };
  }

  // Validate status transition if status is being changed
  if (updates.status && !isValidStatusTransition(existing.status, updates.status)) {
    return {
      success: false,
      status: 400,
      message: `Invalid status transition from '${existing.status}' to '${updates.status}'. Allowed transitions: ${VALID_STATUS_TRANSITIONS[existing.status]?.join(', ') || 'none'}`,
    };
  }

  // Check if budget modification is allowed (not allowed if freelancer assigned)
  if (updates.budget !== undefined && updates.budget !== existing.budget) {
    const freelancerAssigned = await hasFreelancerAssigned(projectId);
    if (freelancerAssigned) {
      return {
        success: false,
        status: 400,
        message: 'Budget cannot be modified once a freelancer is assigned to the project',
      };
    }
  }

  // Build clean updates object, excluding protected fields
  const cleanUpdates: Record<string, any> = {};
  const allowedFields = ['title', 'description', 'category', 'budget', 'status'];

  for (const key of allowedFields) {
    if (updates[key as keyof UpdateProjectDTO] !== undefined) {
      cleanUpdates[key] = updates[key as keyof UpdateProjectDTO];
    }
  }

  // If no valid updates, return early
  if (Object.keys(cleanUpdates).length === 0) {
    return { success: false, status: 400, message: 'No valid fields to update' };
  }

  // Perform the update (updated_at is handled by database trigger)
  const { data: updated, error: updateError } = await supabase
    .from('projects')
    .update(cleanUpdates)
    .eq('id', projectId)
    .select()
    .single();

  if (updateError) {
    return { success: false, status: 500, message: 'Failed to update project' };
  }

  return { success: true, status: 200, data: updated as Project };
};

export const deleteProject = async (id: string, client_id: string) => {
  const { data: existing, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !existing) {
    return { success: false, status: 404, message: 'Project_not_found' };
  }

  if (existing.client_id !== client_id) {
    return { success: false, status: 403, message: 'Unauthorized_client' };
  }

  if (existing.status !== 'pending') {
    return {
      success: false,
      status: 400,
      message: 'Cannot_delete_non_pending_project',
    };
  }

  const { data: deleted, error: deleteError } = await supabase
    .from('projects')
    .update({ status: 'deleted' })
    .eq('id', id)
    .select()
    .single();

  if (deleteError) {
    return {
      success: false,
      status: 500,
      message: 'Delete_failed',
    };
  }

  return { success: true, status: 200, message: 'Project_deleted', data: deleted };
};


class ProjectService {
  /**
   * Get a project by ID with related skills
   * @param projectId - The UUID of the project to retrieve
   * @returns Project data with skills or null if not found
   */
  async getProjectById(projectId: string): Promise<ProjectModel | null> {
    // Query the projects table with related skills
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select(`
        *,
        project_skills(skill_name)
      `)
      .eq("id", projectId)
      .single();

    if (projectError) {
      // If project not found, return null
      if (projectError.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Database error: ${projectError.message}`);
    }

    if (!projectData) {
      return null;
    }

    const row = projectData as ProjectRow & {
      project_skills?: ProjectSkillRow[] | null;
    };

    // Transform the data to include skills as array of strings
    const skills = row.project_skills?.map((ps: ProjectSkillRow) => ps.skill_name) || [];

    return {
      id: row.id,
      clientId: row.client_id,
      freelancerId: row.freelancer_id,
      title: row.title,
      description: row.description,
      category: row.category,
      budgetAmount: Number(row.budget_amount),
      currency: row.currency || "XLM",
      status: (row.status || ProjectStatusEnum.OPEN) as ProjectStatusEnum,
      deadline: row.deadline,
      onChainTxHash: row.on_chain_tx_hash,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      skills,
    };
  }

/**
   * List projects with filtering, searching, and pagination
   * @param filters - Query filters including pagination, search, and field filters
   * @returns Paginated list of projects with total count
   */
  async listProjects(filters: ProjectFilters): Promise<{ projects: ProjectModel[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      category,
      minBudget,
      maxBudget
    } = filters;

    //Start building the query
    let query = supabase
      .from("projects")
      .select(`
        *,
        project_skills(skill_name)
      `, { count: 'exact' });

    //Apply search filter (title and description)
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    //Apply status filter
    if (status) {
      query = query.eq("status", status);
    }

    //Apply category filter
    if (category) {
      query = query.eq("category", category);
    }

    //Apply budget range filters
    if (minBudget !== undefined) {
      query = query.gte("budget", minBudget);
    }

    if (maxBudget !== undefined) {
      query = query.lte("budget", maxBudget);
    }

    //Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    //Order by created_at descending (newest first)
    query = query.order("created_at", { ascending: false });

    //Execute query
    const { data: projectsData, error, count } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    //Transform projects to include skills array
    const projects = (projectsData || []).map((projectData: any) => {
      const skills = projectData.project_skills?.map((ps: ProjectSkillRow) => ps.skill_name) || [];
      const { project_skills, ...project } = projectData;
      return {
        ...project,
        skills
      } as ProjectModel;
    });

    return {
      projects,
      total: count || 0
    };
  }
}

export const assignFreelancer = async (
  projectId: string,
  freelancerId: string,
  clientId: string
): Promise<{ success: boolean; status: number; data?: any; message?: string }> => {
  // 1. Fetch project by ID - return 404 if not found
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (projectError || !project) {
    return { success: false, status: 404, message: 'Project_not_found' };
  }

  // 2. Verify project status is 'open' - return 400 if invalid state
  if (project.status !== 'open') {
    return {
      success: false,
      status: 400,
      message: 'Project_must_be_open_to_assign_freelancer',
    };
  }

  // 3. Verify requester is project owner (client_id matches) - return 403 if unauthorized
  if (project.client_id !== clientId) {
    return { success: false, status: 403, message: 'Unauthorized_client' };
  }

  // 4. Fetch freelancer user - return 404 if not found
  const freelancer = await userService.getUserById(freelancerId);
  if (!freelancer) {
    return { success: false, status: 404, message: 'Freelancer_not_found' };
  }

  // 5. Verify freelancer has 'freelancer' role - return 400 if invalid role
  if (!freelancer.is_freelancer) {
    return {
      success: false,
      status: 400,
      message: 'User_is_not_a_freelancer',
    };
  }

  // 6. Verify freelancer and client are different users - return 400 if same
  if (freelancerId === clientId) {
    return {
      success: false,
      status: 400,
      message: 'Freelancer_and_client_cannot_be_the_same_user',
    };
  }

  // Fetch client user to get wallet address
  const client = await userService.getUserById(clientId);
  if (!client || !client.wallet_address) {
    return {
      success: false,
      status: 500,
      message: 'Client_wallet_address_not_found',
    };
  }

  if (!freelancer.wallet_address) {
    return {
      success: false,
      status: 500,
      message: 'Freelancer_wallet_address_not_found',
    };
  }

  // Transaction Flow: Create escrow first, then update project
  try {
    // Create escrow via escrow service
    const escrowAddress = await escrowService.createEscrow({
      clientAddress: client.wallet_address,
      freelancerAddress: freelancer.wallet_address,
      amount: Number(project.budget), // Convert budget to number (assuming it's in XLM)
      projectId: projectId,
    });

    // If escrow creation succeeds, update project
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({
        freelancer_id: freelancerId,
        escrow_address: escrowAddress,
        status: 'in_progress',
      })
      .eq('id', projectId)
      .select()
      .single();

    if (updateError) {
      // Log error for debugging
      console.error('Failed to update project after escrow creation:', updateError);
      return {
        success: false,
        status: 500,
        message: 'Failed_to_update_project_after_escrow_creation',
      };
    }

    return {
      success: true,
      status: 200,
      data: updatedProject,
      message: 'Freelancer_assigned_successfully',
    };
  } catch (error) {
    // If escrow creation fails, do NOT update project (maintain atomicity)
    // Log error for debugging
    console.error('Escrow creation failed:', error);

    // Check if it's an AppError to get the status code
    if (error instanceof InternalServerError) {
      return {
        success: false,
        status: 500,
        message: error.message || 'Escrow_creation_failed',
      };
    }

    return {
      success: false,
      status: 500,
      message: 'Escrow_creation_failed',
    };
  }
};

export const projectService = new ProjectService();
