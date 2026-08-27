#!/usr/bin/env node
// The mcp/ package builds standalone — its tsconfig `rootDir` is `./src`
// and it's excluded from the root tsconfig, so it can't import files from
// the main app directly. To avoid re-implementing the shared doc-indexing
// traversal, this copies the single source of truth
// (src/lib/docs/collect-files.ts) into mcp/src/ before every build/dev run.
// The copy is generated (see mcp/.gitignore) — edit the source file, not
// this output.
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE = join(__dirname, "..", "..", "src", "lib", "docs", "collect-files.ts");
const DEST = join(__dirname, "..", "src", "collect-files.generated.ts");

mkdirSync(dirname(DEST), { recursive: true });

const header =
  "// GENERATED — synced from src/lib/docs/collect-files.ts by mcp/scripts/sync-shared.mjs.\n" +
  "// Do not edit directly; edit the source file and re-run `npm run build` or `npm run dev`.\n\n";

writeFileSync(DEST, header + readFileSync(SOURCE, "utf8"));
console.log(`Synced ${SOURCE} -> ${DEST}`);
