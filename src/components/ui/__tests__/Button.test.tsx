import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../Button";

describe("Button", () => {
  it("applies each visual variant", () => {
    const { rerender } = render(<Button>Action</Button>);
    expect(screen.getByRole("button", { name: "Action" })).toHaveClass("bg-action", "text-on-action");

    rerender(<Button variant="secondary">Action</Button>);
    expect(screen.getByRole("button", { name: "Action" })).toHaveClass("bg-bg-base");

    rerender(<Button variant="ghost">Action</Button>);
    expect(screen.getByRole("button", { name: "Action" })).toHaveClass("bg-transparent");

    rerender(<Button variant="danger">Action</Button>);
    expect(screen.getByRole("button", { name: "Action" })).toHaveClass("bg-theme-error");
  });

  it("provides the specified sizes", () => {
    const { rerender } = render(<Button size="sm">Action</Button>);
    expect(screen.getByRole("button", { name: "Action" })).toHaveClass("h-9");

    rerender(<Button size="md">Action</Button>);
    expect(screen.getByRole("button", { name: "Action" })).toHaveClass("h-11");

    rerender(<Button size="lg">Action</Button>);
    expect(screen.getByRole("button", { name: "Action" })).toHaveClass("h-12");
  });

  it("renders a Next link when href is provided", () => {
    render(<Button href="/docs">Documentation</Button>);
    expect(screen.getByRole("link", { name: "Documentation" })).toHaveAttribute("href", "/docs");
  });

  it("disables native buttons and prevents disabled links from navigating", () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Disabled" })).toBeDisabled();

    rerender(
      <Button href="/docs" disabled onClick={onClick}>
        Disabled link
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Disabled link" });
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveClass("opacity-50");
    fireEvent.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("exposes loading state and disables the button", () => {
    render(<Button loading>Saving</Button>);
    expect(screen.getByRole("button", { name: "Saving" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Saving" })).toHaveAttribute("aria-busy", "true");
  });
});
