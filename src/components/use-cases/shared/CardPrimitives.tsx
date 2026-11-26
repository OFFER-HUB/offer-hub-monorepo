import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/** Raised section card shared by the hero and every bento section. */
export function BentoCard({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "min-w-0 scroll-mt-32 rounded-3xl bg-bg-elevated p-6 shadow-neu-raised sm:p-8",
        className,
      )}
    >
      {children}
    </section>
  );
}

/** The one section label style used across the use-case page. */
export function CardEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-label uppercase text-content-secondary">
      <span
        className="h-2 w-2 shrink-0 rounded-full bg-theme-primary"
        aria-hidden="true"
      />
      {children}
    </p>
  );
}

/** Inset card used for stats, features, metrics and SDK methods. */
export function InsetCard({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
}) {
  return (
    <Tag
      className={cn(
        "min-w-0 rounded-2xl bg-bg-base p-4 shadow-neu-sunken-subtle",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
