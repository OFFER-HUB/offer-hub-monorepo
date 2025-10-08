import { UserRole } from './auth.types';

export enum ApplicationStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired'
}

export enum ApplicationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum ApplicationType {
  STANDARD = 'standard',
  RUSH = 'rush',
  FEATURED = 'featured',
  PROPOSAL = 'proposal'
}

export interface ApplicationMetadata {
  submissionSource: 'web' | 'mobile' | 'api';
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  deviceInfo?: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
  };
}

export interface ApplicationAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface ApplicationNote {
  id: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  isInternal: boolean;
  visibility: 'public' | 'private' | 'client_only' | 'freelancer_only';
}

export interface ApplicationWorkflow {
  currentStage: string;
  stages: ApplicationWorkflowStage[];
  assignedTo?: string;
  dueDate?: Date;
  escalationDate?: Date;
  reviewers: string[];
}

export interface ApplicationWorkflowStage {
  id: string;
  name: string;
  description?: string;
  order: number;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string;
  requiredRole?: UserRole;
  timeoutDuration?: number;
  actions: string[];
}

export interface ApplicationRating {
  score: number;
  maxScore: number;
  criteria: ApplicationRatingCriteria[];
  ratedBy: string;
  ratedAt: Date;
  feedback?: string;
}

export interface ApplicationRatingCriteria {
  name: string;
  score: number;
  weight: number;
  comments?: string;
}

export interface ApplicationAnalytics {
  viewCount: number;
  lastViewedAt?: Date;
  responseTime?: number;
  processingDuration?: number;
  interactionCount: number;
  conversionRate?: number;
}

export interface ApplicationModel {
  id: string;
  projectId: string;
  freelancerId: string;
  clientId: string;
  status: ApplicationStatus;
  priority: ApplicationPriority;
  type: ApplicationType;
  message: string;
  proposedBudget?: number;
  proposedTimeline?: number;
  proposedStartDate?: Date;
  proposedDeliveryDate?: Date;
  coverLetter?: string;
  portfolio?: string[];
  skills: string[];
  experience?: string;
  availability?: string;
  hourlyRate?: number;
  estimatedHours?: number;
  milestones?: ApplicationMilestone[];
  attachments: ApplicationAttachment[];
  notes: ApplicationNote[];
  workflow: ApplicationWorkflow;
  rating?: ApplicationRating;
  analytics: ApplicationAnalytics;
  metadata: ApplicationMetadata;
  tags: string[];
  isUrgent: boolean;
  isFeatured: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  autoRejectAt?: Date;
  reminderSentAt?: Date;
  lastModifiedBy: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  acceptanceTerms?: string;
  contractId?: string;
  communicationPreferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    reminderFrequency: 'none' | 'daily' | 'weekly';
  };
  qualityScore?: number;
  riskScore?: number;
  compatibilityScore?: number;
  createdAt: Date;
  updatedAt: Date;
  submittedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  archivedAt?: Date;
  deletedAt?: Date;
}

export interface ApplicationMilestone {
  id: string;
  title: string;
  description?: string;
  deliverable: string;
  dueDate: Date;
  budget: number;
  order: number;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface CreateApplicationInput {
  projectId: string;
  freelancerId: string;
  message: string;
  proposedBudget?: number;
  proposedTimeline?: number;
  proposedStartDate?: Date;
  proposedDeliveryDate?: Date;
  coverLetter?: string;
  portfolio?: string[];
  skills: string[];
  experience?: string;
  availability?: string;
  hourlyRate?: number;
  estimatedHours?: number;
  milestones?: Omit<ApplicationMilestone, 'id' | 'isCompleted' | 'completedAt'>[];
  type?: ApplicationType;
  attachments?: Omit<ApplicationAttachment, 'id' | 'uploadedAt' | 'uploadedBy'>[];
  communicationPreferences?: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    pushNotifications?: boolean;
    reminderFrequency?: 'none' | 'daily' | 'weekly';
  };
}

export interface UpdateApplicationInput {
  message?: string;
  proposedBudget?: number;
  proposedTimeline?: number;
  proposedStartDate?: Date;
  proposedDeliveryDate?: Date;
  coverLetter?: string;
  portfolio?: string[];
  skills?: string[];
  experience?: string;
  availability?: string;
  hourlyRate?: number;
  estimatedHours?: number;
  milestones?: ApplicationMilestone[];
  priority?: ApplicationPriority;
  tags?: string[];
  communicationPreferences?: {
    emailNotifications?: boolean;
    smsNotifications?: boolean;
    pushNotifications?: boolean;
    reminderFrequency?: 'none' | 'daily' | 'weekly';
  };
}

export interface ApplicationStatusUpdateInput {
  status: ApplicationStatus;
  rejectionReason?: string;
  acceptanceTerms?: string;
  reviewNotes?: string;
  notifyApplicant?: boolean;
  escalate?: boolean;
  assignTo?: string;
}

export interface BulkApplicationUpdate {
  applicationIds: string[];
  updates: {
    status?: ApplicationStatus;
    priority?: ApplicationPriority;
    tags?: string[];
    assignTo?: string;
    archive?: boolean;
  };
  reason?: string;
}

export interface ApplicationFilter {
  status?: ApplicationStatus[];
  priority?: ApplicationPriority[];
  type?: ApplicationType[];
  projectId?: string;
  freelancerId?: string;
  clientId?: string;
  assignedTo?: string;
  skills?: string[];
  tags?: string[];
  budgetMin?: number;
  budgetMax?: number;
  createdAfter?: Date;
  createdBefore?: Date;
  submittedAfter?: Date;
  submittedBefore?: Date;
  isUrgent?: boolean;
  isFeatured?: boolean;
  isArchived?: boolean;
  qualityScoreMin?: number;
  search?: string;
  sortBy?: 'createdAt' | 'submittedAt' | 'proposedBudget' | 'qualityScore' | 'priority';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface ApplicationSearchCriteria {
  query?: string;
  filters: ApplicationFilter;
  aggregations?: {
    byStatus?: boolean;
    byPriority?: boolean;
    bySkills?: boolean;
    byProject?: boolean;
    byFreelancer?: boolean;
    byClient?: boolean;
    byBudgetRange?: boolean;
    byTimeframe?: boolean;
  };
}

export interface ApplicationSummary {
  id: string;
  projectTitle: string;
  freelancerName: string;
  status: ApplicationStatus;
  priority: ApplicationPriority;
  proposedBudget?: number;
  qualityScore?: number;
  submittedAt: Date;
  skills: string[];
  isUrgent: boolean;
  responseTime?: number;
}

export interface ApplicationStatistics {
  total: number;
  byStatus: Record<ApplicationStatus, number>;
  byPriority: Record<ApplicationPriority, number>;
  byType: Record<ApplicationType, number>;
  averageResponseTime: number;
  averageQualityScore?: number;
  conversionRate: number;
  pendingCount: number;
  expiredCount: number;
  todaysSubmissions: number;
  weeklyTrend: number;
  monthlyTrend: number;
}

export interface ApplicationValidationResult {
  isValid: boolean;
  errors: ApplicationValidationError[];
  warnings: ApplicationValidationWarning[];
  score?: number;
}

export interface ApplicationValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ApplicationValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

export interface ApplicationBusinessRules {
  maxApplicationsPerProject: number;
  maxApplicationsPerFreelancer: number;
  autoRejectAfterDays: number;
  requirePortfolio: boolean;
  requireCoverLetter: boolean;
  minBudgetVariance: number;
  maxBudgetVariance: number;
  allowedFileTypes: string[];
  maxFileSize: number;
  maxAttachments: number;
  qualityScoreThreshold: number;
  autoApprovalEnabled: boolean;
  autoApprovalThreshold: number;
}

export interface ApplicationAuditLog {
  id: string;
  applicationId: string;
  action: ApplicationAuditAction;
  performedBy: string;
  performedAt: Date;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export enum ApplicationAuditAction {
  CREATED = 'created',
  UPDATED = 'updated',
  STATUS_CHANGED = 'status_changed',
  REVIEWED = 'reviewed',
  ASSIGNED = 'assigned',
  UNASSIGNED = 'unassigned',
  ARCHIVED = 'archived',
  UNARCHIVED = 'unarchived',
  DELETED = 'deleted',
  RESTORED = 'restored',
  NOTE_ADDED = 'note_added',
  ATTACHMENT_ADDED = 'attachment_added',
  ATTACHMENT_REMOVED = 'attachment_removed',
  MILESTONE_ADDED = 'milestone_added',
  MILESTONE_UPDATED = 'milestone_updated',
  RATING_ADDED = 'rating_added',
  WORKFLOW_ADVANCED = 'workflow_advanced',
  REMINDER_SENT = 'reminder_sent',
  AUTO_REJECTED = 'auto_rejected',
  BULK_UPDATED = 'bulk_updated'
}

export interface ApplicationRequest {
  application?: ApplicationModel;
  applicationId?: string;
  validatedData?: any;
  businessRules?: ApplicationBusinessRules;
  userPermissions?: string[];
  user?: {
    id: string;
    email: string;
    role: UserRole;
    permissions?: string[];
  };
  params: any;
  query: any;
  body: any;
  headers: any;
}

export interface ApplicationResponse {
  success: boolean;
  data?: ApplicationModel | ApplicationModel[] | ApplicationSummary[];
  message: string;
  errors?: ApplicationValidationError[];
  warnings?: ApplicationValidationWarning[];
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
    statistics?: ApplicationStatistics;
  };
}

export interface ApplicationBatchResponse {
  success: boolean;
  results: Array<{
    id: string;
    success: boolean;
    data?: ApplicationModel;
    error?: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    skipped: number;
  };
  errors?: string[];
}

export interface ApplicationNotification {
  id: string;
  applicationId: string;
  type: ApplicationNotificationType;
  recipients: string[];
  title: string;
  message: string;
  data?: Record<string, any>;
  channels: ('email' | 'sms' | 'push' | 'in_app')[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date[];
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
  createdAt: Date;
}

export enum ApplicationNotificationType {
  APPLICATION_SUBMITTED = 'application_submitted',
  APPLICATION_RECEIVED = 'application_received',
  APPLICATION_REVIEWED = 'application_reviewed',
  APPLICATION_ACCEPTED = 'application_accepted',
  APPLICATION_REJECTED = 'application_rejected',
  APPLICATION_WITHDRAWN = 'application_withdrawn',
  APPLICATION_EXPIRED = 'application_expired',
  APPLICATION_REMINDER = 'application_reminder',
  APPLICATION_ESCALATED = 'application_escalated',
  APPLICATION_UPDATED = 'application_updated',
  APPLICATION_COMMENT_ADDED = 'application_comment_added',
  APPLICATION_RATING_RECEIVED = 'application_rating_received',
  APPLICATION_MILESTONE_COMPLETED = 'application_milestone_completed',
  APPLICATION_DOCUMENT_UPLOADED = 'application_document_uploaded'
}

export interface ApplicationPermissions {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canReview: boolean;
  canAssign: boolean;
  canArchive: boolean;
  canBulkUpdate: boolean;
  canViewAnalytics: boolean;
  canManageWorkflow: boolean;
  canAccessAuditLog: boolean;
  canSendNotifications: boolean;
  restrictedFields?: string[];
  accessLevel: 'none' | 'limited' | 'full' | 'admin';
}

export interface ApplicationFeatureFlags {
  enableAutoReview: boolean;
  enableWorkflowManagement: boolean;
  enableQualityScoring: boolean;
  enableRiskAssessment: boolean;
  enableBulkOperations: boolean;
  enableAdvancedSearch: boolean;
  enableAnalytics: boolean;
  enableAuditLog: boolean;
  enableNotifications: boolean;
  enableFileUpload: boolean;
  enableMilestones: boolean;
  enableRating: boolean;
  enableTags: boolean;
  enableScheduling: boolean;
  enableEscalation: boolean;
}

export interface ApplicationConfiguration {
  businessRules: ApplicationBusinessRules;
  featureFlags: ApplicationFeatureFlags;
  notifications: {
    enabled: boolean;
    defaultChannels: ('email' | 'sms' | 'push' | 'in_app')[];
    templates: Record<ApplicationNotificationType, {
      subject: string;
      body: string;
      variables: string[];
    }>;
  };
  workflow: {
    enabled: boolean;
    defaultStages: ApplicationWorkflowStage[];
    autoAdvance: boolean;
    timeouts: Record<string, number>;
  };
  integration: {
    webhooks: {
      enabled: boolean;
      endpoints: string[];
      events: ApplicationAuditAction[];
    };
    apis: {
      paymentGateway?: string;
      messagingService?: string;
      documentStorage?: string;
      backgroundJobs?: string;
    };
  };
}

export interface ApplicationIntegrationContext {
  webhookUrls?: string[];
  externalIds?: Record<string, string>;
  syncStatus?: 'pending' | 'synced' | 'failed';
  lastSyncAt?: Date;
  syncErrors?: string[];
}

export interface ApplicationExportOptions {
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  fields?: string[];
  filters?: ApplicationFilter;
  includeAttachments?: boolean;
  includeNotes?: boolean;
  includeAuditLog?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
  groupBy?: string;
  aggregations?: string[];
}

export interface ApplicationImportOptions {
  format: 'csv' | 'xlsx' | 'json';
  mapping?: Record<string, string>;
  validation?: 'strict' | 'lenient';
  skipDuplicates?: boolean;
  updateExisting?: boolean;
  batchSize?: number;
  dryRun?: boolean;
}

export interface ApplicationReportData {
  summary: ApplicationStatistics;
  trends: {
    daily: Array<{ date: string; count: number; }>;
    weekly: Array<{ week: string; count: number; }>;
    monthly: Array<{ month: string; count: number; }>;
  };
  performance: {
    averageProcessingTime: number;
    averageResponseTime: number;
    successRate: number;
    qualityTrends: Array<{ period: string; score: number; }>;
  };
  insights: {
    topSkills: Array<{ skill: string; demand: number; }>;
    budgetDistribution: Array<{ range: string; count: number; }>;
    conversionFunnel: Array<{ stage: string; count: number; }>;
    userActivity: Array<{ user: string; activity: number; }>;
  };
}

export type ApplicationEventHandler = (
  event: ApplicationAuditAction,
  application: ApplicationModel,
  context: {
    userId: string;
    timestamp: Date;
    metadata?: Record<string, any>;
  }
) => Promise<void>;

export type ApplicationValidator = (
  input: CreateApplicationInput | UpdateApplicationInput,
  context: {
    userId: string;
    userRole: UserRole;
    businessRules: ApplicationBusinessRules;
  }
) => Promise<ApplicationValidationResult>;

export type ApplicationProcessor = (
  application: ApplicationModel,
  action: string,
  context: Record<string, any>
) => Promise<ApplicationModel>;

export type ApplicationNotifier = (
  type: ApplicationNotificationType,
  application: ApplicationModel,
  recipients: string[],
  context?: Record<string, any>
) => Promise<void>;

export type ApplicationAnalyzer = (
  applications: ApplicationModel[],
  criteria: ApplicationSearchCriteria
) => Promise<ApplicationReportData>;