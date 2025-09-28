/**
 * Review Moderation and Quality Control Component
 * Comprehensive moderation system with automated and manual review capabilities
 */

"use client";

import React, { useState, useCallback, useMemo } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Flag,
  Eye,
  Edit,
  Trash2,
  Clock,
  User,
  Bot,
  Filter,
  Search,
  Download,
  Upload,
  Settings,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Info,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  FileText,
  Users,
  Calendar,
  Star,
  Zap
} from 'lucide-react';
import {
  ReviewCreationData,
  ReviewModeration as ReviewModerationType,
  ModerationFlag,
  ModerationAction,
  ModerationStatus,
  ModerationFlagType,
  ModerationActionType,
  ReviewModerationProps,
  ComplianceReport,
  MODERATION_STATUSES
} from '@/types/review-creation.types';
import { QualityAnalytics, ModerationHistory } from '@/types/review-quality.types';

// ===== MODERATION STATUS CONFIGURATIONS =====

const MODERATION_STATUS_CONFIG = {
  [MODERATION_STATUSES.PENDING]: {
    label: 'Pending Review',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    description: 'Awaiting moderation review'
  },
  [MODERATION_STATUSES.APPROVED]: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Review has been approved'
  },
  [MODERATION_STATUSES.REJECTED]: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    description: 'Review has been rejected'
  },
  [MODERATION_STATUSES.FLAGGED]: {
    label: 'Flagged',
    color: 'bg-orange-100 text-orange-800',
    icon: Flag,
    description: 'Review has been flagged for issues'
  },
  [MODERATION_STATUSES.ESCALATED]: {
    label: 'Escalated',
    color: 'bg-purple-100 text-purple-800',
    icon: AlertTriangle,
    description: 'Review has been escalated for further review'
  },
  [MODERATION_STATUSES.AUTO_APPROVED]: {
    label: 'Auto-Approved',
    color: 'bg-blue-100 text-blue-800',
    icon: Bot,
    description: 'Automatically approved by system'
  },
  [MODERATION_STATUSES.AUTO_REJECTED]: {
    label: 'Auto-Rejected',
    color: 'bg-red-100 text-red-800',
    icon: Bot,
    description: 'Automatically rejected by system'
  }
};

// ===== FLAG TYPE CONFIGURATIONS =====

const FLAG_TYPE_CONFIG = {
  inappropriate_content: {
    label: 'Inappropriate Content',
    color: 'bg-red-100 text-red-800',
    icon: AlertTriangle,
    severity: 'high'
  },
  spam: {
    label: 'Spam',
    color: 'bg-orange-100 text-orange-800',
    icon: Flag,
    severity: 'high'
  },
  fake_review: {
    label: 'Fake Review',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    severity: 'critical'
  },
  inconsistent_rating: {
    label: 'Inconsistent Rating',
    color: 'bg-yellow-100 text-yellow-800',
    icon: AlertCircle,
    severity: 'medium'
  },
  insufficient_detail: {
    label: 'Insufficient Detail',
    color: 'bg-blue-100 text-blue-800',
    icon: Info,
    severity: 'low'
  },
  personal_attack: {
    label: 'Personal Attack',
    color: 'bg-red-100 text-red-800',
    icon: AlertTriangle,
    severity: 'high'
  },
  promotional_content: {
    label: 'Promotional Content',
    color: 'bg-orange-100 text-orange-800',
    icon: Flag,
    severity: 'medium'
  },
  duplicate_content: {
    label: 'Duplicate Content',
    color: 'bg-yellow-100 text-yellow-800',
    icon: FileText,
    severity: 'medium'
  },
  policy_violation: {
    label: 'Policy Violation',
    color: 'bg-red-100 text-red-800',
    icon: Shield,
    severity: 'high'
  }
};

// ===== COMPONENT INTERFACES =====

interface ModerationCardProps {
  review: ReviewCreationData;
  moderation: ReviewModerationType;
  onModerate: (reviewId: string, action: ModerationAction) => void;
  showDetails?: boolean;
}

interface ModerationActionButtonProps {
  action: ModerationActionType;
  onAction: () => void;
  disabled?: boolean;
  loading?: boolean;
}

interface ModerationFiltersProps {
  filters: ModerationFilters;
  onFiltersChange: (filters: ModerationFilters) => void;
}

interface ModerationAnalyticsProps {
  analytics: QualityAnalytics;
}

interface ModerationHistoryProps {
  history: ModerationHistory;
}

interface ModerationBulkActionsProps {
  selectedReviews: string[];
  onBulkAction: (action: ModerationActionType, reviewIds: string[]) => void;
  disabled?: boolean;
}

// ===== MODERATION FILTERS =====

interface ModerationFilters {
  status: ModerationStatus[];
  flagTypes: ModerationFlagType[];
  dateRange: {
    start: string;
    end: string;
  };
  search: string;
  sortBy: 'created_at' | 'updated_at' | 'quality_score' | 'flag_count';
  sortOrder: 'asc' | 'desc';
  showAutomated: boolean;
  showManual: boolean;
}

// ===== MODERATION ACTION BUTTON COMPONENT =====

const ModerationActionButton: React.FC<ModerationActionButtonProps> = ({
  action,
  onAction,
  disabled = false,
  loading = false
}) => {
  const actionConfig = {
    approve: { label: 'Approve', color: 'bg-green-600 hover:bg-green-700', icon: CheckCircle },
    reject: { label: 'Reject', color: 'bg-red-600 hover:bg-red-700', icon: XCircle },
    flag: { label: 'Flag', color: 'bg-orange-600 hover:bg-orange-700', icon: Flag },
    escalate: { label: 'Escalate', color: 'bg-purple-600 hover:bg-purple-700', icon: AlertTriangle },
    request_changes: { label: 'Request Changes', color: 'bg-blue-600 hover:bg-blue-700', icon: Edit },
    delete: { label: 'Delete', color: 'bg-red-600 hover:bg-red-700', icon: Trash2 },
    edit: { label: 'Edit', color: 'bg-gray-600 hover:bg-gray-700', icon: Edit },
    hide: { label: 'Hide', color: 'bg-gray-600 hover:bg-gray-700', icon: Eye }
  };

  const config = actionConfig[action];
  const Icon = config.icon;

  return (
    <button
      onClick={onAction}
      disabled={disabled || loading}
      className={`flex items-center space-x-2 px-3 py-2 text-white rounded-lg transition-colors ${
        config.color
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
      <span>{config.label}</span>
    </button>
  );
};

// ===== MODERATION CARD COMPONENT =====

const ModerationCard: React.FC<ModerationCardProps> = ({
  review,
  moderation,
  onModerate,
  showDetails = false
}) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const [isModerating, setIsModerating] = useState(false);

  const statusConfig = MODERATION_STATUS_CONFIG[moderation.status];
  const StatusIcon = statusConfig.icon;

  const handleModerationAction = async (action: ModerationActionType) => {
    setIsModerating(true);
    try {
      await onModerate(review.contractId, {
        type: action,
        description: `${action} action performed`,
        performedBy: 'current_user', // In real implementation, get from auth context
        performedAt: new Date().toISOString()
      });
    } finally {
      setIsModerating(false);
    }
  };

  const getQualityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="font-semibold text-gray-900">{review.title}</h3>
            <span className={`px-2 py-1 text-xs rounded-full ${statusConfig.color}`}>
              <StatusIcon className="h-3 w-3 inline mr-1" />
              {statusConfig.label}
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>Reviewer: {review.fromUserId}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(review.createdAt).toLocaleDateString()}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Star className="h-4 w-4" />
              <span>Overall: {review.ratings.overall}/5</span>
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium ${getQualityScoreColor(moderation.automatedScore)}`}>
            Quality: {moderation.automatedScore}%
          </span>
        </div>
      </div>

      {/* Content Preview */}
      <div className="mb-4">
        <p className="text-gray-700 text-sm">
          {showFullContent ? review.content : `${review.content.substring(0, 200)}...`}
        </p>
        {review.content.length > 200 && (
          <button
            onClick={() => setShowFullContent(!showFullContent)}
            className="text-blue-600 hover:text-blue-800 text-sm mt-1"
          >
            {showFullContent ? 'Show Less' : 'Show More'}
          </button>
        )}
      </div>

      {/* Flags */}
      {moderation.flags.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Flags:</h4>
          <div className="flex flex-wrap gap-2">
            {moderation.flags.map((flag, index) => {
              const flagConfig = FLAG_TYPE_CONFIG[flag.type];
              const FlagIcon = flagConfig.icon;
              
              return (
                <span
                  key={index}
                  className={`px-2 py-1 text-xs rounded-full ${flagConfig.color}`}
                >
                  <FlagIcon className="h-3 w-3 inline mr-1" />
                  {flagConfig.label}
                  {flag.confidence > 80 && (
                    <span className="ml-1">({flag.confidence}%)</span>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ModerationActionButton
            action="approve"
            onAction={() => handleModerationAction('approve')}
            loading={isModerating}
          />
          <ModerationActionButton
            action="reject"
            onAction={() => handleModerationAction('reject')}
            loading={isModerating}
          />
          <ModerationActionButton
            action="flag"
            onAction={() => handleModerationAction('flag')}
            loading={isModerating}
          />
          <ModerationActionButton
            action="escalate"
            onAction={() => handleModerationAction('escalate')}
            loading={isModerating}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Eye className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Edit className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Project Type:</span>
              <span className="ml-2 text-gray-600">{review.projectType}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Project Value:</span>
              <span className="ml-2 text-gray-600">${review.projectValue}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Tags:</span>
              <span className="ml-2 text-gray-600">{review.tags.join(', ')}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Anonymous:</span>
              <span className="ml-2 text-gray-600">{review.isAnonymous ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== MODERATION FILTERS COMPONENT =====

const ModerationFilters: React.FC<ModerationFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const handleFilterChange = (key: keyof ModerationFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            multiple
            value={filters.status}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              handleFilterChange('status', values);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(MODERATION_STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>

        {/* Flag Types Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Flag Types
          </label>
          <select
            multiple
            value={filters.flagTypes}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value);
              handleFilterChange('flagTypes', values);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(FLAG_TYPE_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div className="space-y-2">
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => handleFilterChange('dateRange', {
                ...filters.dateRange,
                start: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => handleFilterChange('dateRange', {
                ...filters.dateRange,
                end: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Additional Filters */}
      <div className="mt-4 flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filters.showAutomated}
            onChange={(e) => handleFilterChange('showAutomated', e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-gray-700">Show Automated</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={filters.showManual}
            onChange={(e) => handleFilterChange('showManual', e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-gray-700">Show Manual</span>
        </label>
      </div>
    </div>
  );
};

// ===== MODERATION ANALYTICS COMPONENT =====

const ModerationAnalytics: React.FC<ModerationAnalyticsProps> = ({ analytics }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Moderation Analytics</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Total Reviews</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-2">{analytics.overview.totalReviews}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Approval Rate</span>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-2">{analytics.overview.approvalRate}%</p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Flag className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">Flag Rate</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900 mt-2">{analytics.overview.flagRate}%</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Auto Moderation</span>
          </div>
          <p className="text-2xl font-bold text-purple-900 mt-2">{analytics.overview.autoModerationRate}%</p>
        </div>
      </div>

      {/* Quality Trends */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-3">Quality Trends</h4>
        <div className="space-y-2">
          {analytics.trends.map((trend, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-700">{trend.period}</span>
                <p className="text-xs text-gray-500">{trend.startDate} - {trend.endDate}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{trend.averageScore}%</p>
                <p className="text-xs text-gray-500">{trend.totalReviews} reviews</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Issues */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">Top Issues</h4>
        <div className="space-y-2">
          {analytics.topIssues.map((issue, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">{issue.issue}</span>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{issue.count}</p>
                <p className="text-xs text-gray-500">{issue.percentage}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ===== MODERATION BULK ACTIONS COMPONENT =====

const ModerationBulkActions: React.FC<ModerationBulkActionsProps> = ({
  selectedReviews,
  onBulkAction,
  disabled = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkAction = async (action: ModerationActionType) => {
    setIsProcessing(true);
    try {
      await onBulkAction(action, selectedReviews);
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedReviews.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-blue-900">
            {selectedReviews.length} review{selectedReviews.length !== 1 ? 's' : ''} selected
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <ModerationActionButton
            action="approve"
            onAction={() => handleBulkAction('approve')}
            loading={isProcessing}
            disabled={disabled}
          />
          <ModerationActionButton
            action="reject"
            onAction={() => handleBulkAction('reject')}
            loading={isProcessing}
            disabled={disabled}
          />
          <ModerationActionButton
            action="flag"
            onAction={() => handleBulkAction('flag')}
            loading={isProcessing}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

// ===== MAIN REVIEW MODERATION COMPONENT =====

export const ReviewModeration: React.FC<ReviewModerationProps> = ({
  reviews,
  onModerate,
  showAutomated = true,
  showManual = true,
  showAnalytics = true,
  enableBulkActions = true
}) => {
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [filters, setFilters] = useState<ModerationFilters>({
    status: [],
    flagTypes: [],
    dateRange: { start: '', end: '' },
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
    showAutomated: true,
    showManual: true
  });

  // Mock moderation data - in real implementation, this would come from props or API
  const moderationData: ReviewModerationType[] = reviews.map(review => ({
    id: `mod_${review.contractId}`,
    reviewId: review.contractId,
    status: 'pending' as ModerationStatus,
    automatedScore: Math.floor(Math.random() * 40) + 60, // 60-100
    flags: [
      {
        type: 'insufficient_detail' as ModerationFlagType,
        severity: 'low' as const,
        description: 'Review content is too brief',
        confidence: 75,
        autoGenerated: true,
        resolved: false
      }
    ],
    actions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  // Mock analytics data
  const analytics: QualityAnalytics = {
    overview: {
      totalReviews: reviews.length,
      averageQualityScore: 78,
      approvalRate: 85,
      flagRate: 12,
      rejectionRate: 3,
      autoModerationRate: 70
    },
    trends: [
      {
        period: 'daily',
        startDate: '2024-01-01',
        endDate: '2024-01-01',
        averageScore: 78,
        scoreDistribution: { excellent: 30, good: 45, fair: 20, poor: 5 },
        improvementPercentage: 5,
        totalReviews: 25,
        flaggedCount: 3,
        rejectedCount: 1
      }
    ],
    topIssues: [
      { issue: 'Insufficient detail', count: 15, percentage: 20 },
      { issue: 'Inconsistent ratings', count: 8, percentage: 10 },
      { issue: 'Spam content', count: 5, percentage: 6 }
    ],
    moderatorPerformance: [
      {
        moderatorId: 'mod_1',
        decisionsCount: 150,
        accuracy: 92,
        averageResponseTime: 2.5
      }
    ],
    contentInsights: {
      averageLength: 250,
      readabilityScore: 75,
      sentimentDistribution: { positive: 70, neutral: 25, negative: 5 },
      commonKeywords: [
        { word: 'excellent', frequency: 45 },
        { word: 'professional', frequency: 38 },
        { word: 'recommend', frequency: 32 }
      ]
    }
  };

  const handleReviewSelect = (reviewId: string, selected: boolean) => {
    if (selected) {
      setSelectedReviews(prev => [...prev, reviewId]);
    } else {
      setSelectedReviews(prev => prev.filter(id => id !== reviewId));
    }
  };

  const handleSelectAll = () => {
    if (selectedReviews.length === reviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(reviews.map(r => r.contractId));
    }
  };

  const handleBulkAction = async (action: ModerationActionType, reviewIds: string[]) => {
    for (const reviewId of reviewIds) {
      await onModerate(reviewId, {
        type: action,
        description: `Bulk ${action} action`,
        performedBy: 'current_user',
        performedAt: new Date().toISOString()
      });
    }
    setSelectedReviews([]);
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      // Apply filters here
      return true; // Simplified for demo
    });
  }, [reviews, filters]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Review Moderation</h2>
          <p className="text-gray-600">Manage and moderate review submissions</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Analytics */}
      {showAnalytics && (
        <ModerationAnalytics analytics={analytics} />
      )}

      {/* Filters */}
      <ModerationFilters
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Bulk Actions */}
      {enableBulkActions && (
        <ModerationBulkActions
          selectedReviews={selectedReviews}
          onBulkAction={handleBulkAction}
        />
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedReviews.length === reviews.length}
              onChange={handleSelectAll}
              className="rounded"
            />
            <span className="text-sm text-gray-700">
              Select All ({reviews.length} reviews)
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Showing {filteredReviews.length} of {reviews.length} reviews</span>
          </div>
        </div>

        {filteredReviews.map((review) => {
          const moderation = moderationData.find(m => m.reviewId === review.contractId);
          if (!moderation) return null;

          return (
            <div key={review.contractId} className="flex items-start space-x-3">
              {enableBulkActions && (
                <input
                  type="checkbox"
                  checked={selectedReviews.includes(review.contractId)}
                  onChange={(e) => handleReviewSelect(review.contractId, e.target.checked)}
                  className="mt-6 rounded"
                />
              )}
              <div className="flex-1">
                <ModerationCard
                  review={review}
                  moderation={moderation}
                  onModerate={onModerate}
                  showDetails={true}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredReviews.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Shield className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews to moderate</h3>
          <p className="text-gray-600">
            All reviews have been processed or no reviews match your current filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewModeration;
