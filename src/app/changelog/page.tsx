import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "Track the evolution of OFFER-HUB — platform updates, new features, and release notes from the official GitHub releases.",
  openGraph: {
    title: "Changelog | OFFER-HUB",
    description:
      "Track the evolution of OFFER-HUB — platform updates, new features, and release notes.",
  },
};

interface GitHubRelease {
  tag_name: string;
  name: string | null;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  published_at: string | null;
  created_at: string;
}

interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  changes: string[];
}

const RELEASES_API_URL = "https://api.github.com/repos/OFFER-HUB/offer-hub-monorepo/releases";

function formatReleaseDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(dateString));
}

function removeMarkdownInlineSyntax(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .trim();
}

function parseReleaseBody(body: string | null): Pick<ChangelogEntry, "description" | "changes"> {
  const rawBody = body?.trim();

  if (!rawBody) {
    return {
      description: "No release notes were provided for this version.",
      changes: ["See full release details on GitHub."],
    };
  }

  const lines = rawBody
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const changes = lines
    .map((line) => line.match(/^[-*+]\s+(.+)$/)?.[1] ?? line.match(/^\d+\.\s+(.+)$/)?.[1] ?? null)
    .filter((line): line is string => Boolean(line))
    .map(removeMarkdownInlineSyntax);

  const firstMeaningfulLine = lines.find(
    (line) => !/^[-*+]\s+/.test(line) && !/^\d+\.\s+/.test(line) && !/^#+\s+/.test(line),
  );

  return {
    description: firstMeaningfulLine
      ? removeMarkdownInlineSyntax(firstMeaningfulLine)
      : "Release notes are available in the full GitHub release details.",
    changes: changes.length > 0 ? changes : ["See full release details on GitHub."],
  };
}

function getReleaseBadge(release: Pick<GitHubRelease, "draft" | "prerelease">): Pick<ChangelogEntry, "badge" | "badgeColor"> {
  if (release.draft) {
    return {
      badge: "Draft",
      badgeColor: "bg-content-secondary/10 text-content-secondary",
    };
  }

  if (release.prerelease) {
    return {
      badge: "Pre-release",
      badgeColor: "bg-theme-warning/10 text-theme-warning",
    };
  }

  return {
    badge: "Release",
    badgeColor: "bg-theme-success/10 text-theme-success",
  };
}

function mapReleaseToEntry(release: GitHubRelease): ChangelogEntry {
  const { description, changes } = parseReleaseBody(release.body);
  const badge = getReleaseBadge(release);

  return {
    version: release.tag_name,
    date: formatReleaseDate(release.published_at ?? release.created_at),
    title: release.name?.trim() || `Release ${release.tag_name}`,
    description,
    changes,
    ...badge,
  };
}

async function fetchChangelogEntries(): Promise<{ entries: ChangelogEntry[]; hasError: boolean }> {
  try {
    const response = await fetch(RELEASES_API_URL, {
      next: { revalidate: 3600 },
      headers: {
        Accept: "application/vnd.github+json",
      },
    });

    if (!response.ok) {
      return { entries: [], hasError: true };
    }

    const releases = (await response.json()) as GitHubRelease[];

    return {
      entries: releases.map(mapReleaseToEntry),
      hasError: false,
    };
  } catch (error) {
    console.error("Failed to fetch GitHub releases:", error);
    return { entries: [], hasError: true };
  }
}

export default async function ChangelogPage() {
  const { entries: changelogEntries, hasError } = await fetchChangelogEntries();

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      {/* Subtle teal glow centered */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_45%_at_50%_50%,rgba(20,154,155,0.07)_0%,transparent_70%)]" />
      <Navbar />

      <main className="flex-grow pt-32 pb-24 px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="text-center mb-24 animate-fadeInUp">
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-theme-primary mb-4">Evolution</p>
            <h1 className="text-4xl md:text-6xl font-black text-content-primary tracking-tighter leading-none mb-6">
              Platform <span className="text-theme-primary">Updates</span>
            </h1>
            <p className="text-lg text-content-secondary font-medium max-w-2xl mx-auto leading-relaxed">
              Tracking the progress of the Offer Hub ecosystem as we build the foundations of trustless commerce.
            </p>
          </header>

          {/* Timeline Wrapper */}
          <div className="relative">
            {/* Improved Timeline Line */}
            <div className="absolute left-6 md:left-1/2 top-4 bottom-4 w-1 transform md:-translate-x-1/2 bg-theme-primary/10 dark:bg-theme-primary/30 rounded-full" />

            {changelogEntries.length === 0 ? (
              <div className="pl-12 md:pl-0">
                <div className="max-w-2xl mx-auto bg-bg-elevated rounded-[2.5rem] p-8 md:p-10 shadow-neu-raised text-center">
                  <h2 className="text-2xl font-black text-content-primary tracking-tight mb-4">
                    No releases published yet
                  </h2>
                  <p className="text-content-secondary text-sm md:text-base font-medium leading-relaxed">
                    {hasError
                      ? "We couldn’t load GitHub Releases right now. Please try again shortly."
                      : "As soon as a GitHub release is published, it will appear here automatically."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-16 md:space-y-24">
                {changelogEntries.map((entry, index) => (
                <div
                  key={entry.version}
                  className={`relative flex flex-col md:flex-row items-start md:items-center md:justify-between ${index % 2 === 0 ? "md:flex-row-reverse" : ""
                    }`}
                >
                  {/* Neumorphic Dot on timeline */}
                  <div className="absolute left-6 md:left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-bg-base shadow-neu-raised-sm z-10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-theme-primary" />
                  </div>

                  {/* Date (for desktop, alternates side) */}
                  <div
                    className={`hidden md:block w-5/12 ${index % 2 === 0 ? "text-left" : "text-right"}`}
                  >
                    <span className="text-sm font-black text-content-primary uppercase tracking-widest opacity-40">
                      {entry.date}
                    </span>
                  </div>

                  {/* Enhanced Card content */}
                  <div className="w-full md:w-5/12 pl-12 md:pl-0">
                    <div className="bg-bg-elevated rounded-[2.5rem] p-8 md:p-10 shadow-neu-raised hover:shadow-neu-raised-hover transition-all duration-500 ease-out group">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-black text-content-primary tracking-tight group-hover:text-theme-primary transition-colors">
                            {entry.version}
                          </span>
                          <span
                            className={`${entry.badgeColor} text-[9px] uppercase font-black px-3 py-1 rounded-full tracking-widest shadow-neu-raised-sm`}
                          >
                            {entry.badge}
                          </span>
                        </div>
                        <span className="text-xs font-black text-content-secondary block md:hidden uppercase tracking-widest opacity-60">
                          {entry.date}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-content-primary mb-4">
                        {entry.title}
                      </h3>
                      <p className="text-content-secondary text-sm font-medium leading-relaxed mb-6">
                        {entry.description}
                      </p>

                      <ul className="space-y-3">
                        {entry.changes.map((change, i) => (
                          <li
                            key={change}
                            className="flex items-start gap-3 text-sm font-medium text-content-primary/80"
                          >
                            <span className="mt-2 h-1 w-1 rounded-full bg-theme-primary shrink-0" />
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
