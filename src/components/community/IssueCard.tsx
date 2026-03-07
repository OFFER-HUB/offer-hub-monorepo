"use client";

import { ExternalLink, GitPullRequestArrow } from "lucide-react";

export type Difficulty = "easy" | "medium" | "hard";

export interface IssueCardProps {
  number: number;
  title: string;
  difficulty: Difficulty;
  labels: string[];
  url: string;
  createdAt: string;
}

const difficultyConfig: Record<
  Difficulty,
  { label: string; color: string; bg: string }
> = {
  easy: {
    label: "Easy",
    color: "#16a34a",
    bg: "rgba(22,163,74,0.1)",
  },
  medium: {
    label: "Medium",
    color: "#d97706",
    bg: "rgba(217,119,6,0.1)",
  },
  hard: {
    label: "Hard",
    color: "#dc2626",
    bg: "rgba(220,38,38,0.1)",
  },
};

export default function IssueCard({
  number,
  title,
  difficulty,
  labels,
  url,
  createdAt,
}: IssueCardProps) {
  const diff = difficultyConfig[difficulty];

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
        <span
          className="inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ background: diff.bg, color: diff.color }}
        >
          {diff.label}
        </span>
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
