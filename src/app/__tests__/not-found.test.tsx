import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import NotFound from "../not-found";

let mockPathname = "/unknown-route";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/data/docs-index.json", () => ({
  default: [
    {
      id: "doc-1",
      title: "Getting Started",
      section: "Overview",
      content: "Set up OFFER-HUB and make your first integration call.",
      link: "/docs/getting-started",
    },
    {
      id: "doc-2",
      title: "SDK Quick Start",
      section: "TypeScript SDK",
      content: "TypeScript SDK installation, client setup, and usage examples.",
      link: "/docs/sdk/quick-start",
    },
    {
      id: "doc-3",
      title: "API Overview",
      section: "Overview",
      content: "Review endpoints, authentication, webhooks, and response schemas.",
      link: "/docs/api-reference/overview",
    },
  ],
}));

describe("NotFound (404 page)", () => {
  beforeEach(() => {
    mockPathname = "/some-page-does-not-exist";
    document.title = "";
  });

  it("renders within the site shell with navigation and footer", () => {
    render(
      <ThemeProvider>
        <NotFound />
      </ThemeProvider>,
    );

    expect(screen.getAllByRole("banner").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("contentinfo").length).toBeGreaterThan(0);
  });

  it("renders plain language heading and description", () => {
    render(
      <ThemeProvider>
        <NotFound />
      </ThemeProvider>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Page not found" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.",
      ),
    ).toBeInTheDocument();
  });

  it("sets the document title to 'Page not found | OFFER-HUB'", () => {
    render(
      <ThemeProvider>
        <NotFound />
      </ThemeProvider>,
    );

    expect(document.title).toBe("Page not found | OFFER-HUB");
  });

  it("renders the search field and four destination links", () => {
    render(
      <ThemeProvider>
        <NotFound />
      </ThemeProvider>,
    );

    const main = screen.getByRole("main");
    expect(within(main).getByRole("combobox")).toBeInTheDocument();

    const homeLink = within(main).getByRole("link", { name: /home/i });
    expect(homeLink).toHaveAttribute("href", "/");

    const docsLink = within(main).getByRole("link", { name: /documentation/i });
    expect(docsLink).toHaveAttribute("href", "/docs");

    const sdkLink = within(main).getByRole("link", { name: /sdk quick start/i });
    expect(sdkLink).toHaveAttribute("href", "/docs/sdk/quick-start");

    const contactLink = within(main).getByRole("link", { name: /contact/i });
    expect(contactLink).toHaveAttribute("href", "/contact");
  });

  it("suggests up to 3 docs pages when navigating to missing /docs/... route", () => {
    mockPathname = "/docs/missing-feature";

    render(
      <ThemeProvider>
        <NotFound />
      </ThemeProvider>,
    );

    const main = screen.getByRole("main");
    expect(
      within(main).getByRole("heading", {
        level: 2,
        name: "Suggested Documentation",
      }),
    ).toBeInTheDocument();

    const suggestedLinks = within(main).getAllByRole("link", { name: /open/i });
    expect(suggestedLinks.length).toBeLessThanOrEqual(3);
    expect(suggestedLinks.length).toBeGreaterThan(0);
  });
});
