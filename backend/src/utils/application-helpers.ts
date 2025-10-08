import { ApplicationModel, ApplicationStatus, ApplicationPriority, ApplicationType, ApplicationValidationResult, ApplicationAnalytics, ApplicationWorkflow, ApplicationMilestone } from '@/types/application.types';
import { UserRole } from '@/types/auth.types';
import { logger } from '@/utils/logger';

export const ApplicationConstants = {
  MAX_MESSAGE_LENGTH: 1000,
  MIN_MESSAGE_LENGTH: 10,
  MAX_COVER_LETTER_LENGTH: 2000,
  MIN_COVER_LETTER_LENGTH: 50,
  MAX_SKILLS_COUNT: 20,
  MIN_SKILLS_COUNT: 1,
  MAX_HOURLY_RATE: 1000,
  MIN_HOURLY_RATE: 5,
  MAX_ESTIMATED_HOURS: 2000,
  MIN_ESTIMATED_HOURS: 1,
  MAX_PORTFOLIO_ITEMS: 10,
  MAX_ATTACHMENTS: 5,
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  QUALITY_SCORE_WEIGHTS: {
    coverLetter: 20,
    portfolio: 15,
    skills: 15,
    experience: 10,
    budget: 10,
    timeline: 10,
    milestones: 10,
    message: 10
  }
};

export const StatusTransitionRules: Record<ApplicationStatus, ApplicationStatus[]> = {
  [ApplicationStatus.PENDING]: [
    ApplicationStatus.UNDER_REVIEW,
    ApplicationStatus.ACCEPTED,
    ApplicationStatus.REJECTED,
    ApplicationStatus.WITHDRAWN
  ],
  [ApplicationStatus.UNDER_REVIEW]: [
    ApplicationStatus.ACCEPTED,
    ApplicationStatus.REJECTED,
    ApplicationStatus.PENDING
  ],
  [ApplicationStatus.ACCEPTED]: [ApplicationStatus.REJECTED],
  [ApplicationStatus.REJECTED]: [],
  [ApplicationStatus.WITHDRAWN]: [],
  [ApplicationStatus.EXPIRED]: []
};

export function validateApplicationData(data: any): ApplicationValidationResult {
  const errors: any[] = [];
  const warnings: any[] = [];

  if (!data.projectId) {
    errors.push({
      field: 'projectId',
      message: 'Project ID is required',
      code: 'REQUIRED',
      severity: 'error'
    });
  }

  if (!data.message || data.message.length < ApplicationConstants.MIN_MESSAGE_LENGTH) {
    errors.push({
      field: 'message',
      message: `Message must be at least ${ApplicationConstants.MIN_MESSAGE_LENGTH} characters`,
      code: 'MIN_LENGTH',
      severity: 'error'
    });
  }

  if (data.message && data.message.length > ApplicationConstants.MAX_MESSAGE_LENGTH) {
    errors.push({
      field: 'message',
      message: `Message must not exceed ${ApplicationConstants.MAX_MESSAGE_LENGTH} characters`,
      code: 'MAX_LENGTH',
      severity: 'error'
    });
  }

  if (data.coverLetter) {
    if (data.coverLetter.length < ApplicationConstants.MIN_COVER_LETTER_LENGTH) {
      warnings.push({
        field: 'coverLetter',
        message: `Cover letter should be at least ${ApplicationConstants.MIN_COVER_LETTER_LENGTH} characters for better quality score`,
        suggestion: 'Add more details about your experience and approach'
      });
    }
    
    if (data.coverLetter.length > ApplicationConstants.MAX_COVER_LETTER_LENGTH) {
      errors.push({
        field: 'coverLetter',
        message: `Cover letter must not exceed ${ApplicationConstants.MAX_COVER_LETTER_LENGTH} characters`,
        code: 'MAX_LENGTH',
        severity: 'error'
      });
    }
  }

  if (!data.skills || !Array.isArray(data.skills) || data.skills.length === 0) {
    errors.push({
      field: 'skills',
      message: 'At least one skill is required',
      code: 'REQUIRED',
      severity: 'error'
    });
  } else if (data.skills.length > ApplicationConstants.MAX_SKILLS_COUNT) {
    errors.push({
      field: 'skills',
      message: `Maximum ${ApplicationConstants.MAX_SKILLS_COUNT} skills allowed`,
      code: 'MAX_COUNT',
      severity: 'error'
    });
  }

  if (data.hourlyRate !== undefined) {
    if (data.hourlyRate < ApplicationConstants.MIN_HOURLY_RATE) {
      errors.push({
        field: 'hourlyRate',
        message: `Hourly rate must be at least $${ApplicationConstants.MIN_HOURLY_RATE}`,
        code: 'MIN_VALUE',
        severity: 'error'
      });
    }
    
    if (data.hourlyRate > ApplicationConstants.MAX_HOURLY_RATE) {
      errors.push({
        field: 'hourlyRate',
        message: `Hourly rate must not exceed $${ApplicationConstants.MAX_HOURLY_RATE}`,
        code: 'MAX_VALUE',
        severity: 'error'
      });
    }
  }

  if (data.estimatedHours !== undefined) {
    if (data.estimatedHours < ApplicationConstants.MIN_ESTIMATED_HOURS) {
      errors.push({
        field: 'estimatedHours',
        message: `Estimated hours must be at least ${ApplicationConstants.MIN_ESTIMATED_HOURS}`,
        code: 'MIN_VALUE',
        severity: 'error'
      });
    }
    
    if (data.estimatedHours > ApplicationConstants.MAX_ESTIMATED_HOURS) {
      errors.push({
        field: 'estimatedHours',
        message: `Estimated hours must not exceed ${ApplicationConstants.MAX_ESTIMATED_HOURS}`,
        code: 'MAX_VALUE',
        severity: 'error'
      });
    }
  }

  if (data.portfolio && Array.isArray(data.portfolio)) {
    if (data.portfolio.length > ApplicationConstants.MAX_PORTFOLIO_ITEMS) {
      errors.push({
        field: 'portfolio',
        message: `Maximum ${ApplicationConstants.MAX_PORTFOLIO_ITEMS} portfolio items allowed`,
        code: 'MAX_COUNT',
        severity: 'error'
      });
    }

    data.portfolio.forEach((url: string, index: number) => {
      if (!isValidUrl(url)) {
        errors.push({
          field: `portfolio[${index}]`,
          message: 'Invalid URL format',
          code: 'INVALID_FORMAT',
          severity: 'error'
        });
      }
    });
  }

  if (data.proposedBudget !== undefined && data.proposedBudget < 0) {
    errors.push({
      field: 'proposedBudget',
      message: 'Proposed budget must be a positive number',
      code: 'INVALID_VALUE',
      severity: 'error'
    });
  }

  if (data.proposedStartDate && new Date(data.proposedStartDate) < new Date()) {
    warnings.push({
      field: 'proposedStartDate',
      message: 'Start date is in the past',
      suggestion: 'Consider setting a future start date'
    });
  }

  const score = calculateApplicationScore(data);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score
  };
}

export function calculateApplicationScore(application: Partial<ApplicationModel>): number {
  let score = 0;
  const weights = ApplicationConstants.QUALITY_SCORE_WEIGHTS;

  if (application.coverLetter && application.coverLetter.length >= ApplicationConstants.MIN_COVER_LETTER_LENGTH) {
    score += weights.coverLetter;
  }

  if (application.portfolio && application.portfolio.length > 0) {
    score += weights.portfolio;
  }

  if (application.skills && application.skills.length >= 3) {
    score += weights.skills;
  }

  if (application.experience && application.experience.length > 50) {
    score += weights.experience;
  }

  if (application.proposedBudget && application.proposedBudget > 0) {
    score += weights.budget;
  }

  if (application.proposedTimeline && application.proposedTimeline > 0) {
    score += weights.timeline;
  }

  if (application.milestones && application.milestones.length > 0) {
    score += weights.milestones;
  }

  if (application.message && application.message.length >= ApplicationConstants.MIN_MESSAGE_LENGTH) {
    score += weights.message;
  }

  return Math.min(score, 100);
}

export function calculateCompatibilityScore(application: ApplicationModel, projectRequirements: any): number {
  let compatibilityScore = 0;
  const maxScore = 100;

  if (projectRequirements.requiredSkills && application.skills) {
    const matchingSkills = application.skills.filter(skill => 
      projectRequirements.requiredSkills.some((reqSkill: string) => 
        skill.toLowerCase().includes(reqSkill.toLowerCase())
      )
    );
    const skillMatch = (matchingSkills.length / projectRequirements.requiredSkills.length) * 40;
    compatibilityScore += skillMatch;
  }

  if (projectRequirements.budget && application.proposedBudget) {
    const budgetVariance = Math.abs(application.proposedBudget - projectRequirements.budget) / projectRequirements.budget;
    const budgetScore = Math.max(0, (1 - budgetVariance) * 30);
    compatibilityScore += budgetScore;
  }

  if (projectRequirements.timeline && application.proposedTimeline) {
    const timelineVariance = Math.abs(application.proposedTimeline - projectRequirements.timeline) / projectRequirements.timeline;
    const timelineScore = Math.max(0, (1 - timelineVariance) * 20);
    compatibilityScore += timelineScore;
  }

  const qualityFactor = (application.qualityScore || 0) / 100 * 10;
  compatibilityScore += qualityFactor;

  return Math.min(compatibilityScore, maxScore);
}

export function calculateRiskScore(application: ApplicationModel, freelancerProfile?: any): number {
  let riskScore = 0;
  const maxRisk = 100;

  if (!application.coverLetter || application.coverLetter.length < ApplicationConstants.MIN_COVER_LETTER_LENGTH) {
    riskScore += 20;
  }

  if (!application.portfolio || application.portfolio.length === 0) {
    riskScore += 15;
  }

  if (!application.experience || application.experience.length < 50) {
    riskScore += 15;
  }

  if (application.proposedBudget && freelancerProfile?.averageRate) {
    const budgetVariance = Math.abs(application.proposedBudget - freelancerProfile.averageRate) / freelancerProfile.averageRate;
    if (budgetVariance > 0.5) {
      riskScore += 25;
    }
  }

  if (freelancerProfile?.completionRate && freelancerProfile.completionRate < 0.8) {
    riskScore += 15;
  }

  if (freelancerProfile?.averageRating && freelancerProfile.averageRating < 4.0) {
    riskScore += 10;
  }

  return Math.min(riskScore, maxRisk);
}

export function formatApplicationForDisplay(application: ApplicationModel, userRole: UserRole): any {
  const baseData = {
    id: application.id,
    projectId: application.projectId,
    status: application.status,
    priority: application.priority,
    type: application.type,
    message: application.message,
    skills: application.skills,
    submittedAt: application.submittedAt,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt
  };

  if (userRole === UserRole.ADMIN) {
    return application;
  }

  if (userRole === UserRole.CLIENT) {
    return {
      ...baseData,
      freelancerId: application.freelancerId,
      proposedBudget: application.proposedBudget,
      proposedTimeline: application.proposedTimeline,
      coverLetter: application.coverLetter,
      portfolio: application.portfolio,
      experience: application.experience,
      hourlyRate: application.hourlyRate,
      estimatedHours: application.estimatedHours,
      milestones: application.milestones,
      qualityScore: application.qualityScore,
      compatibilityScore: application.compatibilityScore,
      workflow: application.workflow,
      analytics: {
        viewCount: application.analytics?.viewCount,
        responseTime: application.analytics?.responseTime
      }
    };
  }

  if (userRole === UserRole.FREELANCER && application.freelancerId === application.freelancerId) {
    return {
      ...baseData,
      proposedBudget: application.proposedBudget,
      proposedTimeline: application.proposedTimeline,
      coverLetter: application.coverLetter,
      portfolio: application.portfolio,
      experience: application.experience,
      hourlyRate: application.hourlyRate,
      estimatedHours: application.estimatedHours,
      milestones: application.milestones,
      rejectionReason: application.rejectionReason,
      workflow: {
        currentStage: application.workflow?.currentStage,
        stages: application.workflow?.stages?.map(stage => ({
          name: stage.name,
          isCompleted: stage.isCompleted,
          completedAt: stage.completedAt
        }))
      }
    };
  }

  return baseData;
}

export function generateApplicationSummary(applications: ApplicationModel[]): any {
  const total = applications.length;
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const averageQualityScore = applications
    .filter(app => app.qualityScore)
    .reduce((sum, app) => sum + (app.qualityScore || 0), 0) / 
    applications.filter(app => app.qualityScore).length || 0;

  const budgetRange = applications
    .filter(app => app.proposedBudget)
    .reduce((acc, app) => {
      const budget = app.proposedBudget || 0;
      return {
        min: Math.min(acc.min, budget),
        max: Math.max(acc.max, budget),
        avg: acc.avg + budget
      };
    }, { min: Infinity, max: 0, avg: 0 });

  if (budgetRange.avg > 0) {
    budgetRange.avg = budgetRange.avg / applications.filter(app => app.proposedBudget).length;
  }

  const topSkills = applications
    .flatMap(app => app.skills)
    .reduce((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topSkillsList = Object.entries(topSkills)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, count }));

  return {
    total,
    statusCounts,
    averageQualityScore: Math.round(averageQualityScore * 100) / 100,
    budgetRange: budgetRange.min !== Infinity ? budgetRange : null,
    topSkills: topSkillsList,
    recentApplications: applications
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 5)
      .map(app => ({
        id: app.id,
        status: app.status,
        submittedAt: app.submittedAt,
        qualityScore: app.qualityScore
      }))
  };
}

export function createApplicationAnalytics(): ApplicationAnalytics {
  return {
    viewCount: 0,
    interactionCount: 0,
    conversionRate: 0
  };
}

export function createDefaultWorkflow(): ApplicationWorkflow {
  return {
    currentStage: 'review',
    stages: [
      {
        id: 'submission',
        name: 'Submission',
        description: 'Application submitted by freelancer',
        order: 1,
        isCompleted: true,
        completedAt: new Date(),
        actions: ['view', 'edit', 'withdraw']
      },
      {
        id: 'review',
        name: 'Review',
        description: 'Application under review by client',
        order: 2,
        isCompleted: false,
        requiredRole: UserRole.CLIENT,
        timeoutDuration: 7 * 24 * 60 * 60 * 1000,
        actions: ['accept', 'reject', 'request_info']
      },
      {
        id: 'decision',
        name: 'Decision',
        description: 'Final decision made',
        order: 3,
        isCompleted: false,
        actions: ['contract_creation', 'notification']
      }
    ],
    reviewers: [],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  };
}

export function sanitizeApplicationInput(input: any): any {
  const sanitized = { ...input };

  if (sanitized.message) {
    sanitized.message = sanitized.message.trim().substring(0, ApplicationConstants.MAX_MESSAGE_LENGTH);
  }

  if (sanitized.coverLetter) {
    sanitized.coverLetter = sanitized.coverLetter.trim().substring(0, ApplicationConstants.MAX_COVER_LETTER_LENGTH);
  }

  if (sanitized.skills && Array.isArray(sanitized.skills)) {
    sanitized.skills = sanitized.skills
      .map((skill: string) => skill.trim())
      .filter(Boolean)
      .slice(0, ApplicationConstants.MAX_SKILLS_COUNT);
  }

  if (sanitized.portfolio && Array.isArray(sanitized.portfolio)) {
    sanitized.portfolio = sanitized.portfolio
      .filter((url: string) => isValidUrl(url))
      .slice(0, ApplicationConstants.MAX_PORTFOLIO_ITEMS);
  }

  if (sanitized.hourlyRate !== undefined) {
    sanitized.hourlyRate = Math.max(
      ApplicationConstants.MIN_HOURLY_RATE,
      Math.min(sanitized.hourlyRate, ApplicationConstants.MAX_HOURLY_RATE)
    );
  }

  if (sanitized.estimatedHours !== undefined) {
    sanitized.estimatedHours = Math.max(
      ApplicationConstants.MIN_ESTIMATED_HOURS,
      Math.min(sanitized.estimatedHours, ApplicationConstants.MAX_ESTIMATED_HOURS)
    );
  }

  return sanitized;
}

export function isValidStatusTransition(currentStatus: ApplicationStatus, newStatus: ApplicationStatus): boolean {
  return StatusTransitionRules[currentStatus]?.includes(newStatus) || false;
}

export function canUserPerformAction(userRole: UserRole, action: string, application: ApplicationModel, userId: string): boolean {
  switch (action) {
    case 'view':
      return userRole === UserRole.ADMIN || 
             application.freelancerId === userId || 
             application.clientId === userId;

    case 'edit':
      return userRole === UserRole.ADMIN || 
             (userRole === UserRole.FREELANCER && application.freelancerId === userId && 
              application.status === ApplicationStatus.PENDING);

    case 'review':
      return userRole === UserRole.ADMIN || 
             (userRole === UserRole.CLIENT && application.clientId === userId);

    case 'withdraw':
      return userRole === UserRole.FREELANCER && 
             application.freelancerId === userId && 
             application.status === ApplicationStatus.PENDING;

    case 'delete':
      return userRole === UserRole.ADMIN;

    default:
      return false;
  }
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatDate(date: Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  if (format === 'relative') {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: format === 'long' ? 'long' : 'short',
    day: 'numeric'
  });
}

export function generateApplicationId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `app_${timestamp}_${randomStr}`;
}

export function createApplicationMilestone(
  title: string,
  description: string,
  deliverable: string,
  dueDate: Date,
  budget: number,
  order: number
): ApplicationMilestone {
  return {
    id: generateApplicationId(),
    title,
    description,
    deliverable,
    dueDate,
    budget,
    order,
    isCompleted: false
  };
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'were', 'will', 'with', 'have', 'had', 'having'
  ]);

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
    .filter((word, index, arr) => arr.indexOf(word) === index)
    .sort()
    .slice(0, 20);
}

export function calculateApplicationPriority(application: ApplicationModel, projectUrgency?: string): ApplicationPriority {
  let priorityScore = 0;

  if (application.qualityScore && application.qualityScore > 80) {
    priorityScore += 30;
  }

  if (application.type === ApplicationType.RUSH) {
    priorityScore += 25;
  }

  if (application.type === ApplicationType.FEATURED) {
    priorityScore += 20;
  }

  if (projectUrgency === 'urgent') {
    priorityScore += 25;
  }

  if (priorityScore >= 70) return ApplicationPriority.URGENT;
  if (priorityScore >= 50) return ApplicationPriority.HIGH;
  if (priorityScore >= 30) return ApplicationPriority.MEDIUM;
  return ApplicationPriority.LOW;
}

export const ApplicationHelpers = {
  validateApplicationData,
  calculateApplicationScore,
  calculateCompatibilityScore,
  calculateRiskScore,
  formatApplicationForDisplay,
  generateApplicationSummary,
  createApplicationAnalytics,
  createDefaultWorkflow,
  sanitizeApplicationInput,
  isValidStatusTransition,
  canUserPerformAction,
  formatCurrency,
  formatDate,
  generateApplicationId,
  createApplicationMilestone,
  extractKeywords,
  calculateApplicationPriority
};