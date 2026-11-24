export const PRODUCT_TABS = [
  { id: "architecture", label: "Architecture" },
  { id: "orchestrator", label: "Orchestrator" },
  { id: "template", label: "Template" },
  { id: "roadmap", label: "Roadmap" },
] as const;

export type ProductTabId = (typeof PRODUCT_TABS)[number]["id"];

export const PRODUCT_SCROLL_MARGIN_PX = 180;

/** Normalizes a raw URL hash fragment to a valid ProductTabId */
export function normalizeProductTab(rawHash: string): ProductTabId {
  const clean = rawHash.replace(/^#/, "").toLowerCase();
  if (clean === "orchestrator") return "orchestrator";
  if (clean === "template" || clean === "templates") return "template";
  if (
    clean === "roadmap" ||
    clean === "evolution" ||
    clean === "traction" ||
    clean === "scf"
  ) {
    return "roadmap";
  }
  return "architecture";
}
