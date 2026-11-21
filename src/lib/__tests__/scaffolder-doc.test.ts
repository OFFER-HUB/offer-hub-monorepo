import { describe, it, expect } from "vitest";
import { getDocBySlug, getSidebarNav } from "../mdx";

const MERMAID_FENCE = /```mermaid\r?\n([\s\S]*?)```/;

describe("docs/guide/scaffolder", () => {
  it("is a real doc page resolvable through the docs pipeline", () => {
    const doc = getDocBySlug("guide/scaffolder");
    expect(doc).not.toBeNull();
    expect(doc!.frontmatter.title).toBe("Scaffolder (create-offer-hub-orchestrator)");
    expect(doc!.frontmatter.section).toBe("Guides");
    expect(doc!.frontmatter.order).toBe(27);
    expect(doc!.content.length).toBeGreaterThan(500);
  });

  it("is linked from the guides sidebar via frontmatter", () => {
    const nav = getSidebarNav();
    const guides = nav.find((s) => s.section === "Guides");
    expect(guides).toBeDefined();
    expect(guides!.links.map((l) => l.slug)).toContain("guide/scaffolder");
  });

  it("documents every interactive prompt from packages/create-offerhub", () => {
    const doc = getDocBySlug("guide/scaffolder")!;
    const expectedPrompts = [
      "API Port",
      "PostgreSQL Database URL",
      "Redis URL",
      "Payment Provider",
      "AirTM API Key",
      "AirTM API Secret",
      "AirTM Webhook Secret",
      "Stellar Network",
      "Trustless Work API Key",
      "Trustless Work Webhook Secret",
      "Public URL",
      "Run database migrations now?",
      "Generate initial admin API key?",
    ];

    for (const prompt of expectedPrompts) {
      expect(doc.content).toContain(prompt);
    }
  });

  it("documents automated secret generation for master key and wallet encryption key", () => {
    const doc = getDocBySlug("guide/scaffolder")!;
    expect(doc.content).toContain("OFFERHUB_MASTER_KEY");
    expect(doc.content).toContain("WALLET_ENCRYPTION_KEY");
    expect(doc.content).toContain("AES-256-GCM");
  });

  it("documents the generated .env configuration structure", () => {
    const doc = getDocBySlug("guide/scaffolder")!;
    expect(doc.content).toContain("DATABASE_URL=");
    expect(doc.content).toContain("REDIS_URL=");
    expect(doc.content).toContain("PAYMENT_PROVIDER=");
    expect(doc.content).toContain("TRUSTLESS_API_KEY=");
    expect(doc.content).toContain("STELLAR_NETWORK=");
    expect(doc.content).toContain("PLATFORM_USER_ID=");
  });

  it("documents the automated prisma generate, migration deploy, and bootstrap steps", () => {
    const doc = getDocBySlug("guide/scaffolder")!;
    expect(doc.content).toContain("prisma generate");
    expect(doc.content).toContain("prisma migrate deploy");
    expect(doc.content).toContain("npm run bootstrap");
    expect(doc.content).toContain("offerhub-platform");
  });

  it("includes a valid mermaid diagram visualizing the scaffolding lifecycle", () => {
    const doc = getDocBySlug("guide/scaffolder")!;
    const match = doc.content.match(MERMAID_FENCE);
    expect(match).not.toBeNull();
    const diagram = match![1];
    expect(diagram).toContain("flowchart");
    expect(diagram).toContain("npx create-offer-hub-orchestrator");
    expect(diagram).toContain("npm run bootstrap");
  });

  it("includes cross-links to relevant guides", () => {
    const doc = getDocBySlug("guide/scaffolder")!;
    expect(doc.content).toContain("/docs/installation");
    expect(doc.content).toContain("/docs/configuration");
    expect(doc.content).toContain("/docs/guide/cli");
    expect(doc.content).toContain("/docs/guide/quick-start");
  });
});
