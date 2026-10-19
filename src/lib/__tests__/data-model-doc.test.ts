import { describe, it, expect } from "vitest";
import path from "node:path";
import fs from "fs";
import matter from "gray-matter";
import { getDocBySlug, getSidebarNav } from "../mdx";

const DOCS_DIR = path.join(process.cwd(), "content/docs");

/** Extract Mermaid source; docs render these fences through MermaidDiagram. */
const MERMAID_DIAGRAM_CHART = /```mermaid\s*([\s\S]*?)```/;

const EXPECTED_MODELS = [
  "User",
  "Balance",
  "ApiKey",
  "TopUp",
  "Order",
  "Escrow",
  "Milestone",
  "Withdrawal",
  "Dispute",
  "Wallet",
  "AuditLog",
  "WebhookEvent",
  "IdempotencyKey",
  "ProcessedTransaction",
];

/** Mirrors ID_PREFIXES in the orchestrator's packages/shared/src/constants/id-prefixes.ts. */
const EXPECTED_ID_PREFIXES = [
  "usr_",
  "ord_",
  "topup_",
  "esc_",
  "dsp_",
  "wd_",
  "evt_",
  "aud_",
  "key_",
  "mkt_",
  "wal_",
];

/**
 * These tests verify the new data-model reference page through the real docs
 * pipeline: the same `getDocBySlug`/`getSidebarNav` helpers the site uses to
 * render pages and build the sidebar, reading the actual `content/docs` tree
 * (not a mocked fs).
 */
describe("docs/guide/data-model", () => {
  it("is a real doc page resolvable through the docs pipeline", () => {
    const doc = getDocBySlug("guide/data-model");
    expect(doc).not.toBeNull();
    expect(doc!.frontmatter.title).toBe("Data Model");
    expect(doc!.frontmatter.section).toBe("Guides");
    expect(doc!.content.length).toBeGreaterThan(100);
  });

  it("is linked from the guides sidebar via frontmatter", () => {
    const nav = getSidebarNav();
    const guides = nav.find((s) => s.section === "Guides");
    expect(guides).toBeDefined();
    expect(guides!.links.map((l) => l.slug)).toContain("guide/data-model");
  });

  it("documents every model from the Prisma schema", () => {
    const doc = getDocBySlug("guide/data-model")!;
    for (const model of EXPECTED_MODELS) {
      expect(doc.content).toContain(`### ${model}`);
    }
  });

  it("lists every model in the at-a-glance table, linked to its section", () => {
    const doc = getDocBySlug("guide/data-model")!;
    for (const model of EXPECTED_MODELS) {
      expect(doc.content).toContain(`[\`${model}\`](#${model.toLowerCase()})`);
    }
  });

  it("documents every ID prefix from packages/shared/src/constants/id-prefixes.ts", () => {
    const doc = getDocBySlug("guide/data-model")!;
    const section = doc.content.split("## ID Prefixes")[1]?.split("\n## ")[0];
    expect(section).toBeDefined();
    for (const prefix of EXPECTED_ID_PREFIXES) {
      expect(section).toMatch(new RegExp(`^\\| \`${prefix}\` \\|`, "m"));
    }
  });

  it("includes a shared Mermaid entity-relationship diagram of the core entities", () => {
    const doc = getDocBySlug("guide/data-model")!;
    const match = doc.content.match(MERMAID_DIAGRAM_CHART);
    expect(match).not.toBeNull();

    const chart = match![1];
    expect(chart).toContain("erDiagram");
    // Every entity that participates in the core financial flow appears.
    for (const table of [
      "users",
      "balances",
      "wallets",
      "topups",
      "withdrawals",
      "orders",
      "escrows",
      "disputes",
      "milestones",
    ]) {
      expect(chart).toContain(table);
    }
  });

  it("is a valid mermaid erDiagram that parses", async () => {
    const doc = getDocBySlug("guide/data-model")!;
    const match = doc.content.match(MERMAID_DIAGRAM_CHART);
    const mermaid = await import("mermaid");
    await expect(mermaid.default.parse(match![1])).resolves.toBeTruthy();
  }, 20_000);

  it("is cross-linked from the self-hosting guide", () => {
    const raw = fs.readFileSync(
      path.join(DOCS_DIR, "guide/self-hosting.mdx"),
      "utf-8",
    );
    const { content } = matter(raw);
    expect(content).toMatch(/\(\/docs\/guide\/data-model\)/);
  });
});
