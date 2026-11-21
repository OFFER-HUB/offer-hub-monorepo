import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../StatusBadge";
import { statusColors, type StatusTone } from "../status-colors";

describe("StatusBadge", () => {
  it("renders its children with the default tone", () => {
    render(<StatusBadge>Draft</StatusBadge>);

    const badge = screen.getByText("Draft");
    expect(badge).toHaveClass(statusColors.default.bg, statusColors.default.text, "rounded-full");
    expect(badge).not.toHaveClass("shadow-neu-raised-sm");
  });

  it.each(Object.keys(statusColors) as StatusTone[])(
    "applies the %s palette from statusColors",
    (tone) => {
      render(<StatusBadge variant={tone}>label</StatusBadge>);

      expect(screen.getByText("label")).toHaveClass(
        statusColors[tone].bg,
        statusColors[tone].text,
      );
    },
  );

  it("lets callers override the shape", () => {
    render(<StatusBadge className="rounded-2xl">custom shape</StatusBadge>);

    const badge = screen.getByText("custom shape");
    expect(badge).toHaveClass("rounded-2xl");
    expect(badge).not.toHaveClass("rounded-full");
  });
});
