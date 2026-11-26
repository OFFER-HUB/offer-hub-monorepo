import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../StatusBadge";
import { statusColors, type StatusTone } from "../status-colors";

describe("StatusBadge", () => {
  it("renders a flat pill with the default tone", () => {
    render(<StatusBadge>Draft</StatusBadge>);

    const badge = screen.getByText("Draft");
    expect(badge).toHaveClass("rounded-full", statusColors.default.bg, "text-content-primary");
    expect(badge.className).not.toMatch(/shadow-/);
    expect(badge.className).not.toMatch(/rounded-md/);
  });

  it.each(Object.keys(statusColors) as StatusTone[])(
    "tints the %s tone from statusColors and shows its dot",
    (tone) => {
      render(<StatusBadge variant={tone}>label</StatusBadge>);

      const badge = screen.getByText("label");
      expect(badge).toHaveClass(statusColors[tone].bg);
      expect(badge).toHaveAttribute("data-tone", tone);
      const dot = badge.querySelector('[aria-hidden="true"]');
      expect(dot).toHaveClass(statusColors[tone].dotBg);
    },
  );

  it("never uses tone-colored label text (contrast on the tint)", () => {
    render(<StatusBadge variant="primary">In progress</StatusBadge>);

    expect(screen.getByText("In progress")).not.toHaveClass(statusColors.primary.text);
  });

  it("replaces the dot with a decorative icon", () => {
    render(
      <StatusBadge variant="success" icon={<svg data-testid="icon" />}>
        Completed
      </StatusBadge>,
    );

    const badge = screen.getByText("Completed");
    expect(screen.getByTestId("icon").parentElement).toHaveAttribute("aria-hidden", "true");
    expect(badge.querySelector(`.${statusColors.success.dotBg}`)).toBeNull();
  });

  it("merges caller classes", () => {
    render(<StatusBadge className="font-mono">GET</StatusBadge>);

    expect(screen.getByText("GET")).toHaveClass("font-mono", "rounded-full");
  });

  it("lets callers override the shape", () => {
    render(<StatusBadge className="rounded-2xl">custom shape</StatusBadge>);

    const badge = screen.getByText("custom shape");
    expect(badge).toHaveClass("rounded-2xl");
    expect(badge).not.toHaveClass("rounded-full");
  });
});
