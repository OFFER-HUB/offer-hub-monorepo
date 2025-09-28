/**
 * Multi-Dimensional Rating Interface Component
 * Professional rating interface with validation, tooltips, and accessibility
 */

"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Star, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import {
  MultiDimensionalRating,
  RatingValidation,
  RatingInterfaceProps,
  RATING_DIMENSIONS
} from '@/types/review-creation.types';

// ===== RATING DIMENSION CONFIGURATIONS =====

const RATING_DIMENSION_CONFIG = {
  [RATING_DIMENSIONS.QUALITY]: {
    label: 'Quality of Work',
    description: 'How well was the work executed? Consider code quality, design, functionality, and attention to detail.',
    icon: '🎯',
    tooltip: 'Evaluate the technical quality, craftsmanship, and overall execution of the delivered work.'
  },
  [RATING_DIMENSIONS.COMMUNICATION]: {
    label: 'Communication',
    description: 'How effective was the communication throughout the project?',
    icon: '💬',
    tooltip: 'Assess responsiveness, clarity, professionalism, and how well they kept you informed.'
  },
  [RATING_DIMENSIONS.TIMELINESS]: {
    label: 'Timeliness',
    description: 'How well did they meet deadlines and project timelines?',
    icon: '⏰',
    tooltip: 'Consider adherence to deadlines, project milestones, and overall time management.'
  },
  [RATING_DIMENSIONS.VALUE]: {
    label: 'Value for Money',
    description: 'How satisfied are you with the value received for the price paid?',
    icon: '💰',
    tooltip: 'Evaluate the quality of work relative to the cost, including any additional value provided.'
  },
  [RATING_DIMENSIONS.OVERALL]: {
    label: 'Overall Experience',
    description: 'Your overall satisfaction with the collaboration and project outcome.',
    icon: '⭐',
    tooltip: 'Consider the complete experience from start to finish, including all aspects of the collaboration.'
  }
};

// ===== RATING LABELS =====

const RATING_LABELS = {
  1: { label: 'Poor', color: 'text-red-500', bgColor: 'bg-red-50' },
  2: { label: 'Fair', color: 'text-orange-500', bgColor: 'bg-orange-50' },
  3: { label: 'Good', color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
  4: { label: 'Very Good', color: 'text-blue-500', bgColor: 'bg-blue-50' },
  5: { label: 'Excellent', color: 'text-green-500', bgColor: 'bg-green-50' }
};

// ===== COMPONENT INTERFACE =====

interface RatingStarProps {
  rating: number;
  dimension: keyof MultiDimensionalRating;
  value: number;
  onChange: (dimension: keyof MultiDimensionalRating, value: number) => void;
  readOnly?: boolean;
  showLabel?: boolean;
  showTooltip?: boolean;
  validation?: RatingValidation;
  compact?: boolean;
}

interface RatingDimensionProps {
  dimension: keyof MultiDimensionalRating;
  rating: number;
  onChange: (dimension: keyof MultiDimensionalRating, value: number) => void;
  readOnly?: boolean;
  showLabel?: boolean;
  showTooltip?: boolean;
  validation?: RatingValidation;
  compact?: boolean;
}

// ===== RATING STAR COMPONENT =====

const RatingStar: React.FC<{
  value: number;
  rating: number;
  onHover: (value: number) => void;
  onClick: (value: number) => void;
  onLeave: () => void;
  size: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
}> = ({ value, rating, onHover, onClick, onLeave, size, readOnly = false }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const isFilled = value <= rating;
  const isInteractive = !readOnly;

  return (
    <Star
      className={`${sizeClasses[size]} ${
        isFilled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
      } ${
        isInteractive ? 'cursor-pointer hover:text-yellow-300 transition-colors' : ''
      }`}
      onMouseEnter={() => isInteractive && onHover(value)}
      onMouseLeave={onLeave}
      onClick={() => isInteractive && onClick(value)}
    />
  );
};

// ===== RATING DIMENSION COMPONENT =====

const RatingDimension: React.FC<RatingDimensionProps> = ({
  dimension,
  rating,
  onChange,
  readOnly = false,
  showLabel = true,
  showTooltip = true,
  validation,
  compact = false
}) => {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [showTooltipState, setShowTooltipState] = useState(false);

  const config = RATING_DIMENSION_CONFIG[dimension];
  const displayRating = hoveredRating ?? rating;
  const hasError = validation?.errors.some(error => 
    error.toLowerCase().includes(dimension.toLowerCase())
  );
  const hasWarning = validation?.warnings.some(warning => 
    warning.toLowerCase().includes(dimension.toLowerCase())
  );

  const handleStarHover = useCallback((value: number) => {
    if (!readOnly) {
      setHoveredRating(value);
    }
  }, [readOnly]);

  const handleStarClick = useCallback((value: number) => {
    if (!readOnly) {
      onChange(dimension, value);
      setHoveredRating(null);
    }
  }, [dimension, onChange, readOnly]);

  const handleStarLeave = useCallback(() => {
    setHoveredRating(null);
  }, []);

  const handleTooltipToggle = useCallback(() => {
    if (showTooltip) {
      setShowTooltipState(prev => !prev);
    }
  }, [showTooltip]);

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700 min-w-[100px]">
          {config.label}
        </span>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <RatingStar
              key={value}
              value={value}
              rating={displayRating}
              onHover={handleStarHover}
              onClick={handleStarClick}
              onLeave={handleStarLeave}
              size="sm"
              readOnly={readOnly}
            />
          ))}
        </div>
        {displayRating > 0 && (
          <span className="text-xs text-gray-500">
            {RATING_LABELS[displayRating as keyof typeof RATING_LABELS]?.label}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{config.icon}</span>
          <label className="text-sm font-medium text-gray-700">
            {config.label}
          </label>
          {showTooltip && (
            <button
              type="button"
              onClick={handleTooltipToggle}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Info className="h-4 w-4" />
            </button>
          )}
        </div>
        {displayRating > 0 && (
          <span className={`text-sm font-medium px-2 py-1 rounded-full ${
            RATING_LABELS[displayRating as keyof typeof RATING_LABELS]?.color
          } ${
            RATING_LABELS[displayRating as keyof typeof RATING_LABELS]?.bgColor
          }`}>
            {RATING_LABELS[displayRating as keyof typeof RATING_LABELS]?.label}
          </span>
        )}
      </div>

      {showTooltipState && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <p>{config.tooltip}</p>
        </div>
      )}

      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <RatingStar
            key={value}
            value={value}
            rating={displayRating}
            onHover={handleStarHover}
            onClick={handleStarClick}
            onLeave={handleStarLeave}
            size="md"
            readOnly={readOnly}
          />
        ))}
      </div>

      {config.description && (
        <p className="text-xs text-gray-500">{config.description}</p>
      )}

      {hasError && (
        <div className="flex items-center space-x-1 text-red-600 text-xs">
          <XCircle className="h-3 w-3" />
          <span>Please provide a rating for this dimension</span>
        </div>
      )}

      {hasWarning && (
        <div className="flex items-center space-x-1 text-yellow-600 text-xs">
          <AlertTriangle className="h-3 w-3" />
          <span>Consider reviewing this rating</span>
        </div>
      )}
    </div>
  );
};

// ===== MAIN RATING INTERFACE COMPONENT =====

export const RatingInterface: React.FC<RatingInterfaceProps> = ({
  ratings,
  onChange,
  readOnly = false,
  showLabels = true,
  showTooltips = true,
  compact = false,
  validation
}) => {
  const [hoveredDimension, setHoveredDimension] = useState<keyof MultiDimensionalRating | null>(null);

  const handleRatingChange = useCallback((dimension: keyof MultiDimensionalRating, value: number) => {
    const newRatings = { ...ratings, [dimension]: value };
    
    // Auto-calculate overall rating if not manually set
    if (dimension !== RATING_DIMENSIONS.OVERALL) {
      const dimensions = Object.keys(newRatings).filter(
        key => key !== RATING_DIMENSIONS.OVERALL
      ) as Array<keyof MultiDimensionalRating>;
      
      const averageRating = dimensions.reduce((sum, dim) => sum + newRatings[dim], 0) / dimensions.length;
      newRatings.overall = Math.round(averageRating * 2) / 2; // Round to nearest 0.5
    }
    
    onChange(newRatings);
  }, [ratings, onChange]);

  const handleDimensionHover = useCallback((dimension: keyof MultiDimensionalRating) => {
    setHoveredDimension(dimension);
  }, []);

  const handleDimensionLeave = useCallback(() => {
    setHoveredDimension(null);
  }, []);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    const dimensions = Object.keys(ratings).filter(
      key => key !== RATING_DIMENSIONS.OVERALL
    ) as Array<keyof MultiDimensionalRating>;
    
    const averageRating = dimensions.reduce((sum, dim) => sum + ratings[dim], 0) / dimensions.length;
    const completedRatings = dimensions.filter(dim => ratings[dim] > 0).length;
    const totalRatings = dimensions.length;
    
    return {
      averageRating,
      completedRatings,
      totalRatings,
      completionPercentage: (completedRatings / totalRatings) * 100
    };
  }, [ratings]);

  // Validation summary
  const validationSummary = useMemo(() => {
    if (!validation) return null;
    
    const hasErrors = validation.errors.length > 0;
    const hasWarnings = validation.warnings.length > 0;
    const consistencyScore = validation.consistencyScore;
    
    return {
      hasErrors,
      hasWarnings,
      consistencyScore,
      status: hasErrors ? 'error' : hasWarnings ? 'warning' : 'success'
    };
  }, [validation]);

  if (compact) {
    return (
      <div className="space-y-3">
        {Object.keys(ratings).map((dimension) => (
          <RatingDimension
            key={dimension}
            dimension={dimension as keyof MultiDimensionalRating}
            rating={ratings[dimension as keyof MultiDimensionalRating]}
            onChange={handleRatingChange}
            readOnly={readOnly}
            showLabel={showLabels}
            showTooltip={showTooltips}
            validation={validation}
            compact={compact}
          />
        ))}
        
        {validationSummary && (
          <div className="text-xs text-gray-500">
            Consistency: {validationSummary.consistencyScore}%
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Rate Your Experience</h3>
          <p className="text-sm text-gray-600">
            Please rate different aspects of your collaboration
          </p>
        </div>
        
        {validationSummary && (
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
            validationSummary.status === 'error' ? 'bg-red-50 text-red-700' :
            validationSummary.status === 'warning' ? 'bg-yellow-50 text-yellow-700' :
            'bg-green-50 text-green-700'
          }`}>
            {validationSummary.status === 'error' && <XCircle className="h-4 w-4" />}
            {validationSummary.status === 'warning' && <AlertTriangle className="h-4 w-4" />}
            {validationSummary.status === 'success' && <CheckCircle className="h-4 w-4" />}
            <span className="text-sm font-medium">
              {validationSummary.consistencyScore}% Consistent
            </span>
          </div>
        )}
      </div>

      {/* Rating Dimensions */}
      <div className="space-y-6">
        {Object.keys(ratings).map((dimension) => (
          <div
            key={dimension}
            className={`p-4 rounded-lg border transition-colors ${
              hoveredDimension === dimension
                ? 'border-blue-300 bg-blue-50'
                : 'border-gray-200 bg-white'
            }`}
            onMouseEnter={() => handleDimensionHover(dimension as keyof MultiDimensionalRating)}
            onMouseLeave={handleDimensionLeave}
          >
            <RatingDimension
              dimension={dimension as keyof MultiDimensionalRating}
              rating={ratings[dimension as keyof MultiDimensionalRating]}
              onChange={handleRatingChange}
              readOnly={readOnly}
              showLabel={showLabels}
              showTooltip={showTooltips}
              validation={validation}
              compact={false}
            />
          </div>
        ))}
      </div>

      {/* Progress Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">
            {overallStats.completedRatings} of {overallStats.totalRatings} completed
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${overallStats.completionPercentage}%` }}
          />
        </div>
        
        {overallStats.completedRatings > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            Average Rating: {overallStats.averageRating.toFixed(1)} / 5.0
          </div>
        )}
      </div>

      {/* Validation Messages */}
      {validation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="space-y-2">
          {validation.errors.map((error, index) => (
            <div key={index} className="flex items-center space-x-2 text-red-600 text-sm">
              <XCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          ))}
          
          {validation.warnings.map((warning, index) => (
            <div key={index} className="flex items-center space-x-2 text-yellow-600 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Outlier Detection */}
      {validation?.outlierDetection.isOutlier && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Unusual Rating Pattern</h4>
              <p className="text-sm text-yellow-700 mt-1">{validation.outlierDetection.reason}</p>
              {validation.outlierDetection.recommendations.length > 0 && (
                <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
                  {validation.outlierDetection.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RatingInterface;
