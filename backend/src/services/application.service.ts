import { supabase } from '../lib/supabase/supabase';
import { ConflictError, BadRequestError, NotFoundError, AppError } from '@/utils/AppError';
import { UserRole } from '@/types/auth.types';
import {
  ApplicationModel,
  ApplicationStatus,
  ApplicationPriority,
  ApplicationType,
  CreateApplicationInput,
  UpdateApplicationInput,
  ApplicationStatusUpdateInput,
  ApplicationFilter,
  ApplicationSummary,
  ApplicationStatistics,
  ApplicationValidationResult,
  ApplicationBusinessRules,
  ApplicationAuditLog,
  ApplicationAuditAction,
  BulkApplicationUpdate,
  ApplicationBatchResponse,
  ApplicationNotification,
  ApplicationNotificationType,
  ApplicationWorkflow,
  ApplicationWorkflowStage,
  ApplicationMetadata,
  ApplicationAnalytics
} from '@/types/application.types';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/utils/logger';

export interface ApplicationInput {
  project_id: string;
  freelancer_id: string;
  message: string;
}

export interface Application extends ApplicationInput {
  id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

const DEFAULT_BUSINESS_RULES: ApplicationBusinessRules = {
  maxApplicationsPerProject: 50,
  maxApplicationsPerFreelancer: 10,
  autoRejectAfterDays: 30,
  requirePortfolio: false,
  requireCoverLetter: true,
  minBudgetVariance: -50,
  maxBudgetVariance: 100,
  allowedFileTypes: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png'],
  maxFileSize: 10485760,
  maxAttachments: 5,
  qualityScoreThreshold: 60,
  autoApprovalEnabled: false,
  autoApprovalThreshold: 85
};

export class ApplicationService {
  private readonly businessRules: ApplicationBusinessRules;

  constructor(businessRules: ApplicationBusinessRules = DEFAULT_BUSINESS_RULES) {
    this.businessRules = businessRules;
  }

  async createApplication(input: CreateApplicationInput, userId: string, userRole: UserRole): Promise<ApplicationModel> {
    try {
      const validationResult = await this.validateApplicationInput(input, userId, userRole);
      if (!validationResult.isValid) {
        throw new BadRequestError(`Validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
      }

      await this.checkBusinessRules(input, userId);

      const applicationId = uuidv4();
      const now = new Date();

      const workflow = await this.createDefaultWorkflow();
      const metadata = this.createMetadata(input as any);
      const analytics = this.createInitialAnalytics();

      const applicationData: Partial<ApplicationModel> = {
        id: applicationId,
        projectId: input.projectId,
        freelancerId: input.freelancerId,
        clientId: await this.getProjectClientId(input.projectId),
        status: ApplicationStatus.PENDING,
        priority: ApplicationPriority.MEDIUM,
        type: input.type || ApplicationType.STANDARD,
        message: input.message,
        proposedBudget: input.proposedBudget,
        proposedTimeline: input.proposedTimeline,
        proposedStartDate: input.proposedStartDate,
        proposedDeliveryDate: input.proposedDeliveryDate,
        coverLetter: input.coverLetter,
        portfolio: input.portfolio || [],
        skills: input.skills,
        experience: input.experience,
        availability: input.availability,
        hourlyRate: input.hourlyRate,
        estimatedHours: input.estimatedHours,
        milestones: input.milestones?.map(m => ({ ...m, id: uuidv4(), isCompleted: false })) || [],
        attachments: [],
        notes: [],
        workflow,
        analytics,
        metadata,
        tags: [],
        isUrgent: false,
        isFeatured: false,
        isArchived: false,
        isDeleted: false,
        lastModifiedBy: userId,
        communicationPreferences: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          reminderFrequency: 'weekly',
          ...input.communicationPreferences
        },
        createdAt: now,
        updatedAt: now,
        submittedAt: now
      };

      const qualityScore = await this.calculateQualityScore(applicationData as ApplicationModel);
      applicationData.qualityScore = qualityScore;

      const { data: application, error } = await supabase
        .from('applications')
        .insert([this.serializeForDatabase(applicationData)])
        .select()
        .single();

      if (error) {
        logger.error('Failed to create application', { error, input, userId });
        throw new AppError('Failed to create application', 500);
      }

      const createdApplication = this.deserializeFromDatabase(application);

      await this.logAuditAction(
        ApplicationAuditAction.CREATED,
        createdApplication,
        userId,
        { input }
      );

      await this.sendNotification(
        ApplicationNotificationType.APPLICATION_SUBMITTED,
        createdApplication,
        [createdApplication.freelancerId, createdApplication.clientId]
      );

      return createdApplication;
    } catch (error) {
      logger.error('Application creation failed', { error, input, userId });
      throw error;
    }
  }

  async updateApplication(
    applicationId: string,
    input: UpdateApplicationInput,
    userId: string,
    userRole: UserRole
  ): Promise<ApplicationModel> {
    try {
      const existingApplication = await this.getApplicationById(applicationId);
      
      if (!existingApplication) {
        throw new NotFoundError('Application not found');
      }

      if (!this.canUpdateApplication(existingApplication, userId, userRole)) {
        throw new BadRequestError('You do not have permission to update this application');
      }

      if (existingApplication.status !== ApplicationStatus.PENDING) {
        throw new ConflictError('Only pending applications can be updated');
      }

      const validationResult = await this.validateApplicationUpdate(input, userId, userRole);
      if (!validationResult.isValid) {
        throw new BadRequestError(`Validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
      }

      const updatedData: any = {
        ...input,
        lastModifiedBy: userId,
        updatedAt: new Date()
      };

      if (input.skills || input.message || input.coverLetter) {
        updatedData.qualityScore = await this.calculateQualityScore({
          ...existingApplication,
          ...updatedData
        } as ApplicationModel);
      }

      const { data: application, error } = await supabase
        .from('applications')
        .update(this.serializeForDatabase(updatedData))
        .eq('id', applicationId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update application', { error, applicationId, input, userId });
        throw new AppError('Failed to update application', 500);
      }

      const updatedApplication = this.deserializeFromDatabase(application);

      await this.logAuditAction(
        ApplicationAuditAction.UPDATED,
        updatedApplication,
        userId,
        { oldValues: existingApplication, newValues: updatedData }
      );

      return updatedApplication;
    } catch (error) {
      logger.error('Application update failed', { error, applicationId, input, userId });
      throw error;
    }
  }

  async updateApplicationStatus(
    applicationId: string,
    input: ApplicationStatusUpdateInput,
    userId: string,
    userRole: UserRole
  ): Promise<ApplicationModel> {
    try {
      const existingApplication = await this.getApplicationById(applicationId);
      
      if (!existingApplication) {
        throw new NotFoundError('Application not found');
      }

      if (!this.canReviewApplication(existingApplication, userId, userRole)) {
        throw new BadRequestError('You do not have permission to review this application');
      }

      await this.validateStatusTransition(existingApplication.status, input.status);

      if (input.status === ApplicationStatus.ACCEPTED) {
        await this.validateAcceptance(existingApplication);
      }

      const now = new Date();
      const updatedData: Partial<ApplicationModel> = {
        status: input.status,
        rejectionReason: input.rejectionReason,
        acceptanceTerms: input.acceptanceTerms,
        reviewedBy: userId,
        reviewedAt: now,
        lastModifiedBy: userId,
        updatedAt: now
      };

      if (input.status === ApplicationStatus.ACCEPTED || input.status === ApplicationStatus.REJECTED) {
        updatedData.processedAt = now;
      }

      if (input.assignTo) {
        updatedData.workflow = {
          ...existingApplication.workflow,
          assignedTo: input.assignTo
        };
      }

      const { data: application, error } = await supabase
        .from('applications')
        .update(this.serializeForDatabase(updatedData))
        .eq('id', applicationId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update application status', { error, applicationId, input, userId });
        throw new AppError('Failed to update application status', 500);
      }

      const updatedApplication = this.deserializeFromDatabase(application);

      await this.logAuditAction(
        ApplicationAuditAction.STATUS_CHANGED,
        updatedApplication,
        userId,
        { oldStatus: existingApplication.status, newStatus: input.status, reason: input.rejectionReason }
      );

      if (input.notifyApplicant !== false) {
        const notificationType = input.status === ApplicationStatus.ACCEPTED 
          ? ApplicationNotificationType.APPLICATION_ACCEPTED
          : input.status === ApplicationStatus.REJECTED
          ? ApplicationNotificationType.APPLICATION_REJECTED
          : ApplicationNotificationType.APPLICATION_REVIEWED;

        await this.sendNotification(
          notificationType,
          updatedApplication,
          [updatedApplication.freelancerId]
        );
      }

      if (input.status === ApplicationStatus.ACCEPTED) {
        await this.handleApplicationAcceptance(updatedApplication);
      }

      return updatedApplication;
    } catch (error) {
      logger.error('Application status update failed', { error, applicationId, input, userId });
      throw error;
    }
  }

  async getApplicationById(applicationId: string): Promise<ApplicationModel | null> {
    try {
      const { data: application, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', applicationId)
        .eq('isDeleted', false)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        logger.error('Failed to get application by ID', { error, applicationId });
        throw new AppError('Failed to retrieve application', 500);
      }

      return this.deserializeFromDatabase(application);
    } catch (error) {
      logger.error('Get application by ID failed', { error, applicationId });
      throw error;
    }
  }

  async getApplicationsByProject(
    projectId: string,
    filter: Partial<ApplicationFilter> = {},
    userId: string,
    userRole: UserRole
  ): Promise<{ applications: ApplicationSummary[]; total: number }> {
    try {
      if (!this.canViewProjectApplications(projectId, userId, userRole)) {
        throw new BadRequestError('You do not have permission to view these applications');
      }

      let query = supabase
        .from('applications')
        .select('*', { count: 'exact' })
        .eq('projectId', projectId)
        .eq('isDeleted', false);

      query = this.applyFilters(query, filter);

      const { data: applications, error, count } = await query;

      if (error) {
        logger.error('Failed to get applications by project', { error, projectId, filter });
        throw new AppError('Failed to retrieve applications', 500);
      }

      const summaries = applications?.map((app: any) => this.createApplicationSummary(app)) || [];

      return {
        applications: summaries,
        total: count || 0
      };
    } catch (error) {
      logger.error('Get applications by project failed', { error, projectId, filter, userId });
      throw error;
    }
  }

  async getApplicationsByFreelancer(
    freelancerId: string,
    filter: Partial<ApplicationFilter> = {},
    userId: string,
    userRole: UserRole
  ): Promise<{ applications: ApplicationSummary[]; total: number }> {
    try {
      if (!this.canViewFreelancerApplications(freelancerId, userId, userRole)) {
        throw new BadRequestError('You do not have permission to view these applications');
      }

      let query = supabase
        .from('applications')
        .select('*', { count: 'exact' })
        .eq('freelancerId', freelancerId)
        .eq('isDeleted', false);

      query = this.applyFilters(query, filter);

      const { data: applications, error, count } = await query;

      if (error) {
        logger.error('Failed to get applications by freelancer', { error, freelancerId, filter });
        throw new AppError('Failed to retrieve applications', 500);
      }

      const summaries = applications?.map((app: any) => this.createApplicationSummary(app)) || [];

      return {
        applications: summaries,
        total: count || 0
      };
    } catch (error) {
      logger.error('Get applications by freelancer failed', { error, freelancerId, filter, userId });
      throw error;
    }
  }

  async searchApplications(
    filter: ApplicationFilter,
    userId: string,
    userRole: UserRole
  ): Promise<{ applications: ApplicationSummary[]; total: number }> {
    try {
      let query = supabase
        .from('applications')
        .select('*', { count: 'exact' })
        .eq('isDeleted', false);

      if (userRole === UserRole.FREELANCER) {
        query = query.eq('freelancerId', userId);
      } else if (userRole === UserRole.CLIENT) {
        query = query.eq('clientId', userId);
      }

      query = this.applyFilters(query, filter);

      const { data: applications, error, count } = await query;

      if (error) {
        logger.error('Failed to search applications', { error, filter });
        throw new AppError('Failed to search applications', 500);
      }

      const summaries = applications?.map((app: any) => this.createApplicationSummary(app)) || [];

      return {
        applications: summaries,
        total: count || 0
      };
    } catch (error) {
      logger.error('Search applications failed', { error, filter, userId });
      throw error;
    }
  }

  async bulkUpdateApplications(
    input: BulkApplicationUpdate,
    userId: string,
    userRole: UserRole
  ): Promise<ApplicationBatchResponse> {
    try {
      if (userRole !== UserRole.ADMIN && userRole !== UserRole.CLIENT) {
        throw new BadRequestError('Insufficient permissions for bulk operations');
      }

      const results: ApplicationBatchResponse['results'] = [];
      let successful = 0;
      let failed = 0;

      for (const applicationId of input.applicationIds) {
        try {
          const application = await this.getApplicationById(applicationId);
          if (!application) {
            results.push({
              id: applicationId,
              success: false,
              error: 'Application not found'
            });
            failed++;
            continue;
          }

          if (!this.canUpdateApplication(application, userId, userRole)) {
            results.push({
              id: applicationId,
              success: false,
              error: 'Insufficient permissions'
            });
            failed++;
            continue;
          }

          const updateData: Partial<ApplicationModel> = {
            ...input.updates,
            lastModifiedBy: userId,
            updatedAt: new Date()
          };

          if (input.updates.archive) {
            updateData.isArchived = true;
            updateData.archivedAt = new Date();
          }

          const { data: updatedApp, error } = await supabase
            .from('applications')
            .update(this.serializeForDatabase(updateData))
            .eq('id', applicationId)
            .select()
            .single();

          if (error) {
            results.push({
              id: applicationId,
              success: false,
              error: error.message
            });
            failed++;
            continue;
          }

          const updatedApplication = this.deserializeFromDatabase(updatedApp);

          results.push({
            id: applicationId,
            success: true,
            data: updatedApplication
          });
          successful++;

          await this.logAuditAction(
            ApplicationAuditAction.BULK_UPDATED,
            updatedApplication,
            userId,
            { bulkUpdate: input, reason: input.reason }
          );

        } catch (error) {
          results.push({
            id: applicationId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          failed++;
        }
      }

      return {
        success: successful > 0,
        results,
        summary: {
          total: input.applicationIds.length,
          successful,
          failed,
          skipped: 0
        }
      };
    } catch (error) {
      logger.error('Bulk update applications failed', { error, input, userId });
      throw error;
    }
  }

  async getApplicationStatistics(
    filter: Partial<ApplicationFilter> = {},
    userId: string,
    userRole: UserRole
  ): Promise<ApplicationStatistics> {
    try {
      let query = supabase
        .from('applications')
        .select('*')
        .eq('isDeleted', false);

      if (userRole === UserRole.FREELANCER) {
        query = query.eq('freelancerId', userId);
      } else if (userRole === UserRole.CLIENT) {
        query = query.eq('clientId', userId);
      }

      query = this.applyFilters(query, filter);

      const { data: applications, error } = await query;

      if (error) {
        logger.error('Failed to get application statistics', { error, filter });
        throw new AppError('Failed to retrieve statistics', 500);
      }

      const stats = this.calculateStatistics(applications || []);
      return stats;
    } catch (error) {
      logger.error('Get application statistics failed', { error, filter, userId });
      throw error;
    }
  }

  private async validateApplicationInput(
    input: CreateApplicationInput,
    userId: string,
    userRole: UserRole
  ): Promise<ApplicationValidationResult> {
    const errors: any[] = [];
    const warnings: any[] = [];

    if (!input.projectId) {
      errors.push({ field: 'projectId', message: 'Project ID is required', code: 'REQUIRED' });
    }

    if (!input.message || input.message.trim().length < 10) {
      errors.push({ field: 'message', message: 'Message must be at least 10 characters', code: 'MIN_LENGTH' });
    }

    if (this.businessRules.requireCoverLetter && (!input.coverLetter || input.coverLetter.trim().length < 50)) {
      errors.push({ field: 'coverLetter', message: 'Cover letter is required and must be at least 50 characters', code: 'REQUIRED' });
    }

    if (this.businessRules.requirePortfolio && (!input.portfolio || input.portfolio.length === 0)) {
      errors.push({ field: 'portfolio', message: 'Portfolio is required', code: 'REQUIRED' });
    }

    if (!input.skills || input.skills.length === 0) {
      errors.push({ field: 'skills', message: 'At least one skill is required', code: 'REQUIRED' });
    }

    if (input.proposedBudget && input.proposedBudget <= 0) {
      errors.push({ field: 'proposedBudget', message: 'Proposed budget must be greater than 0', code: 'INVALID_VALUE' });
    }

    if (input.hourlyRate && input.hourlyRate <= 0) {
      errors.push({ field: 'hourlyRate', message: 'Hourly rate must be greater than 0', code: 'INVALID_VALUE' });
    }

    if (input.proposedStartDate && input.proposedStartDate < new Date()) {
      warnings.push({ field: 'proposedStartDate', message: 'Start date is in the past', suggestion: 'Consider setting a future start date' });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private async validateApplicationUpdate(
    input: UpdateApplicationInput,
    userId: string,
    userRole: UserRole
  ): Promise<ApplicationValidationResult> {
    const errors: any[] = [];
    const warnings: any[] = [];

    if (input.message && input.message.trim().length < 10) {
      errors.push({ field: 'message', message: 'Message must be at least 10 characters', code: 'MIN_LENGTH' });
    }

    if (input.coverLetter && input.coverLetter.trim().length < 50) {
      errors.push({ field: 'coverLetter', message: 'Cover letter must be at least 50 characters', code: 'MIN_LENGTH' });
    }

    if (input.proposedBudget && input.proposedBudget <= 0) {
      errors.push({ field: 'proposedBudget', message: 'Proposed budget must be greater than 0', code: 'INVALID_VALUE' });
    }

    if (input.hourlyRate && input.hourlyRate <= 0) {
      errors.push({ field: 'hourlyRate', message: 'Hourly rate must be greater than 0', code: 'INVALID_VALUE' });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private async checkBusinessRules(input: CreateApplicationInput, userId: string): Promise<void> {
    const { count: existingApplications } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('projectId', input.projectId)
      .eq('freelancerId', input.freelancerId)
      .eq('isDeleted', false);

    if (existingApplications && existingApplications > 0) {
      throw new ConflictError('You have already applied to this project');
    }

    const { count: projectApplications } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('projectId', input.projectId)
      .eq('isDeleted', false);

    if (projectApplications && projectApplications >= this.businessRules.maxApplicationsPerProject) {
      throw new ConflictError('This project has reached the maximum number of applications');
    }

    const { count: freelancerApplications } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('freelancerId', input.freelancerId)
      .eq('status', ApplicationStatus.PENDING)
      .eq('isDeleted', false);

    if (freelancerApplications && freelancerApplications >= this.businessRules.maxApplicationsPerFreelancer) {
      throw new ConflictError('You have reached the maximum number of pending applications');
    }

    const { data: project } = await supabase
      .from('projects')
      .select('status, budget')
      .eq('id', input.projectId)
      .single();

    if (!project || project.status !== 'active') {
      throw new BadRequestError('This project is not accepting applications');
    }

    if (input.proposedBudget && project.budget) {
      const variance = ((input.proposedBudget - project.budget) / project.budget) * 100;
      if (variance < this.businessRules.minBudgetVariance || variance > this.businessRules.maxBudgetVariance) {
        throw new BadRequestError(`Proposed budget variance (${variance.toFixed(1)}%) is outside acceptable range`);
      }
    }
  }

  private async validateStatusTransition(currentStatus: ApplicationStatus, newStatus: ApplicationStatus): Promise<void> {
    const validTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
      [ApplicationStatus.PENDING]: [ApplicationStatus.UNDER_REVIEW, ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN],
      [ApplicationStatus.UNDER_REVIEW]: [ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED, ApplicationStatus.PENDING],
      [ApplicationStatus.ACCEPTED]: [ApplicationStatus.REJECTED],
      [ApplicationStatus.REJECTED]: [],
      [ApplicationStatus.WITHDRAWN]: [],
      [ApplicationStatus.EXPIRED]: []
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestError(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }

  private async validateAcceptance(application: ApplicationModel): Promise<void> {
    const { count: acceptedApplications } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('projectId', application.projectId)
      .eq('status', ApplicationStatus.ACCEPTED)
      .eq('isDeleted', false);

    if (acceptedApplications && acceptedApplications > 0) {
      throw new ConflictError('This project already has an accepted application');
    }
  }

  private async handleApplicationAcceptance(application: ApplicationModel): Promise<void> {
    const { error } = await supabase
      .from('applications')
      .update({ 
        status: ApplicationStatus.REJECTED,
        rejectionReason: 'Another applicant was selected',
        lastModifiedBy: 'system',
        updatedAt: new Date().toISOString()
      })
      .eq('projectId', application.projectId)
      .neq('id', application.id)
      .eq('status', ApplicationStatus.PENDING);

    if (error) {
      logger.error('Failed to auto-reject other applications', { error, applicationId: application.id });
    }
  }

  private canUpdateApplication(application: ApplicationModel, userId: string, userRole: UserRole): boolean {
    if (userRole === UserRole.ADMIN) return true;
    if (userRole === UserRole.FREELANCER && application.freelancerId === userId) return true;
    return false;
  }

  private canReviewApplication(application: ApplicationModel, userId: string, userRole: UserRole): boolean {
    if (userRole === UserRole.ADMIN) return true;
    if (userRole === UserRole.CLIENT && application.clientId === userId) return true;
    return false;
  }

  private canViewProjectApplications(projectId: string, userId: string, userRole: UserRole): boolean {
    if (userRole === UserRole.ADMIN) return true;
    return true;
  }

  private canViewFreelancerApplications(freelancerId: string, userId: string, userRole: UserRole): boolean {
    if (userRole === UserRole.ADMIN) return true;
    if (freelancerId === userId) return true;
    return false;
  }

  private async getProjectClientId(projectId: string): Promise<string> {
    const { data: project } = await supabase
      .from('projects')
      .select('client_id')
      .eq('id', projectId)
      .single();

    return project?.client_id || '';
  }

  private async createDefaultWorkflow(): Promise<ApplicationWorkflow> {
    const stages: ApplicationWorkflowStage[] = [
      {
        id: uuidv4(),
        name: 'Submission',
        description: 'Application submitted by freelancer',
        order: 1,
        isCompleted: true,
        completedAt: new Date(),
        actions: ['view', 'edit', 'withdraw']
      },
      {
        id: uuidv4(),
        name: 'Review',
        description: 'Application under review by client',
        order: 2,
        isCompleted: false,
        requiredRole: UserRole.CLIENT,
        timeoutDuration: 7 * 24 * 60 * 60 * 1000,
        actions: ['accept', 'reject', 'request_info']
      },
      {
        id: uuidv4(),
        name: 'Decision',
        description: 'Final decision made',
        order: 3,
        isCompleted: false,
        actions: ['contract_creation', 'notification']
      }
    ];

    return {
      currentStage: stages[1].id,
      stages,
      reviewers: [],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
  }

  private createMetadata(req: any): ApplicationMetadata {
    return {
      submissionSource: 'web',
      userAgent: req.userAgent || 'unknown',
      ipAddress: req.ipAddress || 'unknown',
      referrer: req.referrer,
      deviceInfo: req.deviceInfo
    };
  }

  private createInitialAnalytics(): ApplicationAnalytics {
    return {
      viewCount: 0,
      interactionCount: 1,
      conversionRate: 0
    };
  }

  private async calculateQualityScore(application: ApplicationModel): Promise<number> {
    let score = 0;
    const maxScore = 100;

    if (application.coverLetter && application.coverLetter.length > 100) score += 20;
    if (application.portfolio && application.portfolio.length > 0) score += 15;
    if (application.skills && application.skills.length >= 3) score += 15;
    if (application.experience && application.experience.length > 50) score += 10;
    if (application.proposedBudget && application.proposedBudget > 0) score += 10;
    if (application.proposedTimeline && application.proposedTimeline > 0) score += 10;
    if (application.milestones && application.milestones.length > 0) score += 10;
    if (application.message && application.message.length > 100) score += 10;

    return Math.min(score, maxScore);
  }

  private applyFilters(query: any, filter: Partial<ApplicationFilter>): any {
    if (filter.status && filter.status.length > 0) {
      query = query.in('status', filter.status);
    }

    if (filter.priority && filter.priority.length > 0) {
      query = query.in('priority', filter.priority);
    }

    if (filter.type && filter.type.length > 0) {
      query = query.in('type', filter.type);
    }

    if (filter.projectId) {
      query = query.eq('projectId', filter.projectId);
    }

    if (filter.freelancerId) {
      query = query.eq('freelancerId', filter.freelancerId);
    }

    if (filter.clientId) {
      query = query.eq('clientId', filter.clientId);
    }

    if (filter.budgetMin) {
      query = query.gte('proposedBudget', filter.budgetMin);
    }

    if (filter.budgetMax) {
      query = query.lte('proposedBudget', filter.budgetMax);
    }

    if (filter.createdAfter) {
      query = query.gte('createdAt', filter.createdAfter.toISOString());
    }

    if (filter.createdBefore) {
      query = query.lte('createdAt', filter.createdBefore.toISOString());
    }

    if (filter.isUrgent !== undefined) {
      query = query.eq('isUrgent', filter.isUrgent);
    }

    if (filter.isFeatured !== undefined) {
      query = query.eq('isFeatured', filter.isFeatured);
    }

    if (filter.isArchived !== undefined) {
      query = query.eq('isArchived', filter.isArchived);
    }

    if (filter.qualityScoreMin) {
      query = query.gte('qualityScore', filter.qualityScoreMin);
    }

    if (filter.search) {
      query = query.or(`message.ilike.%${filter.search}%,coverLetter.ilike.%${filter.search}%,skills.cs.{${filter.search}}`);
    }

    if (filter.sortBy) {
      const order = filter.sortOrder === 'desc' ? false : true;
      query = query.order(filter.sortBy, { ascending: order });
    } else {
      query = query.order('createdAt', { ascending: false });
    }

    if (filter.limit) {
      query = query.limit(filter.limit);
    }

    if (filter.offset) {
      query = query.range(filter.offset, filter.offset + (filter.limit || 10) - 1);
    }

    return query;
  }

  private createApplicationSummary(application: any): ApplicationSummary {
    return {
      id: application.id,
      projectTitle: application.projectTitle || 'Unknown Project',
      freelancerName: application.freelancerName || 'Unknown Freelancer',
      status: application.status,
      priority: application.priority,
      proposedBudget: application.proposedBudget,
      qualityScore: application.qualityScore,
      submittedAt: new Date(application.submittedAt || application.createdAt),
      skills: application.skills || [],
      isUrgent: application.isUrgent || false,
      responseTime: application.responseTime
    };
  }

  private calculateStatistics(applications: any[]): ApplicationStatistics {
    const total = applications.length;
    const byStatus = this.groupBy(applications, 'status');
    const byPriority = this.groupBy(applications, 'priority');
    const byType = this.groupBy(applications, 'type');

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const todaysSubmissions = applications.filter(app => 
      new Date(app.submittedAt || app.createdAt) >= todayStart
    ).length;

    const weeklyApplications = applications.filter(app => 
      new Date(app.submittedAt || app.createdAt) >= weekStart
    ).length;

    const monthlyApplications = applications.filter(app => 
      new Date(app.submittedAt || app.createdAt) >= monthStart
    ).length;

    const accepted = byStatus[ApplicationStatus.ACCEPTED] || 0;
    const conversionRate = total > 0 ? (accepted / total) * 100 : 0;

    const responseTimes = applications
      .filter(app => app.responseTime)
      .map(app => app.responseTime);
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    const qualityScores = applications
      .filter(app => app.qualityScore)
      .map(app => app.qualityScore);
    const averageQualityScore = qualityScores.length > 0
      ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
      : undefined;

    return {
      total,
      byStatus: byStatus as Record<ApplicationStatus, number>,
      byPriority: byPriority as Record<ApplicationPriority, number>,
      byType: byType as Record<ApplicationType, number>,
      averageResponseTime,
      averageQualityScore,
      conversionRate,
      pendingCount: byStatus[ApplicationStatus.PENDING] || 0,
      expiredCount: byStatus[ApplicationStatus.EXPIRED] || 0,
      todaysSubmissions,
      weeklyTrend: weeklyApplications,
      monthlyTrend: monthlyApplications
    };
  }

  private groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((groups, item) => {
      const value = item[key] || 'unknown';
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {});
  }

  private serializeForDatabase(data: any): any {
    const serialized = { ...data };
    
    if (serialized.workflow) {
      serialized.workflow = JSON.stringify(serialized.workflow);
    }
    if (serialized.analytics) {
      serialized.analytics = JSON.stringify(serialized.analytics);
    }
    if (serialized.metadata) {
      serialized.metadata = JSON.stringify(serialized.metadata);
    }
    if (serialized.attachments) {
      serialized.attachments = JSON.stringify(serialized.attachments);
    }
    if (serialized.notes) {
      serialized.notes = JSON.stringify(serialized.notes);
    }
    if (serialized.milestones) {
      serialized.milestones = JSON.stringify(serialized.milestones);
    }
    if (serialized.communicationPreferences) {
      serialized.communicationPreferences = JSON.stringify(serialized.communicationPreferences);
    }

    return serialized;
  }

  private deserializeFromDatabase(data: any): ApplicationModel {
    const deserialized = { ...data };
    
    try {
      if (typeof deserialized.workflow === 'string') {
        deserialized.workflow = JSON.parse(deserialized.workflow);
      }
      if (typeof deserialized.analytics === 'string') {
        deserialized.analytics = JSON.parse(deserialized.analytics);
      }
      if (typeof deserialized.metadata === 'string') {
        deserialized.metadata = JSON.parse(deserialized.metadata);
      }
      if (typeof deserialized.attachments === 'string') {
        deserialized.attachments = JSON.parse(deserialized.attachments);
      }
      if (typeof deserialized.notes === 'string') {
        deserialized.notes = JSON.parse(deserialized.notes);
      }
      if (typeof deserialized.milestones === 'string') {
        deserialized.milestones = JSON.parse(deserialized.milestones);
      }
      if (typeof deserialized.communicationPreferences === 'string') {
        deserialized.communicationPreferences = JSON.parse(deserialized.communicationPreferences);
      }
    } catch (error) {
      logger.error('Failed to deserialize application data', { error, data });
    }

    return deserialized;
  }

  private async logAuditAction(
    action: ApplicationAuditAction,
    application: ApplicationModel,
    userId: string,
    metadata?: any
  ): Promise<void> {
    try {
      const auditLog: Partial<ApplicationAuditLog> = {
        id: uuidv4(),
        applicationId: application.id,
        action,
        performedBy: userId,
        performedAt: new Date(),
        metadata
      };

      await supabase.from('application_audit_logs').insert([auditLog]);
    } catch (error) {
      logger.error('Failed to log audit action', { error, action, applicationId: application.id });
    }
  }

  private async sendNotification(
    type: ApplicationNotificationType,
    application: ApplicationModel,
    recipients: string[],
    context?: any
  ): Promise<void> {
    try {
      logger.info(`Sending notification: ${type} to ${recipients.join(', ')} for application ${application.id}`);
    } catch (error) {
      logger.error('Failed to send notification', { error, type, applicationId: application.id });
    }
  }
}

export const applicationService = new ApplicationService();

export const createApplication = async (input: ApplicationInput): Promise<Application> => {
  const { data: existingApplication } = await supabase
    .from('applications')
    .select('id')
    .eq('project_id', input.project_id)
    .eq('freelancer_id', input.freelancer_id)
    .single();

  if (existingApplication) {
    throw new ConflictError('You have already applied to this project');
  }

  const { data: project } = await supabase
    .from('projects')
    .select('status')
    .eq('id', input.project_id)
    .single();

  if (!project || project.status !== 'pending') {
    throw new BadRequestError('This project is not accepting applications');
  }

  const { data: application, error } = await supabase
    .from('applications')
    .insert([{ ...input, status: 'pending' }])
    .select()
    .single();

  if (error) throw error;
  return application;
};

export const getApplicationsByProject = async (projectId: string): Promise<Application[]> => {
  const { data: applications, error } = await supabase
    .from('applications')
    .select('id, project_id, freelancer_id, message, status, created_at')
    .eq('project_id', projectId);

  if (error) throw error;
  return applications || [];
};

export const updateApplicationStatus = async (
  applicationId: string,
  status: 'accepted' | 'rejected'
): Promise<Application> => {
  const { data: existingApplication } = await supabase
    .from('applications')
    .select('status')
    .eq('id', applicationId)
    .single();

  if (!existingApplication) {
    throw new NotFoundError('Application not found');
  }

  if (existingApplication.status !== 'pending') {
    throw new ConflictError('Application status can only be updated once');
  }

  if (status === 'accepted') {
    const { data: project } = await supabase
      .from('applications')
      .select('project_id')
      .eq('id', applicationId)
      .single();

    if (project) {
      const { count } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', project.project_id)
        .eq('status', 'accepted');

      if (count && count > 0) {
        throw new ConflictError('This project already has an accepted application');
      }
    }
  }

  const { data: application, error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', applicationId)
    .select()
    .single();

  if (error) throw error;
  return application;
};
