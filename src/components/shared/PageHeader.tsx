import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Eyebrow } from "./Eyebrow";

export interface PageHeaderProps {
  /** Short uppercase label above the title. */
  eyebrow?: ReactNode;
  eyebrowIcon?: ReactNode;
  /** Rendered as the page's only <h1>. */
  title: ReactNode;
  /** One or two sentences under the title. */
  lead?: ReactNode;
  /** Buttons or links under the lead. */
  actions?: ReactNode;
  align?: "left" | "center";
  /** `page`: 40/700 (32 on mobile). `docs`: 32/700 (28 on mobile). */
  size?: "page" | "docs";
  /** id for the <h1>, e.g. for aria-labelledby. */
  titleId?: string;
  className?: string;
  /** Extra content under the actions (e.g. stats). */
  children?: ReactNode;
}

/**
 * The shared page title block. Every route except the home hero uses it for
 * its title, so each page has exactly one <h1> at the shared type scale.
 */
export function PageHeader({
  eyebrow,
  eyebrowIcon,
  title,
  lead,
  actions,
  align = "left",
  size = "page",
  titleId,
  className,
  children,
}: PageHeaderProps) {
  const centered = align === "center";

  return (
    <header className={cn("flex flex-col", centered && "items-center text-center", className)}>
      {eyebrow && (
        <Eyebrow icon={eyebrowIcon} className="mb-3">
          {eyebrow}
        </Eyebrow>
      )}
      <h1
        id={titleId}
        className={cn(
          "max-w-4xl text-content-primary",
          size === "docs" ? "text-h1-docs" : "text-h1",
        )}
      >
        {title}
      </h1>
      {lead && (
        <p
          className={cn(
            "mt-4 max-w-2xl text-body text-content-secondary sm:text-lg",
            centered && "mx-auto",
          )}
        >
          {lead}
        </p>
      )}
      {actions && (
        <div className={cn("mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap", centered && "sm:justify-center")}>
          {actions}
        </div>
      )}
      {children}
    </header>
  );
}
