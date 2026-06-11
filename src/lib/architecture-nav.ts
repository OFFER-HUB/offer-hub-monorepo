/** Clears fixed Navbar + sticky Architecture section nav when scrolling to `#` anchors */
export const ARCHITECTURE_SCROLL_MARGIN_PX = 180;

export const ARCHITECTURE_SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "system", label: "System" },
  { id: "flow", label: "Payment Flow" },
  { id: "integrations", label: "Integrations" },
  { id: "roadmap", label: "Roadmap" },
  { id: "why-stellar", label: "Why Stellar" },
  { id: "traction", label: "Traction" },
] as const;
