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

const mockContributors: Contributor[] = [
  { name: "Ada M.", username: "ada-m", area: "Core Protocol", commits: 248 },
  { name: "Dami O.", username: "dami-o", area: "Frontend", commits: 133 },
  { name: "Hassan K.", username: "hassan-k", area: "DevRel", commits: 92 },
  { name: "Lina S.", username: "lina-s", area: "Tooling", commits: 87 },
  { name: "Marta P.", username: "marta-p", area: "QA", commits: 76 },
  { name: "Tomi A.", username: "tomi-a", area: "Docs", commits: 70 },
  { name: "Carlos R.", username: "carlos-r", area: "Backend", commits: 64 },
  { name: "Femi B.", username: "femi-b", area: "Smart Contracts", commits: 58 },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ContributorGrid({ contributors }: ContributorGridProps) {
  const data = contributors ?? mockContributors;

  return (
    <section id="contributor-grid" className="py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionHeading
          eyebrow="Community"
          title="Our Contributors"
          subtitle="The people building and shipping OFFER-HUB every day."
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {data.map((contributor) => (
            <article
              key={contributor.username}
              className="rounded-2xl p-6 shadow-neu-raised bg-bg-elevated flex flex-col items-center text-center transition-shadow duration-300 hover:shadow-neu-raised-hover"
            >
              <div
                className="w-16 h-16 rounded-full shadow-neu-sunken-subtle bg-theme-primary flex items-center justify-center text-lg font-bold text-white"
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
