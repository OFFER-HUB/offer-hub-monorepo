#!/usr/bin/env node
/**
 * Standalone test runner for the opacity-token guard.
 * Runs without vitest — just pure Node.js assertions.
 * Used to verify correctness before npm install finishes.
 */

const { findOpacityTokenErrors, TOKEN_CSS_VAR_MAP } = require("./check-undefined-utility-classes.js");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

function assertEqual(a, b, message) {
  if (a === b) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}\n    expected: ${JSON.stringify(b)}\n    got:      ${JSON.stringify(a)}`);
    failed++;
  }
}

console.log("\n── TOKEN_CSS_VAR_MAP sanity ──");
assertEqual(TOKEN_CSS_VAR_MAP["theme-primary"], "--color-primary", "theme-primary → --color-primary");
assertEqual(TOKEN_CSS_VAR_MAP["theme-border"], "--color-border", "theme-border → --color-border");
assertEqual(TOKEN_CSS_VAR_MAP["bg-elevated"], "--color-bg-elevated", "bg-elevated → --color-bg-elevated");
assertEqual(TOKEN_CSS_VAR_MAP["content-secondary"], "--color-text-secondary", "content-secondary → --color-text-secondary");

console.log("\n── findOpacityTokenErrors ──");

// flags bg-theme-primary/10
{
  const e = findOpacityTokenErrors(`<div className="bg-theme-primary/10 text-theme-primary" />`, "Example.tsx");
  assert(e.length === 1, "flags bg-theme-primary/10 (1 error)");
  assertEqual(e[0].fullMatch, "bg-theme-primary/10", "correct fullMatch");
  assertEqual(e[0].suggestion, "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]", "correct suggestion");
}

// flags border-theme-border/40
{
  const e = findOpacityTokenErrors(`className="border border-theme-border/40"`, "X.tsx");
  assert(e.length === 1, "flags border-theme-border/40");
  assertEqual(e[0].suggestion, "border-[color-mix(in_srgb,var(--color-border)_40%,transparent)]", "border suggestion");
}

// preserves hover: variant
{
  const e = findOpacityTokenErrors(`hover:bg-theme-primary/10`, "X.tsx");
  assert(e.length === 1, "flags hover:bg-theme-primary/10");
  assertEqual(e[0].fullMatch, "hover:bg-theme-primary/10", "hover: fullMatch");
  assertEqual(e[0].suggestion, "hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]", "hover: suggestion");
}

// does NOT flag color-mix replacement
{
  const e = findOpacityTokenErrors(`bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]`, "X.tsx");
  assert(e.length === 0, "does NOT flag color-mix replacement");
}

// does NOT flag non-token palette colors
{
  const e = findOpacityTokenErrors(`bg-red-500/10 text-blue-400/80`, "X.tsx");
  assert(e.length === 0, "does NOT flag non-token palette colors (bg-red-500/10)");
}

// does NOT flag plain token classes
{
  const e = findOpacityTokenErrors(`bg-theme-primary text-theme-success border-theme-border`, "X.tsx");
  assert(e.length === 0, "does NOT flag plain token classes without /NN");
}

// multiple errors in one file
{
  const e = findOpacityTokenErrors(`bg-theme-primary/10\nborder-theme-border/20\ntext-content-secondary/70`, "X.tsx");
  assert(e.length === 3, "flags 3 errors in one file");
}

// flags every prefix
{
  const prefixes = ["bg", "text", "border", "ring", "from", "to", "via", "divide", "outline", "fill", "stroke"];
  let allPassed = true;
  for (const p of prefixes) {
    const e = findOpacityTokenErrors(`${p}-theme-primary/15`, "X.tsx");
    if (e.length !== 1) { allPassed = false; console.error(`  ✗ prefix ${p} not flagged`); failed++; }
  }
  if (allPassed) { console.log(`  ✓ all 11 prefixes flagged`); passed += prefixes.length; }
}

// bg-theme-success/10 → --color-success
{
  const e = findOpacityTokenErrors(`bg-theme-success/10`, "X.tsx");
  assertEqual(e[0].suggestion, "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]", "success token");
}

// bg-content-muted/12 → --color-text-muted
{
  const e = findOpacityTokenErrors(`bg-content-muted/12`, "X.tsx");
  assertEqual(e[0].suggestion, "bg-[color-mix(in_srgb,var(--color-text-muted)_12%,transparent)]", "content-muted token");
}

console.log(`\n── Results: ${passed} passed, ${failed} failed ──\n`);
if (failed > 0) process.exit(1);
