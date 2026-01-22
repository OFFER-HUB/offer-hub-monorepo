/**
 * @fileoverview User controller handling user management operations and profile updates
 * @author Offer Hub Team
 */

import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@/types/auth.types";
import { userService } from "@/services/user.service";
import { AppError, MissingFieldsError, NotFoundError, ValidationError, BadRequestError, mapSupabaseError } from "@/utils/AppError";
import { UserFilters } from "@/types/user.types";
import { buildSuccessResponse, buildPaginatedResponse } from '../utils/responseBuilder';
import {
  validateUUID,
  validateObject,
  USER_CREATION_SCHEMA,
  validateIntegerRange,
  validateStringLength,
  validateAvatarUrl
} from "@/utils/validation";

export const createUserHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { wallet_address, username, name, bio, email, is_freelancer } = req.body;

    // Use standardized validation
    const validationResult = validateObject(req.body, USER_CREATION_SCHEMA);
    
    if (!validationResult.isValid) {
      throw new ValidationError("User validation failed", validationResult.errors);
    }

    const user = await userService.createUser({
      wallet_address,
      username,
      name,
      bio,
      email,
      is_freelancer,
    });

    res.status(201).json(
      buildSuccessResponse(user, "User created successfully")
    );
  } catch (error: any) {
    // Handle Supabase errors
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }

    next(error);
  }
};

export const getUserByIdHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = Array.isArray(id) ? id[0] : id;

    if (!userId) {
      throw new ValidationError("User ID is required");
    }

    if (!validateUUID(userId)) {
      throw new BadRequestError("Invalid user ID format", "INVALID_UUID");
    }

    const user = await userService.getUserById(userId);
    if (!user) throw new NotFoundError("User not found", "USER_NOT_FOUND");

    res.status(200).json(
      buildSuccessResponse(user, "User fetched successfully")
    );
  } catch (error: any) {
    // Handle Supabase errors
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }

    next(error);
  }
};

export const updateUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = Array.isArray(id) ? id[0] : id;

    if (!userId) throw new MissingFieldsError("User ID is required");

    if (!validateUUID(userId)) throw new BadRequestError("Invalid user ID format", "INVALID_UUID");

    const updateData = req.body;
    const updatedUser = await userService.updateUser(userId, updateData);

    if (!updatedUser) throw new NotFoundError("User not found", "USER_NOT_FOUND");

    // Prepare response with only changed fields
    const changedFields: Record<string, any> = {};
    for (const key of Object.keys(updateData)) {
      if (updatedUser[key] !== undefined) {
        changedFields[key] = updatedUser[key];
      }
    }

    res.status(200).json(
      buildSuccessResponse(changedFields, "User updated successfully")
    );
  } catch (error: any) {
    // Handle Supabase errors
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }

    next(error);
  }
};

export const getAllUsersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filters: UserFilters = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      search: req.query.search as string,
      is_freelancer: req.query.is_freelancer !== undefined
        ? req.query.is_freelancer === 'true'
        : undefined,
    };

    // Validate pagination parameters using standardized validation
    if (filters.page && !validateIntegerRange(filters.page, 1, 1000)) {
      throw new ValidationError("Page number must be between 1 and 1000");
    }

    if (filters.limit && !validateIntegerRange(filters.limit, 1, 50)) {
      throw new ValidationError("Limit must be between 1 and 50");
    }

    // Validate search string length if provided
    if (filters.search && !validateStringLength(filters.search, 1, 100)) {
      throw new ValidationError("Search term must be between 1 and 100 characters");
    }

    const result = await userService.getAllUsers(filters);

    res.status(200).json(
      buildPaginatedResponse(
        result.users,
        "Users retrieved successfully",
        {
          current_page: filters.page || 1,
          total_pages: Math.ceil(result.total / (filters.limit || 20)),
          total_items: result.total,
          per_page: filters.limit || 20,
        }
      )
    );
  } catch (error: any) {
    // Handle Supabase errors
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }

    next(error);
  }
};

export const updateAvatarHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const userIdStr = Array.isArray(userId) ? userId[0] : userId;
    const { avatar_url } = req.body;

    if (!userIdStr) {
      throw new ValidationError("User ID is required");
    }

    if (!validateUUID(userIdStr)) {
      throw new BadRequestError("Invalid user ID format", "INVALID_UUID");
    }

    // Check if requester owns the profile
    if (!req.user || req.user.id !== userIdStr) {
      throw new AppError("Access denied. You can only update your own avatar.", 403);
    }

    // Validate avatar URL format if provided
    if (avatar_url !== null && avatar_url !== undefined && avatar_url !== '') {
      if (typeof avatar_url !== 'string') {
        throw new ValidationError("Avatar URL must be a string");
      }

      if (!validateAvatarUrl(avatar_url)) {
        throw new BadRequestError(
          "Invalid avatar URL format. Must be a valid URL ending with .jpg, .jpeg, .png, .gif, or .webp",
          "INVALID_AVATAR_URL"
        );
      }
    }

    // Convert empty string to null for database
    const avatarUrlValue = avatar_url === '' ? null : avatar_url;

    const updatedUser = await userService.updateAvatar(userIdStr, avatarUrlValue);

    res.status(200).json(
      buildSuccessResponse(updatedUser, "Avatar updated successfully")
    );
  } catch (error: any) {
    // Handle Supabase errors
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }

    next(error);
  }
};