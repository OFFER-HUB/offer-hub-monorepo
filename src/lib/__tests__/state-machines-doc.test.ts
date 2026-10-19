import { describe, it, expect } from "vitest";
import path from "node:path";
import fs from "node:fs";
import matter from "gray-matter";
import { getDocBySlug, getSidebarNav } from "../mdx";

const DOCS_DIR = path.join(process.cwd(), "content/docs");
const SLUG = "guide/state-machines";

/**
 * Valid transitions copied from the orchestrator's `packages/shared/src/enums`
 * (DISPUTE_TRANSITIONS, TOPUP_TRANSITIONS, WITHDRAWAL_TRANSITIONS). Milestones
 * have no transition map; their only move is OPEN to COMPLETED in
 * `OrdersService.completeMilestone`. If the orchestrator changes a map, update
 * this fixture and the page together.
 */
const EXPECTED_EDGES: Record<string, string[]> = {
  Dispute: ["OPEN->UNDER_REVIEW", "UNDER_REVIEW->RESOLVED"],
  "Top-up": [
    "TOPUP_CREATED->TOPUP_AWAITING_USER_CONFIRMATION",
    "TOPUP_AWAITING_USER_CONFIRMATION->TOPUP_PROCESSING",
    "TOPUP_AWAITING_USER_CONFIRMATION->TOPUP_CANCELED",
    "TOPUP_PROCESSING->TOPUP_SUCCEEDED",
    "TOPUP_PROCESSING->TOPUP_FAILED",
  ],
  Withdrawal: [
    "WITHDRAWAL_CREATED->WITHDRAWAL_COMMITTED",
    "WITHDRAWAL_CREATED->WITHDRAWAL_CANCELED",
    "WITHDRAWAL_COMMITTED->WITHDRAWAL_PENDING",
    "WITHDRAWAL_PENDING->WITHDRAWAL_PENDING_USER_ACTION",
    "WITHDRAWAL_PENDING->WITHDRAWAL_COMPLETED",
    "WITHDRAWAL_PENDING->WITHDRAWAL_FAILED",
    "WITHDRAWAL_PENDING_USER_ACTION->WITHDRAWAL_PENDING",
    "WITHDRAWAL_PENDING_USER_ACTION->WITHDRAWAL_FAILED",
  ],
  Milestone: ["OPEN->COMPLETED"],
};

/** Endpoint reference pages that must link back to their machine. */
const CROSS_LINKS: Record<string, string> = {
  "api-reference/disputes.mdx": "#dispute",
  "api-reference/resolution.mdx": "#dispute",
  "api-reference/wallet-topups.mdx": "#top-up",
  "guide/withdrawals.mdx": "#withdrawal",
  "sdk/withdrawals.mdx": "#withdrawal",
  "api-reference/orders.mdx": "#milestone",
  "sdk/topups.mdx": "#top-up",
  "guide/disputes.mdx": "#dispute",
};

/** `<MermaidDiagram caption="..." chart={`...`} />` blocks, keyed by caption. */
function getCharts(content: string): Map<string, string> {
  const charts = new Map<string, string>();
  const re = /<MermaidDiagram\s+caption="([^"]+)"\s+chart=\{`([\s\S]*?)`\}/g;
  for (const match of content.matchAll(re)) charts.set(match[1], match[2]);
  return charts;
}

function chartFor(content: string, domain: string): string {
  const entry = [...getCharts(content)].find(([caption]) =>
    caption.startsWith(`${domain} state machine`),
  );
  expect(entry, `missing ${domain} diagram`).toBeDefined();
  return entry![1];
}

/** State-to-state edges, ignoring the [*] start and end markers. */
function edgesOf(chart: string): string[] {
  return [...chart.matchAll(/^\s*([A-Z_]+)\s*-->\s*([A-Z_]+)/gm)].map(
    ([, from, to]) => `${from}->${to}`,
  );
}

describe("docs/guide/state-machines", () => {
  it("is a Guides page resolvable through the docs pipeline", () => {
    const doc = getDocBySlug(SLUG);
    expect(doc).not.toBeNull();
    expect(doc!.frontmatter.title).toBe("State Machines");
    expect(doc!.frontmatter.section).toBe("Guides");

    const guides = getSidebarNav().find((s) => s.section === "Guides");
    expect(guides!.links.map((l) => l.slug)).toContain(SLUG);
  });

  it("has a section for every domain plus the existing order and escrow machines", () => {
    const doc = getDocBySlug(SLUG)!;
    for (const heading of ["Dispute", "Top-up", "Withdrawal", "Milestone"]) {
      expect(doc.content).toMatch(new RegExp(`^## ${heading}$`, "m"));
    }
    expect(doc.content).toContain("(/docs/guide/orders#order-lifecycle)");
    expect(doc.content).toContain("(/docs/guide/escrow#state-machine)");
  });

  it.each(Object.entries(EXPECTED_EDGES))(
    "draws exactly the %s transitions defined in the orchestrator",
    (domain, expected) => {
      const chart = chartFor(getDocBySlug(SLUG)!.content, domain);
      expect(edgesOf(chart).sort()).toEqual([...expected].sort());
    },
  );

  it.each([
    ["POST /disputes/{id}/assign", "400 INVALID_STATE"],
    ["POST /disputes/{id}/resolve", "400 INVALID_STATE"],
    ["POST /topups/{id}/cancel", "409 INVALID_STATE"],
    ["POST /withdrawals/{id}/commit", "409 WITHDRAWAL_NOT_COMMITTABLE"],
    ["POST /orders/{id}/milestones/{milestoneRef}/complete", "400 INVALID_STATE"],
    ["POST /orders/{orderId}/resolution/release", "400 INVALID_STATE"],
  ])("documents the guard on %s as %s", (endpoint, response) => {
    const rows = getDocBySlug(SLUG)!
      .content.split("\n")
      .filter((line) => line.startsWith(`| \`${endpoint}\` |`));
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) expect(row).toContain(`\`${response}\``);
  });

  it("only contains state diagrams that mermaid can parse", async () => {
    const mermaid = (await import("mermaid")).default;
    const charts = [...getCharts(getDocBySlug(SLUG)!.content).values()];
    expect(charts).toHaveLength(Object.keys(EXPECTED_EDGES).length);
    for (const chart of charts) {
      await expect(mermaid.parse(chart)).resolves.toBeTruthy();
    }
  }, 20_000);

  it.each(Object.entries(CROSS_LINKS))(
    "is cross-linked from %s",
    (file, anchor) => {
      const { content } = matter(fs.readFileSync(path.join(DOCS_DIR, file), "utf-8"));
      expect(content).toContain(`(/docs/guide/state-machines${anchor})`);
    },
  );
});
