import type { PullRequestData } from "@/types/community";
import { logger } from '@/utils/logger';

/* -------------------------------------------------------------------------- */
/*                              Public data shapes                             */
/* -------------------------------------------------------------------------- */

export interface RepoStats {
  stars: string;
  forks: string;
  contributors: string;
  openIssues: string;
}

export interface ContributorData {
  name: string;
  username: string;
  avatar: string;
  commits: number;
  profileUrl: string;
}

export interface IssueData {
  number: number;
  title: string;
  priority: string;
  url: string;
  labels: string[];
}

export interface CommunityData {
  stats: RepoStats | null;
  contributors: ContributorData[];
  pullRequests: PullRequestData[];
  issues: IssueData[];
}

export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  changes: string[];
}

/* -------------------------------------------------------------------------- */
/*                            Raw GitHub API shapes                            */
/* -------------------------------------------------------------------------- */

interface Contributor {
  login: string;
  avatar_url: string;
  contributions: number;
  html_url: string;
}

interface GitHubRepo {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
}

interface GitHubPullRequest {
  number: number;
  title: string;
  html_url: string;
  state: string;
  created_at: string;
  merged_at: string | null;
  user: {
    login: string;
  } | null;
}

interface GitHubIssue {
  number: number;
  title: string;
  html_url: string;
  pull_request?: object;
  created_at?: string;
  labels: Array<{
    name: string;
  }>;
}

interface GitHubRelease {
  tag_name: string;
  name: string | null;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  published_at: string | null;
  created_at: string;
}

/* -------------------------------------------------------------------------- */
/*                                  Community                                  */
/* -------------------------------------------------------------------------- */

const REPOS = [
  'OFFER-HUB/offer-hub-monorepo',
  'OFFER-HUB/OFFER-HUB',
  'OFFER-HUB/OFFER-HUB-Frontend'
];

const formatNumber = (num: number): string => {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "today";
  if (diffInDays === 1) return "1 day ago";
  if (diffInDays < 7) return `${diffInDays} days ago`;
  if (diffInDays < 14) return "1 week ago";
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
  if (diffInDays < 60) return "1 month ago";
  return `${Math.floor(diffInDays / 30)} months ago`;
}

async function fetchRepoData(repo: string) {
  const cacheOpts = { next: { revalidate: 600 } };
  const [repoRes, contribRes, prRes, issueRes] = await Promise.all([
    fetch(`https://api.github.com/repos/${repo}`, cacheOpts),
    fetch(`https://api.github.com/repos/${repo}/contributors?per_page=100`, cacheOpts),
    fetch(`https://api.github.com/repos/${repo}/pulls?state=all&sort=updated&direction=desc&per_page=20`, cacheOpts),
    fetch(`https://api.github.com/repos/${repo}/issues?state=open&sort=created&direction=desc&per_page=20`, cacheOpts),
  ]);

  if (!repoRes.ok || !contribRes.ok || !prRes.ok || !issueRes.ok) return null;

  return {
    repo: await repoRes.json() as GitHubRepo,
    contributors: await contribRes.json() as Contributor[],
    pullRequests: await prRes.json() as GitHubPullRequest[],
    issues: await issueRes.json() as GitHubIssue[],
  };
}

function processGitHubData(validData: NonNullable<Awaited<ReturnType<typeof fetchRepoData>>>[]): CommunityData {
  const totalStars = validData.reduce((acc, d) => acc + d.repo.stargazers_count, 0);
  const totalForks = validData.reduce((acc, d) => acc + d.repo.forks_count, 0);
  const totalOpenIssues = validData.reduce((acc, d) => acc + d.repo.open_issues_count, 0);

  const contribMap = new Map<string, ContributorData>();
  validData.forEach(d => {
    d.contributors.forEach(c => {
      const existing = contribMap.get(c.login);
      if (existing) {
        existing.commits += c.contributions;
      } else {
        contribMap.set(c.login, {
          name: c.login, username: c.login, avatar: c.avatar_url,
          commits: c.contributions, profileUrl: c.html_url
        });
      }
    });
  });
  const contributors = Array.from(contribMap.values()).sort((a, b) => b.commits - a.commits);

  const stats: RepoStats = {
    stars: formatNumber(totalStars), forks: formatNumber(totalForks),
    contributors: formatNumber(contributors.length), openIssues: formatNumber(totalOpenIssues),
  };

  const allPRs = validData.flatMap(d => d.pullRequests)
    .map(pr => ({
      number: pr.number,
      title: pr.title,
      author: pr.user?.login || "Unknown",
      timestamp: pr.state === 'open' ? pr.created_at : pr.merged_at || pr.created_at,
      url: pr.html_url,
      status: (pr.state === 'open' ? 'Open' : 'Merged') as 'Open' | 'Merged' | 'Closed'
    }))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const pullRequests: PullRequestData[] = allPRs.slice(0, 30).map(pr => ({ ...pr, timestamp: formatTimeAgo(pr.timestamp) }));

  const allIssues = validData.flatMap(d => d.issues)
    .filter(issue => !issue.pull_request)
    .map(issue => {
      const priorityLabel = issue.labels.find(label => label.name.toLowerCase().includes('priority'));
      let priority = "Medium";
      if (priorityLabel) {
        const labelName = priorityLabel.name.toLowerCase();
        if (labelName.includes('high') || labelName.includes('critical')) priority = "High";
        else if (labelName.includes('low')) priority = "Low";
      }
      return { number: issue.number, title: issue.title, priority, url: issue.html_url, labels: issue.labels.map(l => l.name), createdAt: issue.created_at || "" };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const issues: IssueData[] = allIssues.slice(0, 50).map(({ number, title, priority, url, labels }) => ({
    number,
    title,
    priority,
    url,
    labels,
  }));

  return { stats, contributors, pullRequests, issues };
}

export async function fetchCommunityData() {
  try {
    const allPills = await Promise.all(REPOS.map(fetchRepoData));

    const validData = allPills.filter((d): d is NonNullable<typeof d> => d !== null);

    if (validData.length === 0) throw new Error('Failed to fetch any repo data');

    return processGitHubData(validData);
  } catch (error) {
    logger.error('Error fetching GitHub data:', error);
    return {
      stats: null,
      contributors: [],
      pullRequests: [],
      issues: [],
    } as CommunityData;
  }
}

/* -------------------------------------------------------------------------- */
/*                                  Changelog                                  */
/* -------------------------------------------------------------------------- */

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

export async function fetchChangelogEntries(): Promise<{ entries: ChangelogEntry[]; hasError: boolean }> {
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
    logger.error("Failed to fetch GitHub releases:", error);
    return { entries: [], hasError: true };
  }
}
