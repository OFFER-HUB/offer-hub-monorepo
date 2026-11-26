#!/usr/bin/env node
/**
 * Fails the build if source files reference an `animate-*` or `shadow-*`
 * Tailwind class that isn't actually defined anywhere (globals.css keyframes,
 * tailwind.config.ts, or an inline `.animate-x { }` / `.shadow-x { }` rule in
 * a component). Catches typos like `animate-fade-in-up` vs `animate-fadeInUp`
 * silently rendering as a no-op (see issue #1500).
 *
 * Also guards against opacity-suffixed theme token classes (e.g.
 * `bg-theme-primary/10`) that Tailwind 3 cannot emit CSS for when the color
 * is defined as a CSS variable. Use color-mix instead:
 *   bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]
 * See: https://github.com/OFFER-HUB/offer-hub-monorepo/issues/1734
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT, "src");

// Tailwind's built-in utilities that never need a local definition.
const BUILTIN_ANIMATE = new Set(["spin", "ping", "pulse", "bounce", "none"]);
const BUILTIN_SHADOW = new Set(["sm", "md", "lg", "xl", "2xl", "inner", "none"]);
// Default Tailwind color palette base names, valid as `shadow-{color}`.
const BUILTIN_COLOR_NAMES = new Set([
  "inherit", "current", "transparent", "black", "white",
  "slate", "gray", "zinc", "neutral", "stone", "red", "orange", "amber",
  "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue",
  "indigo", "violet", "purple", "fuchsia", "pink", "rose",
]);

function walk(dir, exts, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, exts, out);
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      out.push(full);
    }
  }
  return out;
}

function collectDefined() {
  const animate = new Set(BUILTIN_ANIMATE);
  const shadow = new Set(BUILTIN_SHADOW);

  // tailwind.config.ts: keys under `boxShadow` and `animation`.
  const twConfigPath = path.join(ROOT, "tailwind.config.ts");
  const twConfig = fs.readFileSync(twConfigPath, "utf8");

  const boxShadowMatch = twConfig.match(
    /boxShadow:\s*{([\s\S]*?)\r?\n\s*},/,
  );
  if (boxShadowMatch) {
    for (const m of boxShadowMatch[1].matchAll(/["']?([a-zA-Z0-9-]+)["']?\s*:/g)) {
      shadow.add(m[1]);
    }
  }

  const animationMatch = twConfig.match(
    /\banimation:\s*{([\s\S]*?)\r?\n\s*},/,
  );
  if (animationMatch) {
    for (const m of animationMatch[1].matchAll(/["']?([a-zA-Z0-9-]+)["']?\s*:/g)) {
      animate.add(m[1]);
    }
  }

  // Extended color names, valid as `shadow-{color}`.
  const colorsMatch = twConfig.match(
    /colors:\s*{([\s\S]*?)\r?\n\s*},\r?\n\s*keyframes/,
  );
  if (colorsMatch) {
    for (const m of colorsMatch[1].matchAll(/["']?([a-zA-Z0-9-]+)["']?\s*:/g)) {
      BUILTIN_COLOR_NAMES.add(m[1]);
    }
  }

  // globals.css + any .css files: `@keyframes name` and `.animate-x {` / `.shadow-x {`.
  const cssFiles = walk(SRC_DIR, [".css"]);
  // Component/script files can also define local `.animate-x { }` blocks
  // (e.g. inline <style jsx> in a .tsx file).
  const codeFiles = walk(SRC_DIR, [".ts", ".tsx"]);

  for (const file of [...cssFiles, ...codeFiles]) {
    const content = fs.readFileSync(file, "utf8");
    for (const m of content.matchAll(/@keyframes\s+([a-zA-Z0-9_-]+)/g)) {
      animate.add(m[1]);
    }
    for (const m of content.matchAll(/\.animate-([a-zA-Z0-9_-]+)\s*{/g)) {
      animate.add(m[1]);
    }
    for (const m of content.matchAll(/\.shadow-([a-zA-Z0-9_-]+)\s*{/g)) {
      shadow.add(m[1]);
    }
  }

  return { animate, shadow };
}

function checkUsages(defined) {
  const errors = [];
  const codeFiles = walk(SRC_DIR, [".ts", ".tsx"]);

  for (const file of codeFiles) {
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split("\n");
    lines.forEach((line, idx) => {
      // Negative lookbehind excludes CSS custom properties like `var(--shadow-dark)`.
      for (const m of line.matchAll(/(?<!-)\b(animate|shadow)-([a-zA-Z][a-zA-Z0-9_-]*)/g)) {
        const [, kind, rawName] = m;
        const name = rawName.replace(/\/\d+$/, ""); // strip opacity modifier, e.g. shadow-black/10
        const set = kind === "animate" ? defined.animate : defined.shadow;
        const colorSet = kind === "shadow" ? BUILTIN_COLOR_NAMES : null;
        if (set.has(name)) continue;
        if (colorSet && colorSet.has(name)) continue;
        errors.push(`${path.relative(ROOT, file)}:${idx + 1}: undefined class "${kind}-${rawName}"`);
      }
    });
  }

  return errors;
}

// ─── Opacity-suffixed token class guard ─────────────────────────────────────

/**
 * Token → CSS custom property map (mirrors tailwind.config.ts).
 * Used to build the fix suggestion in error messages.
 */
const TOKEN_CSS_VAR_MAP = {
  "theme-primary":        "--color-primary",
  "theme-primary-hover":  "--color-primary-hover",
  "theme-secondary":      "--color-secondary",
  "theme-accent":         "--color-accent",
  "theme-success":        "--color-success",
  "theme-warning":        "--color-warning",
  "theme-error":          "--color-error",
  "theme-border":         "--color-border",
  "bg-base":              "--color-bg-base",
  "bg-elevated":          "--color-bg-elevated",
  "bg-sunken":            "--color-bg-sunken",
  "content-primary":      "--color-text-primary",
  "content-secondary":    "--color-text-secondary",
  "content-muted":        "--color-text-muted",
};

const OPACITY_TOKEN_PREFIXES = [
  "bg", "text", "border", "ring", "from", "to", "via",
  "divide", "outline", "fill", "stroke",
];

/**
 * Build a regex that matches all opacity-suffixed theme token classes.
 * Exported for unit tests.
 */
function buildOpacityTokenPattern() {
  const tokens = Object.keys(TOKEN_CSS_VAR_MAP)
    .sort((a, b) => b.length - a.length) // longest first to avoid partial matches
    .map((t) => t.replace(/-/g, "\\-"))
    .join("|");
  const prefixes = OPACITY_TOKEN_PREFIXES.join("|");
  return new RegExp(
    `((?:[a-zA-Z0-9_\\-]+:)*)(${prefixes})-(${tokens})/(\\d+)`,
    "g"
  );
}

/**
 * Find all opacity-suffixed token class errors in `content`.
 * Returns an array of { line, col, fullMatch, suggestion } objects.
 * Exported for unit tests.
 *
 * @param {string} content - File contents as a string
 * @param {string} filePath - File path for error messages (relative to repo root)
 * @returns {{ line: number, col: number, fullMatch: string, suggestion: string }[]}
 */
function findOpacityTokenErrors(content, filePath) {
  const errors = [];
  const pattern = buildOpacityTokenPattern();
  const lines = content.split("\n");

  lines.forEach((lineText, idx) => {
    pattern.lastIndex = 0;
    let m;
    while ((m = pattern.exec(lineText)) !== null) {
      const [fullMatch, variants, prefix, token, pct] = m;
      const cssVar = TOKEN_CSS_VAR_MAP[token];
      if (!cssVar) continue;
      const suggestion = `${variants}${prefix}-[color-mix(in_srgb,var(${cssVar})_${pct}%,transparent)]`;
      errors.push({
        line: idx + 1,
        col: m.index + 1,
        fullMatch,
        suggestion,
        file: filePath,
      });
    }
  });

  return errors;
}

/**
 * Check all source files for opacity-suffixed token classes.
 * Returns an array of error strings ready for console output.
 */
function checkOpacityTokenUsages() {
  const errors = [];
  const codeFiles = walk(SRC_DIR, [".ts", ".tsx"]);

  for (const file of codeFiles) {
    const content = fs.readFileSync(file, "utf8");
    const relPath = path.relative(ROOT, file);
    const fileErrors = findOpacityTokenErrors(content, relPath);
    for (const e of fileErrors) {
      errors.push(
        `${e.file}:${e.line}:${e.col}: opacity-suffixed token class "${e.fullMatch}" emits no CSS.\n` +
        `  → Replace with: "${e.suggestion}"\n` +
        `  (Tailwind 3 cannot apply opacity modifiers to CSS-variable colors.)`
      );
    }
  }

  return errors;
}

// Export for unit tests
if (typeof module !== "undefined") {
  module.exports = { findOpacityTokenErrors, buildOpacityTokenPattern, TOKEN_CSS_VAR_MAP };
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  const defined = collectDefined();
  const animShadowErrors = checkUsages(defined);
  const opacityErrors = checkOpacityTokenUsages();

  const allErrors = [...animShadowErrors, ...opacityErrors];

  if (animShadowErrors.length > 0) {
    console.error(`Found ${animShadowErrors.length} undefined animate-*/shadow-* class usage(s):\n`);
    animShadowErrors.forEach((e) => console.error(`  ${e}`));
  }

  if (opacityErrors.length > 0) {
    console.error(`\nFound ${opacityErrors.length} opacity-suffixed theme token class(es) that emit no CSS:\n`);
    opacityErrors.forEach((e) => console.error(`  ${e}\n`));
    console.error(
      "Fix: use color-mix() instead of an opacity modifier on a CSS-variable color.\n" +
      "See: https://github.com/OFFER-HUB/offer-hub-monorepo/issues/1734"
    );
  }

  if (allErrors.length > 0) {
    process.exit(1);
  }

  console.log("No undefined animate-*/shadow-* classes found.");
  console.log("No opacity-suffixed theme token classes found.");
}

main();
