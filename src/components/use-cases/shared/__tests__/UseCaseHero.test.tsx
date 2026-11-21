import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ShoppingCart } from "lucide-react";

import { UseCaseHero, type UseCaseHeroProps } from "../UseCaseHero";

const baseProps: UseCaseHeroProps = {
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

  it("uses a calm solid surface with no animated network behind the copy", () => {
    const { container } = render(<UseCaseHero {...baseProps} />);

    const surface = container.querySelector(".bg-bg-elevated");
    expect(surface).not.toBeNull();

    // The old animated background graph lived in a 100x100 SVG viewBox.
    expect(container.querySelector('svg[viewBox="0 0 100 100"]')).toBeNull();
    expect(
      container.querySelectorAll('div[style*="radial-gradient"]'),
    ).toHaveLength(0);
  });
});
