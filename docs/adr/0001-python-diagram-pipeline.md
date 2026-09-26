# ADR 0001 — Python Offline Diagram Generation Pipeline

| Field       | Value                          |
|-------------|--------------------------------|
| **Status**  | Accepted                       |
| **Date**    | 2026-09-26                     |
| **Author**  | OFFER-HUB contributors         |
| **Issue**   | [#1581](https://github.com/OFFER-HUB/offer-hub-monorepo/issues/1581) |

---

## Context

The docs site currently ships **24 Mermaid diagrams** that are rendered entirely
client-side (see `src/components/shared/MermaidDiagram.tsx`).  Client-side
rendering has three problems:

1. **Inconsistent visual output** — Mermaid's layout engine is not deterministic
   across versions; the same `.mdx` file can produce different SVG geometry on
   different CI runs or user browsers.
2. **Layout overhead** — Every diagram triggers a `dynamic import('mermaid')`,
   a `render()` call, and a React re-paint on first load.  On low-power devices
   (mobile, Chromebook) this can cause a visible flash and layout shift.
3. **No offline authoring guarantee** — Diagram sources live inline in `.mdx`
   files; there is no deterministic artefact that can be diffed or cached by a
   CDN.

The goal of this ADR is to choose and justify the toolchain for an **offline
(build-time) SVG generation pipeline** that produces committed, deterministic
SVG files served as static assets from `public/diagrams/`.

---

## Decision

Use **Python + Graphviz** (`graphviz` PyPI package — wraps the Graphviz C
library) as the primary rendering engine, supplemented by a thin Python helper
module (`scripts/diagrams/helpers.py`) that applies OFFER-HUB design-system
tokens to every diagram.

Python scripts live in `scripts/diagrams/`.  Each diagram has its own source
file (e.g. `payment-flow.py`).  Running `npm run diagrams` executes the
pipeline and writes optimised SVGs to `public/diagrams/`.

A companion `npm run diagrams:check` command re-runs the pipeline into a temp
directory and fails CI if the output diverges from what is committed.

### Why Graphviz?

| Criterion                        | Graphviz | `diagrams` (mingrammer) | Matplotlib | Custom SVG (svgwrite) |
|----------------------------------|----------|-------------------------|------------|-----------------------|
| Deterministic SVG output         | ✅ Yes   | ✅ Yes                  | ✅ Yes     | ✅ Yes                |
| Automatic layout (DAG/flowchart) | ✅ Yes   | ✅ Yes                  | ❌ Manual  | ❌ Manual             |
| Zero JS / browser dependency     | ✅ Yes   | ✅ Yes                  | ✅ Yes     | ✅ Yes                |
| Install size                     | ~2 MB    | ~30 MB + icons          | ~35 MB     | ~100 KB               |
| Offline / air-gapped CI          | ✅ Yes   | ✅ Yes                  | ✅ Yes     | ✅ Yes                |
| Pythonic API                     | ✅ Yes   | ✅ Yes                  | ✅ Yes     | ✅ Yes                |
| Scales to 50+ diagrams           | ✅ Yes   | ✅ Yes                  | ⚠️ Tedious | ⚠️ Tedious            |
| Dark-mode–aware colours in SVG   | ✅ CSS vars | ❌ Hardcoded         | ❌ PNG     | ✅ CSS vars           |
| Linux apt/brew install           | ✅ Yes   | ❌ No (Python-only)     | ✅ Yes     | N/A                   |
| Used by industry (CNCF, Google)  | ✅ Yes   | ✅ Yes                  | ⚠️ Charts  | —                     |

**`diagrams` (mingrammer)** was a strong runner-up but is optimised for
cloud-architecture icon-based diagrams and embeds ~800 KB of provider icons
that are irrelevant here.  Its PNG-first output also makes dark-mode theming
harder.

**`svgwrite`** is excellent for pixel-perfect custom visuals but requires
manually positioning every node — not practical as the diagram count grows.

**Matplotlib** targets scientific charts; its SVG output is verbose, includes
font metrics, and is difficult to theme with CSS variables.

**Graphviz** wins because:
- Its DOT-language-based layout engine is the industry standard for DAG/flow
  diagrams, which are the majority of OFFER-HUB architecture diagrams.
- The `graphviz` Python package wraps the C binary that ships with all major
  Linux distros (`apt-get install graphviz`), meaning CI setup is one line.
- The SVG output is clean XML that can embed `<style>` blocks referencing
  `var(--color-*)` CSS tokens, so diagrams adapt to the site's light/dark mode
  without JavaScript.
- Output is deterministic: the same DOT source + Graphviz version → identical
  byte-for-byte SVG, enabling the staleness check in CI.

---

## Consequences

### Positive

- SVG files are committed to the repo and served as static assets; no client
  rendering delay, no layout shift.
- Diagrams are diffable in PRs — reviewers can see exactly what changed.
- Adding a new diagram is a single Python file + `npm run diagrams`.
- The staleness check (`npm run diagrams:check`) prevents PRs from landing with
  out-of-date SVGs.
- CSS variable tokens ensure correct appearance in both light and dark mode
  without any JavaScript.

### Negative / Trade-offs

- Contributors need Python 3.9+ and the `graphviz` system package installed.
  The `README` in `scripts/diagrams/` documents the one-liner install.
- Graphviz's automatic layout can occasionally produce suboptimal edge routing
  for very dense graphs; manual `pos` hints are available as an escape hatch.
- DOT syntax is less expressive than Mermaid for sequence diagrams; complex
  sequence diagrams should remain as `MermaidDiagram` components until a
  dedicated pipeline is added.

### Unchanged

- Existing `MermaidDiagram` components in `.mdx` files are **not migrated** by
  this PR.  They continue to work exactly as before.  The new pipeline is purely
  additive.

---

## Alternatives Considered and Rejected

### Keep Mermaid client-side only

Rejected.  Does not address the determinism and layout-shift problems.

### Use a Node.js SVG library (`@svgdotjs/svg.js`, `d3`)

Rejected.  Requires a headless browser or JSDOM for layout; adds complexity
without determinism benefits.  The Python toolchain is simpler for diagram
authors.

### Use Mermaid CLI (`@mermaid-js/mermaid-cli`)

Considered.  The CLI runs Puppeteer/Chrome headlessly to render, which brings a
~300 MB binary dependency into CI.  Graphviz is ~2 MB and has no browser
dependency.

---

## References

- Graphviz project: <https://graphviz.org>
- `graphviz` Python package: <https://pypi.org/project/graphviz/>
- Mermaid client-side component: `src/components/shared/MermaidDiagram.tsx`
- Design system tokens: `src/app/globals.css`
- Neumorphism guide: `docs/design/neumorphism.md`
