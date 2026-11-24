import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Footer, buildFooterNavColumns } from "../Footer";

function renderFooter(props: { hasReleases?: boolean } = {}) {
  return render(
    <ThemeProvider>
      <Footer {...props} />
    </ThemeProvider>,
  );
}

describe("Footer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("describes OFFER-HUB as a payments orchestrator for marketplaces", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => [] })),
    );

    renderFooter();

    expect(
      screen.getByText(/payments orchestrator for modern marketplaces/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/empowering freelancers and businesses/i),
    ).not.toBeInTheDocument();
  });

  it("hides the Changelog link when there are zero GitHub releases", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => [],
    }));
    vi.stubGlobal("fetch", fetchMock);

    renderFooter();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    expect(
      screen.queryByRole("link", { name: /changelog/i }),
    ).not.toBeInTheDocument();
  });

  it("hides the Changelog link when the GitHub releases API fails", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: false,
      json: async () => ({}),
    }));
    vi.stubGlobal("fetch", fetchMock);

    renderFooter();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    expect(
      screen.queryByRole("link", { name: /changelog/i }),
    ).not.toBeInTheDocument();
  });

  it("shows the Changelog link when GitHub releases exist", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => [{ tag_name: "v1.0.0" }],
      })),
    );

    renderFooter();

    const changelogLink = await screen.findByRole("link", {
      name: /changelog/i,
    });
    expect(changelogLink).toHaveAttribute("href", "/changelog");
  });

  it("builds Resources links conditionally via buildFooterNavColumns", () => {
    const hidden = buildFooterNavColumns(false).find(
      (col) => col.heading === "Resources",
    );
    const visible = buildFooterNavColumns(true).find(
      (col) => col.heading === "Resources",
    );

    expect(hidden?.links.map((l) => l.href)).toEqual(["/use-cases"]);
    expect(visible?.links.map((l) => l.href)).toEqual([
      "/use-cases",
      "/changelog",
    ]);
  });
});
