import { ArrowRight, GitMerge, Plus, Minus } from "lucide-react";

export interface PullRequest {
  number: number;
  title: string;
  author: string;
  mergedAt: string;
  additions: number;
  deletions: number;
  labels: string[];
  url: string;
  repository?: string;
}

// Inline card — will be replaced by <PRCard> once issue #1016 is merged
const AVATAR_COLORS = [
  "#149A9B",
  "#0d7377",
  "#15944C",
  "#002333",
  "#1bc8ca",
  "#0d9fa0",
];

function PRCardInline({ pr }: { pr: PullRequest }) {
  const initials = pr.author.slice(0, 2).toUpperCase();
  const avatarColor =
    AVATAR_COLORS[pr.author.charCodeAt(0) % AVATAR_COLORS.length];

  return (
    <a
      href={pr.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-5 rounded-2xl bg-bg-base shadow-neu-raised transition-shadow duration-[400ms] ease-out hover:shadow-neu-raised-hover active:shadow-neu-sunken-subtle h-full"
    >
      {/* Header: PR number + Merged badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-theme-primary">
          #{pr.number}
          {pr.repository && (
            <span className="ml-1 font-normal text-content-secondary">
              · {pr.repository}
            </span>
          )}
        </span>
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold shadow-neu-raised-sm bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400"
        >
          <GitMerge size={11} />
          Merged
        </span>
      </div>

      {/* Title */}
      <h3
        className="text-sm font-semibold leading-snug mb-3 text-content-primary"
      >
        {pr.title}
      </h3>

      {/* Labels */}
      {pr.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {pr.labels.map((label) => (
            <span
              key={label}
              className="px-2 py-0.5 rounded-full text-[11px] font-medium shadow-neu-raised-sm bg-bg-base text-content-secondary border border-theme-border"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Footer: author avatar + name + line stats + date */}
      <div className="flex items-center justify-between mt-auto pt-1">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-full shadow-neu-raised-sm flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 select-none"
            style={{ background: avatarColor }}
            aria-label={`Avatar for ${pr.author}`}
          >
            {initials}
          </div>
          <span className="text-xs font-medium text-content-secondary">
            {pr.author}
          </span>
        </div>

        <div className="flex items-center gap-2.5 text-xs font-semibold">
          <span
            className="flex items-center gap-0.5 text-theme-success"
            title={`${pr.additions} additions`}
          >
            <Plus size={11} strokeWidth={2.5} />
            {pr.additions}
          </span>
          <span
            className="flex items-center gap-0.5 text-theme-error"
            title={`${pr.deletions} deletions`}
          >
            <Minus size={11} strokeWidth={2.5} />
            {pr.deletions}
          </span>
          <span className="font-normal text-content-secondary">
            {pr.mergedAt}
          </span>
        </div>
      </div>
    </a>
  );
}

const MOCK_PRS: PullRequest[] = [
  {
    number: 1053,
    title: "feat: build MDX documentation system with sidebar and table-of-contents navigation",
    author: "akintewe",
    mergedAt: "2 days ago",
    additions: 847,
    deletions: 12,
    labels: ["enhancement", "frontend", "docs"],
    url: "https://github.com/OFFER-HUB/offer-hub-monorepo/pull/1053",
    repository: "offer-hub-monorepo",
  },
  {
    number: 1045,
    title: "fix: resolve Stellar SDK escrow release logic for dispute resolution edge cases",
    author: "DiegoERS",
    mergedAt: "4 days ago",
    additions: 213,
    deletions: 58,
    labels: ["bug", "backend", "stellar"],
    url: "https://github.com/OFFER-HUB/offer-hub-monorepo/pull/1045",
    repository: "offer-hub-monorepo",
  },
  {
    number: 1038,
    title: "feat: implement multi-currency support for stablecoin settlements on checkout",
    author: "lunavera",
    mergedAt: "1 week ago",
    additions: 512,
    deletions: 34,
    labels: ["enhancement", "payments"],
    url: "https://github.com/OFFER-HUB/offer-hub-monorepo/pulls",
    repository: "offer-hub-monorepo",
  },
  {
    number: 1031,
    title: "chore: upgrade Stellar SDK to v11.3 and resolve breaking API changes",
    author: "stellardev",
    mergedAt: "1 week ago",
    additions: 189,
    deletions: 201,
    labels: ["chore", "dependencies"],
    url: "https://github.com/OFFER-HUB/offer-hub-monorepo/pulls",
    repository: "offer-hub-monorepo",
  },
  {
    number: 1024,
    title: "feat: add real-time transaction status feed with WebSocket event streaming",
    author: "opendev42",
    mergedAt: "2 weeks ago",
    additions: 634,
    deletions: 22,
    labels: ["enhancement", "frontend", "real-time"],
    url: "https://github.com/OFFER-HUB/offer-hub-monorepo/pulls",
    repository: "offer-hub-monorepo",
  },
  {
    number: 1018,
    title: "docs: improve API reference for webhook endpoints, event types and retry policies",
    author: "techwriter_k",
    mergedAt: "3 weeks ago",
    additions: 298,
    deletions: 45,
    labels: ["docs", "api"],
    url: "https://github.com/OFFER-HUB/offer-hub-monorepo/pulls",
    repository: "offer-hub-monorepo",
  },
];

interface RecentPRsFeedProps {
  pullRequests?: PullRequest[];
}

export default function RecentPRsFeed({ pullRequests }: RecentPRsFeedProps) {
  const prs = pullRequests ?? MOCK_PRS;

  return (
    <section id="recent-prs" className="py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16 animate-fadeInUp">
          <p
            className="text-xs font-medium uppercase tracking-[0.4em] mb-4 text-theme-primary"
          >
            Open Source · Community
          </p>
          <h2
            className="text-4xl md:text-5xl font-black tracking-tight text-content-primary"
          >
            Recent Contributions
          </h2>
          <p
            className="mt-4 text-lg font-light max-w-xl mx-auto text-content-secondary"
          >
            The community ships fast. See the latest merged pull requests
            driving OFFER HUB forward.
          </p>
        </div>

        {/* PR grid — 1 col mobile, 2 col desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prs.map((pr) => (
            <div key={pr.number}>
              <PRCardInline pr={pr} />
            </div>
          ))}
        </div>

        {/* View all PRs CTA */}
        <div className="flex justify-center mt-12">
          <a
            href="https://github.com/OFFER-HUB/offer-hub-monorepo/pulls?q=is%3Apr+is%3Amerged"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-[400ms] ease-out shadow-neu-raised hover:shadow-neu-raised-hover active:shadow-neu-sunken-subtle bg-theme-primary hover:bg-theme-primary-hover"
          >
            View all PRs
            <ArrowRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}
