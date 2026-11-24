import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo, LOGO_PATHS } from "../Logo";

describe("Logo", () => {
  it("uses exactly the path data of the official public/logo.svg", () => {
    const svg = readFileSync(join(process.cwd(), "public/logo.svg"), "utf8");
    const official = [...svg.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]);
    expect(LOGO_PATHS.map((p) => p.d)).toEqual(official);
  });

  it("renders an accessible image with explicit dimensions", () => {
    render(<Logo height={40} />);
    const logo = screen.getByRole("img", { name: "OFFER-HUB" });
    expect(logo).toHaveAttribute("height", "40");
    expect(logo).toHaveAttribute("width", "66");
  });

  it("colors the mark with theme tokens so it follows the theme toggle", () => {
    const { container } = render(<Logo />);
    const classes = [...container.querySelectorAll("path")].map((p) => p.getAttribute("class"));
    expect(classes).toEqual(["fill-theme-primary", "fill-content-primary", "fill-content-primary"]);
  });
});
