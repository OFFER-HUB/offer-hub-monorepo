import { describe, it, expect } from "vitest";
import { slugify } from "../slugify";

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("Getting Started")).toBe("getting-started");
  });

  it("strips punctuation not in [a-z0-9\\s-]", () => {
    expect(slugify("What's new in v2.0 (beta)?")).toBe("whats-new-in-v20-beta");
  });

  it("collapses repeated whitespace into a single hyphen", () => {
    expect(slugify("Install   the   SDK")).toBe("install-the-sdk");
  });

  it("returns an empty string for empty input", () => {
    expect(slugify("")).toBe("");
  });
});
