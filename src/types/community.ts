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

export interface PullRequestData {
  number: number;
  title: string;
  author: string;
  timestamp: string;
  url: string;
  status: 'Open' | 'Merged' | 'Closed';
}

export interface CommunityData {
  stats: RepoStats | null;
  contributors: ContributorData[];
  pullRequests: PullRequestData[];
  issues: IssueData[];
}
