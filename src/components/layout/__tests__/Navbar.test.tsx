import { describe, it, expect } from "vitest";
import { isLinkActive } from "../Navbar";

const hrefs = ["/", "/#features", "/#how-it-works", "/use-cases", "/docs", "/community", "/pricing"];
const activeCount = (pathname: string) => hrefs.filter((h) => isLinkActive(h, pathname)).length;

describe("isLinkActive", () => {
  it("never marks hash links active", () => {
    expect(isLinkActive("/#features", "/")).toBe(false);
    expect(isLinkActive("/#how-it-works", "/")).toBe(false);
    expect(isLinkActive("/#features", "/docs")).toBe(false);
  });

  it("matches full-path links by prefix (nested routes)", () => {
    expect(isLinkActive("/product", "/product")).toBe(true);
    expect(isLinkActive("/product", "/")).toBe(false);
    expect(isLinkActive("/docs", "/docs")).toBe(true);
    expect(isLinkActive("/docs", "/docs/getting-started")).toBe(true);
    expect(isLinkActive("/community", "/docs")).toBe(false);
  });

  it("matches root only on the home route", () => {
    expect(isLinkActive("/", "/")).toBe(true);
    expect(isLinkActive("/", "/docs")).toBe(false);
  });

  it("marks exactly one item active on /, and on nested routes", () => {
    expect(activeCount("/")).toBe(1);
    expect(activeCount("/docs/getting-started")).toBe(1);
    expect(activeCount("/pricing")).toBe(1);
  });
});
