"""
helpers.py — shared utilities for the OFFER-HUB offline SVG diagram pipeline.

Every diagram source file imports from this module to get consistent:
  - Design-system colour tokens (matching src/app/globals.css)
  - Neumorphic shadow utilities
  - Graphviz graph factory with sane defaults
  - SVG post-processing: inject <style> block so CSS variables resolve at
    render-time in both light and dark mode

Usage in a diagram source file:
    from helpers import make_graph, save_svg, TOKENS

    g = make_graph("my-diagram", label="My Diagram")
    g.node("A", "Step A")
    g.edge("A", "B")
    save_svg(g, "my-diagram")
"""

from __future__ import annotations

import os
import re
import textwrap
from pathlib import Path
from typing import Final

import graphviz  # type: ignore[import]

# ---------------------------------------------------------------------------
# Output directory
# ---------------------------------------------------------------------------

OUTPUT_DIR: Final[Path] = Path(__file__).resolve().parents[2] / "public" / "diagrams"

# ---------------------------------------------------------------------------
# Design-system colour tokens
# (keep in sync with src/app/globals.css :root and .dark)
# ---------------------------------------------------------------------------

TOKENS: Final[dict[str, str]] = {
    # Backgrounds
    "bg_base": "var(--color-bg-base)",
    "bg_elevated": "var(--color-bg-elevated)",
    "bg_sunken": "var(--color-bg-sunken)",
    # Text
    "text_primary": "var(--color-text-primary)",
    "text_secondary": "var(--color-text-secondary)",
    "text_muted": "var(--color-text-muted)",
    # Brand
    "primary": "var(--color-primary)",
    "primary_hover": "var(--color-primary-hover)",
    "secondary": "var(--color-secondary)",
    "accent": "var(--color-accent)",
    # Semantic
    "success": "var(--color-success)",
    "warning": "var(--color-warning)",
    "error": "var(--color-error)",
    # Borders
    "border": "var(--color-border)",
    # Shadows (used as stroke/fill helpers when needed)
    "shadow_dark": "var(--shadow-dark)",
    "shadow_light": "var(--shadow-light)",
}

# Fallback static values used for Graphviz attribute strings (Graphviz cannot
# evaluate CSS variables at render time — we inject a <style> block instead).
# These are the light-mode defaults from globals.css.
_FALLBACK: Final[dict[str, str]] = {
    "bg_base": "#F1F3F7",
    "bg_elevated": "#ffffff",
    "bg_sunken": "#e8eaef",
    "text_primary": "#19213D",
    "text_secondary": "#6D758F",
    "text_muted": "#9ca3af",
    "primary": "#149A9B",
    "primary_hover": "#0d7377",
    "secondary": "#002333",
    "accent": "#15949C",
    "success": "#16a34a",
    "warning": "#d97706",
    "error": "#FF0000",
    "border": "#d1d5db",
    "shadow_dark": "#d1d5db",
    "shadow_light": "#ffffff",
}


def color(name: str) -> str:
    """Return the static fallback colour for the given token name.

    Used wherever Graphviz needs a literal hex string (e.g. node fillcolor).
    The generated SVG also receives an injected <style> block that overrides
    these with CSS variables at runtime.
    """
    return _FALLBACK[name]


# ---------------------------------------------------------------------------
# CSS style block injected into every SVG
# ---------------------------------------------------------------------------

_CSS_STYLE: Final[str] = textwrap.dedent(
    """
    <style>
      /* ── Light-mode defaults (CSS custom properties from globals.css) ─────── */
      :root {
        --color-bg-base:         #F1F3F7;
        --color-bg-elevated:     #ffffff;
        --color-bg-sunken:       #e8eaef;
        --color-text-primary:    #19213D;
        --color-text-secondary:  #6D758F;
        --color-primary:         #149A9B;
        --color-primary-hover:   #0d7377;
        --color-secondary:       #002333;
        --color-accent:          #15949C;
        --color-success:         #16a34a;
        --color-warning:         #d97706;
        --color-error:           #FF0000;
        --color-border:          #d1d5db;
        --shadow-dark:           #d1d5db;
        --shadow-light:          #ffffff;
      }

      /* ── Dark-mode overrides ────────────────────────────────────────────── */
      @media (prefers-color-scheme: dark) {
        :root {
          --color-bg-base:         #242433;
          --color-bg-elevated:     #2e2e3f;
          --color-bg-sunken:       #1a1a26;
          --color-text-primary:    #f1f3f7;
          --color-text-secondary:  #b8bfd0;
          --color-primary:         #1fb8b9;
          --color-primary-hover:   #25d4d5;
          --color-border:          #3d3d5c;
          --shadow-dark:           #1a1a26;
          --shadow-light:          #2e2e3f;
        }
      }

      /* Class-based dark mode (.dark on <html>) used by site ThemeProvider */
      .dark {
        --color-bg-base:         #242433;
        --color-bg-elevated:     #2e2e3f;
        --color-bg-sunken:       #1a1a26;
        --color-text-primary:    #f1f3f7;
        --color-text-secondary:  #b8bfd0;
        --color-primary:         #1fb8b9;
        --color-primary-hover:   #25d4d5;
        --color-border:          #3d3d5c;
        --shadow-dark:           #1a1a26;
        --shadow-light:          #2e2e3f;
      }

      /* ── Neumorphic card (raised) ───────────────────────────────────────── */
      .neu-raised {
        filter: drop-shadow(3px 3px 6px var(--shadow-dark))
                drop-shadow(-3px -3px 6px var(--shadow-light));
      }

      /* ── SVG element theming ────────────────────────────────────────────── */
      svg {
        background: var(--color-bg-base);
        font-family: Inter, Roboto, Outfit, sans-serif;
      }

      /* Nodes */
      .node polygon,
      .node ellipse,
      .node rect {
        fill:   var(--color-bg-elevated);
        stroke: var(--color-primary);
      }

      /* Cluster subgraph */
      .cluster rect {
        fill:   var(--color-bg-sunken);
        stroke: var(--color-border);
      }

      /* Edge lines */
      .edge path,
      .edge line {
        stroke: var(--color-text-secondary);
      }

      .edge polygon {
        fill:   var(--color-text-secondary);
        stroke: var(--color-text-secondary);
      }

      /* Text */
      .node text,
      .cluster text,
      .edge text {
        fill: var(--color-text-primary);
      }
    </style>
    """
).strip()


# ---------------------------------------------------------------------------
# Graph factory
# ---------------------------------------------------------------------------


def make_graph(
    name: str,
    *,
    label: str = "",
    directed: bool = True,
    rankdir: str = "LR",
    fontsize: str = "13",
    margin: str = "0.4,0.3",
) -> graphviz.Digraph | graphviz.Graph:
    """Return a styled Graphviz (Di)graph with OFFER-HUB design defaults.

    Parameters
    ----------
    name:
        Internal graph name (used as the SVG element id).
    label:
        Human-readable diagram title rendered above the graph.
    directed:
        True → Digraph (arrows); False → undirected Graph.
    rankdir:
        Layout direction: ``LR`` (left→right) or ``TB`` (top→bottom).
    fontsize:
        Base font size in points.
    margin:
        Canvas margin ``"x,y"`` in inches.
    """
    cls = graphviz.Digraph if directed else graphviz.Graph

    g = cls(
        name=name,
        graph_attr={
            "bgcolor": color("bg_base"),
            "fontname": "Inter, Roboto, sans-serif",
            "fontsize": fontsize,
            "fontcolor": color("text_primary"),
            "label": label,
            "labelloc": "t",
            "rankdir": rankdir,
            "margin": margin,
            "pad": "0.4",
            "splines": "curved",
            "overlap": "false",
        },
        node_attr={
            "shape": "roundedbox",
            "style": "filled,rounded",
            "fillcolor": color("bg_elevated"),
            "color": color("primary"),
            "fontname": "Inter, Roboto, sans-serif",
            "fontsize": fontsize,
            "fontcolor": color("text_primary"),
            "penwidth": "1.5",
            "margin": "0.18,0.12",
        },
        edge_attr={
            "color": color("text_secondary"),
            "fontname": "Inter, Roboto, sans-serif",
            "fontsize": str(int(fontsize) - 1),
            "fontcolor": color("text_secondary"),
            "penwidth": "1.5",
            "arrowsize": "0.8",
        },
    )
    return g


# ---------------------------------------------------------------------------
# SVG post-processing & save
# ---------------------------------------------------------------------------


def _inject_style(svg_text: str) -> str:
    """Inject the design-system <style> block into the SVG's <defs> section."""
    # If there is an existing <defs> block, insert before </defs>
    if "<defs>" in svg_text:
        return svg_text.replace("<defs>", f"<defs>\n{_CSS_STYLE}\n", 1)

    # Otherwise insert right after the opening <svg …> tag
    match = re.search(r"(<svg\b[^>]*>)", svg_text)
    if match:
        insert_pos = match.end()
        return svg_text[:insert_pos] + f"\n<defs>\n{_CSS_STYLE}\n</defs>\n" + svg_text[insert_pos:]

    return svg_text


def _make_responsive(svg_text: str) -> str:
    """Replace fixed width/height with viewBox so the SVG scales fluidly."""
    # Extract and preserve the viewBox; remove fixed pixel dimensions.
    viewbox_match = re.search(r'viewBox="([^"]+)"', svg_text)
    if not viewbox_match:
        return svg_text

    # Remove width="…" and height="…" attributes from the <svg> opening tag.
    svg_text = re.sub(r'\s+width="[^"]*"', "", svg_text)
    svg_text = re.sub(r'\s+height="[^"]*"', "", svg_text)

    return svg_text


def save_svg(graph: graphviz.Digraph | graphviz.Graph, filename: str) -> Path:
    """Render *graph* to SVG, post-process it, and write to public/diagrams/.

    Parameters
    ----------
    graph:
        A Graphviz (Di)graph instance produced by :func:`make_graph`.
    filename:
        Output file stem (no extension), e.g. ``"payment-flow"``.

    Returns
    -------
    Path
        The absolute path of the written SVG file.
    """
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Render to SVG string (Graphviz writes a temp file then reads it back).
    raw_svg: str = graph.pipe(format="svg").decode("utf-8")

    # Post-process.
    svg = _inject_style(raw_svg)
    svg = _make_responsive(svg)

    out_path = OUTPUT_DIR / f"{filename}.svg"
    out_path.write_text(svg, encoding="utf-8")
    print(f"  ✔  {out_path.relative_to(Path.cwd())}")
    return out_path
