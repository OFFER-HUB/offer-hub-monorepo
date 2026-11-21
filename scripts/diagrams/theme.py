"""Shared helpers for OFFER-HUB's static (offline) diagram pipeline.

Why this exists and how it stays token-driven is explained in
docs/adr/0001-python-diagram-pipeline.md. In short, every diagram:

1. Is built with Graphviz using semantic `class` attributes
   (``oh-node``, ``oh-node--terminal``, ``oh-edge``) instead of literal
   colors. The literal colors passed to graphviz below (``black``/``white``)
   are placeholders only: Graphviz requires *some* valid color to lay the
   graph out, but every one of them is overridden by the stylesheet below.
2. Gets a single ``<style>`` block injected after the opening ``<svg>`` tag.
   Every declaration in it is a ``var(--token)`` reference into the site's
   existing CSS custom properties (``src/app/globals.css``), never a literal
   hex value. A CSS class selector always wins over an SVG presentation
   attribute of the same property, so this overrides Graphviz's placeholder
   colors without needing to strip them first.
3. Because the generated SVG is inlined into the page DOM (see
   ``src/components/docs/StaticDiagram.tsx``), those ``var()`` references
   resolve against the *live* page tokens: light/dark mode and any future
   palette change apply automatically, with zero regeneration.
4. Gets the same dual drop-shadow neumorphic treatment as Mermaid diagrams
   (``src/lib/diagram-theme.ts``), at the same 145 degree light source
   documented in docs/design/neumorphism.md.
5. Is optimized with scour before being written to ``public/diagrams/``.

Every token referenced in STYLE_BLOCK must exist in src/app/globals.css
under both `:root` and `.dark`. If you add a new token reference here, add
it there first.
"""

from __future__ import annotations

from pathlib import Path

import graphviz
from scour.scour import sanitizeOptions, scourString

REPO_ROOT = Path(__file__).resolve().parents[2]
PUBLIC_DIAGRAMS_DIR = REPO_ROOT / "public" / "diagrams"

# Keep in sync with src/app/globals.css. See docs/adr/0001-python-diagram-pipeline.md.
STYLE_BLOCK = """<style>
.oh-node path, .oh-node polygon, .oh-node ellipse {
  fill: var(--color-bg-elevated);
  stroke: var(--color-border);
  stroke-width: 1.5px;
  filter: drop-shadow(3px 3px 4px var(--shadow-dark)) drop-shadow(-2px -2px 4px var(--shadow-light));
}
.oh-node text {
  fill: var(--color-text-primary);
  font-family: var(--font-inter), Inter, sans-serif;
}
.oh-node--terminal ellipse {
  fill: var(--color-primary);
  stroke: var(--color-primary);
  filter: none;
}
.oh-edge path {
  stroke: var(--color-text-secondary);
  fill: none;
}
.oh-edge polygon {
  fill: var(--color-text-secondary);
  stroke: var(--color-text-secondary);
}
.oh-edge--alt path {
  stroke-dasharray: 5 4;
}
.oh-edge--alt polygon {
  stroke-dasharray: none;
}
.oh-cluster path, .oh-cluster polygon {
  fill: none;
  stroke: var(--color-border);
  stroke-width: 1.5px;
  stroke-dasharray: 6 4;
}
.oh-cluster text {
  fill: var(--color-text-secondary);
  font-family: var(--font-inter), Inter, sans-serif;
  font-weight: 600;
}
.oh-edge text {
  fill: var(--color-text-secondary);
  font-family: var(--font-inter), Inter, sans-serif;
}
</style>"""


def new_graph(name: str, *, rankdir: str = "TB") -> graphviz.Digraph:
    """A Graphviz digraph pre-configured with this pipeline's shared layout defaults."""
    g = graphviz.Digraph(name, format="svg")
    g.attr(bgcolor="transparent", rankdir=rankdir, nodesep="0.45", ranksep="0.6")
    g.attr("node", fontname="Inter, sans-serif", fontsize="13")
    g.attr("edge", fontname="Inter, sans-serif", fontsize="11")
    return g


def state_node(g: graphviz.Digraph, name: str, label: str | None = None) -> None:
    """A regular (non-terminal) state node, styled via the ``oh-node`` class."""
    g.node(
        name,
        label=label if label is not None else name,
        shape="box",
        style="rounded,filled",
        fillcolor="white",
        color="black",
        fontcolor="black",
        margin="0.22,0.14",
        **{"class": "oh-node"},
    )


def terminal_node(g: graphviz.Digraph, name: str) -> None:
    """A UML-style start/end marker (filled dot), styled via ``oh-node--terminal``."""
    g.node(
        name,
        label="",
        shape="circle",
        width="0.16",
        height="0.16",
        fixedsize="true",
        style="filled",
        fillcolor="black",
        color="black",
        **{"class": "oh-node oh-node--terminal"},
    )


def transition_edge(
    g: graphviz.Digraph,
    source: str,
    target: str,
    label: str = "",
    *,
    alt: bool = False,
    **attrs: str,
) -> None:
    """A labeled transition edge, styled via the ``oh-edge`` class.

    ``alt=True`` draws it dashed (``oh-edge--alt``) to mark a path that belongs
    to a different provider than the solid edges in the same diagram.
    """
    css_class = "oh-edge oh-edge--alt" if alt else "oh-edge"
    g.edge(source, target, label=label, color="black", fontcolor="black", **{"class": css_class}, **attrs)


def cluster(g: graphviz.Digraph, name: str, label: str) -> graphviz.Digraph:
    """A labeled, dashed group box (``oh-cluster``) used to separate provider paths.

    Use as ``with cluster(g, "crypto", "Crypto-native (Stellar)") as c:`` and add
    nodes to ``c``.
    """
    c = graphviz.Digraph(name=f"cluster_{name}")
    c.attr(
        label=label,
        style="rounded",
        color="black",
        fontcolor="black",
        fontname="Inter, sans-serif",
        fontsize="12",
        margin="16",
        **{"class": "oh-cluster"},
    )
    return _Cluster(g, c)


class _Cluster:
    def __init__(self, parent: graphviz.Digraph, sub: graphviz.Digraph) -> None:
        self._parent = parent
        self._sub = sub

    def __enter__(self) -> graphviz.Digraph:
        return self._sub

    def __exit__(self, *exc: object) -> None:
        self._parent.subgraph(self._sub)


def _inject_style(svg: str) -> str:
    """Insert STYLE_BLOCK right after the opening <svg ...> tag."""
    svg_tag_start = svg.index("<svg")
    insert_at = svg.index(">", svg_tag_start) + 1
    return f"{svg[:insert_at]}\n{STYLE_BLOCK}{svg[insert_at:]}"


def _optimize(svg: str) -> str:
    options = sanitizeOptions()
    options.strip_comments = True
    options.remove_metadata = True
    options.remove_titles = False  # keep <title> elements: screen-reader/debugging value
    options.remove_descriptions = False
    options.remove_descriptive_elements = False
    options.simple_colors = False  # never let scour "normalize" a var(--token) string
    options.style_to_xml = False  # keep our <style> block as CSS, not inlined presentation attrs
    options.strip_xml_prolog = True
    options.indent_type = "none"
    options.newlines = False
    return scourString(svg, options)


def render_diagram(g: graphviz.Digraph, output_name: str) -> Path:
    """Render, theme, and optimize a graph, writing it deterministically to public/diagrams/."""
    raw_svg = g.pipe(format="svg", encoding="utf-8")
    themed_svg = _inject_style(raw_svg)
    optimized_svg = _optimize(themed_svg)

    PUBLIC_DIAGRAMS_DIR.mkdir(parents=True, exist_ok=True)
    out_path = PUBLIC_DIAGRAMS_DIR / f"{output_name}.svg"
    # Explicit "\n" newline + trailing newline: deterministic bytes regardless
    # of the platform the pipeline runs on (CI is Linux; contributors may be
    # on Windows), so `git diff` only ever shows a real content change.
    out_path.write_text(optimized_svg.strip() + "\n", encoding="utf-8", newline="\n")
    return out_path
