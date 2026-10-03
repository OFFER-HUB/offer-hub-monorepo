# ADR 0001: Diagram Generation Pipeline

- **Status:** Accepted
- **Date:** 2025-02-14

## Context

All 24 diagrams in the documentation site are currently Mermaid definitions rendered client-side by the `mermaid` package. This has several drawbacks:

1. **Client-side cost** - Mermaid is a large bundle that must be loaded and executed in the browser on every page that contains a diagram.
2. **Flash of unstyled content** - Diagrams appear after hydration, causing layout shifts.
3. **Inconsistent look in light/dark mode** - Mermaid theming is limited and does not match the neumorphic design system.
4. **Difficult to review** - Mermaid source lives inside TypeScript files, not in a dedicated diagram source location.

## Decision

We will generate SVG diagrams offline using **Graphviz**, driven from Python, with a thin helper layer that applies the neumorphic design tokens.

The pipeline lives in `scripts/diagrams/` and is exposed through `npm run diagrams`.

## Why Graphviz (and not `mermaid-cli`, `diagrams`, or matplotlib)

| Option | Pros | Cons/Rejected because |
| --- | --- | --- |
| **Graphviz** | Mature, deterministic, excellent layout engines (`dot`, `neato`, `circo`), SVG output, stable CLI, available in CI via apt/brew. | Lower-level than Mermaid; requires a thin helper for theming. Accepted because the helper is small and the result is fully controlled. |
| `mermaid-cli` | Same syntax as existing diagrams. | Mermaid's SVG output is hard to theme with our tokens; heavy Node dependency; layout less predictable. |
| `diagrams` (Python) | Nice cloud icons. | Tied to cloud provider icons, not our domain; adds a heavy dependency tree. |
| **Matplotlib** | Great for charts. | Poor for node/edge diagrams; manual layout needed. |
| **Custom SVG** | Full control. | Too much manual work for 24+ diagrams; difficult to maintain. |

## Consequences

### Positive

- **Deterministic output** - the same source always produces the same SVG, which makes CI drift checks reliable.
- **Instant load** - SVGs are static assets; no client-side JavaScript is needed to render them.
- **Consistent look in both themes** - the helper injects CSS variables that resolve to the design tokens at runtime, so light and dark mode both look correct.
- **Editable source** - one Python file per diagram, easy to review and diff.

### Negative

- Adds a Python + Graphviz toolchain to the repo. This is isolated to `scripts/diagrams/` and only runs on demand or in CI.
- No longer possible to edit diagrams directly in the browser; the contributor must regenerate.

## References

- [Graphviz DOT language](https://graphviz.org/doc/info/lang.html)
- [Graphviz SVG output](https://graphviz.org/doc/info/output.html#svg)
- Existing Mermaid diagrams in `src/components/architecture/`
