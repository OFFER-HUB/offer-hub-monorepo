/**
 * @fileoverview Project service providing project data management and database operations
 * @author Offer Hub Team
 */

import { supabase } from "@/lib/supabase/supabase";
import { 
  AppError, 
  BadRequestError, 
  NotFoundError, 
  ForbiddenError,
  InternalServerError 
} from "@/utils/AppError";
import { Project, UpdateProjectDTO, ProjectStatus } from "@/types/project.types";

class ProjectService {
  /**
   * Update an existing project
   * Only allows updates when project status is 'open' or 'in_progress'
   * Budget cannot be modified once a freelancer is assigned
   * Only the project owner can make updates
   * 
   * @param projectId - The ID of the project to update
   * @param updates - The fields to update
   * @param userId - The ID of the user making the update (must be project owner)
   * @returns The updated project
   */
  async updateProject(
    projectId: string,
    updates: UpdateProjectDTO,
    userId: string
  ): Promise<Project> {
    // Fetch the existing project
    const { data: project, error: fetchError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (fetchError || !project) {
      throw new NotFoundError("Project not found", "PROJECT_NOT_FOUND");
    }

    // Validate that the user is the project owner
    if (project.client_id !== userId) {
      throw new ForbiddenError(
        "Only the project owner can update this project",
        "RESOURCE_ACCESS_DENIED"
      );
    }

    // Validate that status allows updates (only 'open' or 'in_progress')
    const allowedStatuses: ProjectStatus[] = ['open', 'in_progress'];
    if (!allowedStatuses.includes(project.status)) {
      throw new BadRequestError(
        `Project cannot be updated when status is '${project.status}'. Only projects with status 'open' or 'in_progress' can be updated.`,
        "INVALID_STATUS_TRANSITION"
      );
    }

    // Protect budget_amount if freelancer is assigned
    if (project.freelancer_id && updates.budget_amount !== undefined) {
      throw new BadRequestError(
        "Budget cannot be modified once a freelancer is assigned",
        "BUSINESS_LOGIC_ERROR"
      );
    }

    // Protect immutable fields from modification
    const protectedFields = ['id', 'client_id', 'on_chain_tx_hash'];
    const updatesAny = updates as any; // Type assertion needed to check for protected fields at runtime
    const attemptedProtectedFields = protectedFields.filter(
      field => updatesAny[field] !== undefined
    );

    if (attemptedProtectedFields.length > 0) {
      throw new BadRequestError(
        `Cannot modify protected fields: ${attemptedProtectedFields.join(', ')}`,
        "BUSINESS_LOGIC_ERROR"
      );
    }

    // Validate status transition if status is being updated
    if (updates.status) {
      this.validateStatusTransition(project.status, updates.status);
    }

    // Prepare update data (exclude undefined values and protected fields)
    const updateData: Partial<Project> = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Remove any undefined values and protected fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof Project] === undefined || protectedFields.includes(key)) {
        delete updateData[key as keyof Project];
      }
    });

    // Perform the update
    const { data: updatedProject, error: updateError } = await supabase
      .from("projects")
      .update(updateData)
      .eq("id", projectId)
      .select()
      .single();

    if (updateError) {
      throw new InternalServerError(
        `Failed to update project: ${updateError.message}`,
        updateError
      );
    }

    if (!updatedProject) {
      throw new InternalServerError("Project update succeeded but no data returned");
    }

    return updatedProject;
  }

  /**
   * Validate status transition
   * Status transitions should follow: open -> in_progress -> completed/cancelled
   * Direct transition from open to completed is not allowed
   * 
   * @param currentStatus - Current project status
   * @param newStatus - Desired new status
   */
  private validateStatusTransition(
    currentStatus: ProjectStatus,
    newStatus: ProjectStatus
  ): void {
    // Define valid transitions
    const validTransitions: Record<ProjectStatus, ProjectStatus[]> = {
      'open': ['in_progress', 'cancelled'],
      'in_progress': ['completed', 'cancelled'],
      'completed': [], // Cannot transition from completed
      'cancelled': [], // Cannot transition from cancelled
    };

    const allowedTransitions = validTransitions[currentStatus];

    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestError(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'. ` +
        `Allowed transitions from '${currentStatus}': ${allowedTransitions.join(', ')}`,
        "INVALID_STATUS_TRANSITION"
      );
    }
  }

  /**
   * Get a project by ID
   * 
   * @param projectId - The ID of the project to fetch
   * @returns The project or null if not found
   */
  async getProjectById(projectId: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new InternalServerError(
        `Failed to fetch project: ${error.message}`,
        error
      );
    }

    return data;
  }
}

export const projectService = new ProjectService();
