import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { StatsSection } from "../StatsSection";

function repoPayload(overrides: Record<string, number> = {}) {
  return {
    stargazers_count: 20,
    forks_count: 100,
    open_issues_count: 5,
    ...overrides,
  };
}

function contributor(login: string, contributions = 5) {
  return {
    login,
    contributions,
    avatar_url: `https://avatars.example/${login}.png`,
    html_url: `https://github.com/${login}`,
  };
}

describe("StatsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows a loading state initially and never renders fabricated metrics", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {})),
    );

    render(<StatsSection />);

    expect(
      screen.getByRole("status", { name: /loading live github metrics/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText("10K+")).not.toBeInTheDocument();
    expect(screen.queryByText("$50M+")).not.toBeInTheDocument();
    expect(screen.queryByText("99.9%")).not.toBeInTheDocument();
    expect(screen.queryByText("50+")).not.toBeInTheDocument();
  });

  it("renders aggregated live GitHub metrics and excludes bot contributors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.includes("/contributors")) {
          if (url.includes("offer-hub-monorepo")) {
            return {
              ok: true,
              json: async () => [
                contributor("alice"),
                contributor("bob"),
                contributor("dependabot[bot]"),
              ],
            };
          }
          return {
            ok: true,
            json: async () => [contributor("alice"), contributor("carol")],
          };
        }

        if (url.endsWith("/OFFER-HUB/offer-hub-monorepo")) {
          return {
            ok: true,
            json: async () =>
              repoPayload({ stargazers_count: 1200, forks_count: 300, open_issues_count: 12 }),
          };
        }

        return {
          ok: true,
          json: async () =>
            repoPayload({ stargazers_count: 150, forks_count: 50, open_issues_count: 4 }),
        };
      }),
    );

    render(<StatsSection />);

    // Stars: 1200 + 150 + 150 = 1500 -> "1.5k"
    // Unique human contributors: alice, bob, carol -> "3"
    // Forks: 300 + 50 + 50 = 400 -> "400"
    // Open issues: 12 + 4 + 4 = 20 -> "20"
    expect(await screen.findByText("1.5k")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("400")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it("renders a graceful fallback when GitHub requests fail", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        json: async () => ({}),
      })),
    );

    render(<StatsSection />);

    await waitFor(() => {
      expect(
        screen.getByText(/live open-source metrics from github are temporarily unavailable/i),
      ).toBeInTheDocument();
    });

    const link = screen.getByRole("link", { name: /view on github/i });
    expect(link).toHaveAttribute("href", "https://github.com/OFFER-HUB");
  });

  it("renders a graceful fallback when the network throws", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Network error");
      }),
    );

    render(<StatsSection />);

    expect(
      await screen.findByText(/live open-source metrics from github are temporarily unavailable/i),
    ).toBeInTheDocument();
  });
});
