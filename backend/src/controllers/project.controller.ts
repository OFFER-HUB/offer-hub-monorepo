/**
 * @fileoverview Project controller handling project management operations
 * @author Offer Hub Team
 */

import { Request, Response, NextFunction } from "express";
import { projectService } from "@/services/project.service";
import { 
  AppError, 
  BadRequestError, 
  NotFoundError, 
  ValidationError,
  mapSupabaseError 
} from "@/utils/AppError";
import { UpdateProjectDTO } from "@/types/project.types";
import { buildSuccessResponse } from '../utils/responseBuilder';
import { validateUUID } from "@/utils/validation";
import { AuthenticatedRequest } from "@/types/middleware.types";

/**
 * Update project handler
 * Returns 200 on success, 404 if not found, 403 if unauthorized, 400 if invalid state
 */
export const updateProjectHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;
    const authReq = req as AuthenticatedRequest;

    // Validate projectId
    if (!projectId) {
      throw new BadRequestError("Project ID is required", "REQUIRED_FIELD");
    }

    if (!validateUUID(projectId)) {
      throw new BadRequestError("Invalid project ID format", "INVALID_UUID");
    }

    // Ensure user is authenticated
    if (!authReq.user || !authReq.user.id) {
      throw new AppError("Authentication required", 401);
    }

    const userId = authReq.user.id;
    const updateData: UpdateProjectDTO = req.body;

    // Validate that updateData is not empty
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new BadRequestError(
        "Update data is required. At least one field must be provided.",
        "REQUIRED_FIELD"
      );
    }

    // Update the project
    const updatedProject = await projectService.updateProject(
      projectId,
      updateData,
      userId
    );

    res.status(200).json(
      buildSuccessResponse(updatedProject, "Project updated successfully")
    );
  } catch (error: any) {
    // Handle Supabase errors
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }

    next(error);
  }
};

/**
 * Get project by ID handler
 */
export const getProjectByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      throw new BadRequestError("Project ID is required", "REQUIRED_FIELD");
    }

    if (!validateUUID(projectId)) {
      throw new BadRequestError("Invalid project ID format", "INVALID_UUID");
    }

    const project = await projectService.getProjectById(projectId);

    if (!project) {
      throw new NotFoundError("Project not found", "PROJECT_NOT_FOUND");
    }

    res.status(200).json(
      buildSuccessResponse(project, "Project fetched successfully")
    );
  } catch (error: any) {
    // Handle Supabase errors
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }

    next(error);
  }
};
