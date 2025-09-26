import React, { useState, useEffect } from 'react';
import { Star, StarHalf, StarOff } from 'lucide-react';
import { Rating, RatingDimension } from '@/types/review-creation.types';
import { cn } from '@/lib/utils';

interface RatingInterfaceProps {
  dimensions: Array<{
    id: RatingDimension;
    label: string;
    description: string;
  }>;
  initialRatings?: Rating[];
  onChange?: (ratings: Rating[]) => void;
  disabled?: boolean;
  maxRating?: number;
  className?: string;
}

const DEFAULT_MAX_RATING = 5;

export const RatingInterface: React.FC<RatingInterfaceProps> = ({
  dimensions,
  initialRatings = [],
  onChange,
  disabled = false,
  maxRating = DEFAULT_MAX_RATING,
  className,
}) => {
  const [ratings, setRatings] = useState<Rating[]>(() => {
    // Initialize with default ratings or existing ones
    return dimensions.map(dim => {
      const existing = initialRatings.find(r => r.dimension === dim.id);
      return existing || {
        dimension: dim.id,
        value: 0,
        label: dim.label,
      };
    });
  });

  // Update internal state if initialRatings change
  useEffect(() => {
    if (initialRatings.length > 0) {
      setRatings(prev => 
        prev.map(rating => {
          const updated = initialRatings.find(r => r.dimension === rating.dimension);
          return updated ? { ...rating, ...updated } : rating;
        })
      );
    }
  }, [initialRatings]);

  const handleRatingChange = (dimension: RatingDimension, value: number) => {
    if (disabled) return;
    
    const newRatings = ratings.map(rating =>
      rating.dimension === dimension ? { ...rating, value } : rating
    );
    
    setRatings(newRatings);
    onChange?.(newRatings);
  };

  const getRatingDescription = (value: number) => {
    if (value === 0) return 'Not rated';
    const descriptions = [
      'Poor',
      'Fair',
      'Good',
      'Very Good',
      'Excellent'
    ];
    return descriptions[Math.min(Math.ceil(value) - 1, descriptions.length - 1)];
  };

  const renderStars = (dimension: RatingDimension, currentValue: number) => {
    return Array.from({ length: maxRating }).map((_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= currentValue;
      const isHalfFilled = starValue - 0.5 <= currentValue && currentValue < starValue;

      return (
        <button
          key={starValue}
          type="button"
          className={cn(
            'p-1 focus:outline-none',
            disabled ? 'cursor-default' : 'hover:scale-110 transition-transform',
            isFilled ? 'text-yellow-400' : 'text-gray-300',
          )}
          onClick={() => !disabled && handleRatingChange(dimension, starValue)}
          onMouseEnter={() => {
            if (!disabled) {
              // Optional: Add hover effect
              const hoverRatings = ratings.map(r => 
                r.dimension === dimension ? { ...r, value: starValue } : r
              );
              setRatings(hoverRatings);
            }
          }}
          onMouseLeave={() => !disabled && setRatings(ratings)}
          disabled={disabled}
          aria-label={`Rate ${starValue} out of ${maxRating}`}
        >
          {isFilled ? (
            <Star className="w-6 h-6 fill-current" />
          ) : isHalfFilled ? (
            <StarHalf className="w-6 h-6 fill-current" />
          ) : (
            <Star className="w-6 h-6" />
          )}
        </button>
      );
    });
  };

  return (
    <div className={cn('space-y-6', className)}>
      {ratings.map((rating, index) => {
        const dimension = dimensions.find(d => d.id === rating.dimension);
        if (!dimension) return null;

        return (
          <div key={rating.dimension} className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {dimension.label}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {dimension.description}
                </p>
              </div>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {rating.value > 0 ? `${rating.value.toFixed(1)}` : '—'}
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              {renderStars(rating.dimension, rating.value)}
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                {getRatingDescription(rating.value)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RatingInterface;
