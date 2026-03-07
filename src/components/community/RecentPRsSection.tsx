"use client";

import { memo } from "react";
import { GitPullRequest, Timer, User, ArrowUpRight } from "lucide-react";
import SectionHeading from "@/components/community/SectionHeading";

interface PullRequestData {
  number: number;
  title: string;
  author: string;
  mergedAt: string;
  url: string;
  status: string;
}

interface RecentPRsSectionProps {
  pullRequests: PullRequestData[];
}

// Memoized PR card component
const PRCard = memo(function PRCard({ pr }: { pr: PullRequestData }) {
  return (
    <article className="flex flex-col gap-4 rounded-3xl bg-[#F1F3F7]/40 p-5 border border-black/[0.02] hover:bg-white hover:shadow-[0_15px_40px_rgba(0,0,0,0.05)] hover:border-[#149A9B]/20 transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 w-8 h-8 rounded-lg bg-white border border-black/[0.03] flex items-center justify-center shadow-sm">
            <GitPullRequest size={14} className="text-[#149A9B]" />
          </div>
          <div>
            <a
              href={pr.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-blacktext-[#19213D] dark:text-[#b8bfd0] leading-tight hover:text-[#149A9B] transition-colors"
            >
              {pr.title}
            </a>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#6D758F]">
                <User size={12} className="text-[#149A9B]/40" />
                @{pr.author}
              </div>
              <div className="w-1 h-1 rounded-full bg-black/10" />
              <div className="text-[10px] font-bold text-[#6D758F] lowercase">
                merged {pr.mergedAt}
              </div>
            </div>
          </div>
        </div>

        <a
          href={pr.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-white border border-black/[0.03] text-[#149A9B] hover:scale-110 transition-transform"
        >
          <ArrowUpRight size={14} />
        </a>
      </div>
    </article>
  );
});

const RecentPRsSection = ({ pullRequests }: RecentPRsSectionProps) => {
  // Double the list for seamless loop (not triple - reduces DOM elements)
  const doublePRs = [...pullRequests, ...pullRequests];

  return (
    <section id="recent-prs" className="py-24 overflow-hidden bg-transparent">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

          {/* Left Side: Context */}
          <div className="lg:col-span-4">
            <SectionHeading
              eyebrow="Activity Stream"
              title="Real-time growth"
              subtitle="Watch as the global developer community continuously pushes the boundaries of Offer Hub."
            />

            <div className="mt-10 flex flex-col gap-6">
              <div className="flex items-start gap-4 p-5 rounded-[2rem] bg-[#F1F3F7]/50 border border-black/[0.03]">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <Timer size={18} className="text-[#149A9B]" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widesttext-[#19213D] dark:text-[#b8bfd0] mb-1">Update Frequency</p>
                  <p className="text-sm font-medium text-[#6D758F]">New commits merged every 2.4 hours on average.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: CSS-animated Marquee (GPU-accelerated) */}
          <div className="lg:col-span-8 relative h-[600px] overflow-hidden group">
            {/* Gradient Overlays for Fade */}
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#F1F3F7]/90 to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[#F1F3F7]/90 to-transparent z-10 pointer-events-none" />

            <div
              className="flex flex-col gap-4 py-10 animate-marquee-vertical group-hover:[animation-play-state:paused]"
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

export default RecentPRsSection;
