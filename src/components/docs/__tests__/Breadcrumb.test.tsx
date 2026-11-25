import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Breadcrumb, formatSegment } from "../Breadcrumb";

const pathnameMock = vi.fn<() => string>();

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock(),
}));

describe("formatSegment", () => {
  it.each([
    ["sdk", "SDK"],
    ["api-reference", "API Reference"],
    ["getting-started", "Getting Started"],
    ["quick-start", "Quick Start"],
    ["config-and-health", "Config And Health"],
    ["mcp", "MCP"],
    ["cli", "CLI"],
    ["openapi", "OpenAPI"],
  ])("formats %s as %s", (segment, expected) => {
    expect(formatSegment(segment)).toBe(expected);
  });
});

describe("Breadcrumb", () => {
  beforeEach(() => {
    pathnameMock.mockReset();
  });

  it("renders SDK with its fixed casing", () => {
    pathnameMock.mockReturnValue("/docs/sdk/quick-start");
    render(<Breadcrumb />);
    expect(screen.getByRole("link", { name: "SDK" })).toHaveAttribute("href", "/docs/sdk");
    expect(screen.getByText("Quick Start")).toBeInTheDocument();
    expect(screen.queryByText("Sdk")).toBeNull();
  });

  it("renders API Reference with its fixed casing", () => {
    pathnameMock.mockReturnValue("/docs/api-reference/overview");
    render(<Breadcrumb />);
    expect(screen.getByRole("link", { name: "API Reference" })).toBeInTheDocument();
    expect(screen.queryByText("Api Reference")).toBeNull();
  });

  it("renders nothing on the docs home", () => {
    pathnameMock.mockReturnValue("/docs");
    const { container } = render(<Breadcrumb />);
    expect(container).toBeEmptyDOMElement();
  });
});
