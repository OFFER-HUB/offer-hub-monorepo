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
    <article className="group relative rounded-2xl bg-[#F1F3F7] p-5 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] transition-shadow duration-300 hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]">
      <div className="flex flex-col items-center text-center gap-3">
        {person.avatar ? (
          <img
            src={person.avatar}
            alt={person.name}
            loading="lazy"
            decoding="async"
            className="w-14 h-14 rounded-full object-cover shadow-sm"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-[#F1F3F7] flex items-center justify-center">
            <Users size={20} className="text-[#6D758F]" />
          </div>
        )}

        <div className="min-w-0">
          <h3 className="text-base font-bold text-[#19213D] truncate tracking-tight">
            {person.name || person.username}
          </h3>
          <p className="text-xs font-medium text-[#149A9B]">
            @{person.username}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6D758F]/60">
          <GitCommit size={12} />
          <span>{person.commits} commits</span>
        </div>

        {person.profileUrl && (
          <a
            href={person.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 text-[10px] font-bold text-[#149A9B] hover:underline"
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
              className="inline-flex items-center gap-2.5 px-7 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 shadow-raised hover:shadow-raised-hover active:shadow-sunken-subtle"
              style={{ background: "#149A9B" }}
            >
              Show more ({totalContributors - displayCount} remaining)
              <ChevronDown size={16} />
            </button>
            <p className="mt-3 text-xs text-[#6D758F]">
              Showing {displayCount} of {totalContributors} contributors
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ContributorsSection;
