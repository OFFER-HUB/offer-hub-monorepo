import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface StepsProps {
  items?: string[];
  children?: ReactNode;
  className?: string;
}

export function Steps({ items, children, className }: StepsProps) {
  const content =
    children ??
    items?.map((item, index) => (
      <li key={`${item}-${index}`} className="flex items-start gap-3 rounded-2xl bg-bg-base p-4 shadow-neu-sunken-subtle">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-theme-primary/10 text-xs font-black text-theme-primary shadow-neu-raised-sm">
          {index + 1}
        </span>
        <span className="flex-1 leading-relaxed text-content-primary">{item}</span>
      </li>
    ));

  return (
    <ol
      aria-label="Procedure steps"
      className={cn(
        "my-8 list-none space-y-4 rounded-[1.5rem] bg-bg-elevated p-4 shadow-neu-raised md:p-5",
        className
      )}
    >
      {content}
    </ol>
  );
}
