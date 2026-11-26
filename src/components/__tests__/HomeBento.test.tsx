import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import Home from "@/app/page";
import { NAV_CTA } from "@/components/layout/Navbar";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

function renderHome() {
  return render(
    <ThemeProvider>
      <Home />
    </ThemeProvider>,
  );
}

describe("Home bento", () => {
  beforeEach(() => {
    // StatsSection loads live GitHub numbers; fail fast so it shows its fallback.
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, json: async () => ({}) })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("has exactly one H1 and it states the value proposition, not the wordmark", () => {
    renderHome();
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("Escrow for your marketplace without building payments");
    expect(headings[0].textContent).not.toMatch(/^OFFER-HUB$/);
  });

  it("has one primary CTA to the quick start and a GitHub link", () => {
    renderHome();
    expect(screen.getAllByRole("link", { name: /read the quick start/i })).toHaveLength(1);
    expect(screen.getByRole("link", { name: /read the quick start/i })).toHaveAttribute(
      "href",
      "/docs/guide/quick-start",
    );
    expect(screen.getByRole("link", { name: /view on github/i })).toHaveAttribute("target", "_blank");
  });

  it("shows how it works as three steps inside the page", () => {
    const { container } = renderHome();
    const section = container.querySelector("#how-it-works");
    expect(section).not.toBeNull();
    const steps = within(section as HTMLElement).getAllByRole("heading", { level: 3 });
    expect(steps.map((step) => step.textContent)).toEqual([
      "Funds locked",
      "Work delivered",
      "Released or disputed",
    ]);
  });

  it("keeps the #features anchor used by the navbar", () => {
    const { container } = renderHome();
    expect(container.querySelector("#features")).not.toBeNull();
  });

  // Scoped to <main>: the shared footer's headings belong to the site-shell issue.
  it("never skips a heading level inside main", () => {
    renderHome();
    const main = screen.getByRole("main");
    const levels = Array.from(main.querySelectorAll("h1, h2, h3, h4, h5, h6")).map((h) =>
      Number(h.tagName[1]),
    );
    levels.forEach((level, i) => {
      if (i > 0) expect(level - levels[i - 1]).toBeLessThanOrEqual(1);
    });
  });

  it("does not render a waitlist form", () => {
    renderHome();
    expect(screen.queryByText(/waitlist/i)).toBeNull();
  });
});

describe("Navbar CTA", () => {
  it("points to getting started", () => {
    expect(NAV_CTA).toEqual({ href: "/docs/getting-started", label: "Get started" });
  });

  it("renders the Get started link in the desktop bar", () => {
    render(
      <ThemeProvider>
        <Home />
      </ThemeProvider>,
    );
    const links = screen.getAllByRole("link", { name: "Get started" });
    expect(links.length).toBeGreaterThanOrEqual(1);
    links.forEach((link) => expect(link).toHaveAttribute("href", "/docs/getting-started"));
  });
});
