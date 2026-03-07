import React from 'react';
import { cn } from '@/lib/cn';

type BadgeVariant = 'easy' | 'medium' | 'hard' | 'feature' | 'fix' | 'breaking' | 'new';

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  easy: 'bg-[rgba(22,163,74,0.12)] text-[#16a34a]',
  medium: 'bg-[rgba(217,119,6,0.12)] text-[#d97706]',
  hard: 'bg-[rgba(220,38,38,0.12)] text-[#dc2626]',
  feature: 'bg-[rgba(20,154,155,0.12)] text-[#149A9B]',
  new: 'bg-[rgba(20,154,155,0.12)] text-[#149A9B]',
  fix: 'bg-[rgba(109,117,143,0.12)] text-[#6D758F]',
  breaking: 'bg-[rgba(220,38,38,0.15)] text-[#dc2626] border border-[#dc2626]',
};

const defaultLabels: Record<BadgeVariant, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  feature: 'Feature',
  new: 'New',
  fix: 'Fix',
  breaking: 'Breaking',
};

export const Badge: React.FC<BadgeProps> = ({ variant, label, className }) => {
  const displayLabel = label ?? defaultLabels[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {displayLabel}
    </span>
  );
};
