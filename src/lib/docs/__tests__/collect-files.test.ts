import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Same in-memory filesystem approach as `src/lib/__tests__/mdx.test.ts` —
 * `collectFilesByExtension` walks the real filesystem, so it's driven
 * against a small virtual tree instead.
 */
const vfs = vi.hoisted(() => ({
  dirs: new Set<string>(),
  files: new Map<string, string>(),
}));

const norm = (p: string) => p.replace(/\\/g, "/").replace(/\/+$/, "");

vi.mock("fs", () => {
  const readdirSync = (dir: string) => {
    const base = norm(dir);
    const names = new Set<string>();
    const entries: { name: string; isDirectory(): boolean; isFile(): boolean }[] = [];

    const add = (name: string, isDir: boolean) => {
      if (names.has(name)) return;
      names.add(name);
      entries.push({ name, isDirectory: () => isDir, isFile: () => !isDir });
    };

    for (const d of vfs.dirs) {
      if (d.startsWith(base + "/")) {
        const rest = d.slice(base.length + 1);
        if (!rest.includes("/")) add(rest, true);
      }
    }
    for (const f of vfs.files.keys()) {
      if (f.startsWith(base + "/")) {
        const rest = f.slice(base.length + 1);
        if (!rest.includes("/")) add(rest, false);
      }
    }
    return entries;
  };

  return { default: { readdirSync }, readdirSync };
});

import path from "node:path";
import { collectFilesByExtension } from "../collect-files";

const ROOT = norm(path.join(process.cwd(), "content/docs"));

function addFile(relPath: string) {
  const full = ROOT + "/" + relPath;
  let dir = norm(path.dirname(full));
  while (dir.length >= ROOT.length) {
    vfs.dirs.add(dir);
    const parent = norm(path.dirname(dir));
    if (parent === dir) break;
    dir = parent;
  }
  vfs.files.set(full, "");
}

beforeEach(() => {
  vfs.dirs.clear();
  vfs.files.clear();
});

describe("collectFilesByExtension", () => {
  it("returns nested paths relative to dir, with forward slashes", () => {
    addFile("intro.mdx");
    addFile("api-reference/webhooks.mdx");
    addFile("guide/escrow/deposits.mdx");

    expect(collectFilesByExtension(ROOT, ".mdx").sort()).toEqual([
      "api-reference/webhooks.mdx",
      "guide/escrow/deposits.mdx",
      "intro.mdx",
    ]);
  });

  it("filters by extension, ignoring other file types", () => {
    addFile("intro.mdx");
    vfs.files.set(ROOT + "/README.md", "");
    vfs.files.set(ROOT + "/diagram.png", "");

    expect(collectFilesByExtension(ROOT, ".mdx")).toEqual(["intro.mdx"]);
  });

  it("returns an empty list for an empty directory", () => {
    vfs.dirs.add(ROOT);

    expect(collectFilesByExtension(ROOT, ".mdx")).toEqual([]);
  });
});
