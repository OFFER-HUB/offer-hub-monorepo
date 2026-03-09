"use client";

import { useState, memo } from "react";
import { Users, GitCommit, ChevronDown } from "lucide-react";
import SectionHeading from "@/components/community/SectionHeading";

interface ContributorData {
  name: string;
  username: string;
  avatar: string;
  commits: number;
  profileUrl: string;
}

interface ContributorsSectionProps {
  contributors: ContributorData[];
}

// Memoized contributor card to prevent unnecessary re-renders
const ContributorCard = memo(function ContributorCard({ person }: { person: ContributorData }) {
  return (
    <article className="group relative rounded-2xl bg-bg-elevated p-5 shadow-neu-raised transition-shadow duration-300 hover:shadow-neu-raised-hover">
      <div className="flex flex-col items-center text-center gap-3">
        {person.avatar ? (
          <img
            src={person.avatar}
            alt={person.name}
            loading="lazy"
            decoding="async"
            className="w-14 h-14 rounded-full object-cover shadow-neu-sunken-subtle"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-bg-elevated flex items-center justify-center shadow-neu-sunken-subtle">
            <Users size={20} className="text-content-secondary" />
          </div>
        )}

        <div className="min-w-0">
          <h3 className="text-base font-bold text-content-primary truncate tracking-tight">
            {person.name || person.username}
          </h3>
          <p className="text-xs font-medium text-content-primary">
            @{person.username}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-theme-primary">
          <GitCommit size={12} />
          <span>{person.commits} commits</span>
        </div>

        {person.profileUrl && (
          <a
            href={person.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 text-[10px] font-bold text-theme-primary hover:underline"
          >
            View Profile
          </a>
        )}
      </div>
    </article>
  );
});

const ContributorsSection = ({ contributors }: ContributorsSectionProps) => {
  const [displayCount, setDisplayCount] = useState(30);
  const totalContributors = contributors.length;

  const visibleContributors = contributors.slice(0, displayCount);
  const hasMore = displayCount < totalContributors;

  const handleLoadMore = () => {
    setDisplayCount(prev => Math.min(prev + 30, totalContributors));
  };

  return (
    <section id="contributors" className="py-24 bg-transparent">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Contributors"
          title="Meet the people shipping OFFER-HUB"
          subtitle={`Meet the developers shipping OFFER-HUB every day. A growing community of ${totalContributors} contributors.`}
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 mt-12">
          {visibleContributors.map((person) => (
            <ContributorCard key={person.username} person={person} />
          ))}
        </div>

        {hasMore && (
          <div className="mt-12 text-center">
            <button
              onClick={handleLoadMore}
              className="inline-flex items-center gap-2.5 px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 btn-neumorphic-primary"
            >
              Show more ({totalContributors - displayCount} remaining)
              <ChevronDown size={16} />
            </button>
            <p className="mt-3 text-xs text-content-secondary">
              Showing {displayCount} of {totalContributors} contributors
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ContributorsSection;
