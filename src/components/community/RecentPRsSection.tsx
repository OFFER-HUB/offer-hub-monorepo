"use client";

import { memo, useMemo } from "react";
import { GitPullRequest, Timer, User, ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/community/SectionHeading";
import { GITHUB_ORG_URL } from "@/constants/github";
import type { PullRequestData } from "@/types/community";

interface RecentPRsSectionProps {
  pullRequests: PullRequestData[];
}

const BOT_AUTHORS = new Set([
  "dependabot",
  "renovate",
  "github-actions",
]);

const DEP_BUMP_TITLE_RE = /^chore\(deps/i;

export function isBotOrDependencyPR(
  pr: Pick<PullRequestData, "author" | "title">,
): boolean {
  const rawAuthor = pr.author.trim().toLowerCase().replace(/^@/, "");
  const baseAuthor = rawAuthor.replace(/\[bot\]$/, "");

  if (rawAuthor.endsWith("[bot]") || BOT_AUTHORS.has(baseAuthor)) {
    return true;
  }

  if (DEP_BUMP_TITLE_RE.test(pr.title.trim())) {
    return true;
  }

  return false;
}

export function filterCommunityPRs(
  pullRequests: PullRequestData[],
): PullRequestData[] {
  return pullRequests.filter((pr) => !isBotOrDependencyPR(pr));
}

// Memoized PR card component
const PRCard = memo(function PRCard({ pr }: { pr: PullRequestData }) {
  const isMerged = pr.status === "Merged";

  return (
    <article className="flex flex-col gap-4 rounded-3xl bg-bg-base p-5 shadow-neu-raised-sm hover:shadow-neu-raised transition-shadow duration-300 motion-reduce:transition-none group/card min-w-0 overflow-hidden">
      <div className="flex items-start justify-between gap-4 min-w-0">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="mt-1 w-8 h-8 rounded-xl bg-bg-base flex items-center justify-center shadow-neu-sunken-subtle transition-transform duration-200 motion-reduce:transition-none group-hover/card:scale-110 shrink-0">
            <GitPullRequest
              size={14}
              className={isMerged ? "text-theme-accent" : "text-theme-primary"}
            />
          </div>
          <div className="min-w-0 max-w-full overflow-hidden">
            <a
              href={pr.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-content-primary leading-tight hover:text-theme-primary transition-colors duration-200 motion-reduce:transition-none mb-2 min-h-11 max-w-full overflow-hidden truncate flex items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
            >
              {pr.title}
            </a>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-content-secondary">
                <User size={12} className="text-theme-primary" />
                @{pr.author}
              </div>
              <div className="w-1 h-1 rounded-full bg-content-muted" />
              <div className="min-w-0 max-w-full truncate text-xs font-semibold text-content-secondary lowercase">
                {isMerged ? `merged ${pr.timestamp}` : `opened ${pr.timestamp}`}
              </div>
              {!isMerged && (
                <>
                  <div className="w-1 h-1 rounded-full bg-content-muted" />
                  <span className="min-w-0 max-w-full truncate text-xs font-semibold uppercase tracking-widest text-theme-primary px-2.5 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]">
                    Open
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <a
          href={pr.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open pull request: ${pr.title}`}
          className="min-h-11 min-w-11 max-w-full shrink-0 truncate p-2 rounded-xl bg-bg-base shadow-neu-raised-sm text-theme-primary hover:shadow-neu-sunken-subtle active:shadow-neu-sunken transition-shadow duration-200 motion-reduce:transition-none flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
        >
          <ArrowUpRight size={14} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
});

export const RecentPRsSection = ({ pullRequests }: RecentPRsSectionProps) => {
  const filteredPRs = useMemo(
    () => filterCommunityPRs(pullRequests),
    [pullRequests],
  );
  // Double the list for seamless loop when cards exist
  const doublePRs = useMemo(
    () => [...filteredPRs, ...filteredPRs],
    [filteredPRs],
  );

  return (
    <section id="recent-prs" className="py-24 overflow-hidden bg-transparent">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left Side: Context */}
          <div className="lg:col-span-4">
            <SectionHeading
              eyebrow="Collaboration"
              title="Open for review"
              subtitle="Help the community move faster by reviewing these open contributions and verifying the latest features."
            />

            <div className="mt-10 flex flex-col gap-6">
              <div className="flex items-start gap-4 p-5 rounded-3xl bg-bg-base shadow-neu-sunken-subtle">
                <div className="w-10 h-10 rounded-xl bg-bg-base flex items-center justify-center shadow-neu-raised-sm shrink-0">
                  <Timer size={18} className="text-theme-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-content-primary mb-1">
                    Impact Factor
                  </p>
                  <p className="text-sm font-medium text-content-secondary">
                    Every open PR brings us closer to the next milestone.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: CSS-animated Marquee (GPU-accelerated) */}
          {filteredPRs.length === 0 ? (
            <div className="lg:col-span-8">
              <div className="rounded-3xl bg-bg-elevated p-8 shadow-neu-raised flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <p className="text-sm font-medium text-content-secondary">
                  No recent community pull requests to display right now.
                </p>
                <a
                  href={GITHUB_ORG_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-11 px-5 py-2.5 rounded-xl text-sm font-semibold text-theme-primary bg-bg-sunken shadow-neu-sunken-subtle transition-shadow duration-200 motion-reduce:transition-none hover:shadow-neu-raised-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary shrink-0"
                >
                  Browse on GitHub
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-8 relative h-[600px] overflow-hidden group">
              {/* Gradient Overlays for Fade */}
              <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-bg-base to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-bg-base to-transparent z-10 pointer-events-none" />

              <div
                className="flex flex-col gap-6 px-6 sm:px-12 py-10 animate-marquee-vertical group-hover:[animation-play-state:paused]"
                style={{ willChange: "transform" }}
              >
                {doublePRs.map((pr, index) => (
                  <PRCard key={`${pr.number}-${index}`} pr={pr} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS animation for vertical marquee - GPU accelerated */}
      <style jsx>{`
        @keyframes marquee-vertical {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        .animate-marquee-vertical {
          animation: marquee-vertical 60s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-marquee-vertical {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
};
