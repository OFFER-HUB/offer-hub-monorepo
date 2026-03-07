"use client";

import { useState, memo, useMemo } from "react";
import { Tag, ArrowUpRight, ChevronDown } from "lucide-react";
import SectionHeading from "@/components/community/SectionHeading";
import { cn } from "@/lib/cn";

interface IssueData {
  number: number;
  title: string;
  priority: string;
  url: string;
  labels: string[];
}

interface OpenIssuesSectionProps {
  issues: IssueData[];
}

// Memoized issue card component
const IssueCard = memo(function IssueCard({ issue }: { issue: IssueData }) {
  const isGoodFirstIssue = issue.labels.some(l => l.toLowerCase().includes('good') || l.toLowerCase().includes('help'));

  return (
    <article className="group relative flex flex-col justify-between rounded-2xl bg-bg-base p-6 shadow-neu-raised transition-shadow duration-300 hover:shadow-neu-raised-hover">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-bg-base text-[10px] font-semibold text-content-secondary tracking-wider shadow-neu-sunken-subtle uppercase">
            #{issue.number}
          </div>
          {isGoodFirstIssue && (
            <span className="text-[9px] font-bold text-theme-primary uppercase tracking-widest bg-green-500/10 dark:bg-green-500/20 px-1.5 py-0.5 rounded shadow-sm">
              Starter
            </span>
          )}
        </div>

        <a
          href={issue.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-[15px] font-semibold text-content-primary hover:text-theme-primary transition-colors leading-snug line-clamp-2 mb-4 tracking-tight"
        >
          {issue.title}
        </a>

        {issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {issue.labels.slice(0, 2).map((label) => (
              <span
                key={label}
                className="flex items-center gap-1 text-[10px] font-medium text-content-secondary px-2 py-1 bg-bg-base rounded-lg shadow-neu-raised-sm"
              >
                <Tag size={9} className="text-theme-primary" />
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-theme-border/20">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold uppercase tracking-widest text-content-muted mb-0.5">Priority</span>
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-widest",
            issue.priority === 'High' ? 'text-red-500' :
              issue.priority === 'Low' ? 'text-emerald-500' :
                'text-theme-primary'
          )}>
            {issue.priority}
          </span>
        </div>

        <a
          href={issue.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl text-white transition-all btn-neumorphic-primary flex items-center justify-center"
        >
          <ArrowUpRight size={16} />
        </a>
      </div>
    </article>
  );
});

const OpenIssuesSection = ({ issues }: OpenIssuesSectionProps) => {
  const [displayCount, setDisplayCount] = useState(15);

  // Sort by number descending for newest first - memoized
  const sortedIssues = useMemo(() =>
    [...issues].sort((a, b) => b.number - a.number),
    [issues]
  );

  const visibleIssues = sortedIssues.slice(0, displayCount);
  const hasMore = displayCount < sortedIssues.length;

  const handleLoadMore = () => {
    setDisplayCount(prev => Math.min(prev + 15, sortedIssues.length));
  };

  return (
    <section id="open-issues" className="py-24 bg-transparent">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Open Issues"
          title="Shape the future of the platform"
          subtitle="Explore the latest roadmap items and help us unblock the community."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          {visibleIssues.map((issue) => (
            <IssueCard key={issue.number} issue={issue} />
          ))}
        </div>

        {hasMore && (
          <div className="mt-16 text-center">
            <button
              onClick={handleLoadMore}
              className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-theme-primary hover:gap-3 transition-all group"
            >
              Load more issues
              <ChevronDown size={14} className="group-hover:translate-y-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default OpenIssuesSection;
