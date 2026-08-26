import React from 'react';
import { cn } from '@/lib/cn';
import { statusColors } from '@/lib/statusColors';

/**
 * All badge variant keys supported by StatusBadge.
 *
 * Difficulty   : easy | medium | hard
 * Changelog    : feature | new | fix | breaking
 * HTTP methods : get | post | put | delete
 * Release types: release | prerelease | draft
 */
export type BadgeVariant =
  | 'easy' | 'medium' | 'hard'
  | 'feature' | 'new' | 'fix' | 'breaking'
  | 'get' | 'post' | 'put' | 'delete'
  | 'release' | 'prerelease' | 'draft';

interface StatusBadgeProps {
  variant: BadgeVariant;
  /** Override the displayed label; defaults to the capitalised variant name. */
  label?: string;
  /** Extra Tailwind classes forwarded to the outer <span>. */
  className?: string;
}

const defaultLabels: Record<BadgeVariant, string> = {
  easy:       'Easy',
  medium:     'Medium',
  hard:       'Hard',
  feature:    'Feature',
  new:        'New',
  fix:        'Fix',
  breaking:   'Breaking',
  get:        'GET',
  post:       'POST',
  put:        'PUT',
  delete:     'DELETE',
  release:    'Release',
  prerelease: 'Pre-release',
  draft:      'Draft',
};

/** Maps BadgeVariant → statusColors key (they match 1-to-1 except 'feature'/'new'/'fix'). */
const variantColorKey: Record<BadgeVariant, keyof typeof statusColors> = {
  easy:       'easy',
  medium:     'medium',
  hard:       'hard',
  feature:    'info',
  new:        'info',
  fix:        'muted',
  breaking:   'breaking',
  get:        'get',
  post:       'post',
  put:        'put',
  delete:     'delete',
  release:    'release',
  prerelease: 'prerelease',
  draft:      'draft',
};

/**
 * StatusBadge — the single source-of-truth pill badge for the app.
 *
 * Uses design-token Tailwind classes from statusColors so it automatically
 * respects both light and dark mode without any hardcoded hex values.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant,
  label,
  className,
}) => {
  const colors = statusColors[variantColorKey[variant]];
  const displayLabel = label ?? defaultLabels[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shadow-neu-raised-sm',
        colors.text,
        colors.bg,
        colors.border,
        className,
      )}
    >
      {displayLabel}
    </span>
  );
};

/**
 * @deprecated Use `StatusBadge` instead. Kept as a thin alias so existing
 * imports of `Badge` continue to compile without changes.
 */
export const Badge = StatusBadge;
