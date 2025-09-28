/**
 * Review Validation and Quality Assessment Utilities
 * Comprehensive validation system for multi-dimensional ratings and review content
 */

import {
  MultiDimensionalRating,
  RatingValidation,
  RatingValidationConfig,
  RatingConsistencyCheck,
  OutlierDetection,
  ReviewCreationData,
  ReviewTemplate,
  ReviewTemplateSection,
  ModerationFlag,
  ModerationFlagType,
  ReviewPattern,
  RATING_DIMENSIONS
} from '@/types/review-creation.types';

// ===== DEFAULT CONFIGURATION =====

export const DEFAULT_VALIDATION_CONFIG: RatingValidationConfig = {
  consistencyThreshold: 70,
  outlierDetectionEnabled: true,
  outlierThreshold: 2.5,
  minRatingDifference: 0,
  maxRatingDifference: 3,
  autoFlagThreshold: 60
};

// ===== RATING VALIDATION =====

/**
 * Validates multi-dimensional ratings for consistency and quality
 */
export function validateMultiDimensionalRating(
  ratings: MultiDimensionalRating,
  config: RatingValidationConfig = DEFAULT_VALIDATION_CONFIG
): RatingValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  let consistencyScore = 0;

  // Basic validation
  const dimensions = Object.keys(ratings) as Array<keyof MultiDimensionalRating>;
  
  for (const dimension of dimensions) {
    const value = ratings[dimension];
    
    if (value < 1 || value > 5) {
      errors.push(`${dimension} rating must be between 1 and 5`);
    }
    
    if (!Number.isInteger(value)) {
      warnings.push(`${dimension} rating should be a whole number`);
    }
  }

  // Consistency check
  const consistencyCheck = checkRatingConsistency(ratings, config);
  consistencyScore = consistencyCheck.overallConsistency;
  
  if (consistencyScore < config.consistencyThreshold) {
    warnings.push(`Rating consistency is below threshold (${consistencyScore}%)`);
  }

  // Outlier detection
  const outlierDetection = detectRatingOutliers(ratings, config);
  
  if (outlierDetection.isOutlier) {
    warnings.push(`Rating pattern appears unusual: ${outlierDetection.reason}`);
  }

  // Extreme rating differences
  const maxRating = Math.max(...Object.values(ratings));
  const minRating = Math.min(...Object.values(ratings));
  const ratingDifference = maxRating - minRating;

  if (ratingDifference > config.maxRatingDifference) {
    warnings.push(`Large rating difference detected (${ratingDifference} points)`);
  }

  const isValid = errors.length === 0 && consistencyScore >= config.autoFlagThreshold;

  return {
    isValid,
    errors,
    warnings,
    consistencyScore,
    outlierDetection
  };
}

/**
 * Checks consistency between different rating dimensions
 */
export function checkRatingConsistency(
  ratings: MultiDimensionalRating,
  config: RatingValidationConfig = DEFAULT_VALIDATION_CONFIG
): RatingConsistencyCheck {
  const dimensions = Object.keys(ratings) as Array<keyof MultiDimensionalRating>;
  const values = Object.values(ratings);
  
  // Calculate standard deviation
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Consistency score based on standard deviation (lower is more consistent)
  const consistencyScore = Math.max(0, 100 - (standardDeviation * 20));
  
  // Check individual dimension consistency
  const dimensionConsistency = dimensions.reduce((acc, dimension) => {
    const value = ratings[dimension];
    const deviation = Math.abs(value - mean);
    acc[dimension] = Math.max(0, 100 - (deviation * 25));
    return acc;
  }, {} as Record<keyof MultiDimensionalRating, number>);

  const flags: string[] = [];
  const suggestions: string[] = [];

  if (consistencyScore < config.consistencyThreshold) {
    flags.push('Low consistency between rating dimensions');
    suggestions.push('Consider if all aspects of the project were evaluated fairly');
  }

  if (standardDeviation > 1.5) {
    flags.push('High variation in ratings');
    suggestions.push('Review each dimension carefully to ensure accuracy');
  }

  return {
    overallConsistency: Math.round(consistencyScore),
    dimensionConsistency,
    flags,
    suggestions
  };
}

/**
 * Detects outlier ratings using statistical methods
 */
export function detectRatingOutliers(
  ratings: MultiDimensionalRating,
  config: RatingValidationConfig = DEFAULT_VALIDATION_CONFIG
): OutlierDetection {
  if (!config.outlierDetectionEnabled) {
    return {
      isOutlier: false,
      confidence: 0,
      method: 'rule_based',
      reason: 'Outlier detection disabled',
      similarReviews: [],
      recommendations: []
    };
  }

  const values = Object.values(ratings);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const standardDeviation = Math.sqrt(variance);

  // Z-score based outlier detection
  const zScores = values.map(val => Math.abs((val - mean) / standardDeviation));
  const maxZScore = Math.max(...zScores);
  
  const isOutlier = maxZScore > config.outlierThreshold;
  const confidence = Math.min(100, maxZScore * 20);

  let reason = '';
  const recommendations: string[] = [];

  if (isOutlier) {
    if (maxZScore > 3) {
      reason = 'Extreme rating pattern detected';
      recommendations.push('Double-check all ratings for accuracy');
      recommendations.push('Consider if the project had exceptional circumstances');
    } else {
      reason = 'Unusual rating pattern detected';
      recommendations.push('Review ratings for consistency');
    }
  } else {
    reason = 'Rating pattern appears normal';
  }

  return {
    isOutlier,
    confidence: Math.round(confidence),
    method: 'statistical',
    reason,
    similarReviews: [], // Would be populated with actual similar review IDs
    recommendations
  };
}

// ===== CONTENT VALIDATION =====

/**
 * Validates review content for quality and appropriateness
 */
export function validateReviewContent(
  content: string,
  _title: string,
  minLength: number = 10,
  maxLength: number = 2000
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  qualityScore: number;
  flags: ModerationFlag[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const flags: ModerationFlag[] = [];
  let qualityScore = 100;

  // Length validation
  if (content.length < minLength) {
    errors.push(`Content must be at least ${minLength} characters long`);
    qualityScore -= 20;
  }

  if (content.length > maxLength) {
    errors.push(`Content must be no more than ${maxLength} characters long`);
    qualityScore -= 10;
  }

  if (_title.length < 5) {
    errors.push('Title must be at least 5 characters long');
    qualityScore -= 15;
  }

  // Content quality checks
  const qualityChecks = analyzeContentQuality(content);
  
  if (qualityChecks.readabilityScore < 60) {
    warnings.push('Content may be difficult to read');
    qualityScore -= 10;
  }

  if (qualityChecks.sentimentScore < -0.5) {
    flags.push({
      type: 'inappropriate_content',
      severity: 'medium',
      description: 'Negative sentiment detected',
      confidence: 75,
      autoGenerated: true,
      resolved: false
    });
    qualityScore -= 15;
  }

  if (qualityChecks.spamScore > 0.7) {
    flags.push({
      type: 'spam',
      severity: 'high',
      description: 'Potential spam content detected',
      confidence: 80,
      autoGenerated: true,
      resolved: false
    });
    qualityScore -= 25;
  }

  if (qualityChecks.duplicateScore > 0.8) {
    flags.push({
      type: 'duplicate_content',
      severity: 'medium',
      description: 'Potential duplicate content detected',
      confidence: 70,
      autoGenerated: true,
      resolved: false
    });
    qualityScore -= 20;
  }

  // Professional tone check
  if (qualityChecks.professionalScore < 60) {
    warnings.push('Content may not maintain a professional tone');
    qualityScore -= 10;
  }

  const isValid = errors.length === 0 && qualityScore >= 60;

  return {
    isValid,
    errors,
    warnings,
    qualityScore: Math.max(0, qualityScore),
    flags
  };
}

/**
 * Analyzes content quality using various metrics
 */
export function analyzeContentQuality(content: string): {
  readabilityScore: number;
  sentimentScore: number;
  spamScore: number;
  duplicateScore: number;
  professionalScore: number;
  wordCount: number;
  sentenceCount: number;
  averageWordsPerSentence: number;
} {
  const words = content.split(/\s+/).filter(word => word.length > 0);
  const sentences = content.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  
  const wordCount = words.length;
  const sentenceCount = sentences.length;
  const averageWordsPerSentence = sentenceCount > 0 ? wordCount / sentenceCount : 0;

  // Readability score (simplified Flesch Reading Ease)
  const readabilityScore = calculateReadabilityScore(words, sentences);
  
  // Sentiment analysis (simplified)
  const sentimentScore = calculateSentimentScore(content);
  
  // Spam detection (simplified)
  const spamScore = calculateSpamScore(content);
  
  // Duplicate content detection (simplified)
  const duplicateScore = calculateDuplicateScore(content);
  
  // Professional tone analysis
  const professionalScore = calculateProfessionalScore(content);

  return {
    readabilityScore,
    sentimentScore,
    spamScore,
    duplicateScore,
    professionalScore,
    wordCount,
    sentenceCount,
    averageWordsPerSentence
  };
}

/**
 * Calculates readability score using simplified Flesch Reading Ease
 */
function calculateReadabilityScore(words: string[], sentences: string[]): number {
  if (sentences.length === 0) return 0;
  
  const totalWords = words.length;
  const totalSentences = sentences.length;
  
  // Count syllables (simplified)
  const totalSyllables = words.reduce((count, word) => {
    return count + countSyllables(word);
  }, 0);
  
  // Flesch Reading Ease formula
  const score = 206.835 - (1.015 * (totalWords / totalSentences)) - (84.6 * (totalSyllables / totalWords));
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Counts syllables in a word (simplified)
 */
function countSyllables(word: string): number {
  const vowels = 'aeiouy';
  let count = 0;
  let previousWasVowel = false;
  
  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i].toLowerCase());
    if (isVowel && !previousWasVowel) {
      count++;
    }
    previousWasVowel = isVowel;
  }
  
  // Handle silent 'e'
  if (word.endsWith('e') && count > 1) {
    count--;
  }
  
  return Math.max(1, count);
}

/**
 * Calculates sentiment score (-1 to 1)
 */
function calculateSentimentScore(content: string): number {
  const positiveWords = ['excellent', 'great', 'amazing', 'wonderful', 'outstanding', 'perfect', 'fantastic', 'brilliant', 'superb', 'exceptional'];
  const negativeWords = ['terrible', 'awful', 'horrible', 'disappointing', 'poor', 'bad', 'worst', 'unacceptable', 'frustrating', 'annoying'];
  
  const words = content.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;
  
  for (const word of words) {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  }
  
  const totalWords = words.length;
  if (totalWords === 0) return 0;
  
  return (positiveCount - negativeCount) / totalWords;
}

/**
 * Calculates spam score (0 to 1)
 */
function calculateSpamScore(content: string): number {
  const spamIndicators = [
    /https?:\/\/[^\s]+/g, // URLs
    /[A-Z]{3,}/g, // Excessive caps
    /!{3,}/g, // Multiple exclamation marks
    /\${2,}/g, // Multiple dollar signs
    /free\s+money/gi,
    /click\s+here/gi,
    /limited\s+time/gi
  ];
  
  let spamScore = 0;
  
  for (const indicator of spamIndicators) {
    const matches = content.match(indicator);
    if (matches) {
      spamScore += matches.length * 0.1;
    }
  }
  
  // Check for excessive repetition
  const words = content.toLowerCase().split(/\s+/);
  const wordCounts = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const maxRepetition = Math.max(...Object.values(wordCounts));
  if (maxRepetition > words.length * 0.3) {
    spamScore += 0.3;
  }
  
  return Math.min(1, spamScore);
}

/**
 * Calculates duplicate content score (0 to 1)
 */
function calculateDuplicateScore(content: string): number {
  // This is a simplified implementation
  // In a real system, you would compare against a database of existing reviews
  
  const commonPhrases = [
    'great work',
    'highly recommend',
    'excellent communication',
    'on time',
    'within budget',
    'professional service',
    'will hire again',
    'exceeded expectations'
  ];
  
  let duplicateScore = 0;
  const contentLower = content.toLowerCase();
  
  for (const phrase of commonPhrases) {
    if (contentLower.includes(phrase)) {
      duplicateScore += 0.1;
    }
  }
  
  return Math.min(1, duplicateScore);
}

/**
 * Calculates professional tone score (0 to 100)
 */
function calculateProfessionalScore(content: string): number {
  const professionalWords = ['professional', 'quality', 'delivered', 'communication', 'timeline', 'budget', 'requirements', 'excellent', 'outstanding'];
  const unprofessionalWords = ['awesome', 'cool', 'dude', 'bro', 'lol', 'omg', 'wtf', 'sucks', 'crap', 'stupid'];
  
  const words = content.toLowerCase().split(/\s+/);
  let professionalCount = 0;
  let unprofessionalCount = 0;
  
  for (const word of words) {
    if (professionalWords.includes(word)) professionalCount++;
    if (unprofessionalWords.includes(word)) unprofessionalCount++;
  }
  
  const totalWords = words.length;
  if (totalWords === 0) return 50;
  
  const professionalRatio = professionalCount / totalWords;
  const unprofessionalRatio = unprofessionalCount / totalWords;
  
  return Math.max(0, Math.min(100, 50 + (professionalRatio * 50) - (unprofessionalRatio * 50)));
}

// ===== TEMPLATE VALIDATION =====

/**
 * Validates review against template requirements
 */
export function validateReviewAgainstTemplate(
  reviewData: Partial<ReviewCreationData>,
  template: ReviewTemplate
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  completionScore: number;
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  let completionScore = 0;
  const totalSections = template.sections.length;
  let completedSections = 0;

  for (const section of template.sections) {
    const sectionValidation = validateTemplateSection(reviewData, section);
    
    if (sectionValidation.isValid) {
      completedSections++;
    } else {
      errors.push(...sectionValidation.errors);
      warnings.push(...sectionValidation.warnings);
    }
  }

  completionScore = totalSections > 0 ? (completedSections / totalSections) * 100 : 100;
  
  const isValid = errors.length === 0 && completionScore >= 80;

  return {
    isValid,
    errors,
    warnings,
    completionScore
  };
}

/**
 * Validates a single template section
 */
function validateTemplateSection(
  reviewData: Partial<ReviewCreationData>,
  section: ReviewTemplateSection
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Get section value from review data
  const sectionValue = getSectionValue(reviewData, section);
  
  // Required field validation
  if (section.required && (!sectionValue || sectionValue.toString().trim() === '')) {
    errors.push(`${section.title} is required`);
    return { isValid: false, errors, warnings };
  }

  // Type-specific validation
  switch (section.type) {
    case 'text':
      if (sectionValue && typeof sectionValue === 'string') {
        if (section.minLength && sectionValue.length < section.minLength) {
          errors.push(`${section.title} must be at least ${section.minLength} characters long`);
        }
        if (section.maxLength && sectionValue.length > section.maxLength) {
          errors.push(`${section.title} must be no more than ${section.maxLength} characters long`);
        }
      }
      break;
      
    case 'rating':
      if (sectionValue && typeof sectionValue === 'number') {
        if (section.validation?.min && sectionValue < section.validation.min) {
          errors.push(`${section.title} must be at least ${section.validation.min}`);
        }
        if (section.validation?.max && sectionValue > section.validation.max) {
          errors.push(`${section.title} must be no more than ${section.validation.max}`);
        }
      }
      break;
      
    case 'multiple_choice':
      if (sectionValue && section.options && !section.options.includes(sectionValue.toString())) {
        errors.push(`${section.title} must be one of the provided options`);
      }
      break;
  }

  const isValid = errors.length === 0;
  return { isValid, errors, warnings };
}

/**
 * Gets section value from review data
 */
function getSectionValue(reviewData: Partial<ReviewCreationData>, section: ReviewTemplateSection): unknown {
  // This is a simplified implementation
  // In a real system, you would have a more sophisticated mapping
  switch (section.id) {
    case 'title':
      return reviewData.title;
    case 'content':
      return reviewData.content;
    case 'quality_rating':
      return reviewData.ratings?.quality;
    case 'communication_rating':
      return reviewData.ratings?.communication;
    case 'timeliness_rating':
      return reviewData.ratings?.timeliness;
    case 'value_rating':
      return reviewData.ratings?.value;
    case 'overall_rating':
      return reviewData.ratings?.overall;
    default:
      return null;
  }
}

// ===== PATTERN DETECTION =====

/**
 * Detects patterns in review data
 */
export function detectReviewPatterns(
  reviews: ReviewCreationData[]
): ReviewPattern[] {
  const patterns: ReviewPattern[] = [];

  // Rating pattern detection
  const ratingPatterns = detectRatingPatterns(reviews);
  patterns.push(...ratingPatterns);

  // Content pattern detection
  const contentPatterns = detectContentPatterns(reviews);
  patterns.push(...contentPatterns);

  // Timing pattern detection
  const timingPatterns = detectTimingPatterns(reviews);
  patterns.push(...timingPatterns);

  return patterns;
}

/**
 * Detects rating patterns
 */
function detectRatingPatterns(reviews: ReviewCreationData[]): ReviewPattern[] {
  const patterns: ReviewPattern[] = [];

  if (reviews.length < 5) return patterns;

  // Check for consistent high ratings
  const highRatingCount = reviews.filter(r => r.ratings.overall >= 4).length;
  const highRatingPercentage = (highRatingCount / reviews.length) * 100;

  if (highRatingPercentage > 90) {
    patterns.push({
      type: 'rating_pattern',
      description: 'Consistently high ratings detected',
      frequency: highRatingPercentage,
      impact: 'positive',
      recommendations: ['Verify rating authenticity', 'Check for rating inflation']
    });
  }

  // Check for rating clustering
  const ratingClusters = reviews.reduce((acc, review) => {
    const rating = Math.round(review.ratings.overall);
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const maxCluster = Math.max(...Object.values(ratingClusters));
  const clusterPercentage = (maxCluster / reviews.length) * 100;

  if (clusterPercentage > 70) {
    patterns.push({
      type: 'rating_pattern',
      description: 'Rating clustering detected',
      frequency: clusterPercentage,
      impact: 'neutral',
      recommendations: ['Encourage more diverse ratings', 'Review rating criteria']
    });
  }

  return patterns;
}

/**
 * Detects content patterns
 */
function detectContentPatterns(reviews: ReviewCreationData[]): ReviewPattern[] {
  const patterns: ReviewPattern[] = [];

  if (reviews.length < 3) return patterns;

  // Check for duplicate content
  const contentHashes = reviews.map(r => hashContent(r.content));
  const uniqueHashes = new Set(contentHashes);
  
  if (uniqueHashes.size < reviews.length * 0.8) {
    patterns.push({
      type: 'content_pattern',
      description: 'Potential duplicate content detected',
      frequency: ((reviews.length - uniqueHashes.size) / reviews.length) * 100,
      impact: 'negative',
      recommendations: ['Review content for originality', 'Implement duplicate detection']
    });
  }

  // Check for content length patterns
  const avgLength = reviews.reduce((sum, r) => sum + r.content.length, 0) / reviews.length;
  const shortReviews = reviews.filter(r => r.content.length < avgLength * 0.5).length;
  
  if (shortReviews > reviews.length * 0.3) {
    patterns.push({
      type: 'content_pattern',
      description: 'Many short reviews detected',
      frequency: (shortReviews / reviews.length) * 100,
      impact: 'neutral',
      recommendations: ['Encourage more detailed feedback', 'Provide review guidelines']
    });
  }

  return patterns;
}

/**
 * Detects timing patterns
 */
function detectTimingPatterns(reviews: ReviewCreationData[]): ReviewPattern[] {
  const patterns: ReviewPattern[] = [];

  if (reviews.length < 5) return patterns;

  // Check for rapid review submission
  const sortedReviews = reviews.sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  let rapidSubmissions = 0;
  for (let i = 1; i < sortedReviews.length; i++) {
    const timeDiff = new Date(sortedReviews[i].createdAt).getTime() - 
                    new Date(sortedReviews[i-1].createdAt).getTime();
    if (timeDiff < 5 * 60 * 1000) { // 5 minutes
      rapidSubmissions++;
    }
  }

  if (rapidSubmissions > 0) {
    patterns.push({
      type: 'timing_pattern',
      description: 'Rapid review submissions detected',
      frequency: (rapidSubmissions / reviews.length) * 100,
      impact: 'negative',
      recommendations: ['Implement rate limiting', 'Review submission quality']
    });
  }

  return patterns;
}

/**
 * Simple content hashing for duplicate detection
 */
function hashContent(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
}

// ===== UTILITY FUNCTIONS =====

/**
 * Calculates overall quality score for a review
 */
export function calculateOverallQualityScore(
  reviewData: Partial<ReviewCreationData>
): number {
  let score = 0;
  let factors = 0;

  // Rating consistency (30%)
  if (reviewData.ratings) {
    const consistency = checkRatingConsistency(reviewData.ratings);
    score += consistency.overallConsistency * 0.3;
    factors += 0.3;
  }

  // Content quality (40%)
  if (reviewData.content) {
    const contentValidation = validateReviewContent(reviewData.content, reviewData.title || '');
    score += contentValidation.qualityScore * 0.4;
    factors += 0.4;
  }

  // Completeness (30%)
  const completeness = calculateCompletenessScore(reviewData);
  score += completeness * 0.3;
  factors += 0.3;

  return factors > 0 ? score / factors : 0;
}

/**
 * Calculates completeness score for a review
 */
function calculateCompletenessScore(reviewData: Partial<ReviewCreationData>): number {
  let score = 0;
  let totalFields = 0;

  // Required fields
  const requiredFields = ['title', 'content', 'ratings'];
  for (const field of requiredFields) {
    totalFields++;
    if (reviewData[field as keyof ReviewCreationData]) {
      score++;
    }
  }

  // Optional fields
  const optionalFields = ['projectType', 'projectTitle', 'tags'];
  for (const field of optionalFields) {
    totalFields++;
    if (reviewData[field as keyof ReviewCreationData]) {
      score++;
    }
  }

  return totalFields > 0 ? (score / totalFields) * 100 : 0;
}

/**
 * Generates validation summary
 */
export function generateValidationSummary(
  validation: RatingValidation,
  contentValidation: ReturnType<typeof validateReviewContent>,
  templateValidation?: ReturnType<typeof validateReviewAgainstTemplate>
): {
  overallScore: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  summary: string;
  recommendations: string[];
} {
  const scores = [
    validation.consistencyScore,
    contentValidation.qualityScore,
    templateValidation?.completionScore || 100
  ];

  const overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  let status: 'excellent' | 'good' | 'fair' | 'poor';
  if (overallScore >= 90) status = 'excellent';
  else if (overallScore >= 75) status = 'good';
  else if (overallScore >= 60) status = 'fair';
  else status = 'poor';

  const summary = `Review quality: ${status} (${Math.round(overallScore)}%)`;
  
  const recommendations: string[] = [];
  if (validation.warnings.length > 0) {
    recommendations.push('Address rating consistency warnings');
  }
  if (contentValidation.warnings.length > 0) {
    recommendations.push('Improve content quality');
  }
  if (templateValidation && templateValidation.completionScore < 80) {
    recommendations.push('Complete all required template sections');
  }

  return {
    overallScore,
    status,
    summary,
    recommendations
  };
}
