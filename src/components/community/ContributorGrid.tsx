import { AlertCircle } from "lucide-react";
import SectionHeading from "@/components/community/SectionHeading";

interface Contributor {
  name: string;
  username: string;
  area: string;
  commits: number;
}

interface ContributorGridProps {
  contributors?: Contributor[];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ContributorGrid({ contributors }: ContributorGridProps) {
  const hasData = contributors && contributors.length > 0;

  return (
    <section id="contributor-grid" className="py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionHeading
          eyebrow="Community"
          title="Our Contributors"
          subtitle="The people building and shipping OFFER-HUB every day."
        />

        {hasData ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {contributors.map((contributor) => (
              <article
                key={contributor.username}
                className="rounded-2xl p-6 shadow-neu-raised bg-bg-elevated flex flex-col items-center text-center hover:shadow-neu-raised-hover transition-shadow duration-300"
              >
                <div
                  className="w-16 h-16 rounded-full shadow-neu-raised-sm flex items-center justify-center text-lg font-bold text-white bg-theme-primary"
                >
                  {getInitials(contributor.name)}
                </div>
                <h3 className="mt-4 text-base font-bold text-content-primary">
                  {contributor.name}
                </h3>
                <p className="mt-1 text-xs font-light text-content-secondary">
                  {contributor.area}
                </p>
                <p className="mt-3 text-sm font-medium text-theme-primary">
                  {contributor.commits} commits
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 rounded-2xl shadow-neu-raised bg-bg-elevated">
            <AlertCircle size={24} className="text-content-muted" />
            <p className="mt-3 text-sm font-semibold text-content-secondary">
              Contributors temporarily unavailable
            </p>
            <p className="mt-1 text-xs text-content-muted">
              We&apos;re fetching live contributor data from GitHub.
            </p>
          </div>
        )}

        <div className="mt-12 text-center">
          <a
            href="https://github.com/OFFER-HUB/offer-hub-monorepo/graphs/contributors"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-[400ms] ease-out border border-theme-primary text-theme-primary hover:shadow-neu-raised-hover"
          >
            View all on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
