import { Request, Response, NextFunction } from "express";
import { userManagementService } from "@/services/user-management.service";
import { AppError, MissingFieldsError, NotFoundError, ValidationError, BadRequestError, mapSupabaseError } from "@/utils/AppError";
import { 
    AdminUserFilters, 
    BulkUserOperation,
    UserStatusChange,
    UserRoleChange,
    UserVerification,
    AdminCreateUserDTO,
    UserExportOptions
} from "@/types/user-management.types";
import { buildSuccessResponse, buildPaginatedResponse } from '../utils/responseBuilder';
import { 
  validateUUID, 
  validateObject, 
  USER_CREATION_SCHEMA,
  validateIntegerRange,
  validateStringLength
} from "@/utils/validation";

// Admin-specific handlers
export const createUserAsAdminHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userData: AdminCreateUserDTO = req.body;
    const adminId = (req as any).user?.id;

    if (!adminId) {
      throw new BadRequestError("Admin ID is required");
    }

    const user = await userManagementService.createUser(userData, adminId);

    res.status(201).json(
      buildSuccessResponse(user, "User created successfully by admin")
    );
  } catch (error: any) {
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }
    next(error);
  }
};

export const getAllUsersForAdminHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters: AdminUserFilters = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      search: req.query.search as string,
      status: req.query.status as any,
      role: req.query.role as any,
      verification_status: req.query.verification_status as any,
      is_freelancer: req.query.is_freelancer !== undefined
        ? req.query.is_freelancer === 'true'
        : undefined,
      date_from: req.query.date_from as string,
      date_to: req.query.date_to as string,
      sort_by: req.query.sort_by as any,
      sort_order: req.query.sort_order as any,
    };

    const result = await userManagementService.getAllUsers(filters);

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
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }
    next(error);
  }
};

export const getUserByIdForAdminHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new ValidationError("User ID is required");
    }

    if (!validateUUID(id)) {
      throw new BadRequestError("Invalid user ID format", "INVALID_UUID");
    }

    const user = await userManagementService.getUserById(id);

    res.status(200).json(
      buildSuccessResponse(user, "User fetched successfully")
    );
  } catch (error: any) {
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }
    next(error);
  }
};

export const updateUserAsAdminHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user?.id;

    if (!id) throw new MissingFieldsError("User ID is required");
    if (!adminId) throw new BadRequestError("Admin ID is required");
    
    if (!validateUUID(id)) throw new BadRequestError("Invalid user ID format", "INVALID_UUID");

    const updateData = req.body;
    const updatedUser = await userManagementService.updateUser(id, updateData, adminId);

    res.status(200).json(
      buildSuccessResponse(updatedUser, "User updated successfully")
    );
  } catch (error: any) {
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }
    next(error);
  }
};

export const deleteUserAsAdminHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user?.id;

    if (!id) throw new MissingFieldsError("User ID is required");
    if (!adminId) throw new BadRequestError("Admin ID is required");
    
    if (!validateUUID(id)) throw new BadRequestError("Invalid user ID format", "INVALID_UUID");

    await userManagementService.deleteUser(id, adminId);

    res.status(200).json(
      buildSuccessResponse(null, "User deleted successfully")
    );
  } catch (error: any) {
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }
    next(error);
  }
};

export const suspendUserHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason, notes } = req.body;
    const adminId = (req as any).user?.id;

    if (!id) throw new MissingFieldsError("User ID is required");
    if (!adminId) throw new BadRequestError("Admin ID is required");

    const statusChange: UserStatusChange = {
      user_id: id,
      status: 'suspended',
      reason,
      notes
    };

    const user = await userManagementService.suspendUser(statusChange, adminId);

    res.status(200).json(
      buildSuccessResponse(user, "User suspended successfully")
    );
  } catch (error: any) {
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }
    next(error);
  }
};

export const activateUserHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user?.id;

    if (!id) throw new MissingFieldsError("User ID is required");
    if (!adminId) throw new BadRequestError("Admin ID is required");

    const user = await userManagementService.activateUser(id, adminId);

    res.status(200).json(
      buildSuccessResponse(user, "User activated successfully")
    );
  } catch (error: any) {
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }
    next(error);
  }
};

export const changeUserRoleHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { role, reason } = req.body;
    const adminId = (req as any).user?.id;

    if (!id) throw new MissingFieldsError("User ID is required");
    if (!adminId) throw new BadRequestError("Admin ID is required");
    if (!role) throw new MissingFieldsError("Role is required");

    const roleChange: UserRoleChange = {
      user_id: id,
      role,
      reason
    };

    const user = await userManagementService.changeUserRole(roleChange, adminId);

    res.status(200).json(
      buildSuccessResponse(user, "User role changed successfully")
    );
  } catch (error: any) {
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }
    next(error);
  }
};

export const verifyUserHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { verification_status, verification_type, notes } = req.body;
    const adminId = (req as any).user?.id;

    if (!id) throw new MissingFieldsError("User ID is required");
    if (!adminId) throw new BadRequestError("Admin ID is required");
    if (!verification_status) throw new MissingFieldsError("Verification status is required");

    const verification: UserVerification = {
      user_id: id,
      verification_status,
      verification_type: verification_type || 'identity',
      notes
    };

    const user = await userManagementService.verifyUser(verification, adminId);

    res.status(200).json(
      buildSuccessResponse(user, "User verification updated successfully")
    );
  } catch (error: any) {
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }
    next(error);
  }
};

export const bulkUserOperationHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const operation: BulkUserOperation = req.body;
    const adminId = (req as any).user?.id;

    if (!adminId) throw new BadRequestError("Admin ID is required");
    if (!operation.action) throw new MissingFieldsError("Action is required");
    if (!operation.user_ids || operation.user_ids.length === 0) {
      throw new MissingFieldsError("User IDs are required");
    }

    const result = await userManagementService.bulkOperation(operation, adminId);

    res.status(200).json(
      buildSuccessResponse(result, "Bulk operation completed")
    );
  } catch (error: any) {
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }
    next(error);
  }
};

export const getUserAnalyticsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const analytics = await userManagementService.getUserAnalytics();

    res.status(200).json(
      buildSuccessResponse(analytics, "User analytics retrieved successfully")
    );
  } catch (error: any) {
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }
    next(error);
  }
};

export const getUserActivityLogsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    if (!id) throw new MissingFieldsError("User ID is required");
    if (!validateUUID(id)) throw new BadRequestError("Invalid user ID format", "INVALID_UUID");

    const logs = await userManagementService.getUserActivityLogs(id, limit);

    res.status(200).json(
      buildSuccessResponse(logs, "User activity logs retrieved successfully")
    );
  } catch (error: any) {
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }
    next(error);
  }
};

export const exportUsersHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const options: UserExportOptions = req.body;

    if (!options.format) throw new MissingFieldsError("Export format is required");
    if (!options.fields || options.fields.length === 0) {
      throw new MissingFieldsError("Export fields are required");
    }

    const data = await userManagementService.exportUsers(options);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
    res.status(200).send(data);
  } catch (error: any) {
    if (error.code && error.message) {
      throw mapSupabaseError(error);
    }
    next(error);
  }
};
