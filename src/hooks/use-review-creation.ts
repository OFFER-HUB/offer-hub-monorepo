/**
 * Custom Hook for Review Creation Logic
 * Comprehensive hook for managing review creation, validation, and submission
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReviewCreationData,
  MultiDimensionalRating,
  ReviewTemplate,
  ReviewTemplateConfig,
  RatingValidation,
  RatingValidationConfig,
  RatingConsistencyCheck,
  OutlierDetection,
  ReviewAnalytics,
  ReviewPattern,
  MobileReviewConfig,
  MobileReviewState,
  ReviewPerformanceMetrics,
  ComplianceConfig,
  ComplianceReport,
  ExternalIntegration,
  ReviewIncentive,
  UserIncentiveProgress,
  ReviewHistory,
  ExportConfig,
  ExportResult,
  UseReviewCreationReturn,
  ReviewCreationOptions,
  ReviewCreationConfig,
  RATING_DIMENSIONS,
  MODERATION_STATUSES,
  EXPORT_FORMATS,
  REVIEW_TEMPLATE_CATEGORIES
} from '@/types/review-creation.types';

import {
  validateMultiDimensionalRating,
  validateReviewContent,
  validateReviewAgainstTemplate,
  checkRatingConsistency,
  detectRatingOutliers,
  detectReviewPatterns,
  calculateOverallQualityScore,
  generateValidationSummary,
  DEFAULT_VALIDATION_CONFIG
} from '@/utils/review-validation';

// ===== DEFAULT CONFIGURATIONS =====

const DEFAULT_OPTIONS: ReviewCreationOptions = {
  enableTemplates: true,
  enableValidation: true,
  enableModeration: true,
  enableAnalytics: true,
  enableMobile: true,
  enableOffline: false,
  enableExport: true,
  enableIncentives: true,
  enableHistory: true,
  enableCompliance: true
};

const DEFAULT_MOBILE_CONFIG: MobileReviewConfig = {
  compactView: false,
  gestureControls: true,
  offlineCapabilities: false,
  pushNotifications: true,
  quickActions: ['save_draft', 'submit', 'preview'],
  touchOptimized: true,
  voiceInput: false,
  cameraIntegration: true
};

const DEFAULT_COMPLIANCE_CONFIG: ComplianceConfig = {
  dataRetention: {
    enabled: true,
    period: 365,
    autoDelete: false
  },
  gdprCompliance: {
    enabled: true,
    rightToErasure: true,
    dataPortability: true,
    consentManagement: true
  },
  auditTrail: {
    enabled: true,
    retentionPeriod: 2555, // 7 years
    includeMetadata: true
  },
  privacySettings: {
    anonymizeData: false,
    encryptSensitiveData: true,
    accessControls: true
  }
};

// ===== HOOK INTERFACE =====

interface UseReviewCreationOptions {
  userId: string;
  contractId: string;
  projectId?: string;
  initialData?: Partial<ReviewCreationData>;
  options?: Partial<ReviewCreationOptions>;
  validationConfig?: Partial<RatingValidationConfig>;
  onReviewCreated?: (review: ReviewCreationData) => void;
  onReviewUpdated?: (review: ReviewCreationData) => void;
  onError?: (error: string) => void;
}

/**
 * useReviewCreation - Comprehensive Review Creation Hook
 * 
 * This hook provides complete functionality for creating, validating, and managing
 * professional reviews with multi-dimensional ratings, templates, and quality assurance.
 */
export function useReviewCreation({
  userId,
  contractId,
  projectId,
  initialData,
  options = {},
  validationConfig = {},
  onReviewCreated,
  onReviewUpdated,
  onError
}: UseReviewCreationOptions): UseReviewCreationReturn {
  
  // ===== STATE MANAGEMENT =====
  
  const [reviewData, setReviewData] = useState<Partial<ReviewCreationData>>({
    fromUserId: userId,
    toUserId: '', // Will be set from contract
    contractId,
    projectId,
    ratings: {
      quality: 0,
      communication: 0,
      timeliness: 0,
      value: 0,
      overall: 0
    },
    title: '',
    content: '',
    projectType: '',
    projectTitle: '',
    projectValue: 0,
    projectDuration: 0,
    tags: [],
    isAnonymous: false,
    isPublic: true,
    attachments: [],
    moderationStatus: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...initialData
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});
  const [validation, setValidation] = useState<RatingValidation>({
    isValid: false,
    errors: [],
    warnings: [],
    consistencyScore: 0,
      outlierDetection: {
        isOutlier: false,
        confidence: 0,
        reason: '',
        recommendations: []
      }
  });

  // ===== CONFIGURATION =====
  
  const finalOptions = useMemo(() => ({
    ...DEFAULT_OPTIONS,
    ...options
  }), [options]);

  const finalValidationConfig = useMemo(() => ({
    ...DEFAULT_VALIDATION_CONFIG,
    ...validationConfig
  }), [validationConfig]);

  // ===== TEMPLATE SYSTEM =====
  
  const [availableTemplates, setAvailableTemplates] = useState<ReviewTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReviewTemplate | null>(null);

  // ===== ANALYTICS =====
  
  const [analytics, setAnalytics] = useState<ReviewAnalytics | null>(null);
  const [patterns, setPatterns] = useState<ReviewPattern[]>([]);

  // ===== MOBILE SUPPORT =====
  
  const [mobileConfig] = useState<MobileReviewConfig>(DEFAULT_MOBILE_CONFIG);
  const [mobileState, setMobileState] = useState<MobileReviewState>({
    isOnline: navigator.onLine,
    pendingReviews: [],
    syncStatus: 'idle',
    offlineStorage: {
      enabled: finalOptions.enableOffline,
      maxSize: 50, // 50MB
      currentSize: 0
    }
  });

  // ===== PERFORMANCE METRICS =====
  
  const [performanceMetrics, setPerformanceMetrics] = useState<ReviewPerformanceMetrics>({
    processingTime: 0,
    throughput: 0,
    errorRate: 0,
    queueLength: 0,
    resourceUsage: {
      cpu: 0,
      memory: 0,
      storage: 0
    },
    bottlenecks: []
  });

  // ===== COMPLIANCE =====
  
  const [complianceConfig] = useState<ComplianceConfig>(DEFAULT_COMPLIANCE_CONFIG);
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);

  // ===== VALIDATION LOGIC =====
  
  const validateReview = useCallback((): RatingValidation => {
    if (!reviewData.ratings) {
      return {
        isValid: false,
        errors: ['Ratings are required'],
        warnings: [],
        consistencyScore: 0,
        outlierDetection: {
          isOutlier: false,
          confidence: 0,
          reason: 'No ratings provided',
          recommendations: []
        }
      };
    }

    const ratingValidation = validateMultiDimensionalRating(
      reviewData.ratings,
      finalValidationConfig
    );

    setValidation(ratingValidation);
    return ratingValidation;
  }, [reviewData.ratings, finalValidationConfig]);

  // ===== CONSISTENCY CHECK =====
  
  const consistencyCheck = useMemo((): RatingConsistencyCheck => {
    if (!reviewData.ratings) {
      return {
        overallConsistency: 0,
        dimensionConsistency: {
          quality: 0,
          communication: 0,
          timeliness: 0,
          value: 0
        },
        flags: [],
        suggestions: []
      };
    }

    return checkRatingConsistency(reviewData.ratings, finalValidationConfig);
  }, [reviewData.ratings, finalValidationConfig]);

  // ===== OUTLIER DETECTION =====
  
  const outlierDetection = useMemo((): OutlierDetection => {
    if (!reviewData.ratings) {
      return {
        isOutlier: false,
        confidence: 0,
        method: 'rule_based',
        reason: 'No ratings provided',
        similarReviews: [],
        recommendations: []
      };
    }

    return detectRatingOutliers(reviewData.ratings, finalValidationConfig);
  }, [reviewData.ratings, finalValidationConfig]);

  // ===== VALIDATION EFFECT =====
  
  useEffect(() => {
    if (finalOptions.enableValidation) {
      const validationResult = validateReview();
      
      // Update errors and warnings
      const newErrors: Record<string, string> = {};
      const newWarnings: Record<string, string> = {};
      
      validationResult.errors.forEach((error, index) => {
        newErrors[`validation_${index}`] = error;
      });
      
      validationResult.warnings.forEach((warning, index) => {
        newWarnings[`validation_${index}`] = warning;
      });
      
      setErrors(newErrors);
      setWarnings(newWarnings);
    }
  }, [reviewData, validateReview, finalOptions.enableValidation]);

  // ===== TEMPLATE MANAGEMENT =====
  
  const loadTemplates = useCallback(async () => {
    if (!finalOptions.enableTemplates) return;
    
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch from an API
      const mockTemplates: ReviewTemplate[] = [
        {
          id: 'web_dev_template',
          name: 'Web Development Review',
          description: 'Comprehensive template for web development projects',
          category: 'web_development',
          projectTypes: ['web_development', 'frontend', 'backend'],
          sections: [
            {
              id: 'title',
              title: 'Project Title',
              type: 'text',
              required: true,
              placeholder: 'Enter project title'
            },
            {
              id: 'content',
              title: 'Review Content',
              type: 'text',
              required: true,
              minLength: 50,
              maxLength: 1000,
              placeholder: 'Share your experience with this project'
            },
            {
              id: 'quality_rating',
              title: 'Code Quality',
              type: 'rating',
              required: true,
              validation: { min: 1, max: 5 }
            },
            {
              id: 'communication_rating',
              title: 'Communication',
              type: 'rating',
              required: true,
              validation: { min: 1, max: 5 }
            },
            {
              id: 'timeliness_rating',
              title: 'Timeliness',
              type: 'rating',
              required: true,
              validation: { min: 1, max: 5 }
            },
            {
              id: 'value_rating',
              title: 'Value for Money',
              type: 'rating',
              required: true,
              validation: { min: 1, max: 5 }
            }
          ],
          isDefault: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      setAvailableTemplates(mockTemplates);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load templates';
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [finalOptions.enableTemplates, onError]);

  const selectTemplate = useCallback((templateId: string) => {
    const template = availableTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      
      // Apply template defaults
      setReviewData(prev => ({
        ...prev,
        projectType: template.projectTypes[0] || prev.projectType,
        templateId: template.id
      }));
    }
  }, [availableTemplates]);

  const createCustomTemplate = useCallback(async (template: Omit<ReviewTemplate, 'id'>): Promise<ReviewTemplate> => {
    const newTemplate: ReviewTemplate = {
      ...template,
      id: `custom_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setAvailableTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  }, []);

  // ===== REVIEW DATA MANAGEMENT =====
  
  const updateReviewData = useCallback((data: Partial<ReviewCreationData>) => {
    setReviewData(prev => ({
      ...prev,
      ...data,
      updatedAt: new Date().toISOString()
    }));
  }, []);

  const updateRating = useCallback((dimension: keyof MultiDimensionalRating, value: number) => {
    setReviewData(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings!,
        [dimension]: value
      },
      updatedAt: new Date().toISOString()
    }));
  }, []);

  const updateContent = useCallback((field: string, value: string) => {
    setReviewData(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString()
    }));
  }, []);

  const addAttachment = useCallback((attachment: any) => {
    setReviewData(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), attachment],
      updatedAt: new Date().toISOString()
    }));
  }, []);

  const removeAttachment = useCallback((attachmentId: string) => {
    setReviewData(prev => ({
      ...prev,
      attachments: (prev.attachments || []).filter(a => a.id !== attachmentId),
      updatedAt: new Date().toISOString()
    }));
  }, []);

  const resetReview = useCallback(() => {
    setReviewData({
      fromUserId: userId,
      toUserId: '',
      contractId,
      projectId,
      ratings: {
        quality: 0,
        communication: 0,
        timeliness: 0,
        value: 0,
        overall: 0
      },
      title: '',
      content: '',
      projectType: '',
      projectTitle: '',
      projectValue: 0,
      projectDuration: 0,
      tags: [],
      isAnonymous: false,
      isPublic: true,
      attachments: [],
      moderationStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setErrors({});
    setWarnings({});
    setSelectedTemplate(null);
  }, [userId, contractId, projectId]);

  // ===== SUBMISSION LOGIC =====
  
  const submitReview = useCallback(async (): Promise<ReviewCreationData> => {
    if (!reviewData.ratings || !reviewData.title || !reviewData.content) {
      throw new Error('Required fields are missing');
    }

    setIsSubmitting(true);
    
    try {
      // Final validation
      const ratingValidation = validateMultiDimensionalRating(
        reviewData.ratings,
        finalValidationConfig
      );
      
      const contentValidation = validateReviewContent(
        reviewData.content,
        reviewData.title
      );

      if (!ratingValidation.isValid) {
        throw new Error(`Rating validation failed: ${ratingValidation.errors.join(', ')}`);
      }

      if (!contentValidation.isValid) {
        throw new Error(`Content validation failed: ${contentValidation.errors.join(', ')}`);
      }

      // Template validation if template is selected
      if (selectedTemplate) {
        const templateValidation = validateReviewAgainstTemplate(reviewData, selectedTemplate);
        if (!templateValidation.isValid) {
          throw new Error(`Template validation failed: ${templateValidation.errors.join(', ')}`);
        }
      }

      // Calculate overall quality score
      const qualityScore = calculateOverallQualityScore(reviewData);
      
      // Create final review data
      const finalReviewData: ReviewCreationData = {
        ...reviewData,
        ratings: reviewData.ratings!,
        title: reviewData.title!,
        content: reviewData.content!,
        validation: ratingValidation,
        moderationStatus: qualityScore >= 80 ? 'auto_approved' : 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as ReviewCreationData;

      // In a real implementation, this would submit to an API
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Call success callback
      onReviewCreated?.(finalReviewData);

      return finalReviewData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit review';
      onError?.(errorMessage);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [reviewData, selectedTemplate, finalValidationConfig, onReviewCreated, onError]);

  // ===== ANALYTICS =====
  
  const loadAnalytics = useCallback(async () => {
    if (!finalOptions.enableAnalytics) return;
    
    try {
      // Mock analytics data
      const mockAnalytics: ReviewAnalytics = {
        overview: {
          totalReviews: 150,
          averageRating: 4.2,
          ratingDistribution: { 1: 5, 2: 10, 3: 25, 4: 60, 5: 50 },
          completionRate: 85,
          moderationRate: 12
        },
        trends: {
          period: 'monthly',
          data: [
            { date: '2024-01', reviews: 12, averageRating: 4.1, completionRate: 83 },
            { date: '2024-02', reviews: 15, averageRating: 4.3, completionRate: 87 },
            { date: '2024-03', reviews: 18, averageRating: 4.2, completionRate: 85 }
          ]
        },
        quality: {
          averageQualityScore: 78,
          qualityDistribution: { excellent: 30, good: 45, fair: 20, poor: 5 },
          improvementTrend: 5,
          topIssues: [
            { issue: 'Insufficient detail', count: 25, percentage: 16.7 },
            { issue: 'Inconsistent ratings', count: 15, percentage: 10 }
          ]
        },
        engagement: {
          averageResponseTime: 24,
          responseRate: 75,
          followUpRate: 30,
          userSatisfaction: 82
        }
      };
      
      setAnalytics(mockAnalytics);
      
      // Load patterns
      const mockPatterns: ReviewPattern[] = [
        {
          type: 'rating_pattern',
          description: 'Consistently high ratings detected',
          frequency: 85,
          impact: 'positive',
          recommendations: ['Verify rating authenticity', 'Check for rating inflation']
        }
      ];
      
      setPatterns(mockPatterns);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load analytics';
      onError?.(errorMessage);
    }
  }, [finalOptions.enableAnalytics, onError]);

  // ===== MOBILE SUPPORT =====
  
  useEffect(() => {
    const handleOnlineStatus = () => {
      setMobileState(prev => ({
        ...prev,
        isOnline: navigator.onLine,
        syncStatus: navigator.onLine ? 'idle' : 'error'
      }));
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  // ===== INITIALIZATION =====
  
  useEffect(() => {
    loadTemplates();
    loadAnalytics();
  }, [loadTemplates, loadAnalytics]);

  // ===== COMPUTED VALUES =====
  
  const isValid = useMemo(() => {
    return Boolean(validation.isValid && 
           reviewData.title && 
           reviewData.content && 
           reviewData.ratings &&
           Object.values(reviewData.ratings).every(rating => rating > 0));
  }, [validation.isValid, reviewData.title, reviewData.content, reviewData.ratings]);

  // ===== RETURN INTERFACE =====
  
  return {
    // State
    reviewData,
    isLoading,
    isSubmitting,
    isValid,
    errors,
    warnings,
    
    // Actions
    updateReviewData,
    updateRating,
    updateContent,
    addAttachment,
    removeAttachment,
    submitReview,
    resetReview,
    validateReview,
    
    // Template system
    availableTemplates,
    selectedTemplate,
    selectTemplate,
    createCustomTemplate,
    
    // Validation
    validation,
    consistencyCheck,
    outlierDetection,
    
    // Analytics
    analytics,
    patterns,
    
    // Mobile
    mobileConfig,
    mobileState,
    
    // Performance
    performanceMetrics,
    
    // Compliance
    complianceConfig,
    complianceReport
  };
}
