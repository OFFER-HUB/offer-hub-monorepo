#!/usr/bin/env node
/**
 * Fails the build if source files reference an `animate-*` or `shadow-*`
 * Tailwind class that isn't actually defined anywhere (globals.css keyframes,
 * tailwind.config.ts, or an inline `.animate-x { }` / `.shadow-x { }` rule in
 * a component). Catches typos like `animate-fade-in-up` vs `animate-fadeInUp`
 * silently rendering as a no-op (see issue #1500).
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

function main() {
  const defined = collectDefined();
  const errors = checkUsages(defined);

  if (errors.length > 0) {
    console.error(`Found ${errors.length} undefined animate-*/shadow-* class usage(s):\n`);
    errors.forEach((e) => console.error(`  ${e}`));
    process.exit(1);
  }

  console.log("No undefined animate-*/shadow-* classes found.");
}

main();
