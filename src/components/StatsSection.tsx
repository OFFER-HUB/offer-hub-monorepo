"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { GITHUB_ORG_URL } from "@/constants/github";
import type { Contributor, GitHubRepo } from "@/types/github";

const PUBLIC_REPOS = [
  "OFFER-HUB/offer-hub-monorepo",
  "OFFER-HUB/OFFER-HUB",
  "OFFER-HUB/OFFER-HUB-Frontend",
] as const;

interface StatItem {
  label: string;
  value: string;
}

type StatsState =
  | { status: "loading" }
  | { status: "ready"; items: StatItem[] }
  | { status: "unavailable" };

const SKELETON_LABELS = [
  "GitHub Stars",
  "Contributors",
  "GitHub Forks",
  "Open Issues",
] as const;

function formatCount(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return String(value);
}

function isValidRepoPayload(value: unknown): value is GitHubRepo {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const candidate = value as Partial<GitHubRepo>;
  return (
    typeof candidate.stargazers_count === "number" &&
    typeof candidate.forks_count === "number" &&
    typeof candidate.open_issues_count === "number"
  );
}

function isBotLogin(login: string): boolean {
  const normalized = login.trim().toLowerCase();
  return (
    normalized.endsWith("[bot]") ||
    normalized === "dependabot" ||
    normalized === "renovate" ||
    normalized === "github-actions"
  );
}

export async function loadLiveGitHubStats(
  signal?: AbortSignal,
): Promise<StatItem[] | null> {
  const results = await Promise.all(
    PUBLIC_REPOS.map(async (repo) => {
      try {
        const [repoRes, contributorsRes] = await Promise.all([
          fetch(`https://api.github.com/repos/${repo}`, {
            headers: { Accept: "application/vnd.github+json" },
            signal,
          }),
          fetch(`https://api.github.com/repos/${repo}/contributors?per_page=100`, {
            headers: { Accept: "application/vnd.github+json" },
            signal,
          }),
        ]);

        if (!repoRes.ok || !contributorsRes.ok) {
          return null;
        }

        const [repoData, contributorsData] = await Promise.all([
          repoRes.json() as Promise<unknown>,
          contributorsRes.json() as Promise<unknown>,
        ]);

        if (!isValidRepoPayload(repoData) || !Array.isArray(contributorsData)) {
          return null;
        }

        return {
          repo: repoData,
          contributors: contributorsData as Contributor[],
        };
      } catch {
        return null;
      }
    }),
  );

  const valid = results.filter(
    (entry): entry is NonNullable<(typeof results)[number]> => entry !== null,
  );

  if (valid.length === 0) {
    return null;
  }

  const stars = valid.reduce((sum, entry) => sum + entry.repo.stargazers_count, 0);
  const forks = valid.reduce((sum, entry) => sum + entry.repo.forks_count, 0);
  const openIssues = valid.reduce((sum, entry) => sum + entry.repo.open_issues_count, 0);

  const uniqueContributors = new Set<string>();
  for (const entry of valid) {
    for (const contributor of entry.contributors) {
      if (
        contributor &&
        typeof contributor.login === "string" &&
        contributor.login.length > 0 &&
        !isBotLogin(contributor.login)
      ) {
        uniqueContributors.add(contributor.login.toLowerCase());
      }
    }
  }

  return [
    { label: "GitHub Stars", value: formatCount(stars) },
    { label: "Contributors", value: formatCount(uniqueContributors.size) },
    { label: "GitHub Forks", value: formatCount(forks) },
    { label: "Open Issues", value: formatCount(openIssues) },
  ];
}

export function StatsSection() {
  const [state, setState] = useState<StatsState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    loadLiveGitHubStats(controller.signal).then((items) => {
      if (cancelled || controller.signal.aborted) return;
      if (items) {
        setState({ status: "ready", items });
      } else {
        setState({ status: "unavailable" });
      }
    });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return (
    <section
      aria-label="Open-source repository metrics"
      className="relative py-20"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {state.status === "loading" && (
          <div
            role="status"
            aria-live="polite"
            aria-label="Loading live GitHub metrics"
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {SKELETON_LABELS.map((label) => (
              <div
                key={label}
                className="relative z-10 flex flex-col items-center text-center p-8 rounded-2xl bg-bg-elevated shadow-neu-raised min-w-0"
              >
                <span
                  aria-hidden="true"
                  className="h-12 w-20 rounded-xl bg-bg-sunken shadow-neu-sunken-subtle animate-pulse motion-reduce:animate-none"
                />
                <span className="text-xs font-semibold mt-3 uppercase tracking-widest text-content-secondary">
                  {label}
                </span>
              </div>
            ))}
          </div>
        )}

        {state.status === "ready" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {state.items.map((stat) => (
              <div
                key={stat.label}
                className="relative z-10 flex flex-col items-center text-center p-8 rounded-2xl bg-bg-elevated shadow-neu-raised transition-shadow duration-200 motion-reduce:transition-none hover:shadow-neu-raised-hover min-w-0"
              >
                <span className="text-4xl md:text-5xl font-bold tracking-tight text-theme-primary tabular-nums">
                  {stat.value}
                </span>
                <span className="text-xs font-semibold mt-3 uppercase tracking-widest text-content-secondary">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {state.status === "unavailable" && (
          <div className="rounded-2xl p-8 bg-bg-elevated shadow-neu-raised flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p className="text-sm font-medium text-content-secondary">
              Live open-source metrics from GitHub are temporarily unavailable.
            </p>
            <a
              href={GITHUB_ORG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 min-h-11 px-5 py-2.5 rounded-xl text-sm font-semibold text-theme-primary bg-bg-sunken shadow-neu-sunken-subtle transition-shadow duration-200 motion-reduce:transition-none hover:shadow-neu-raised-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary shrink-0"
            >
              View on GitHub
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
