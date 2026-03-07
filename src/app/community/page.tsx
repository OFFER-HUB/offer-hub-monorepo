import HeroRepoStatsSection from "@/components/community/HeroRepoStatsSection";
import ContributorsSection from "@/components/community/ContributorsSection";
import HowToContribute from "@/components/community/HowToContribute";
import RecentPRsSection from "@/components/community/RecentPRsSection";
import OpenIssuesSection from "@/components/community/OpenIssuesSection";
import RepoLinksSection from "@/components/community/RepoLinksSection";
import CommunityChannelsSection from "@/components/community/CommunityChannelsSection";
import RegistrationForm from "@/components/community/RegistrationForm";
import LoadingBar from "@/components/ui/LoadingBar";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

interface RepoStats {
  stars: string;
  forks: string;
  contributors: string;
  openIssues: string;
}

interface Contributor {
  login: string;
  avatar_url: string;
  contributions: number;
  html_url: string;
}

interface ContributorData {
  name: string;
  username: string;
  avatar: string;
  commits: number;
  profileUrl: string;
}

interface PullRequestData {
  number: number;
  title: string;
  author: string;
  mergedAt: string;
  url: string;
  status: string;
}

interface IssueData {
  number: number;
  title: string;
  priority: string;
  url: string;
  labels: string[];
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

const REPOS = [
  'OFFER-HUB/offer-hub-monorepo',
  'OFFER-HUB/OFFER-HUB',
  'OFFER-HUB/OFFER-HUB-Frontend'
];

// In-memory cache for GitHub data (survives hot reloads in dev)
let githubCache: { data: ReturnType<typeof processGitHubData> | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

function processGitHubData(validData: NonNullable<Awaited<ReturnType<typeof fetchRepoData>>>[]) {
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
    .filter(pr => pr.merged_at !== null)
    .map(pr => ({ number: pr.number, title: pr.title, author: pr.user?.login || "Unknown", mergedAt: pr.merged_at!, url: pr.html_url, status: "Merged" }))
    .sort((a, b) => new Date(b.mergedAt).getTime() - new Date(a.mergedAt).getTime());
  const pullRequests: PullRequestData[] = allPRs.slice(0, 30).map(pr => ({ ...pr, mergedAt: formatTimeAgo(pr.mergedAt) }));

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
  const issues: IssueData[] = allIssues.slice(0, 50).map(({ createdAt: _, ...rest }) => rest);

  return { stats, contributors, pullRequests, issues };
}

async function fetchRepoData(repo: string) {
  const cacheOpts = { next: { revalidate: 7200 } };
  const [repoRes, contribRes, prRes, issueRes] = await Promise.all([
    fetch(`https://api.github.com/repos/${repo}`, cacheOpts),
    fetch(`https://api.github.com/repos/${repo}/contributors?per_page=100`, cacheOpts),
    fetch(`https://api.github.com/repos/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=10`, cacheOpts),
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

async function fetchGitHubData() {
  // Return cached data if still fresh
  if (githubCache.data && Date.now() - githubCache.timestamp < CACHE_TTL) {
    return githubCache.data;
  }

  try {
    const allPills = await Promise.all(REPOS.map(fetchRepoData));

    const validData = allPills.filter((d): d is NonNullable<typeof d> => d !== null);

    if (validData.length === 0) throw new Error('Failed to fetch any repo data');

    const result = processGitHubData(validData);
    githubCache = { data: result, timestamp: Date.now() };
    return result;
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    return {
      stats: {
        stars: "8.2k",
        forks: "1.4k",
        contributors: "168",
        openIssues: "128",
      },
      contributors: [
        { name: "Ada M.", username: "ada-m", avatar: "", commits: 248, profileUrl: "" },
        { name: "Dami O.", username: "dami-o", avatar: "", commits: 133, profileUrl: "" },
        { name: "Hassan K.", username: "hassan-k", avatar: "", commits: 92, profileUrl: "" },
        { name: "Lina S.", username: "lina-s", avatar: "", commits: 87, profileUrl: "" },
        { name: "Marta P.", username: "marta-p", avatar: "", commits: 76, profileUrl: "" },
        { name: "Tomi A.", username: "tomi-a", avatar: "", commits: 70, profileUrl: "" },
      ],
      pullRequests: [
        { number: 1042, title: "feat: add account-level escrow analytics", author: "contributor1", mergedAt: "2 days ago", url: "", status: "Merged" },
        { number: 1039, title: "refactor: simplify wallet sync flow", author: "contributor2", mergedAt: "3 days ago", url: "", status: "Merged" },
        { number: 1036, title: "fix: resolve pagination edge case in jobs feed", author: "contributor3", mergedAt: "5 days ago", url: "", status: "Merged" },
        { number: 1033, title: "docs: add validator onboarding guide", author: "contributor4", mergedAt: "1 week ago", url: "", status: "Merged" },
      ],
      issues: [
        { number: 1055, title: "Improve CI cache invalidation strategy", priority: "Medium", url: "", labels: [] },
        { number: 1051, title: "Add e2e tests for payout cancellation", priority: "High", url: "", labels: [] },
        { number: 1048, title: "Expose webhook replay in dashboard", priority: "Low", url: "", labels: [] },
        { number: 1046, title: "Polish mobile nav focus styles", priority: "Low", url: "", labels: [] },
      ],
    };
  }
}

export default async function CommunityPage() {
  const { stats, contributors, pullRequests, issues } = await fetchGitHubData();

  return (
    <>
      <LoadingBar />
      <Navbar />
      <main className="pt-28">
        <HeroRepoStatsSection stats={stats} />
        <RepoLinksSection />
        <ContributorsSection contributors={contributors} />
        <RecentPRsSection pullRequests={pullRequests} />
        <OpenIssuesSection issues={issues} />
        <HowToContribute />
        <CommunityChannelsSection />
        <RegistrationForm />
      </main>
      <Footer />
    </>
  );
}
