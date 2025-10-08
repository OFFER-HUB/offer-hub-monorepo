import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/utils/AppError';
import { UserRole } from '@/types/auth.types';
import { ApplicationPermissions } from '@/types/application.types';
import { supabase } from '@/lib/supabase/supabase';
import { logger } from '@/utils/logger';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    email?: string;
    permissions?: string[];
  };
  applicationPermissions?: ApplicationPermissions;
}

export const checkApplicationPermissions = (requiredPermission: keyof ApplicationPermissions) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        return next(new AppError('Authentication required', 401));
      }

      const permissions = await getApplicationPermissions(userId, userRole);
      req.applicationPermissions = permissions;

      if (!permissions[requiredPermission]) {
        logger.error(`Access denied: User ${userId} lacks permission ${requiredPermission}`);
        return next(new AppError(`Access denied: ${requiredPermission} permission required`, 403));
      }

      next();
    } catch (error) {
      logger.error('Permission check failed', { error, userId: req.user?.id });
      next(new AppError('Permission verification failed', 500));
    }
  };
};

export const checkApplicationAccess = (accessType: 'view' | 'edit' | 'review' | 'delete') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const applicationId = req.params?.id;

      if (!userId || !userRole) {
        return next(new AppError('Authentication required', 401));
      }

      if (!applicationId) {
        return next(new AppError('Application ID is required', 400));
      }

      if (userRole === UserRole.ADMIN) {
        return next();
      }

      const { data: application, error } = await supabase
        .from('applications')
        .select('freelancerId, clientId, projectId')
        .eq('id', applicationId)
        .single();

      if (error || !application) {
        return next(new AppError('Application not found', 404));
      }

      const hasAccess = await checkUserApplicationAccess(
        userId,
        userRole,
        application,
        accessType
      );

      if (!hasAccess) {
        logger.error(`Access denied: User ${userId} cannot ${accessType} application ${applicationId}`);
        return next(new AppError(`Access denied: Cannot ${accessType} this application`, 403));
      }

      next();
    } catch (error) {
      logger.error('Application access check failed', { error, userId: req.user?.id });
      next(new AppError('Access verification failed', 500));
    }
  };
};

export const checkProjectAccess = (accessType: 'view' | 'manage') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const projectId = req.params?.id;

      if (!userId || !userRole) {
        return next(new AppError('Authentication required', 401));
      }

      if (!projectId) {
        return next(new AppError('Project ID is required', 400));
      }

      if (userRole === UserRole.ADMIN) {
        return next();
      }

      const { data: project, error } = await supabase
        .from('projects')
        .select('client_id, status')
        .eq('id', projectId)
        .single();

      if (error || !project) {
        return next(new AppError('Project not found', 404));
      }

      const hasAccess = await checkUserProjectAccess(
        userId,
        userRole,
        project,
        accessType
      );

      if (!hasAccess) {
        logger.error(`Access denied: User ${userId} cannot ${accessType} project ${projectId}`);
        return next(new AppError(`Access denied: Cannot ${accessType} this project`, 403));
      }

      next();
    } catch (error) {
      logger.error('Project access check failed', { error, userId: req.user?.id });
      next(new AppError('Access verification failed', 500));
    }
  };
};

export const requireFreelancerRole = (req: AuthRequest, res: Response, next: NextFunction) => {
  const userRole = req.user?.role;

  if (!userRole) {
    return next(new AppError('Authentication required', 401));
  }

  if (userRole !== UserRole.FREELANCER && userRole !== UserRole.ADMIN) {
    return next(new AppError('Freelancer role required', 403));
  }

  next();
};

export const requireClientRole = (req: AuthRequest, res: Response, next: NextFunction) => {
  const userRole = req.user?.role;

  if (!userRole) {
    return next(new AppError('Authentication required', 401));
  }

  if (userRole !== UserRole.CLIENT && userRole !== UserRole.ADMIN) {
    return next(new AppError('Client role required', 403));
  }

  next();
};

export const requireAdminRole = (req: AuthRequest, res: Response, next: NextFunction) => {
  const userRole = req.user?.role;

  if (!userRole) {
    return next(new AppError('Authentication required', 401));
  }

  if (userRole !== UserRole.ADMIN) {
    return next(new AppError('Administrator role required', 403));
  }

  next();
};

export const checkApplicationStatusTransition = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const applicationId = req.params?.id;
    const newStatus = req.body?.status;

    if (!userId || !userRole) {
      return next(new AppError('Authentication required', 401));
    }

    if (!applicationId || !newStatus) {
      return next(new AppError('Application ID and status are required', 400));
    }

    const { data: application, error } = await supabase
      .from('applications')
      .select('status, freelancerId, clientId')
      .eq('id', applicationId)
      .single();

    if (error || !application) {
      return next(new AppError('Application not found', 404));
    }

    const canTransition = await validateStatusTransition(
      application.status,
      newStatus,
      userId,
      userRole,
      application
    );

    if (!canTransition.allowed) {
      return next(new AppError(canTransition.reason || 'Status transition not allowed', 403));
    }

    next();
  } catch (error) {
    logger.error('Status transition check failed', { error, userId: req.user?.id });
    next(new AppError('Status transition verification failed', 500));
  }
};

export const checkBulkOperationLimits = (req: AuthRequest, res: Response, next: NextFunction) => {
  const userRole = req.user?.role;
  const applicationIds = req.body?.applicationIds;

  if (!userRole) {
    return next(new AppError('Authentication required', 401));
  }

  if (!applicationIds || !Array.isArray(applicationIds)) {
    return next(new AppError('Application IDs array is required', 400));
  }

  const maxBulkOperations = getUserMaxBulkOperations(userRole);
  
  if (applicationIds.length > maxBulkOperations) {
    return next(new AppError(`Maximum ${maxBulkOperations} applications allowed in bulk operation`, 400));
  }

  next();
};

export const checkRateLimits = (operationType: 'create' | 'update' | 'status_change' | 'bulk') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return next(new AppError('Authentication required', 401));
      }

      const isRateLimited = await checkUserRateLimit(userId, operationType);

      if (isRateLimited.limited) {
        return next(new AppError(
          `Rate limit exceeded. Try again in ${isRateLimited.retryAfter} seconds`,
          429
        ));
      }

      next();
    } catch (error) {
      logger.error('Rate limit check failed', { error, userId: req.user?.id });
      next();
    }
  };
};

export const logSecurityEvent = (eventType: string, details?: any) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const ipAddress = req.ip || req.socket?.remoteAddress;
    const userAgent = req.get('User-Agent');
    const timestamp = new Date().toISOString();

    logger.info('Security event logged', {
      eventType,
      userId,
      userRole,
      ipAddress,
      userAgent,
      timestamp,
      details
    });

    next();
  };
};

async function getApplicationPermissions(userId: string, userRole: UserRole): Promise<ApplicationPermissions> {
  const basePermissions: ApplicationPermissions = {
    canView: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    canReview: false,
    canAssign: false,
    canArchive: false,
    canBulkUpdate: false,
    canViewAnalytics: false,
    canManageWorkflow: false,
    canAccessAuditLog: false,
    canSendNotifications: false,
    accessLevel: 'none'
  };

  switch (userRole) {
    case UserRole.ADMIN:
      return {
        ...basePermissions,
        canView: true,
        canCreate: true,
        canUpdate: true,
        canDelete: true,
        canReview: true,
        canAssign: true,
        canArchive: true,
        canBulkUpdate: true,
        canViewAnalytics: true,
        canManageWorkflow: true,
        canAccessAuditLog: true,
        canSendNotifications: true,
        accessLevel: 'admin'
      };

    case UserRole.CLIENT:
      return {
        ...basePermissions,
        canView: true,
        canReview: true,
        canViewAnalytics: true,
        canBulkUpdate: true,
        accessLevel: 'full',
        restrictedFields: ['freelancerId']
      };

    case UserRole.FREELANCER:
      return {
        ...basePermissions,
        canView: true,
        canCreate: true,
        canUpdate: true,
        accessLevel: 'limited',
        restrictedFields: ['clientId', 'reviewedBy', 'processedAt']
      };

    default:
      return basePermissions;
  }
}

async function checkUserApplicationAccess(
  userId: string,
  userRole: UserRole,
  application: any,
  accessType: string
): Promise<boolean> {
  switch (accessType) {
    case 'view':
      return userRole === UserRole.ADMIN ||
             application.freelancerId === userId ||
             application.clientId === userId;

    case 'edit':
      return userRole === UserRole.ADMIN ||
             (userRole === UserRole.FREELANCER && application.freelancerId === userId);

    case 'review':
      return userRole === UserRole.ADMIN ||
             (userRole === UserRole.CLIENT && application.clientId === userId);

    case 'delete':
      return userRole === UserRole.ADMIN;

    default:
      return false;
  }
}

async function checkUserProjectAccess(
  userId: string,
  userRole: UserRole,
  project: any,
  accessType: string
): Promise<boolean> {
  switch (accessType) {
    case 'view':
      return userRole === UserRole.ADMIN || userRole === UserRole.FREELANCER || project.client_id === userId;

    case 'manage':
      return userRole === UserRole.ADMIN || project.client_id === userId;

    default:
      return false;
  }
}

async function validateStatusTransition(
  currentStatus: string,
  newStatus: string,
  userId: string,
  userRole: UserRole,
  application: any
): Promise<{ allowed: boolean; reason?: string }> {
  const validTransitions: Record<string, string[]> = {
    'pending': ['under_review', 'accepted', 'rejected', 'withdrawn'],
    'under_review': ['accepted', 'rejected', 'pending'],
    'accepted': ['rejected'],
    'rejected': [],
    'withdrawn': [],
    'expired': []
  };

  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    return {
      allowed: false,
      reason: `Invalid status transition from ${currentStatus} to ${newStatus}`
    };
  }

  if (newStatus === 'withdrawn' && userRole === UserRole.FREELANCER && application.freelancerId !== userId) {
    return {
      allowed: false,
      reason: 'Only the applicant can withdraw their application'
    };
  }

  if ((newStatus === 'accepted' || newStatus === 'rejected') && 
      userRole === UserRole.CLIENT && 
      application.clientId !== userId) {
    return {
      allowed: false,
      reason: 'Only the project owner can accept or reject applications'
    };
  }

  return { allowed: true };
}

function getUserMaxBulkOperations(userRole: UserRole): number {
  switch (userRole) {
    case UserRole.ADMIN:
      return 100;
    case UserRole.CLIENT:
      return 50;
    case UserRole.FREELANCER:
      return 10;
    default:
      return 1;
  }
}

async function checkUserRateLimit(userId: string, operationType: string): Promise<{ limited: boolean; retryAfter?: number }> {
  const limits: Record<string, { requests: number; windowMs: number }> = {
    'create': { requests: 10, windowMs: 60 * 1000 },
    'update': { requests: 20, windowMs: 60 * 1000 },
    'status_change': { requests: 30, windowMs: 60 * 1000 },
    'bulk': { requests: 5, windowMs: 60 * 1000 }
  };

  const limit = limits[operationType];
  if (!limit) {
    return { limited: false };
  }

  return { limited: false };
}