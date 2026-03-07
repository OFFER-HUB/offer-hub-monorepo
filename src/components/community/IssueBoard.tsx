"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import SectionHeading from "@/components/community/SectionHeading";
import IssueCard, { type Difficulty, type IssueCardProps } from "@/components/community/IssueCard";

const MOCK_ISSUES: IssueCardProps[] = [
  {
    number: 1055,
    title: "Add loading skeleton to ContributorGrid while fetching GitHub data",
    difficulty: "easy",
    labels: ["good first issue", "frontend", "ux"],
    url: "https://github.com/OFFER-HUB/offer-hub-monorepo/issues/1055",
    createdAt: "2 days ago",
  },
  {
    number: 1051,
    title: "Implement dark mode toggle in Navbar and persist preference to localStorage",
    difficulty: "medium",
    labels: ["enhancement", "frontend", "accessibility"],
    url: "https://github.com/OFFER-HUB/offer-hub-monorepo/issues/1051",
    createdAt: "3 days ago",
  },
  {
    number: 1048,
    title: "Write integration tests for holdBalance() and releaseBalance() service methods",
    difficulty: "hard",
    labels: ["testing", "backend", "help wanted"],
    url: "https://github.com/OFFER-HUB/offer-hub-monorepo/issues/1048",
    createdAt: "4 days ago",
  },
  {
    number: 1044,
    title: "Fix mobile nav focus trap so keyboard users can close the menu",
    difficulty: "easy",
    labels: ["bug", "accessibility", "good first issue"],
    url: "https://github.com/OFFER-HUB/offer-hub-monorepo/issues/1044",
    createdAt: "5 days ago",
  },
  {
    number: 1040,
    title: "Add MDX content page for Stellar smart contract deployment guide",
    difficulty: "medium",
    labels: ["documentation", "mdx", "help wanted"],
    url: "https://github.com/OFFER-HUB/offer-hub-monorepo/issues/1040",
    createdAt: "6 days ago",
  },
  {
    number: 1036,
    title: "Migrate REST balance endpoints to use Supabase RPC with row-level locking",
    difficulty: "hard",
    labels: ["backend", "database", "performance"],
    url: "https://github.com/OFFER-HUB/offer-hub-monorepo/issues/1036",
    createdAt: "1 week ago",
  },
  {
    number: 1031,
    title: "Polish issue card hover state to match neumorphic design system",
    difficulty: "easy",
    labels: ["good first issue", "design", "frontend"],
    url: "https://github.com/OFFER-HUB/offer-hub-monorepo/issues/1031",
    createdAt: "1 week ago",
  },
  {
    number: 1027,
    title: "Add pagination to the Recent PRs feed on the /community page",
    difficulty: "medium",
    labels: ["enhancement", "frontend", "community"],
    url: "https://github.com/OFFER-HUB/offer-hub-monorepo/issues/1027",
    createdAt: "2 weeks ago",
  },
];

type Filter = "all" | Difficulty;

const FILTERS: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
];

interface IssueBoardProps {
  issues?: IssueCardProps[];
}

export default function IssueBoard({ issues = MOCK_ISSUES }: IssueBoardProps) {
  const [activeFilter, setActiveFilter] = useState<Filter>("all");

  const filtered =
    activeFilter === "all"
      ? issues
      : issues.filter((issue) => issue.difficulty === activeFilter);

  return (
    <section id="open-issues" className="py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionHeading
          eyebrow="Open Issues"
          title="Open Issues"
          subtitle="Good first issues and help-wanted tasks waiting for contributors like you."
        />

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-theme-primary text-white shadow-neu-sunken-subtle"
                    : "bg-bg-base text-content-secondary shadow-neu-raised-sm"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Issue grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {filtered.map((issue) => (
            <div key={issue.number}>
              <IssueCard {...issue} />
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center py-16 text-sm text-content-secondary">
            No issues found for this filter.
          </p>
        )}

        {/* CTA */}
        <div className="mt-12 flex justify-center">
          <a
            href="https://github.com/OFFER-HUB/offer-hub-monorepo/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold transition-all duration-200 hover:opacity-90 bg-theme-primary text-white shadow-neu-raised"
          >
            Browse all issues
            <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
