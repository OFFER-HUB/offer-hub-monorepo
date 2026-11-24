import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { PullRequestData } from "@/types/community";
import {
  RecentPRsSection,
  filterCommunityPRs,
  isBotOrDependencyPR,
} from "../RecentPRsSection";

function pr(overrides: Partial<PullRequestData> = {}): PullRequestData {
  return {
    number: 1,
    title: "feat(escrow): support milestone release",
    author: "alice",
    timestamp: "today",
    url: "https://github.com/OFFER-HUB/offer-hub-monorepo/pull/1",
    status: "Open",
    ...overrides,
  };
}

describe("RecentPRsSection filtering", () => {
  it.each([
    "dependabot",
    "dependabot[bot]",
    "renovate",
    "renovate[bot]",
    "github-actions",
    "github-actions[bot]",
    "Dependabot[bot]",
  ])("excludes bot author %s", (author) => {
    expect(
      isBotOrDependencyPR(pr({ author, title: "feat: automated update" })),
    ).toBe(true);
  });

  it.each([
    "chore(deps): bump mermaid from 11.12.3 to 12.2.0",
    "chore(deps-dev): bump jsdom from 29.1.1 to 31.0.1",
    "Chore(deps): update lockfile",
  ])("excludes dependency-bump title %s", (title) => {
    expect(isBotOrDependencyPR(pr({ author: "human-dev", title }))).toBe(true);
  });

  it("keeps human pull requests including non-deps chore titles", () => {
    const items = [
      pr({ number: 101, author: "dependabot[bot]", title: "chore(deps): bump next" }),
      pr({ number: 102, author: "renovate", title: "Update dependencies" }),
      pr({ number: 103, author: "github-actions[bot]", title: "ci: sync artifacts" }),
      pr({ number: 104, author: "bob", title: "chore(deps-dev): bump vitest" }),
      pr({ number: 105, author: "alice", title: "fix(payments): validate escrow amount" }),
      pr({ number: 106, author: "carol", title: "chore(ci): cache node_modules" }),
    ];

    expect(filterCommunityPRs(items).map((item) => item.number)).toEqual([
      105,
      106,
    ]);
  });

  it("renders only human non-dependency PRs in the marquee", () => {
    const items = [
      pr({
        number: 1,
        author: "dependabot[bot]",
        title: "chore(deps-dev): bump jsdom from 29.1.1 to 31.0.1",
      }),
      pr({
        number: 2,
        author: "alice",
        title: "feat(orders): add idempotency check",
      }),
    ];

    render(<RecentPRsSection pullRequests={items} />);

    expect(
      screen.queryByText(/chore\(deps-dev\): bump jsdom/i),
    ).not.toBeInTheDocument();
    expect(
      screen.getAllByText("feat(orders): add idempotency check").length,
    ).toBeGreaterThan(0);
  });

  it("renders a clean empty state when all PRs are filtered out", () => {
    const items = [
      pr({
        number: 1,
        author: "dependabot[bot]",
        title: "chore(deps): bump glob from 11.1.0 to 14.0.6",
      }),
    ];

    render(<RecentPRsSection pullRequests={items} />);

    expect(
      screen.getByText(/no recent community pull requests to display right now/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /browse on github/i }),
    ).toHaveAttribute("href", "https://github.com/OFFER-HUB");
  });
});
