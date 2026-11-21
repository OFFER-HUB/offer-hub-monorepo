import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { StaticDiagram } from "../StaticDiagram";

const SAMPLE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><style>.oh-node path { fill: var(--color-bg-elevated); }</style><g class="node oh-node"><title>A</title><path fill="white" stroke="black" d="M0,0" /></g></svg>';

vi.mock("node:fs", () => ({
  default: {
    readFileSync: vi.fn(),
  },
}));

describe("StaticDiagram", () => {
  it("inlines the generated SVG and sets the figure caption", async () => {
    const fs = (await import("node:fs")).default;
    vi.mocked(fs.readFileSync).mockReturnValue(SAMPLE_SVG);

    render(<StaticDiagram name="order-state-machine" caption="Order state machine" />);

    expect(screen.getByText("Order state machine")).toBeInTheDocument();
    const region = screen.getByRole("img", { name: "Order state machine" });
    expect(region.querySelector("svg")).toBeInTheDocument();
    expect(region.querySelector(".oh-node")).toBeInTheDocument();
  });

  it("renders a fallback instead of throwing when the SVG file is missing", async () => {
    const fs = (await import("node:fs")).default;
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error("ENOENT: no such file or directory");
    });

    render(<StaticDiagram name="does-not-exist" />);

    expect(screen.getByText("Diagram not found")).toBeInTheDocument();
    expect(screen.getByText(/does-not-exist\.svg/)).toBeInTheDocument();
  });

  it("falls back to a generic image label when no caption is given", async () => {
    const fs = (await import("node:fs")).default;
    vi.mocked(fs.readFileSync).mockReturnValue(SAMPLE_SVG);

    render(<StaticDiagram name="order-state-machine" />);

    expect(screen.getByRole("img", { name: "Diagram" })).toBeInTheDocument();
  });
});
