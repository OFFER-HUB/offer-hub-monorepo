import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DocDiagram } from "../DocDiagram";
import { axe } from "@/test/axe";

const themeState = vi.hoisted(() => ({ resolvedTheme: "light" as "light" | "dark" }));

vi.mock("@/components/providers/ThemeProvider", () => ({
  useTheme: () => ({
    theme: themeState.resolvedTheme,
    resolvedTheme: themeState.resolvedTheme,
    setTheme: vi.fn(),
    toggleTheme: vi.fn(),
  }),
}));

const ALT = "Architecture diagram showing a marketplace calling the Offer Hub orchestrator.";
const CAPTION = "Marketplace → Orchestrator → Stellar";

beforeEach(() => {
  themeState.resolvedTheme = "light";
  document.body.style.overflow = "";
});

describe("DocDiagram", () => {
  it("renders the light variant with role=img, alt text, and a caption", () => {
    render(<DocDiagram name="orchestrator-architecture" alt={ALT} caption={CAPTION} />);

    const image = screen.getByRole("img", { name: ALT });
    expect(image).toHaveAttribute("src", "/diagrams/orchestrator-architecture-light.svg");
    expect(image).toHaveAttribute("loading", "lazy");
    expect(screen.getByText(CAPTION)).toBeInTheDocument();
  });

  it("swaps to the dark variant when the theme changes without rebuilding the frame", () => {
    const { rerender } = render(<DocDiagram name="orchestrator-architecture" alt={ALT} />);

    expect(screen.getByRole("img", { name: ALT })).toHaveAttribute(
      "src",
      "/diagrams/orchestrator-architecture-light.svg",
    );

    themeState.resolvedTheme = "dark";
    rerender(<DocDiagram name="orchestrator-architecture" alt={ALT} />);

    expect(screen.getByRole("img", { name: ALT })).toHaveAttribute(
      "src",
      "/diagrams/orchestrator-architecture-dark.svg",
    );
  });

  it("falls back to a labelled empty state when the SVG is missing", () => {
    render(<DocDiagram name="missing-diagram" alt={ALT} caption={CAPTION} />);

    fireEvent.error(screen.getByRole("img", { name: ALT }));

    expect(screen.getByText("Diagram unavailable")).toBeInTheDocument();
    expect(screen.getByText("missing-diagram")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("never resolves a path-traversal diagram name", () => {
    render(<DocDiagram name="../private/secret" alt={ALT} />);

    expect(screen.getByText("Diagram unavailable")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("opens a keyboard-accessible modal and closes it with Escape, restoring focus", async () => {
    const user = userEvent.setup();
    render(<DocDiagram name="orchestrator-architecture" alt={ALT} caption={CAPTION} />);

    const trigger = screen.getByRole("button", { name: new RegExp(`open larger view of ${ALT}`, "i") });
    await user.click(trigger);

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /close enlarged diagram/i })).toHaveFocus();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("supports zoom controls and keyboard shortcuts", async () => {
    const user = userEvent.setup();
    render(<DocDiagram name="orchestrator-architecture" alt={ALT} />);

    await user.click(screen.getByRole("button", { name: /open larger view/i }));
    expect(screen.getByText("100%")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(screen.getByText("125%")).toBeInTheDocument();

    await user.keyboard("+");
    expect(screen.getByText("150%")).toBeInTheDocument();

    await user.keyboard("0");
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("has no axe violations, closed and open", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DocDiagram name="orchestrator-architecture" alt={ALT} caption={CAPTION} />,
    );

    expect(await axe(container)).toHaveNoViolations();

    await user.click(screen.getByRole("button", { name: /open larger view/i }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
