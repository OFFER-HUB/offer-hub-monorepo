/**
 * @fileoverview User controller handling user management operations and profile updates
 * @author Offer Hub Team
 */

import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@/types/auth.types";
import { userService } from "@/services/user.service";
import { AppError, MissingFieldsError, NotFoundError, ValidationError, BadRequestError, mapSupabaseError, UnauthorizedError } from "@/utils/AppError";
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





export const updateProfileHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedError("User ID not found in token");
    }

    const { username, avatar_url } = req.body;

    if (username === undefined && avatar_url === undefined) {
      throw new ValidationError("At least one field (username or avatar_url) must be provided");
    }

    const errors: Array<{ field: string; message: string }> = [];


    if (username !== undefined) {
      if (typeof username !== 'string') {
        errors.push({
          field: 'username',
          message: 'Username must be a string'
        });
      } else {

        if (username.length < 3 || username.length > 100) {
          errors.push({
            field: 'username',
            message: 'Username must be between 3 and 100 characters'
          });
        }

        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(username)) {
          errors.push({
            field: 'username',
            message: 'Username can only contain letters, numbers, and underscores'
          });
        }
      }
    }


    if (avatar_url !== undefined && avatar_url !== null && avatar_url !== '') {
      if (typeof avatar_url !== 'string') {
        errors.push({
          field: 'avatar_url',
          message: 'Avatar URL must be a string'
        });
      } else {

        try {
          const url = new URL(avatar_url);
          if (!['http:', 'https:'].includes(url.protocol)) {
            errors.push({
              field: 'avatar_url',
              message: 'Avatar URL must use HTTP or HTTPS protocol'
            });
          }
        } catch (error) {
          errors.push({
            field: 'avatar_url',
            message: 'Invalid URL format'
          });
        }
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('The provided data is invalid', errors.map(err => ({
        field: err.field,
        value: err.field,
        reason: err.message,
        code: 'INVALID_FIELD'
      })));
    }


    const avatarUrlValue = avatar_url === '' ? null : avatar_url;


    const updatedUser = await userService.updateProfile(userId, {
      username,
      avatar_url: avatarUrlValue
    });

    res.status(200).json(
      buildSuccessResponse(updatedUser, "Profile updated successfully")
    );
  } catch (error: any) {

    if (error.code && error.message) {
      return next(mapSupabaseError(error));
    }

    next(error);
  }
};


/**
 * Delete own account handler (soft-delete)
 * Requires JWT authentication
 * Request body: { password: string, confirmation: "DELETE" }
 */
export const deleteOwnAccountHandler = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { password, confirmation } = req.body;

    // Validate required fields
    if (!password) {
      throw new BadRequestError("Password is required", "MISSING_PASSWORD");
    }

    if (!confirmation) {
      throw new BadRequestError("Confirmation is required", "MISSING_CONFIRMATION");
    }

    // Validate confirmation string (case-sensitive exact match)
    if (confirmation !== "DELETE") {
      throw new BadRequestError(
        "Confirmation must be exactly 'DELETE'",
        "INVALID_CONFIRMATION"
      );
    }

    // Get authenticated user ID
    if (!req.user || !req.user.id) {
      throw new AppError("Authentication required", 401, "UNAUTHORIZED");
    }

    const userId = req.user.id;

    // Call service to delete account
    await userService.deleteOwnAccount(userId, password, confirmation);

    res.status(200).json({
      success: true,
      message: "Account scheduled for deletion. You will receive a confirmation email."
    });
  } catch (error: any) {
    // Handle Supabase errors
    if (error.code && error.message && !error.statusCode) {
      return next(mapSupabaseError(error));
    }

    next(error);
  }
};