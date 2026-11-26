import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Label 12/600, uppercase, 0.12em (the `text-label` token), in brand teal.
 *
 * Color is `text-theme-primary-hover`: #0D7377 in light mode is 5.1:1 on
 * bg-base, while `text-theme-primary` (#149A9B) is only 3.2:1 at this size.
 * In dark mode it resolves to a lighter teal that also passes.
 */
export const EYEBROW_CLASS = "text-label uppercase text-theme-primary-hover";

interface EyebrowProps {
  children: ReactNode;
  /** Decorative icon before the text. */
  icon?: ReactNode;
  as?: "p" | "span" | "div";
  className?: string;
}

export function Eyebrow({ children, icon, as: Tag = "p", className }: EyebrowProps) {
  return (
    <Tag className={cn(EYEBROW_CLASS, icon && "inline-flex items-center gap-2", className)}>
      {icon && (
        <span aria-hidden="true" className="inline-flex shrink-0">
          {icon}
        </span>
      )}
      {children}
    </Tag>
  );
}
