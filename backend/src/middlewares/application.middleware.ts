import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { AppError } from '@/utils/AppError';
import { UserRole } from '@/types/auth.types';
import { ApplicationStatus, ApplicationPriority, ApplicationType } from '@/types/application.types';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    email?: string;
  };
}

export const validateCreateApplication = [
  body('projectId')
    .notEmpty()
    .withMessage('Project ID is required')
    .isUUID()
    .withMessage('Project ID must be a valid UUID'),
    
  body('message')
    .notEmpty()
    .withMessage('Application message is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
    
  body('proposedBudget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Proposed budget must be a positive number'),
    
  body('proposedTimeline')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Proposed timeline must be a positive integer (days)'),
    
  body('coverLetter')
    .optional()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Cover letter must be between 50 and 2000 characters'),
    
  body('skills')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Skills must be an array with at least one skill'),
    
  body('skills.*')
    .optional()
    .isString()
    .isLength({ min: 2, max: 50 })
    .withMessage('Each skill must be between 2 and 50 characters'),
    
  body('hourlyRate')
    .optional()
    .isFloat({ min: 5, max: 1000 })
    .withMessage('Hourly rate must be between $5 and $1000'),
    
  body('estimatedHours')
    .optional()
    .isInt({ min: 1, max: 2000 })
    .withMessage('Estimated hours must be between 1 and 2000'),
    
  body('portfolio')
    .optional()
    .isArray()
    .withMessage('Portfolio must be an array of URLs'),
    
  body('portfolio.*')
    .optional()
    .isURL()
    .withMessage('Each portfolio item must be a valid URL'),
    
  body('communicationPreferences.emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('Email notifications preference must be boolean'),
    
  body('communicationPreferences.smsNotifications')
    .optional()
    .isBoolean()
    .withMessage('SMS notifications preference must be boolean'),
    
  body('communicationPreferences.pushNotifications')
    .optional()
    .isBoolean()
    .withMessage('Push notifications preference must be boolean'),
    
  body('communicationPreferences.reminderFrequency')
    .optional()
    .isIn(['none', 'daily', 'weekly'])
    .withMessage('Reminder frequency must be none, daily, or weekly'),

  (req: AuthRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg).join('; ');
      return next(new AppError(`Validation failed: ${errorMessages}`, 400));
    }
    next();
  }
];

export const validateUpdateApplication = [
  param('id')
    .notEmpty()
    .withMessage('Application ID is required')
    .isUUID()
    .withMessage('Application ID must be a valid UUID'),
    
  body('message')
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters'),
    
  body('proposedBudget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Proposed budget must be a positive number'),
    
  body('proposedTimeline')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Proposed timeline must be a positive integer (days)'),
    
  body('coverLetter')
    .optional()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Cover letter must be between 50 and 2000 characters'),
    
  body('skills')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Skills must be an array with at least one skill'),
    
  body('hourlyRate')
    .optional()
    .isFloat({ min: 5, max: 1000 })
    .withMessage('Hourly rate must be between $5 and $1000'),

  (req: AuthRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg).join('; ');
      return next(new AppError(`Validation failed: ${errorMessages}`, 400));
    }
    next();
  }
];

export const validateUpdateApplicationStatus = [
  param('id')
    .notEmpty()
    .withMessage('Application ID is required')
    .isUUID()
    .withMessage('Application ID must be a valid UUID'),
    
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(ApplicationStatus))
    .withMessage(`Status must be one of: ${Object.values(ApplicationStatus).join(', ')}`),
    
  body('rejectionReason')
    .if(body('status').equals(ApplicationStatus.REJECTED))
    .notEmpty()
    .withMessage('Rejection reason is required when rejecting an application')
    .isLength({ min: 10, max: 500 })
    .withMessage('Rejection reason must be between 10 and 500 characters'),
    
  body('acceptanceTerms')
    .if(body('status').equals(ApplicationStatus.ACCEPTED))
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Acceptance terms must not exceed 1000 characters'),
    
  body('reviewNotes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Review notes must not exceed 1000 characters'),
    
  body('notifyApplicant')
    .optional()
    .isBoolean()
    .withMessage('Notify applicant must be boolean'),

  (req: AuthRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg).join('; ');
      return next(new AppError(`Validation failed: ${errorMessages}`, 400));
    }
    next();
  }
];

export const validateGetApplicationById = [
  param('id')
    .notEmpty()
    .withMessage('Application ID is required')
    .isUUID()
    .withMessage('Application ID must be a valid UUID'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg).join('; ');
      return next(new AppError(`Validation failed: ${errorMessages}`, 400));
    }
    next();
  }
];

export const validateGetApplicationsByProject = [
  param('id')
    .notEmpty()
    .withMessage('Project ID is required')
    .isUUID()
    .withMessage('Project ID must be a valid UUID'),
    
  query('status')
    .optional()
    .isIn(Object.values(ApplicationStatus))
    .withMessage(`Status must be one of: ${Object.values(ApplicationStatus).join(', ')}`),
    
  query('priority')
    .optional()
    .isIn(Object.values(ApplicationPriority))
    .withMessage(`Priority must be one of: ${Object.values(ApplicationPriority).join(', ')}`),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
    
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'submittedAt', 'proposedBudget', 'qualityScore', 'priority'])
    .withMessage('SortBy must be one of: createdAt, submittedAt, proposedBudget, qualityScore, priority'),
    
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('SortOrder must be asc or desc'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg).join('; ');
      return next(new AppError(`Validation failed: ${errorMessages}`, 400));
    }
    next();
  }
];

export const validateSearchApplications = [
  query('status')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const statuses = value.split(',');
        return statuses.every(status => Object.values(ApplicationStatus).includes(status as ApplicationStatus));
      }
      return true;
    })
    .withMessage(`Status must be comma-separated values from: ${Object.values(ApplicationStatus).join(', ')}`),
    
  query('priority')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const priorities = value.split(',');
        return priorities.every(priority => Object.values(ApplicationPriority).includes(priority as ApplicationPriority));
      }
      return true;
    })
    .withMessage(`Priority must be comma-separated values from: ${Object.values(ApplicationPriority).join(', ')}`),
    
  query('type')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const types = value.split(',');
        return types.every(type => Object.values(ApplicationType).includes(type as ApplicationType));
      }
      return true;
    })
    .withMessage(`Type must be comma-separated values from: ${Object.values(ApplicationType).join(', ')}`),
    
  query('projectId')
    .optional()
    .isUUID()
    .withMessage('Project ID must be a valid UUID'),
    
  query('freelancerId')
    .optional()
    .isUUID()
    .withMessage('Freelancer ID must be a valid UUID'),
    
  query('clientId')
    .optional()
    .isUUID()
    .withMessage('Client ID must be a valid UUID'),
    
  query('budgetMin')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget minimum must be a non-negative number'),
    
  query('budgetMax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget maximum must be a non-negative number'),
    
  query('qualityScoreMin')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Quality score minimum must be between 0 and 100'),
    
  query('search')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Search query must be between 3 and 100 characters'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg).join('; ');
      return next(new AppError(`Validation failed: ${errorMessages}`, 400));
    }
    next();
  }
];

export const validateBulkUpdate = [
  body('applicationIds')
    .isArray({ min: 1, max: 50 })
    .withMessage('Application IDs must be an array with 1-50 items'),
    
  body('applicationIds.*')
    .isUUID()
    .withMessage('Each application ID must be a valid UUID'),
    
  body('updates.status')
    .optional()
    .isIn(Object.values(ApplicationStatus))
    .withMessage(`Status must be one of: ${Object.values(ApplicationStatus).join(', ')}`),
    
  body('updates.priority')
    .optional()
    .isIn(Object.values(ApplicationPriority))
    .withMessage(`Priority must be one of: ${Object.values(ApplicationPriority).join(', ')}`),
    
  body('updates.archive')
    .optional()
    .isBoolean()
    .withMessage('Archive must be boolean'),
    
  body('reason')
    .optional()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),

  (req: AuthRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg).join('; ');
      return next(new AppError(`Validation failed: ${errorMessages}`, 400));
    }
    next();
  }
];

export const checkApplicationOwnership = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const applicationId = req.params.id;

    if (!userId || !userRole) {
      return next(new AppError('Authentication required', 401));
    }

    if (userRole === UserRole.ADMIN) {
      return next();
    }

    next();
  } catch (error) {
    next(new AppError('Failed to verify application ownership', 500));
  }
};

export const checkProjectOwnership = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const projectId = req.params.id;

    if (!userId || !userRole) {
      return next(new AppError('Authentication required', 401));
    }

    if (userRole === UserRole.ADMIN) {
      return next();
    }

    next();
  } catch (error) {
    next(new AppError('Failed to verify project ownership', 500));
  }
};

export const rateLimitApplicationCreation = (req: AuthRequest, res: Response, next: NextFunction) => {
  next();
};

export const checkApplicationLimits = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      return next(new AppError('Authentication required', 401));
    }

    if (userRole !== UserRole.FREELANCER) {
      return next(new AppError('Only freelancers can create applications', 403));
    }

    next();
  } catch (error) {
    next(new AppError('Failed to check application limits', 500));
  }
};

export const sanitizeApplicationInput = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.body.message) {
    req.body.message = req.body.message.trim();
  }
  
  if (req.body.coverLetter) {
    req.body.coverLetter = req.body.coverLetter.trim();
  }
  
  if (req.body.skills && Array.isArray(req.body.skills)) {
    req.body.skills = req.body.skills.map((skill: string) => skill.trim()).filter(Boolean);
  }
  
  if (req.body.tags && Array.isArray(req.body.tags)) {
    req.body.tags = req.body.tags.map((tag: string) => tag.trim().toLowerCase()).filter(Boolean);
  }
  
  next();
};

export const logApplicationActivity = (action: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const applicationId = req.params.id;
    const timestamp = new Date().toISOString();
    
    console.log(`[${timestamp}] Application ${action} by user ${userId} for application ${applicationId}`);
    
    next();
  };
};