import { Request, Response } from 'express';
import { applicationService, createApplication, getApplicationsByProject, updateApplicationStatus } from '../services/application.service';
import { buildSuccessResponse, buildErrorResponse } from '../utils/responseBuilder';
import { AppError } from '@/utils/AppError';
import { logger } from '@/utils/logger';
import { UserRole } from '@/types/auth.types';
import { CreateApplicationInput, ApplicationStatus } from '@/types/application.types';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    email?: string;
  };
}

export const createApplicationHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role || UserRole.FREELANCER;

    if (!userId) {
      return res.status(401).json(buildErrorResponse('Authentication required'));
    }

    const { projectId, message, proposedBudget, coverLetter, skills, hourlyRate } = req.body;
    
    if (!projectId || !message) {
      return res.status(400).json(
        buildErrorResponse('Missing required fields: projectId, message')
      );
    }

    const input: CreateApplicationInput = {
      projectId,
      freelancerId: userId,
      message,
      proposedBudget,
      coverLetter,
      skills: skills || [],
      hourlyRate
    };

    const application = await applicationService.createApplication(input, userId, userRole);
    
    res.status(201).json(
      buildSuccessResponse(application, 'Application created successfully')
    );
  } catch (error) {
    logger.error('Create application failed');
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(buildErrorResponse(error.message));
    }
    res.status(500).json(buildErrorResponse('Failed to create application'));
  }
};

export const updateApplicationHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role || UserRole.FREELANCER;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json(buildErrorResponse('Authentication required'));
    }

    if (!id) {
      return res.status(400).json(buildErrorResponse('Application ID is required'));
    }

    const input = req.body;
    const application = await applicationService.updateApplication(id, input, userId, userRole);
    
    res.status(200).json(
      buildSuccessResponse(application, 'Application updated successfully')
    );
  } catch (error) {
    logger.error('Update application failed');
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(buildErrorResponse(error.message));
    }
    res.status(500).json(buildErrorResponse('Failed to update application'));
  }
};

export const updateApplicationStatusHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role || UserRole.CLIENT;
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    
    if (!userId) {
      return res.status(401).json(buildErrorResponse('Authentication required'));
    }

    if (!id) {
      return res.status(400).json(buildErrorResponse('Application ID is required'));
    }

    if (!status) {
      return res.status(400).json(buildErrorResponse('Status is required'));
    }

    const input = { status, rejectionReason };
    const application = await applicationService.updateApplicationStatus(id, input, userId, userRole);
    
    res.status(200).json(
      buildSuccessResponse(application, `Application ${status} successfully`)
    );
  } catch (error) {
    logger.error('Update application status failed');
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(buildErrorResponse(error.message));
    }
    res.status(500).json(buildErrorResponse('Failed to update application status'));
  }
};

export const getApplicationByIdHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json(buildErrorResponse('Authentication required'));
    }

    if (!id) {
      return res.status(400).json(buildErrorResponse('Application ID is required'));
    }

    const application = await applicationService.getApplicationById(id);

    if (!application) {
      return res.status(404).json(buildErrorResponse('Application not found'));
    }

    res.status(200).json(
      buildSuccessResponse(application, 'Application retrieved successfully')
    );
  } catch (error) {
    logger.error('Get application failed');
    res.status(500).json(buildErrorResponse('Failed to retrieve application'));
  }
};

export const getApplicationsByProjectHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role || UserRole.CLIENT;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json(buildErrorResponse('Authentication required'));
    }

    if (!id) {
      return res.status(400).json(buildErrorResponse('Project ID is required'));
    }

    const filter = {
      status: req.query.status ? [req.query.status as ApplicationStatus] : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0
    };

    const result = await applicationService.getApplicationsByProject(id, filter, userId, userRole);
    
    res.status(200).json(
      buildSuccessResponse(result.applications, 'Applications retrieved successfully')
    );
  } catch (error) {
    logger.error('Get applications by project failed');
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(buildErrorResponse(error.message));
    }
    res.status(500).json(buildErrorResponse('Failed to retrieve applications'));
  }
};

export const getApplicationsByFreelancerHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role || UserRole.FREELANCER;
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json(buildErrorResponse('Authentication required'));
    }

    if (!id) {
      return res.status(400).json(buildErrorResponse('Freelancer ID is required'));
    }

    const filter = {
      status: req.query.status ? [req.query.status as ApplicationStatus] : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0
    };

    const result = await applicationService.getApplicationsByFreelancer(id, filter, userId, userRole);
    
    res.status(200).json(
      buildSuccessResponse(result.applications, 'Applications retrieved successfully')
    );
  } catch (error) {
    logger.error('Get applications by freelancer failed');
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(buildErrorResponse(error.message));
    }
    res.status(500).json(buildErrorResponse('Failed to retrieve applications'));
  }
};

export const searchApplicationsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role || UserRole.CLIENT;
    
    if (!userId) {
      return res.status(401).json(buildErrorResponse('Authentication required'));
    }

    const filter = {
      status: req.query.status ? (req.query.status as string).split(',') as ApplicationStatus[] : undefined,
      projectId: req.query.projectId as string,
      freelancerId: req.query.freelancerId as string,
      search: req.query.search as string,
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as 'asc' | 'desc',
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      offset: req.query.offset ? parseInt(req.query.offset as string) : 0
    };

    const result = await applicationService.searchApplications(filter, userId, userRole);
    
    res.status(200).json(
      buildSuccessResponse(result.applications, 'Applications found successfully')
    );
  } catch (error) {
    logger.error('Search applications failed');
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(buildErrorResponse(error.message));
    }
    res.status(500).json(buildErrorResponse('Failed to search applications'));
  }
};

export const getApplicationStatisticsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role || UserRole.CLIENT;
    
    if (!userId) {
      return res.status(401).json(buildErrorResponse('Authentication required'));
    }

    const filter = {
      projectId: req.query.projectId as string,
      freelancerId: req.query.freelancerId as string,
      clientId: req.query.clientId as string
    };

    const statistics = await applicationService.getApplicationStatistics(filter, userId, userRole);
    
    res.status(200).json(
      buildSuccessResponse(statistics, 'Statistics retrieved successfully')
    );
  } catch (error) {
    logger.error('Get statistics failed');
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(buildErrorResponse(error.message));
    }
    res.status(500).json(buildErrorResponse('Failed to retrieve statistics'));
  }
};

  async updateApplication(req: ApplicationRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const { id: applicationId } = req.params;

      if (!userId || !userRole) {
        return next(new AppError('Authentication required', 401));
      }

      if (!applicationId) {
        return next(new AppError('Application ID is required', 400));
      }

      const input: UpdateApplicationInput = req.validatedData || req.body;

      const application = await applicationService.updateApplication(applicationId, input, userId, userRole);

      res.status(200).json(
        buildSuccessResponse(
          application,
          'Application updated successfully'
        )
      );
    } catch (error) {
      logger.error('Update application failed', { error, applicationId: req.params.id, userId: req.user?.id });
      next(error);
    }
  }

  async updateApplicationStatus(req: ApplicationRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const { id: applicationId } = req.params;

      if (!userId || !userRole) {
        return next(new AppError('Authentication required', 401));
      }

      if (!applicationId) {
        return next(new AppError('Application ID is required', 400));
      }

      const input: ApplicationStatusUpdateInput = req.validatedData || req.body;

      const application = await applicationService.updateApplicationStatus(applicationId, input, userId, userRole);

      res.status(200).json(
        buildSuccessResponse(
          application,
          `Application ${input.status} successfully`,
          {
            applicationId: application.id,
            newStatus: application.status,
            processedAt: application.processedAt
          }
        )
      );
    } catch (error) {
      logger.error('Update application status failed', { error, applicationId: req.params.id, userId: req.user?.id });
      next(error);
    }
  }

  async getApplicationById(req: ApplicationRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const { id: applicationId } = req.params;

      if (!userId || !userRole) {
        return next(new AppError('Authentication required', 401));
      }

      if (!applicationId) {
        return next(new AppError('Application ID is required', 400));
      }

      const application = await applicationService.getApplicationById(applicationId);

      if (!application) {
        return next(new AppError('Application not found', 404));
      }

      if (userRole !== UserRole.ADMIN && 
          application.freelancerId !== userId && 
          application.clientId !== userId) {
        return next(new AppError('Access denied', 403));
      }

      res.status(200).json(
        buildSuccessResponse(
          application,
          'Application retrieved successfully'
        )
      );
    } catch (error) {
      logger.error('Get application by ID failed', { error, applicationId: req.params.id, userId: req.user?.id });
      next(error);
    }
  }

  async getApplicationsByProject(req: ApplicationRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const { id: projectId } = req.params;

      if (!userId || !userRole) {
        return next(new AppError('Authentication required', 401));
      }

      if (!projectId) {
        return next(new AppError('Project ID is required', 400));
      }

      const filter: Partial<ApplicationFilter> = {
        status: req.query.status ? [req.query.status as ApplicationStatus] : undefined,
        priority: req.query.priority ? [req.query.priority as any] : undefined,
        search: req.query.search as string,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0
      };

      const result = await applicationService.getApplicationsByProject(projectId, filter, userId, userRole);

      res.status(200).json(
        buildSuccessResponse(
          result.applications,
          'Applications retrieved successfully',
          {
            total: result.total,
            page: Math.floor((filter.offset || 0) / (filter.limit || 20)) + 1,
            limit: filter.limit,
            hasNext: (filter.offset || 0) + (filter.limit || 20) < result.total,
            hasPrevious: (filter.offset || 0) > 0
          }
        )
      );
    } catch (error) {
      logger.error('Get applications by project failed', { error, projectId: req.params.id, userId: req.user?.id });
      next(error);
    }
  }

  async getApplicationsByFreelancer(req: ApplicationRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const { id: freelancerId } = req.params;

      if (!userId || !userRole) {
        return next(new AppError('Authentication required', 401));
      }

      if (!freelancerId) {
        return next(new AppError('Freelancer ID is required', 400));
      }

      const filter: Partial<ApplicationFilter> = {
        status: req.query.status ? [req.query.status as ApplicationStatus] : undefined,
        priority: req.query.priority ? [req.query.priority as any] : undefined,
        search: req.query.search as string,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0
      };

      const result = await applicationService.getApplicationsByFreelancer(freelancerId, filter, userId, userRole);

      res.status(200).json(
        buildSuccessResponse(
          result.applications,
          'Applications retrieved successfully',
          {
            total: result.total,
            page: Math.floor((filter.offset || 0) / (filter.limit || 20)) + 1,
            limit: filter.limit,
            hasNext: (filter.offset || 0) + (filter.limit || 20) < result.total,
            hasPrevious: (filter.offset || 0) > 0
          }
        )
      );
    } catch (error) {
      logger.error('Get applications by freelancer failed', { error, freelancerId: req.params.id, userId: req.user?.id });
      next(error);
    }
  }

  async searchApplications(req: ApplicationRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        return next(new AppError('Authentication required', 401));
      }

      const filter: ApplicationFilter = {
        status: req.query.status ? (req.query.status as string).split(',') as ApplicationStatus[] : undefined,
        priority: req.query.priority ? (req.query.priority as string).split(',') as any[] : undefined,
        type: req.query.type ? (req.query.type as string).split(',') as any[] : undefined,
        projectId: req.query.projectId as string,
        freelancerId: req.query.freelancerId as string,
        clientId: req.query.clientId as string,
        skills: req.query.skills ? (req.query.skills as string).split(',') : undefined,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
        budgetMin: req.query.budgetMin ? parseFloat(req.query.budgetMin as string) : undefined,
        budgetMax: req.query.budgetMax ? parseFloat(req.query.budgetMax as string) : undefined,
        createdAfter: req.query.createdAfter ? new Date(req.query.createdAfter as string) : undefined,
        createdBefore: req.query.createdBefore ? new Date(req.query.createdBefore as string) : undefined,
        isUrgent: req.query.isUrgent ? req.query.isUrgent === 'true' : undefined,
        isFeatured: req.query.isFeatured ? req.query.isFeatured === 'true' : undefined,
        isArchived: req.query.isArchived ? req.query.isArchived === 'true' : undefined,
        qualityScoreMin: req.query.qualityScoreMin ? parseFloat(req.query.qualityScoreMin as string) : undefined,
        search: req.query.search as string,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0
      };

      const result = await applicationService.searchApplications(filter, userId, userRole);

      res.status(200).json(
        buildSuccessResponse(
          result.applications,
          'Applications found successfully',
          {
            total: result.total,
            page: Math.floor((filter.offset || 0) / (filter.limit || 20)) + 1,
            limit: filter.limit,
            hasNext: (filter.offset || 0) + (filter.limit || 20) < result.total,
            hasPrevious: (filter.offset || 0) > 0,
            filters: filter
          }
        )
      );
    } catch (error) {
      logger.error('Search applications failed', { error, userId: req.user?.id });
      next(error);
    }
  }

  async bulkUpdateApplications(req: ApplicationRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        return next(new AppError('Authentication required', 401));
      }

      if (userRole !== UserRole.ADMIN && userRole !== UserRole.CLIENT) {
        return next(new AppError('Insufficient permissions for bulk operations', 403));
      }

      const input: BulkApplicationUpdate = req.validatedData || req.body;

      if (!input.applicationIds || input.applicationIds.length === 0) {
        return next(new AppError('Application IDs are required', 400));
      }

      const result = await applicationService.bulkUpdateApplications(input, userId, userRole);

      res.status(200).json(
        buildSuccessResponse(
          result,
          `Bulk update completed: ${result.summary.successful} successful, ${result.summary.failed} failed`,
          {
            summary: result.summary,
            hasErrors: result.summary.failed > 0
          }
        )
      );
    } catch (error) {
      logger.error('Bulk update applications failed', { error, userId: req.user?.id });
      next(error);
    }
  }

  async getApplicationStatistics(req: ApplicationRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        return next(new AppError('Authentication required', 401));
      }

      const filter: Partial<ApplicationFilter> = {
        projectId: req.query.projectId as string,
        freelancerId: req.query.freelancerId as string,
        clientId: req.query.clientId as string,
        createdAfter: req.query.createdAfter ? new Date(req.query.createdAfter as string) : undefined,
        createdBefore: req.query.createdBefore ? new Date(req.query.createdBefore as string) : undefined
      };

      const statistics = await applicationService.getApplicationStatistics(filter, userId, userRole);

      res.status(200).json(
        buildSuccessResponse(
          statistics,
          'Statistics retrieved successfully'
        )
      );
    } catch (error) {
      logger.error('Get application statistics failed', { error, userId: req.user?.id });
      next(error);
    }
  }

  async withdrawApplication(req: ApplicationRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const { id: applicationId } = req.params;

      if (!userId || !userRole) {
        return next(new AppError('Authentication required', 401));
      }

      if (!applicationId) {
        return next(new AppError('Application ID is required', 400));
      }

      const input: ApplicationStatusUpdateInput = {
        status: ApplicationStatus.WITHDRAWN,
        notifyApplicant: false
      };

      const application = await applicationService.updateApplicationStatus(applicationId, input, userId, userRole);

      res.status(200).json(
        buildSuccessResponse(
          application,
          'Application withdrawn successfully',
          {
            applicationId: application.id,
            newStatus: application.status
          }
        )
      );
    } catch (error) {
      logger.error('Withdraw application failed', { error, applicationId: req.params.id, userId: req.user?.id });
      next(error);
    }
  }

  async archiveApplication(req: ApplicationRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;
      const { id: applicationId } = req.params;

      if (!userId || !userRole) {
        return next(new AppError('Authentication required', 401));
      }

      if (!applicationId) {
        return next(new AppError('Application ID is required', 400));
      }

      if (userRole !== UserRole.ADMIN && userRole !== UserRole.CLIENT) {
        return next(new AppError('Insufficient permissions to archive applications', 403));
      }

      const application = await applicationService.getApplicationById(applicationId);

      if (!application) {
        return next(new AppError('Application not found', 404));
      }

      const input: BulkApplicationUpdate = {
        applicationIds: [applicationId],
        updates: { archive: true },
        reason: req.body.reason
      };

      const result = await applicationService.bulkUpdateApplications(input, userId, userRole);

      if (result.summary.successful === 0) {
        return next(new AppError('Failed to archive application', 500));
      }

      res.status(200).json(
        buildSuccessResponse(
          result.results[0].data,
          'Application archived successfully',
          {
            applicationId,
            archivedAt: result.results[0].data?.archivedAt
          }
        )
      );
    } catch (error) {
      logger.error('Archive application failed', { error, applicationId: req.params.id, userId: req.user?.id });
      next(error);
    }
  }

  async getMyApplications(req: ApplicationRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        return next(new AppError('Authentication required', 401));
      }

      const filter: ApplicationFilter = {
        freelancerId: userRole === UserRole.FREELANCER ? userId : undefined,
        clientId: userRole === UserRole.CLIENT ? userId : undefined,
        status: req.query.status ? (req.query.status as string).split(',') as ApplicationStatus[] : undefined,
        isArchived: req.query.includeArchived === 'true' ? undefined : false,
        sortBy: req.query.sortBy as any || 'createdAt',
        sortOrder: req.query.sortOrder as 'asc' | 'desc' || 'desc',
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0
      };

      const result = await applicationService.searchApplications(filter, userId, userRole);

      res.status(200).json(
        buildSuccessResponse(
          result.applications,
          'Your applications retrieved successfully',
          {
            total: result.total,
            page: Math.floor((filter.offset || 0) / (filter.limit || 20)) + 1,
            limit: filter.limit,
            hasNext: (filter.offset || 0) + (filter.limit || 20) < result.total,
            hasPrevious: (filter.offset || 0) > 0
          }
        )
      );
    } catch (error) {
      logger.error('Get my applications failed', { error, userId: req.user?.id });
      next(error);
    }
  }
}

const applicationController = new ApplicationController();

export const createApplicationHandler = applicationController.createApplication.bind(applicationController);
export const updateApplicationHandler = applicationController.updateApplication.bind(applicationController);
export const updateApplicationStatusHandler = applicationController.updateApplicationStatus.bind(applicationController);
export const getApplicationByIdHandler = applicationController.getApplicationById.bind(applicationController);
export const getApplicationsByProjectHandler = applicationController.getApplicationsByProject.bind(applicationController);
export const getApplicationsByFreelancerHandler = applicationController.getApplicationsByFreelancer.bind(applicationController);
export const searchApplicationsHandler = applicationController.searchApplications.bind(applicationController);
export const bulkUpdateApplicationsHandler = applicationController.bulkUpdateApplications.bind(applicationController);
export const getApplicationStatisticsHandler = applicationController.getApplicationStatistics.bind(applicationController);
export const withdrawApplicationHandler = applicationController.withdrawApplication.bind(applicationController);
export const archiveApplicationHandler = applicationController.archiveApplication.bind(applicationController);
export const getMyApplicationsHandler = applicationController.getMyApplications.bind(applicationController);

export default applicationController;
