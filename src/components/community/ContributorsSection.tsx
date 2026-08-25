"use client";

import { useState, memo } from "react";
import { Users, GitCommit, ChevronDown } from "lucide-react";
import { SectionHeading } from "@/components/community/SectionHeading";
import Image from "next/image";
import type { ContributorData } from "@/types/community";

interface ContributorsSectionProps {
  contributors: ContributorData[];
}

// Memoized contributor card to prevent unnecessary re-renders
const ContributorCard = memo(function ContributorCard({ person }: { person: ContributorData }) {
  return (
    <article className="group relative rounded-3xl bg-bg-base p-6 shadow-neu-raised transition-[box-shadow,transform] duration-300 hover:shadow-neu-raised-hover hover:-translate-y-1 min-w-0 overflow-hidden">
      <div className="flex flex-col items-center text-center gap-4 min-w-0">
        {person.avatar ? (
          <div className="p-1 rounded-full bg-bg-base shadow-neu-sunken-subtle group-hover:shadow-neu-sunken transition-shadow">
            <Image
              src={person.avatar}
              alt={person.name}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-bg-base flex items-center justify-center shadow-neu-sunken-subtle">
            <Users size={24} className="text-content-secondary" />
          </div>
        )}

        <div className="min-w-0 w-full max-w-full">
          <h3 className="text-base font-black text-content-primary truncate tracking-tight">
            {person.name || person.username}
          </h3>
          <p className="text-[11px] font-black uppercase tracking-widest text-theme-primary mt-1 truncate">
            @{person.username}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-base shadow-neu-sunken-subtle text-[10px] font-bold uppercase tracking-wider text-content-secondary">
          <GitCommit size={14} className="text-theme-primary/60" />
          <span>{person.commits} commits</span>
        </div>

        {person.profileUrl && (
          <a
            href={person.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 p-2 rounded-lg bg-bg-base shadow-neu-raised-sm text-[10px] font-black uppercase tracking-widest text-theme-primary hover:shadow-neu-sunken-subtle active:shadow-neu-sunken transition-shadow max-w-full overflow-hidden truncate flex items-center min-h-11"
          >
            Profile
          </a>
        )}
      </div>
    </article>
  );
});

export const ContributorsSection = ({ contributors }: ContributorsSectionProps) => {
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
          subtitle={
            totalContributors > 0
              ? `Meet the developers shipping OFFER-HUB every day. A growing community of ${totalContributors} contributors.`
              : "Contributor data is temporarily unavailable while we reconnect to GitHub."
          }
        />

        {totalContributors > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 mt-12">
            {visibleContributors.map((person) => (
              <ContributorCard key={person.username} person={person} />
            ))}
          </div>
        ) : (
          <div className="mt-12 rounded-3xl bg-bg-base p-8 shadow-neu-raised">
            <p className="text-sm font-black uppercase tracking-widest text-content-primary">
              Contributors temporarily unavailable
            </p>
            <p className="mt-3 text-sm text-content-secondary">
              We could not load live contributor activity right now. Please try again shortly.
            </p>
          </div>
        )}

        {hasMore && (
          <div className="mt-16 text-center">
            <button
              onClick={handleLoadMore}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white transition-[background-color,box-shadow,transform] duration-300 btn-neumorphic-primary group"
            >
              Show more creators
              <ChevronDown size={14} className="group-hover:translate-y-1 transition-transform" />
            </button>
            <p className="mt-6 text-[10px] font-bold uppercase tracking-widest text-content-muted">
              Displaying {displayCount} of {totalContributors} contributors
            </p>
          </div>
        )}
      </div>
    </section>
  );
};


