#!/usr/bin/env node
/**
 * Fails the build if source files reference an `animate-*` or `shadow-*`
 * Tailwind class that isn't actually defined anywhere (globals.css keyframes,
 * tailwind.config.ts, or an inline `.animate-x { }` / `.shadow-x { }` rule in
 * a component). Catches typos like `animate-fade-in-up` vs `animate-fadeInUp`
 * silently rendering as a no-op (see issue #1500).
 *
 * Also guards against opacity-suffixed theme token classes (e.g.
 * `bg-theme-primary/10`, `border-theme-border/40`): Tailwind 3 cannot apply an
 * opacity modifier to colors defined as CSS variables, so those classes emit no
 * CSS at all. The replacement is an equivalent color-mix arbitrary value (see
 * issue #1734 and the reference pattern in src/components/ui/status-colors.ts).
 */

const fs = require("fs");
const path = require("path");

/**
 * Theme tokens whose backing value is a CSS variable (see tailwind.config.ts).
 * Mapping each token to its CSS variable lets the guard suggest the exact
 * color-mix replacement in its error message.
 */
const TOKEN_TO_CSS_VAR = {
  "theme-primary": "--color-primary",
  "theme-primary-hover": "--color-primary-hover",
  "theme-secondary": "--color-secondary",
  "theme-accent": "--color-accent",
  "bg-base": "--color-bg-base",
  "bg-elevated": "--color-bg-elevated",
  "bg-sunken": "--color-bg-sunken",
  "content-primary": "--color-text-primary",
  "content-secondary": "--color-text-secondary",
  "content-muted": "--color-text-muted",
  "theme-success": "--color-success",
  "theme-warning": "--color-warning",
  "theme-error": "--color-error",
  "theme-border": "--color-border",
};

// Matches an opacity-suffixed theme token class as a standalone token. The
// lookbehind `(?<![\w-])` avoids matching inside another class name; variant
// prefixes like `hover:`/`md:` end with `:`, which is not [\w-], so they pass
// and are preserved (only the matched span is flagged for replacement).
const OPACITY_TOKEN_RE =
  /(?<![\w-])(bg|text|border|ring|from|to|via|divide|outline|fill|stroke)-(theme-[a-z-]+|bg-(?:base|elevated|sunken)|content-(?:primary|secondary|muted))\/(\d+)/g;

/**
 * Scan a single line of source for opacity-suffixed theme token classes and
 * return a descriptive error string per match. Exported so it can be unit
 * tested without touching the filesystem.
 *
 * @param {string} line   one source line
 * @param {string} file   repo-relative file path (for the error location)
 * @param {number} lineNo 1-based line number
 * @returns {string[]}    error messages (empty when the line is clean)
 */
function findOpacityTokenErrors(line, file, lineNo) {
  const errors = [];
  for (const m of line.matchAll(OPACITY_TOKEN_RE)) {
    const [, prefix, token, opacity] = m;
    const cssVar = TOKEN_TO_CSS_VAR[token];
    if (!cssVar) continue; // unknown token — not the guard's concern
    const suggestion = `${prefix}-[color-mix(in_srgb,var(${cssVar})_${opacity}%,transparent)]`;
    errors.push(
      `${file}:${lineNo}: opacity-suffixed token class "${m[0]}" emits no CSS in Tailwind 3 ` +
        `(CSS-variable colors ignore the /opacity modifier). Replace with "${suggestion}".`,
    );
  }
  return errors;
}

module.exports = { findOpacityTokenErrors, OPACITY_TOKEN_RE, TOKEN_TO_CSS_VAR };

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

  const boxShadowMatch = twConfig.match(/boxShadow:\s*{([\s\S]*?)\n\s*},/);
  if (boxShadowMatch) {
    for (const m of boxShadowMatch[1].matchAll(/["']?([a-zA-Z0-9-]+)["']?\s*:/g)) {
      shadow.add(m[1]);
    }
  }

  const animationMatch = twConfig.match(/\banimation:\s*{([\s\S]*?)\n\s*},/);
  if (animationMatch) {
    for (const m of animationMatch[1].matchAll(/["']?([a-zA-Z0-9-]+)["']?\s*:/g)) {
      animate.add(m[1]);
    }
  }

  // Extended color names, valid as `shadow-{color}`.
  const colorsMatch = twConfig.match(/colors:\s*{([\s\S]*?)\n\s*},\n\s*keyframes/);
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

function checkOpacitySuffixedTokenClasses() {
  const errors = [];
  const codeFiles = walk(SRC_DIR, [".ts", ".tsx"]);

  for (const file of codeFiles) {
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split("\n");
    lines.forEach((line, idx) => {
      const lineErrors = findOpacityTokenErrors(
        line,
        path.relative(ROOT, file),
        idx + 1,
      );
      errors.push(...lineErrors);
    });
  }

  return errors;
}

function main() {
  const defined = collectDefined();

  const errors = checkUsages(defined);
  const opacityErrors = checkOpacitySuffixedTokenClasses();

  if (errors.length > 0) {
    console.error(`Found ${errors.length} undefined animate-*/shadow-* class usage(s):\n`);
    errors.forEach((e) => console.error(`  ${e}`));
  }

  if (opacityErrors.length > 0) {
    console.error(
      `\nFound ${opacityErrors.length} opacity-suffixed theme token class(es) that emit no CSS:\n`,
    );
    opacityErrors.forEach((e) => console.error(`  ${e}`));
    console.error(
      "\nTailwind 3 ignores the /opacity modifier on CSS-variable colors. " +
        "Use an equivalent color-mix arbitrary value, e.g. " +
        "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]. " +
        "See src/components/ui/status-colors.ts for the reference pattern.\n",
    );
  }

  if (errors.length > 0 || opacityErrors.length > 0) {
    process.exit(1);
  }

  console.log("No undefined animate-*/shadow-* classes found.");
  console.log("No opacity-suffixed theme token classes found.");
}

// Run only when invoked directly (not when required by a test).
if (require.main === module) {
  main();
}
