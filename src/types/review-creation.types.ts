export type RatingDimension = 'quality' | 'communication' | 'timeliness' | 'value';

export interface Rating {
  value: number; // 1-5
  dimension: RatingDimension;
  label: string;
  description?: string;
}

export interface ReviewTemplate {
  id: string;
  name: string;
  description: string;
  questions: string[];
  defaultRatings: Rating[];
  applicableProjectTypes: string[];
}

export interface Review {
  id: string;
  projectId: string;
  reviewerId: string;
  revieweeId: string;
  ratings: Rating[];
  comment: string;
  templateId?: string;
  isAnonymous: boolean;
  status: 'draft' | 'pending' | 'published' | 'rejected' | 'flagged';
  createdAt: string;
  updatedAt: string;
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    deviceType?: 'mobile' | 'tablet' | 'desktop';
  };
}

export interface ReviewStats {
  averageRatings: Record<RatingDimension, number>;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  dimensionAverages: Record<RatingDimension, number>;
}

export interface ReviewModerationAction {
  id: string;
  reviewId: string;
  moderatorId: string;
  action: 'approve' | 'reject' | 'flag' | 'request_changes';
  reason?: string;
  comment?: string;
  createdAt: string;
}

export interface ReviewExportOptions {
  format: 'csv' | 'json' | 'pdf';
  includeRatings: boolean;
  includeComments: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
  projectIds?: string[];
  userIds?: string[];
}

export interface ReviewAnalytics {
  totalReviews: number;
  averageRating: number;
  responseRate: number;
  dimensionAverages: Record<RatingDimension, number>;
  monthlyTrends: Array<{
    month: string;
    count: number;
    averageRating: number;
  }>;
  wordCloud: Array<{
    text: string;
    value: number;
  }>;
}

export interface ReviewTemplateConfig {
  id: string;
  name: string;
  description: string;
  ratingDimensions: Array<{
    id: RatingDimension;
    label: string;
    description: string;
  }>;
  defaultQuestions: string[];
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSubmission {
  projectId: string;
  revieweeId: string;
  ratings: Array<{
    dimension: RatingDimension;
    value: number;
  }>;
  comment: string;
  isAnonymous: boolean;
  templateId?: string;
  customQuestions?: Array<{
    question: string;
    answer: string;
  }>;
}