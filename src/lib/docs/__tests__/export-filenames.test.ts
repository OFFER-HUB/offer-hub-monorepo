import { describe, it, expect } from "vitest";
import { docExportBaseName, docExportDateStamp } from "../export-filenames";

describe("docExportBaseName", () => {
  it("flattens a nested slug's slashes into dashes", () => {
    expect(docExportBaseName("api-reference/webhooks")).toBe("api-reference-webhooks");
  });

  it("leaves a top-level slug unchanged", () => {
    expect(docExportBaseName("getting-started")).toBe("getting-started");
  });

  it("flattens every slash in a deeply nested slug", () => {
    expect(docExportBaseName("a/b/c")).toBe("a-b-c");
  });
});

describe("docExportDateStamp", () => {
  it("formats a given date as YYYY-MM-DD", () => {
    expect(docExportDateStamp(new Date("2026-08-27T15:04:05.000Z"))).toBe("2026-08-27");
  });

  it("defaults to the current date when none is provided", () => {
    expect(docExportDateStamp()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
