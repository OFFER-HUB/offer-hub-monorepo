"use client";

import { ExternalLink, GitPullRequestArrow } from "lucide-react";
import { StatusBadge } from "@/components/ui/Badge";

export type Difficulty = "easy" | "medium" | "hard";

export interface IssueCardProps {
  number: number;
  title: string;
  difficulty: Difficulty;
  labels: string[];
  url: string;
  createdAt: string;
}

export function IssueCard({
  number,
  title,
  difficulty,
  labels,
  url,
  createdAt,
}: IssueCardProps) {
  return (
    <article
      className="rounded-2xl p-5 shadow-neu-raised transition-shadow duration-300 hover:shadow-neu-raised-sm bg-bg-base"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <GitPullRequestArrow
            size={18}
            className="mt-0.5 shrink-0 text-theme-primary"
          />
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold leading-snug transition-colors duration-200 hover:text-theme-primary line-clamp-2 text-content-primary"
          >
            {title}
          </a>
        </div>
        <StatusBadge variant={difficulty} className="shrink-0 py-1 font-semibold" />
      </div>

      {labels.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 pl-7">
          {labels.slice(0, 3).map((label) => (
            <span
              key={label}
              className="rounded-full px-2 py-0.5 text-[11px] font-medium shadow-neu-raised-sm text-content-secondary border border-theme-border"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between pl-7">
        <span className="text-xs text-content-secondary">
          #{number} · {createdAt}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-medium transition-colors duration-200 hover:text-theme-primary text-content-secondary"
        >
          View
          <ExternalLink size={11} />
        </a>
      </div>
    </article>
  );
}
