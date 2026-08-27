"use client";

import { memo } from "react";
import { GitPullRequest, Timer, User, ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/community/SectionHeading";
import type { PullRequestData } from "@/types/community";

interface RecentPRsSectionProps {
  pullRequests: PullRequestData[];
}

// Memoized PR card component
const PRCard = memo(function PRCard({ pr }: { pr: PullRequestData }) {
  const isMerged = pr.status === 'Merged';

  return (
    <article className="flex flex-col gap-4 rounded-3xl bg-bg-base p-5 shadow-neu-raised-sm hover:shadow-neu-raised transition-shadow duration-300 group/card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 w-8 h-8 rounded-lg bg-bg-base flex items-center justify-center shadow-neu-sunken-subtle transition-transform group-hover/card:scale-110">
            <GitPullRequest size={14} className={isMerged ? "text-purple-500" : "text-theme-primary"} />
          </div>
          <div>
            <a
              href={pr.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-black text-content-primary leading-tight hover:text-theme-primary transition-colors block mb-2"
            >
              {pr.title}
            </a>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-content-secondary">
                <User size={12} className="text-theme-primary/40" />
                @{pr.author}
              </div>
              <div className="w-1 h-1 rounded-full bg-content-muted/30" />
              <div className="text-[10px] font-bold text-content-secondary lowercase">
                {isMerged ? `merged ${pr.timestamp}` : `opened ${pr.timestamp}`}
              </div>
              {!isMerged && (
                <>
                  <div className="w-1 h-1 rounded-full bg-content-muted/30" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-theme-primary px-1.5 py-0.5 rounded bg-theme-primary/10 shadow-sm">
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
          className="p-2 rounded-lg bg-bg-base shadow-neu-raised-sm text-theme-primary hover:shadow-neu-sunken-subtle active:shadow-neu-sunken transition-shadow"
        >
          <ArrowUpRight size={14} />
        </a>
      </div>
    </article>
  );
});

export const RecentPRsSection = ({ pullRequests }: RecentPRsSectionProps) => {
  // Double the list for seamless loop
  const doublePRs = [...pullRequests, ...pullRequests];

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
              <div className="flex items-start gap-4 p-5 rounded-[2rem] bg-bg-base shadow-neu-sunken-subtle">
                <div className="w-10 h-10 rounded-xl bg-bg-base flex items-center justify-center shadow-neu-raised-sm">
                  <Timer size={18} className="text-theme-primary" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-content-primary mb-1">Impact Factor</p>
                  <p className="text-sm font-medium text-content-secondary">Every open PR brings us closer to the next milestone.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: CSS-animated Marquee (GPU-accelerated) */}
          <div className="lg:col-span-8 relative h-[600px] overflow-hidden group">
            {/* Gradient Overlays for Fade */}
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-bg-base/90 to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-bg-base/90 to-transparent z-10 pointer-events-none" />

            <div
              className="flex flex-col gap-6 px-6 sm:px-12 py-10 animate-marquee-vertical group-hover:[animation-play-state:paused]"
              style={{ willChange: "transform" }}
            >
              {doublePRs.map((pr, index) => (
                <PRCard key={`${pr.number}-${index}`} pr={pr} />
              ))}
            </div>
          </div>
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
      `}</style>
    </section>
  );
};


