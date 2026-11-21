/**
 * Shared neumorphic theme for generated diagrams (Mermaid today; any future
 * static diagram pipeline can reuse the same token contract).
 *
 * Every color comes from the site's CSS custom properties (`src/app/globals.css`,
 * documented in `docs/design/color-palette.md`) so diagrams stay in sync with
 * the rest of the design system in both light and dark mode with zero
 * hardcoded colors here. Shadows follow the 145° top-left light source
 * defined in `docs/design/neumorphism.md`.
 */

const TOKEN_VAR_NAMES = {
  bgBase: "--color-bg-base",
  bgElevated: "--color-bg-elevated",
  bgSunken: "--color-bg-sunken",
  textPrimary: "--color-text-primary",
  textSecondary: "--color-text-secondary",
  border: "--color-border",
  shadowDark: "--shadow-dark",
  shadowLight: "--shadow-light",
} as const;

// Fallbacks mirror the light-mode defaults in globals.css and are only used
// if a property fails to resolve (e.g. styles not yet attached to the DOM).
const TOKEN_FALLBACKS: Record<keyof typeof TOKEN_VAR_NAMES, string> = {
  bgBase: "#F1F3F7",
  bgElevated: "#ffffff",
  bgSunken: "#e8eaef",
  textPrimary: "#19213D",
  textSecondary: "#6D758F",
  border: "#d1d5db",
  shadowDark: "#d1d5db",
  shadowLight: "#ffffff",
};

export type DiagramColorTokens = Record<keyof typeof TOKEN_VAR_NAMES, string>;

/** Reads the live design tokens from `:root`/`.dark`, whichever is active. */
export function readDiagramColorTokens(): DiagramColorTokens {
  const computed = getComputedStyle(document.documentElement);
  const tokens = {} as DiagramColorTokens;
  for (const key of Object.keys(TOKEN_VAR_NAMES) as Array<keyof typeof TOKEN_VAR_NAMES>) {
    const value = computed.getPropertyValue(TOKEN_VAR_NAMES[key]).trim();
    tokens[key] = value || TOKEN_FALLBACKS[key];
  }
  return tokens;
}

/**
 * Mermaid `themeVariables`, built entirely from design tokens.
 * Node/cluster borders use the neutral `--color-border` token (never the
 * brand teal) so diagrams read as depth via shadow, not colored outlines.
 */
export function getMermaidThemeVariables(tokens: DiagramColorTokens, fontSize: string) {
  return {
    primaryColor: tokens.bgElevated,
    primaryTextColor: tokens.textPrimary,
    primaryBorderColor: tokens.border,
    secondaryColor: tokens.bgSunken,
    secondaryTextColor: tokens.textPrimary,
    secondaryBorderColor: tokens.border,
    tertiaryColor: tokens.bgBase,
    tertiaryTextColor: tokens.textPrimary,
    tertiaryBorderColor: tokens.border,
    background: tokens.bgElevated,
    mainBkg: tokens.bgElevated,
    textColor: tokens.textPrimary,
    lineColor: tokens.textSecondary,
    fontFamily: "var(--font-inter), Inter, sans-serif",
    fontSize,
    nodeBorder: tokens.border,
    nodeTextColor: tokens.textPrimary,
    clusterBkg: tokens.bgSunken,
    clusterBorder: tokens.border,
    edgeLabelBackground: tokens.bgElevated,
    labelBackgroundColor: tokens.bgElevated,
    titleColor: tokens.textPrimary,
  };
}

/**
 * Soft dual drop-shadow applied to every node shape, matching the raised
 * neumorphic surfaces used across the site (`shadow-neu-raised` in
 * `tailwind.config.ts`): dark shadow bottom-right, light highlight
 * top-left, same 145° source.
 */
export function getNeumorphicDiagramCSS(tokens: DiagramColorTokens): string {
  const nodeShadow = `drop-shadow(3px 3px 4px ${tokens.shadowDark}) drop-shadow(-2px -2px 4px ${tokens.shadowLight})`;
  const clusterShadow = `drop-shadow(2px 2px 3px ${tokens.shadowDark})`;
  return `
    .node rect, .node polygon, .node circle, .node ellipse, .node path.basic {
      filter: ${nodeShadow};
    }
    .cluster rect {
      filter: ${clusterShadow};
    }
    .edgeLabel {
      border-radius: 6px;
    }
  `;
}
