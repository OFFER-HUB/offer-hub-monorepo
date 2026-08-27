import { SectionHeading } from "@/components/community/SectionHeading";
import { GITHUB_REPO_URL } from "@/constants/github";

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

export function ContributorGrid({ contributors }: ContributorGridProps) {
  const data = contributors ?? [];

  return (
    <section id="contributor-grid" className="py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionHeading
          eyebrow="Community"
          title="Our Contributors"
          subtitle="The people building and shipping OFFER-HUB every day."
        />

        {data.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.map((contributor) => (
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
          <div className="rounded-2xl p-6 shadow-neu-raised bg-bg-elevated text-center">
            <p className="text-base font-bold text-content-primary">
              Contributors temporarily unavailable
            </p>
            <p className="mt-2 text-sm text-content-secondary">
              Live contributor activity could not be loaded from GitHub.
            </p>
          </div>
        )}

        <div className="mt-12 text-center">
          <a
                        href={`${GITHUB_REPO_URL}/graphs/contributors`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 rounded-xl text-sm font-semibold transition-shadow duration-[400ms] ease-out border border-theme-primary text-theme-primary hover:shadow-neu-raised-hover"
          >
            View all on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
