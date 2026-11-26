/**
 * Regenerates the design-token tables in the docs from the code.
 *
 * Source of truth:
 * - Color / shadow tokens: CSS variables in `src/app/globals.css`
 *   (`:root` for light mode, `.dark` for dark mode).
 * - Shadow utilities: `boxShadow` entries in `tailwind.config.ts`.
 * - Radii: the Tailwind 3 default scale for the four radii the Review bar
 *   allows (`tailwind.config.ts` does not extend `borderRadius`).
 *
 * The tables live between marker comments in:
 * - `docs/design/color-palette.md`
 *   (`<!-- BEGIN GENERATED TOKEN TABLES -->` /
 *   `<!-- END GENERATED TOKEN TABLES -->`)
 * - `content/docs/guide/style-guide.mdx`
 *   (BEGIN GENERATED TOKEN TABLES / END GENERATED TOKEN TABLES markers,
 *   written as MDX comments)
 *
 * Usage:
 *   npm run docs:tokens            # regenerate the tables in place
 *   npm run docs:tokens -- --check # exit 1 if the committed tables are stale
 *
 * The output is deterministic (fixed ordering, fixed formatting), so running
 * the generator twice produces no diff.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const GLOBALS_CSS = path.join(ROOT, "src/app/globals.css");
const TAILWIND_CONFIG = path.join(ROOT, "tailwind.config.ts");
const COLOR_PALETTE_MD = path.join(ROOT, "docs/design/color-palette.md");
const STYLE_GUIDE_MDX = path.join(ROOT, "content/docs/guide/style-guide.mdx");

const MD_BEGIN = "<!-- BEGIN GENERATED TOKEN TABLES -->";
const MD_END = "<!-- END GENERATED TOKEN TABLES -->";
const MDX_BEGIN = "{/* BEGIN GENERATED TOKEN TABLES */}";
const MDX_END = "{/* END GENERATED TOKEN TABLES */}";

/** Group order for the color token table (matches globals.css layout). */
const COLOR_GROUPS: Array<{
  heading: string;
  tokens: Array<{ name: string; tailwind: string; usage: string }>;
}> = [
  {
    heading: "Background",
    tokens: [
      { name: "--color-bg-base", tailwind: "bg-bg-base", usage: "Page background" },
      { name: "--color-bg-elevated", tailwind: "bg-bg-elevated", usage: "Cards, modals, elevated surfaces" },
      { name: "--color-bg-sunken", tailwind: "bg-bg-sunken", usage: "Inset areas, input backgrounds" },
    ],
  },
  {
    heading: "Text",
    tokens: [
      { name: "--color-text-primary", tailwind: "text-content-primary", usage: "Headings, primary text" },
      { name: "--color-text-secondary", tailwind: "text-content-secondary", usage: "Body text, descriptions" },
      { name: "--color-text-muted", tailwind: "text-content-muted", usage: "Placeholder text, hints" },
    ],
  },
  {
    heading: "Brand",
    tokens: [
      { name: "--color-primary", tailwind: "bg-theme-primary / text-theme-primary", usage: "Primary buttons, links, accents" },
      { name: "--color-primary-hover", tailwind: "bg-theme-primary-hover", usage: "Primary hover states" },
      { name: "--color-secondary", tailwind: "bg-theme-secondary / text-theme-secondary", usage: "Deep-navy accent (diagrams, icon tints)" },
      { name: "--color-accent", tailwind: "text-theme-accent", usage: "Accent highlights" },
    ],
  },
  {
    heading: "Semantic",
    tokens: [
      { name: "--color-success", tailwind: "text-theme-success", usage: "Success states" },
      { name: "--color-warning", tailwind: "text-theme-warning", usage: "Warning states" },
      { name: "--color-error", tailwind: "text-theme-error", usage: "Error states" },
    ],
  },
  {
    heading: "Border",
    tokens: [
      { name: "--color-border", tailwind: "border-theme-border", usage: "Borders, dividers" },
    ],
  },
  {
    heading: "Shadow",
    tokens: [
      { name: "--shadow-dark", tailwind: "var(--shadow-dark)", usage: "Dark shadow in neumorphic effects" },
      { name: "--shadow-light", tailwind: "var(--shadow-light)", usage: "Light shadow in neumorphic effects" },
    ],
  },
];

/** Tailwind 3 default radii for the four radii the Review bar allows. */
const RADII: Array<{ utility: string; size: string; usage: string }> = [
  { utility: "rounded-xl", size: "12px", usage: "Controls" },
  { utility: "rounded-2xl", size: "16px", usage: "Inner cards, code, callouts, tables" },
  { utility: "rounded-3xl", size: "24px", usage: "Section cards" },
  { utility: "rounded-full", size: "9999px", usage: "Badges, avatars" },
];

interface TokenValues {
  light: Map<string, string>;
  dark: Map<string, string>;
  shadows: Map<string, string>;
}

/** Extract the `--var: value;` declarations inside a CSS block. */
function parseCssBlock(css: string, selector: RegExp): Map<string, string> {
  const values = new Map<string, string>();
  const block = css.match(selector);
  if (!block) return values;
  const body = block[1];
  for (const m of body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    values.set(`--${m[1]}`, m[2].trim());
  }
  return values;
}

/** Extract the `boxShadow` entries from tailwind.config.ts (as text). */
function parseTailwindShadows(configText: string): Map<string, string> {
  const shadows = new Map<string, string>();
  const block = configText.match(/boxShadow\s*:\s*\{([\s\S]*?)\n      \},/);
  if (!block) return shadows;
  for (const m of block[1].matchAll(/"([\w-]+)"\s*:\s*"([^"]+)"/g)) {
    shadows.set(m[1], m[2]);
  }
  return shadows;
}

export function readTokenValues(): TokenValues {
  const css = fs.readFileSync(GLOBALS_CSS, "utf8");
  const configText = fs.readFileSync(TAILWIND_CONFIG, "utf8");
  return {
    light: parseCssBlock(css, /:root\s*\{([\s\S]*?)\n\}/),
    dark: parseCssBlock(css, /\.dark\s*\{([\s\S]*?)\n\}/),
    shadows: parseTailwindShadows(configText),
  };
}

function colorTable(values: TokenValues): string {
  const lines: string[] = [
    "### Color tokens",
    "",
    "Values are read from `src/app/globals.css` (`:root` for light, `.dark` for dark).",
    "",
    "| Token | Light | Dark | Tailwind class | Usage |",
    "|---|---|---|---|---|",
  ];
  for (const group of COLOR_GROUPS) {
    for (const token of group.tokens) {
      const light = values.light.get(token.name) ?? "";
      // A token not redefined in `.dark` inherits its `:root` value.
      const dark = values.dark.get(token.name) ?? light;
      lines.push(
        `| \`${token.name}\` | \`${light}\` | \`${dark}\` | \`${token.tailwind}\` | ${token.usage} |`,
      );
    }
  }
  return lines.join("\n");
}

function shadowTable(values: TokenValues): string {
  const lines: string[] = [
    "### Shadow tokens",
    "",
    "Values are read from the `boxShadow` entries in `tailwind.config.ts`.",
    "",
    "| Utility | Value |",
    "|---|---|",
  ];
  for (const name of [...values.shadows.keys()].sort()) {
    lines.push(`| \`shadow-${name}\` | \`${values.shadows.get(name)}\` |`);
  }
  return lines.join("\n");
}

function radiusTable(): string {
  const lines: string[] = [
    "### Radius tokens",
    "",
    "The Review bar allows only these four radii. `tailwind.config.ts` does not",
    "extend `borderRadius`, so these are the Tailwind 3 default sizes.",
    "",
    "| Utility | Size | Usage |",
    "|---|---|---|",
  ];
  for (const r of RADII) {
    lines.push(`| \`${r.utility}\` | ${r.size} | ${r.usage} |`);
  }
  return lines.join("\n");
}

/** The generated block for docs/design/color-palette.md (markdown). */
export function generateColorPaletteBlock(values: TokenValues): string {
  return [colorTable(values), "", shadowTable(values), "", radiusTable()].join("\n");
}

function styleGuideColorTables(values: TokenValues): string {
  const sections: string[] = [];
  for (const group of COLOR_GROUPS) {
    const heading =
      group.heading === "Shadow"
        ? "### Shadow Colors (Neumorphic)"
        : group.heading === "Border"
          ? "### Border Colors"
          : `### ${group.heading} Colors`;
    const lines: string[] = [
      heading,
      "",
      "| Token | Light Mode | Dark Mode | Usage |",
      "|-------|------------|-----------|-------|",
    ];
    for (const token of group.tokens) {
      const light = values.light.get(token.name) ?? "";
      // A token not redefined in `.dark` inherits its `:root` value.
      const dark = values.dark.get(token.name) ?? light;
      lines.push(`| \`${token.name}\` | \`${light}\` | \`${dark}\` | ${token.usage} |`);
    }
    sections.push(lines.join("\n"));
  }
  return sections.join("\n\n");
}

/** The generated block for content/docs/guide/style-guide.mdx. */
export function generateStyleGuideBlock(values: TokenValues): string {
  return [
    "## Color System",
    "",
    "OFFER-HUB uses CSS variables for theme-aware colors. All colors automatically adapt when switching between light and dark modes.",
    "",
    styleGuideColorTables(values),
  ].join("\n");
}

function replaceBetweenMarkers(
  content: string,
  begin: string,
  end: string,
  generated: string,
): string {
  const start = content.indexOf(begin);
  const stop = content.indexOf(end);
  if (start === -1 || stop === -1 || stop <= start) {
    throw new Error(`Marker pair not found: ${begin} ... ${end}`);
  }
  const before = content.slice(0, start + begin.length);
  const after = content.slice(stop);
  return `${before}\n\n${generated}\n\n${after}`;
}

function currentBetweenMarkers(
  content: string,
  begin: string,
  end: string,
): string {
  const start = content.indexOf(begin);
  const stop = content.indexOf(end);
  if (start === -1 || stop === -1 || stop <= start) {
    throw new Error(`Marker pair not found: ${begin} ... ${end}`);
  }
  return content.slice(start + begin.length, stop).trim();
}

function main(): number {
  const check = process.argv.includes("--check");
  const values = readTokenValues();

  // Sanity: every token the tables reference must exist in the CSS.
  // A token missing from `.dark` inherits its `:root` value (CSS cascade),
  // so only a token missing from `:root` is an error.
  const missing: string[] = [];
  for (const group of COLOR_GROUPS) {
    for (const token of group.tokens) {
      if (!values.light.has(token.name)) missing.push(token.name);
    }
  }
  if (missing.length > 0) {
    console.error(`Missing tokens in src/app/globals.css: ${missing.join(", ")}`);
    return 1;
  }
  if (values.shadows.size === 0) {
    console.error("No boxShadow entries found in tailwind.config.ts");
    return 1;
  }

  const targets = [
    {
      file: COLOR_PALETTE_MD,
      begin: MD_BEGIN,
      end: MD_END,
      generated: generateColorPaletteBlock(values),
    },
    {
      file: STYLE_GUIDE_MDX,
      begin: MDX_BEGIN,
      end: MDX_END,
      generated: generateStyleGuideBlock(values),
    },
  ];

  let stale = false;
  for (const target of targets) {
    const content = fs.readFileSync(target.file, "utf8");
    const current = currentBetweenMarkers(content, target.begin, target.end);
    if (current === target.generated) {
      console.log(`${path.relative(ROOT, target.file)}: up to date`);
      continue;
    }
    if (check) {
      console.error(
        `${path.relative(ROOT, target.file)}: token tables are out of date — run \`npm run docs:tokens\` to regenerate them.`,
      );
      stale = true;
      continue;
    }
    fs.writeFileSync(
      target.file,
      replaceBetweenMarkers(content, target.begin, target.end, target.generated),
    );
    console.log(`${path.relative(ROOT, target.file)}: regenerated token tables`);
  }

  return stale ? 1 : 0;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(__filename);
if (isMain) {
  process.exit(main());
}
