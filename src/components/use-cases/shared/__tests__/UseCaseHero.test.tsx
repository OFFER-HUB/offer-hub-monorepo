import { describe, it, expect, beforeAll, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ShoppingCart } from "lucide-react";
import UseCaseHero, { type UseCaseHeroProps } from "../UseCaseHero";

// framer-motion's `whileInView` (used by the "At a glance" stat cards) relies on
// IntersectionObserver, which jsdom does not implement.
beforeAll(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    },
  );
});

const baseProps: UseCaseHeroProps = {
  gradientId: "test-network-line",
  badgeLabel: "CASE STUDY: LVL-9 TEST",
  headline: "Test Headline",
  subheadline: "A concise test subheadline describing the use case.",
  docsUrl: "https://example.com/docs#test",
  footerIcon: ShoppingCart,
  footerLabel: "Test footer infrastructure",
  stats: [
    { label: "Target", value: "B2B / Test", accent: "Test Scope" },
    { label: "Provider", value: "Stellar (USDC)", accent: "Settlement Layer" },
    { label: "Features", value: "A, B, C", accent: "Release Logic" },
  ],
  nodes: [
    { id: "a", x: 16, y: 44, size: 12, delay: 0 },
    { id: "b", x: 50, y: 38, size: 14, delay: 0.6 },
    { id: "c", x: 86, y: 50, size: 10, delay: 1.5 },
  ],
  links: [
    ["a", "b"],
    ["b", "c"],
  ],
};

describe("UseCaseHero", () => {
  it("renders the headline, badge and subheadline", () => {
    render(<UseCaseHero {...baseProps} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Test Headline" }),
    ).toBeInTheDocument();
    expect(screen.getByText("CASE STUDY: LVL-9 TEST")).toBeInTheDocument();
    expect(
      screen.getByText(/concise test subheadline/i),
    ).toBeInTheDocument();
  });

  it("renders the primary CTA as an external link to docsUrl", () => {
    render(<UseCaseHero {...baseProps} />);

    const cta = screen.getByRole("link", { name: /technical doc/i });
    expect(cta).toHaveAttribute("href", "https://example.com/docs#test");
    expect(cta).toHaveAttribute("target", "_blank");
    expect(cta).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("supports overriding the CTA label", () => {
    render(<UseCaseHero {...baseProps} ctaLabel="View Implementation" />);

    expect(
      screen.getByRole("link", { name: /view implementation/i }),
    ).toBeInTheDocument();
  });

  it("renders the footer label and every stat card", () => {
    render(<UseCaseHero {...baseProps} />);

    expect(screen.getByText("Test footer infrastructure")).toBeInTheDocument();

    for (const stat of baseProps.stats) {
      expect(screen.getByText(stat.label)).toBeInTheDocument();
      expect(screen.getByText(stat.value)).toBeInTheDocument();
      expect(screen.getByText(stat.accent)).toBeInTheDocument();
    }
  });

  it("renders the background network graph from nodes and links", () => {
    const { container } = render(<UseCaseHero {...baseProps} />);

    // The background network graph lives in its own 100x100 SVG.
    const graph = container.querySelector('svg[viewBox="0 0 100 100"]');
    expect(graph).not.toBeNull();

    // One gradient definition using the supplied id.
    expect(
      graph!.querySelector(`linearGradient#${baseProps.gradientId}`),
    ).not.toBeNull();

    // One <line> per link, wired to the gradient.
    const lines = graph!.querySelectorAll("line");
    expect(lines).toHaveLength(baseProps.links.length);
    expect(lines[0]).toHaveAttribute(
      "stroke",
      `url(#${baseProps.gradientId})`,
    );

    // Each node renders its group of three concentric circles.
    expect(graph!.querySelectorAll("circle")).toHaveLength(
      baseProps.nodes.length * 3,
    );
  });
});
