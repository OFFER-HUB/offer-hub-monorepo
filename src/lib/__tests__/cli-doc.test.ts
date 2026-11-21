import { describe, it, expect } from "vitest";
import { getDocBySlug } from "../mdx";

describe("docs/guide/cli", () => {
  it("resolves through the docs pipeline with correct frontmatter", () => {
    const doc = getDocBySlug("guide/cli");
    expect(doc).not.toBeNull();
    expect(doc!.frontmatter.title).toBe("CLI Tool");
    expect(doc!.frontmatter.section).toBe("Guides");
    expect(doc!.frontmatter.order).toBe(24);
  });

  it("documents configuration resolution priority order accurately", () => {
    const doc = getDocBySlug("guide/cli")!;
    expect(doc.content).toContain("OFFERHUB_API_URL");
    expect(doc.content).toContain("OFFERHUB_API_KEY");
    expect(doc.content).toContain("~/.offerhub/config.json");
    expect(doc.content).toContain(".env");
  });

  it.each([
    {
      name: "marks keys revoke as unavailable in API",
      tokens: ["keys revoke", "Unavailable in API", "DELETE /auth/api-keys/:id"],
    },
    {
      name: "marks maintenance commands as unavailable in API",
      tokens: ["Maintenance Commands", "Unavailable in API", "admin/maintenance"],
    },
    {
      name: "clarifies that keys list/create user-id option is not supported by API",
      tokens: ["--user-id", "Not supported in API"],
    },
    {
      name: "documents that token TTL is fixed at 1 hour by backend",
      tokens: ["keys token", "1 hour", "3600"],
    },
    {
      name: "includes cross-link to the scaffolder guide",
      tokens: ["/docs/guide/scaffolder"],
    },
  ])("$name", ({ tokens }) => {
    const doc = getDocBySlug("guide/cli")!;
    for (const token of tokens) {
      expect(doc.content).toContain(token);
    }
  });
});
