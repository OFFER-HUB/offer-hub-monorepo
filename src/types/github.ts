export interface Contributor {
  login: string;
  avatar_url: string;
  contributions: number;
  html_url: string;
}

export interface GitHubRepo {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
}

export interface GitHubPullRequest {
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

export interface GitHubIssue {
  number: number;
  title: string;
  html_url: string;
  pull_request?: object;
  created_at?: string;
  labels: Array<{
    name: string;
  }>;
}

export interface GitHubRelease {
  tag_name: string;
  name: string | null;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  published_at: string | null;
  created_at: string;
}
