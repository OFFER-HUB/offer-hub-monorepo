import { describe, it, expect } from "vitest";
import { isLinkActive } from "../Navbar";

describe("isLinkActive", () => {
  it("matches hash links only on the home page", () => {
    expect(isLinkActive("/#features", "/")).toBe(true);
    expect(isLinkActive("/#how-it-works", "/")).toBe(true);
    expect(isLinkActive("/#features", "/docs")).toBe(false);
  });

  it("matches full-path links by prefix, including nested routes", () => {
    expect(isLinkActive("/docs", "/docs")).toBe(true);
    expect(isLinkActive("/docs", "/docs/getting-started")).toBe(true);
    expect(isLinkActive("/community", "/docs")).toBe(false);
  });

  it("matches the root path only on an exact match", () => {
    expect(isLinkActive("/", "/")).toBe(true);
    expect(isLinkActive("/", "/docs")).toBe(false);
  });
});
