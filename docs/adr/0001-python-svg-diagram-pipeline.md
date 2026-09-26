# ADR 0001 — Python SVG Diagram Generation Pipeline

**Status:** Accepted  
**Date:** 2026-09-26  
**Issue:** [#1581](https://github.com/OFFER-HUB/offer-hub-monorepo/issues/1581)

---

## Context

The site currently renders all 24 architectural diagrams using
[Mermaid](https://mermaid.js.org/) client-side inside the `MermaidDiagram`
React component (`src/components/shared/MermaidDiagram.tsx`).

Client-side rendering has three drawbacks we want to eliminate:

1. **Inconsistency** — Mermaid re-renders on every page visit; slight style
   drift appears between light/dark theme flips and browser versions.
2. **Performance** — Each diagram costs a dynamic-import + JS parse of the
   full Mermaid bundle (~900 kB) before anything appears.
3. **No diff-ability** — SVG output isn't committed, so CI cannot detect when
   a source diagram changes but the rendered artefact is stale.

We need an **offline pipeline** that generates deterministic, optimised SVGs
from source files, commits the output into `public/diagrams/`, and lets CI
enforce freshness.

---

## Decision

Use **[drawsvg](https://pypi.org/project/drawsvg/)** (≥ 2.4) as the
programmatic SVG construction library, driven by plain Python scripts.

### Why drawsvg?

| Criterion | drawsvg | Graphviz (dot) | diagrams (py) | matplotlib |
|-----------|---------|---------------|---------------|------------|
| Pure-Python SVG construction | ✅ | ❌ (C binary dep) | ❌ (Graphviz dep) | ❌ (Pillow/Agg) |
| No system-level install in CI | ✅ | ❌ | ❌ | ❌ |
| Fine-grained neumorphic style control | ✅ (full SVG API) | ⚠️ limited | ❌ | ⚠️ limited |
| Light + dark output from one source | ✅ (pass tokens) | ⚠️ manual | ⚠️ manual | ⚠️ manual |
| Deterministic output | ✅ | ✅ | ✅ | ✅ |
| pip-only dependency | ✅ | ❌ | ❌ | ❌ |
| Existing design-token integration | ✅ (CSS vars mapped in helper) | ❌ | ❌ | ❌ |

Graphviz (`dot`) was the closest alternative but requires a system binary
(`apt-get install graphviz`) that inflates CI setup time and is unavailable
in locked-down environments. The `diagrams` library wraps Graphviz and
inherits the same constraint.

`matplotlib` can emit SVG but is a 35 MB scientific-computing library;
using it for architecture diagrams would be a heavy, semantically wrong
dependency.

drawsvg is a pure-Python SVG construction library: `pip install drawsvg`
is the only step needed. It generates compliant, minifiable SVG with full
control over every attribute — exactly what we need to match the
neumorphic design system's CSS-variable tokens.

### How design tokens map to the pipeline

The shared helper (`scripts/diagrams/diagram_helper.py`) exposes two
`Palette` objects — `LIGHT` and `DARK` — whose values are read from the
same CSS variable names documented in `tailwind.config.ts` and
`docs/design/color-palette.md`. Each diagram source file calls
`draw_diagram(palette=LIGHT)` and `draw_diagram(palette=DARK)` to produce
two SVGs per source:

```
public/diagrams/<name>-light.svg
public/diagrams/<name>-dark.svg
```

The Next.js `<img>` tag selects the correct variant via a CSS class
`:root` / `.dark` media approach so no JS is required at runtime.

---

## Consequences

**Positive:**
- Zero system-level dependencies; CI install is a single `pip install -r`.
- Output SVGs are committed and diffable in PRs.
- CI fails fast when a source diagram changes without regenerating the SVG.
- Diagrams load as static assets — no JS bundle cost.
- Full neumorphic design-token compliance in light and dark mode.

**Negative / trade-offs:**
- Diagrams are authored in Python, not Mermaid DSL. New contributors need to
  learn the `drawsvg` API. Mitigation: `docs/diagrams.md` includes a complete
  step-by-step guide and the helper module abstracts most boilerplate.
- Each diagram change requires running `npm run diagrams` locally before
  committing. Mitigation: CI check surfaces forgotten regeneration
  immediately.

---

## Alternatives Rejected

| Alternative | Reason rejected |
|-------------|-----------------|
| Keep Mermaid client-side | Does not solve perf or consistency issues |
| Graphviz / `dot` binary | System dependency; CI overhead |
| `diagrams` Python lib | Wraps Graphviz; same system dep |
| SVG hand-authored in Figma / Sketch | Not diff-able, not automatable |
| Puppeteer Mermaid SSR | Node + Chrome headless in CI; heavy |

---

## References

- `tailwind.config.ts` — design token CSS variables
- `docs/design/color-palette.md` — full colour palette reference
- `docs/design/neumorphism.md` — neumorphic shadow tokens
- `src/components/shared/MermaidDiagram.tsx` — existing client-side renderer
- `scripts/diagrams/` — pipeline implementation
- `docs/diagrams.md` — contributor guide
