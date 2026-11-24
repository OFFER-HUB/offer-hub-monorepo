#!/usr/bin/env node
/**
 * fix-opacity-tokens.js
 * Replaces all opacity-suffixed theme token Tailwind classes with
 * color-mix() arbitrary-value equivalents that actually emit CSS.
 *
 * Token → CSS variable map mirrors tailwind.config.ts
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT, "src");

/** Token name → CSS custom property */
const TOKEN_MAP = {
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

const PREFIXES = [
  "bg", "text", "border", "ring", "from", "to", "via",
  "divide", "outline", "fill", "stroke",
];

function walk(dir, exts, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, exts, out);
    } else if (exts.some((e) => entry.name.endsWith(e))) {
      out.push(full);
    }
  }
  return out;
}

function buildPattern() {
  const tokens = Object.keys(TOKEN_MAP).sort((a, b) => b.length - a.length); // longest first
  const tokenAlt = tokens.map((t) => t.replace(/-/g, "\\-")).join("|");
  const prefixAlt = PREFIXES.join("|");
  // Capture:
  //   group 1 (variants): zero or more `word:` segments (hover:, md:focus:, etc.)
  //   group 2 (prefix):   one of PREFIXES
  //   group 3 (token):    one of TOKEN_MAP keys
  //   group 4 (pct):      integer 1-100
  return new RegExp(
    `((?:[a-zA-Z0-9_\\-]+:)*)(${prefixAlt})-(${tokenAlt})/(\\d+)`,
    "g"
  );
}

function replace(content, pattern) {
  return content.replace(pattern, (_, variants, prefix, token, pct) => {
    const cssVar = TOKEN_MAP[token];
    if (!cssVar) return _;
    return `${variants}${prefix}-[color-mix(in_srgb,var(${cssVar})_${pct}%,transparent)]`;
  });
}

function main() {
  const pattern = buildPattern();
  const files = walk(SRC_DIR, [".tsx", ".ts", ".css"]);
  let totalFiles = 0;
  let totalReplacements = 0;

  for (const file of files) {
    const original = fs.readFileSync(file, "utf8");
    // Reset lastIndex each file
    pattern.lastIndex = 0;
    // Count matches first
    const matchCount = (original.match(new RegExp(pattern.source, "g")) || []).length;
    if (matchCount === 0) continue;

    pattern.lastIndex = 0;
    const updated = replace(original, pattern);
    fs.writeFileSync(file, updated, "utf8");
    totalFiles++;
    totalReplacements += matchCount;
    console.log(`  [${matchCount} fixes] ${path.relative(ROOT, file)}`);
  }

  console.log(`\nDone. ${totalReplacements} replacements across ${totalFiles} files.`);
}

main();
