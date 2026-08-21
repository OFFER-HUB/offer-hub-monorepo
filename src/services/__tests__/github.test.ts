import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GITHUB_RELEASES_API_URL } from "@/constants/github";

vi.mock("@/utils/logger", () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { fetchCommunityData, fetchChangelogEntries } from "../github";
import { logger } from "@/utils/logger";

/* -------------------------------------------------------------------------- */
/*                                  Fixtures                                   */
/* -------------------------------------------------------------------------- */

const REPOS = [
  "OFFER-HUB/offer-hub-monorepo",
  "OFFER-HUB/OFFER-HUB",
  "OFFER-HUB/OFFER-HUB-Frontend",
];

/** A day in ms — used to build deterministic "N days ago" timestamps. */
const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY).toISOString();

function repoPayload(over: Record<string, number> = {}) {
  return {
    stargazers_count: 400,
    forks_count: 200,
    open_issues_count: 10,
    ...over,
  };
}

function contributor(login: string, contributions: number) {
  return {
    login,
    contributions,
    avatar_url: `https://avatars.example/${login}.png`,
    html_url: `https://github.com/${login}`,
  };
}

function pullRequest(over: Record<string, unknown> = {}) {
  return {
    number: 1,
    title: "A pull request",
    user: { login: "octocat" },
    state: "open",
    created_at: daysAgo(1),
    merged_at: null,
    html_url: "https://github.com/x/pull/1",
    ...over,
  };
}

function issue(over: Record<string, unknown> = {}) {
  return {
    number: 10,
    title: "An issue",
    labels: [] as { name: string }[],
    html_url: "https://github.com/x/issues/10",
    created_at: daysAgo(1),
    ...over,
  };
}

type RepoFixture = {
  repo?: ReturnType<typeof repoPayload>;
  contributors?: ReturnType<typeof contributor>[];
  pulls?: ReturnType<typeof pullRequest>[];
  issues?: ReturnType<typeof issue>[];
  /** When set, every endpoint for this repo responds non-ok. */
  failing?: boolean;
};

const ok = (body: unknown) => ({ ok: true, json: async () => body });
const notOk = { ok: false, json: async () => ({}) };

/**
 * Routes the 4 community endpoints per repo. Anything unrecognised responds
 * non-ok so an unexpected call surfaces as a failure rather than a hang.
 */
function stubCommunityFetch(fixtures: Record<string, RepoFixture>) {
  const fetchMock = vi.fn(async (url: string) => {
    // Match the owner/name pair exactly — "OFFER-HUB/OFFER-HUB" is a prefix of
    // "OFFER-HUB/OFFER-HUB-Frontend", so a substring check mixes up the repos.
    const path = url.split("/repos/")[1] ?? "";
    const repo = path.split("?")[0].split("/").slice(0, 2).join("/");
    const f = fixtures[repo];
    if (!f || f.failing) return notOk;
    if (url.includes("/contributors")) return ok(f.contributors ?? []);
    if (url.includes("/pulls")) return ok(f.pulls ?? []);
    if (url.includes("/issues")) return ok(f.issues ?? []);
    return ok(f.repo ?? repoPayload());
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

/* -------------------------------------------------------------------------- */

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchCommunityData", () => {
  it("queries the four endpoints for each of the three repos with revalidation", async () => {
    const fetchMock = stubCommunityFetch({
      [REPOS[0]]: {},
      [REPOS[1]]: {},
      [REPOS[2]]: {},
    });

    await fetchCommunityData();

    expect(fetchMock).toHaveBeenCalledTimes(12);
    for (const repo of REPOS) {
      expect(fetchMock).toHaveBeenCalledWith(
        `https://api.github.com/repos/${repo}`,
        { next: { revalidate: 600 } },
      );
    }
  });

  it("sums stars, forks and open issues across repos and formats thousands", async () => {
    stubCommunityFetch({
      [REPOS[0]]: { repo: repoPayload({ stargazers_count: 600 }) },
      [REPOS[1]]: { repo: repoPayload({ stargazers_count: 600 }) },
      [REPOS[2]]: { repo: repoPayload({ stargazers_count: 300 }) },
    });

    const data = await fetchCommunityData();

    // 600 + 600 + 300 = 1500 -> "1.5k"; 200 * 3 = 600 stays plain.
    expect(data.stats).toEqual({
      stars: "1.5k",
      forks: "600",
      contributors: "0",
      openIssues: "30",
    });
  });

  it("merges a contributor appearing in several repos and sorts by commits", async () => {
    stubCommunityFetch({
      [REPOS[0]]: { contributors: [contributor("alice", 10), contributor("bob", 40)] },
      [REPOS[1]]: { contributors: [contributor("alice", 50)] },
      [REPOS[2]]: {},
    });

    const { contributors } = await fetchCommunityData();

    expect(contributors).toEqual([
      {
        name: "alice",
        username: "alice",
        avatar: "https://avatars.example/alice.png",
        commits: 60,
        profileUrl: "https://github.com/alice",
      },
      expect.objectContaining({ username: "bob", commits: 40 }),
    ]);
  });

  it("labels open PRs Open and non-open PRs Merged, newest first", async () => {
    stubCommunityFetch({
      [REPOS[0]]: {
        pulls: [
          pullRequest({ number: 1, state: "open", created_at: daysAgo(9) }),
          pullRequest({
            number: 2,
            state: "closed",
            created_at: daysAgo(40),
            merged_at: daysAgo(0),
          }),
        ],
      },
      [REPOS[1]]: {},
      [REPOS[2]]: {},
    });

    const { pullRequests } = await fetchCommunityData();

    expect(pullRequests.map((pr) => [pr.number, pr.status, pr.timestamp])).toEqual([
      [2, "Merged", "today"],
      [1, "Open", "1 week ago"],
    ]);
  });

  it("falls back to Unknown for a PR with no author", async () => {
    stubCommunityFetch({
      [REPOS[0]]: { pulls: [pullRequest({ user: null })] },
      [REPOS[1]]: {},
      [REPOS[2]]: {},
    });

    const { pullRequests } = await fetchCommunityData();

    expect(pullRequests[0].author).toBe("Unknown");
  });

  it("excludes pull requests that arrive on the issues endpoint", async () => {
    stubCommunityFetch({
      [REPOS[0]]: {
        issues: [
          issue({ number: 10 }),
          issue({ number: 11, pull_request: { url: "..." } }),
        ],
      },
      [REPOS[1]]: {},
      [REPOS[2]]: {},
    });

    const { issues } = await fetchCommunityData();

    expect(issues.map((i) => i.number)).toEqual([10]);
  });

  it.each([
    ["priority: critical", "High"],
    ["priority: high", "High"],
    ["priority: low", "Low"],
    ["priority: medium", "Medium"],
    ["bug", "Medium"],
  ])("derives priority %s -> %s", async (label, expected) => {
    stubCommunityFetch({
      [REPOS[0]]: { issues: [issue({ labels: [{ name: label }] })] },
      [REPOS[1]]: {},
      [REPOS[2]]: {},
    });

    const { issues } = await fetchCommunityData();

    expect(issues[0].priority).toBe(expected);
    expect(issues[0].labels).toEqual([label]);
  });

  it("caps the lists at 30 pull requests and 50 issues", async () => {
    stubCommunityFetch({
      [REPOS[0]]: {
        pulls: Array.from({ length: 40 }, (_, i) => pullRequest({ number: i })),
        issues: Array.from({ length: 60 }, (_, i) => issue({ number: i })),
      },
      [REPOS[1]]: {},
      [REPOS[2]]: {},
    });

    const { pullRequests, issues } = await fetchCommunityData();

    expect(pullRequests).toHaveLength(30);
    expect(issues).toHaveLength(50);
  });

  it("still aggregates when one repo fails entirely", async () => {
    stubCommunityFetch({
      [REPOS[0]]: { repo: repoPayload({ stargazers_count: 5 }) },
      [REPOS[1]]: { failing: true },
      [REPOS[2]]: { repo: repoPayload({ stargazers_count: 7 }) },
    });

    const { stats } = await fetchCommunityData();

    expect(stats?.stars).toBe("12");
  });

  it("returns the empty shape and logs when every repo fails", async () => {
    stubCommunityFetch({
      [REPOS[0]]: { failing: true },
      [REPOS[1]]: { failing: true },
      [REPOS[2]]: { failing: true },
    });

    await expect(fetchCommunityData()).resolves.toEqual({
      stats: null,
      contributors: [],
      pullRequests: [],
      issues: [],
    });
    expect(logger.error).toHaveBeenCalledWith(
      "Error fetching GitHub data:",
      expect.any(Error),
    );
  });

  it("returns the empty shape when the network rejects", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
    );

    const data = await fetchCommunityData();

    expect(data.stats).toBeNull();
    expect(logger.error).toHaveBeenCalled();
  });
});

/* -------------------------------------------------------------------------- */
/*                                  Changelog                                  */
/* -------------------------------------------------------------------------- */

function release(over: Record<string, unknown> = {}) {
  return {
    tag_name: "v1.2.0",
    name: "Escrow improvements",
    body: "Ships the new escrow flow.\n\n- Adds `deposit` endpoint\n- Fixes **withdrawals**",
    published_at: "2026-03-15T12:00:00Z",
    created_at: "2026-01-15T12:00:00Z",
    draft: false,
    prerelease: false,
    ...over,
  };
}

function stubReleases(body: unknown, options: { ok?: boolean } = {}) {
  const fetchMock = vi.fn(async () => ({
    ok: options.ok ?? true,
    json: async () => body,
  }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("fetchChangelogEntries", () => {
  it("requests the releases endpoint with the GitHub Accept header", async () => {
    const fetchMock = stubReleases([]);

    await fetchChangelogEntries();

    expect(fetchMock).toHaveBeenCalledWith(GITHUB_RELEASES_API_URL, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/vnd.github+json" },
    });
  });

  it("maps a release, formatting the date and stripping inline markdown", async () => {
    stubReleases([release()]);

    const { entries, hasError } = await fetchChangelogEntries();

    expect(hasError).toBe(false);
    expect(entries).toEqual([
      {
        version: "v1.2.0",
        date: "March 2026",
        title: "Escrow improvements",
        badge: "Release",
        badgeColor: "bg-theme-success/10 text-theme-success",
        description: "Ships the new escrow flow.",
        changes: ["Adds deposit endpoint", "Fixes withdrawals"],
      },
    ]);
  });

  it("falls back to created_at when the release was never published", async () => {
    stubReleases([release({ published_at: null })]);

    const { entries } = await fetchChangelogEntries();

    expect(entries[0].date).toBe("January 2026");
  });

  it("falls back to a generated title when the release has no name", async () => {
    stubReleases([release({ name: "   " })]);

    const { entries } = await fetchChangelogEntries();

    expect(entries[0].title).toBe("Release v1.2.0");
  });

  it.each([
    [{ draft: true }, "Draft"],
    [{ prerelease: true }, "Pre-release"],
    [{}, "Release"],
  ])("badges %j as %s", async (flags, badge) => {
    stubReleases([release(flags)]);

    const { entries } = await fetchChangelogEntries();

    expect(entries[0].badge).toBe(badge);
    expect(entries[0].badgeColor).toContain("/10");
  });

  it("prefers Draft over Pre-release when a release is both", async () => {
    stubReleases([release({ draft: true, prerelease: true })]);

    const { entries } = await fetchChangelogEntries();

    expect(entries[0].badge).toBe("Draft");
  });

  it.each([null, "", "   "])(
    "uses the placeholder copy for an empty body (%j)",
    async (body) => {
      stubReleases([release({ body })]);

      const { entries } = await fetchChangelogEntries();

      expect(entries[0].description).toBe(
        "No release notes were provided for this version.",
      );
      expect(entries[0].changes).toEqual([
        "See full release details on GitHub.",
      ]);
    },
  );

  it("parses numbered lists and skips headings when picking the description", async () => {
    stubReleases([
      release({ body: "## What's new\n1. First item\n2. Second item" }),
    ]);

    const { entries } = await fetchChangelogEntries();

    expect(entries[0].changes).toEqual(["First item", "Second item"]);
    expect(entries[0].description).toBe(
      "Release notes are available in the full GitHub release details.",
    );
  });

  it("strips links, bold, italic and underscore emphasis from bullets", async () => {
    stubReleases([
      release({
        body: "* See [the docs](https://example.com)\n* _Refactored_ __internals__ and *tuned* perf",
      }),
    ]);

    const { entries } = await fetchChangelogEntries();

    expect(entries[0].changes).toEqual([
      "See the docs",
      "Refactored internals and tuned perf",
    ]);
  });

  it("reports hasError on a non-ok response without throwing", async () => {
    stubReleases({}, { ok: false });

    await expect(fetchChangelogEntries()).resolves.toEqual({
      entries: [],
      hasError: true,
    });
  });

  it("reports hasError and logs when the request rejects", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      }),
    );

    await expect(fetchChangelogEntries()).resolves.toEqual({
      entries: [],
      hasError: true,
    });
    expect(logger.error).toHaveBeenCalledWith(
      "Failed to fetch GitHub releases:",
      expect.any(Error),
    );
  });
});
