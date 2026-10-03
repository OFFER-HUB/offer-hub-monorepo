"""Shared helpers for the offline diagram generation pipeline.

Every diagram source file imports from this module. The helpers are
responsible for:

* providing the neumorphic design tokens (colors, shadows) as CSS variables,
* rendering a Graphviz ``DOT`` source to a clean, accessible SVG, and
* stamping the SVG with a hash of its source so that ``npm run diagrams:check``
  can prove a committed diagram is still in sync with the code that made it.

The stamp is deliberately a hash rather than a byte-for-byte regeneration diff:
the layout Graphviz produces changes between releases, so comparing SVG bytes
would report drift every time the CI runner image picks up a new Graphviz.

The module depends only on the Graphviz ``dot`` binary. There is no cloud
dependency and no network access.
"""

from __future__ import annotations

import hashlib
import os
import re
import sys
from pathlib import Path
from typing import Mapping

import graphviz


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUTPUT_DIR = ROOT / "public" / "diagrams"
HELPERS_PATH = Path(__file__).resolve()

STAMP_PREFIX = "dg-source-sha256:"


# -----------------------------------------------------------------------------
# Design tokens
# -----------------------------------------------------------------------------
# These are the only colors allowed in diagrams. They are exposed as CSS
# variables in the generated SVG so that the site can switch theme (light /
# dark) at runtime without regenerating the SVG.

TOKENS: Mapping[str, str] = {
    "--dg-bg": "var(--color-background, #f1f3f7)",
    "--dg-surface": "var(--color-surface, #ffffff)",
    "--dg-surface-alt": "var(--color-surface-alt, #e2e8f0)",
    "--dg-border": "var(--color-border, #d1d5db)",
    "--dg-text": "var(--color-text, #19213d)",
    "--dg-text-muted": "var(--color-text-muted, #4b5563)",
    "--dg-accent": "var(--color-accent, #149a9b)",
    "--dg-accent-contrast": "var(--color-accent-contrast, #ffffff)",
    "--dg-backend": "var(--color-secondary, #002333)",
    "--dg-backend-contrast": "#ffffff",
    "--dg-shadow-dark": "rgba(163, 177, 201, 0.6)",
    "--dg-shadow-light": "rgba(255, 255, 255, 0.9)",
}

# Node/edge classes a diagram source can put on its elements. They resolve to
# the tokens above, so a diagram source never hardcodes a colour.
CLASS_CSS = """      .dg-node polygon,
      .dg-node rect,
      .dg-node ellipse,
      .dg-node path {
        fill: var(--dg-surface);
        stroke: var(--dg-border);
        filter: drop-shadow(2px 2px 4px var(--dg-shadow-dark))
          drop-shadow(-2px -2px 4px var(--dg-shadow-light));
      }

      .dg-node text {
        fill: var(--dg-text);
        font-family: var(--font-sans, Inter, ui-sans-serif, system-ui);
        font-size: 13px;
      }

      .dg-accent polygon,
      .dg-accent rect,
      .dg-accent ellipse,
      .dg-accent path {
        fill: var(--dg-accent);
        stroke: var(--dg-accent);
      }

      .dg-accent text {
        fill: var(--dg-accent-contrast);
      }

      .dg-backend polygon,
      .dg-backend rect,
      .dg-backend ellipse,
      .dg-backend path {
        fill: var(--dg-backend);
        stroke: var(--dg-backend);
      }

      .dg-backend text {
        fill: var(--dg-backend-contrast);
      }

      .dg-edge path {
        stroke: var(--dg-border);
        stroke-width: 1.5;
        fill: none;
      }

      .dg-edge polygon {
        fill: var(--dg-border);
        stroke: var(--dg-border);
      }

      .dg-edge text {
        fill: var(--dg-text-muted);
        font-family: var(--font-sans, Inter, ui-sans-serif, system-ui);
        font-size: 11px;
      }"""


# -----------------------------------------------------------------------------
# SVG template
# -----------------------------------------------------------------------------
# Graphviz draws the nodes and edges; this template only wraps them with the
# responsive viewBox, the design tokens and the neumorphic class rules.
# Placeholders are substituted with str.replace because the stylesheet below
# contains literal braces.

SVG_TEMPLATE = """<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     viewBox="0 0 __WIDTH__ __HEIGHT__"
     width="__WIDTH__"
     height="__HEIGHT__"
     role="img"
     aria-label="__ARIA_LABEL__">
  <defs>
    <style>
__TOKENS__
__CLASS_CSS__
    </style>
  </defs>
  <rect width="100%" height="100%" fill="var(--dg-bg)"/>
  __BODY__
</svg>
"""


# -----------------------------------------------------------------------------
# Public API
# -----------------------------------------------------------------------------

def render(
    dot_source: str,
    *,
    aria_label: str,
    engine: str = "dot",
    extra_tokens: Mapping[str, str] | None = None,
) -> str:
    """Render a Graphviz ``DOT`` source to an optimised SVG string.

    Parameters
    ----------
    dot_source:
        The Graphviz source. Use the ``dg-*`` classes rather than literal
        colours so the diagram follows the design tokens.
    aria_label:
        Accessible label for the resulting SVG.
    engine:
        Graphviz layout engine (``dot``, ``neato``, ``circo``, ``twopi``, ...).
    extra_tokens:
        Optional overrides merged into :data:`TOKENS`, for a diagram that
        needs one additional token-driven colour.
    """
    tokens = dict(TOKENS)
    if extra_tokens:
        tokens.update(extra_tokens)

    try:
        raw = graphviz.Source(dot_source, engine=engine).pipe(format="svg")
    except graphviz.ExecutableNotFound as exc:  # pragma: no cover - env issue
        raise RuntimeError(
            "Graphviz 'dot' was not found on PATH. Install it with "
            "`brew install graphviz` (macOS) or `apt-get install graphviz` (CI)."
        ) from exc

    svg = raw.decode("utf-8") if isinstance(raw, (bytes, bytearray)) else raw
    return _optimise(svg, tokens, aria_label)


def write_diagram(name: str, svg: str, *, source: str | Path | None = None) -> Path:
    """Write an SVG to ``public/diagrams/<name>.svg`` and return the path.

    ``DIAGRAMS_OUT_DIR`` overrides the destination, which is how
    ``npm run diagrams:check`` renders into a scratch directory.

    The file is stamped with :func:`source_hash` so a later run can tell
    whether the diagram was generated from the current source.
    """
    output_dir = _output_dir()
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{name}.svg"
    output_path.write_text(stamp(svg, source), encoding="utf-8")
    return output_path


def source_hash(source: str | Path | None = None) -> str:
    """Return a stable hash of a diagram source file.

    The hash covers the diagram source *and* this helper module, so editing
    either one marks every diagram generated from it as stale.
    """
    path = Path(source).resolve() if source is not None else _running_source()
    if path is None or not path.is_file():
        raise RuntimeError(
            "cannot determine the diagram source file; run the diagram as a "
            "script or pass source=<path>"
        )
    digest = hashlib.sha256()
    digest.update(path.read_bytes())
    digest.update(b"\x00")
    digest.update(HELPERS_PATH.read_bytes())
    return digest.hexdigest()


def stamp(svg: str, source: str | Path | None = None) -> str:
    """Return ``svg`` with the source hash recorded in a leading comment."""
    marker = f"<!-- {STAMP_PREFIX}{source_hash(source)} -->"
    if marker in svg:
        return svg
    return svg.replace(">", f">\n  {marker}", 1)


# -----------------------------------------------------------------------------
# Internals
# -----------------------------------------------------------------------------

_COMMENT_RE = re.compile(r"<!--.*?-->", re.DOTALL)
_XML_DECL_RE = re.compile(r"<\?xml.*?\?>", re.DOTALL)
_DOCTYPE_RE = re.compile(r"<!DOCTYPE.*?>", re.DOTALL)
# Graphviz writes viewBox="0.00 0.00 <width> <height>".
_VIEWBOX_RE = re.compile(
    r'viewBox="([-\d.eE+]+)\s+([-\d.eE+]+)\s+([-\d.eE+]+)\s+([-\d.eE+]+)"'
)
_ROOT_TAG_RE = re.compile(r"<svg\b[^>]*>", re.DOTALL)
_ATTR_ESCAPES = (("&", "&amp;"), ("<", "&lt;"), (">", "&gt;"), ('"', "&quot;"))


def _output_dir() -> Path:
    override = os.environ.get("DIAGRAMS_OUT_DIR")
    return Path(override).resolve() if override else DEFAULT_OUTPUT_DIR


def _running_source() -> Path | None:
    """The script being executed, when the diagram was run as a script."""
    argv0 = sys.argv[0] if sys.argv else ""
    if not argv0:
        return None
    path = Path(argv0).resolve()
    return path if path.suffix == ".py" and path.is_file() else None


def _escape_attr(value: str) -> str:
    for char, entity in _ATTR_ESCAPES:
        value = value.replace(char, entity)
    return value


def _optimise(svg: str, tokens: Mapping[str, str], aria_label: str) -> str:
    """Apply the neumorphic template and normalise the Graphviz output."""
    # The generator comment carries the Graphviz version, and the XML
    # declaration/DOCTYPE are replaced by our own root element.
    svg = _COMMENT_RE.sub("", svg)
    svg = _XML_DECL_RE.sub("", svg)
    svg = _DOCTYPE_RE.sub("", svg).strip()

    root = _ROOT_TAG_RE.search(svg)
    if not root:
        raise ValueError("Graphviz output has no <svg> root tag.")
    match = _VIEWBOX_RE.search(root.group(0))
    if not match:
        raise ValueError("Graphviz output is missing a viewBox.")
    _, _, width, height = match.groups()

    body_start = root.end()
    body_end = svg.rfind("</svg>")
    if body_end < body_start:
        raise ValueError("Graphviz output has no closing </svg> tag.")
    body = svg[body_start:body_end].strip()
    if "<svg" in body:
        raise ValueError("Graphviz output contains a nested <svg> element.")
    # Collapse the whitespace Graphviz inserts between elements, but leave the
    # text inside <text> untouched.
    body = re.sub(r">\s+<", "><", body)

    token_css = "\n".join(f"      {key}: {value};" for key, value in tokens.items())

    return (
        SVG_TEMPLATE
        .replace("__ARIA_LABEL__", _escape_attr(aria_label))
        .replace("__TOKENS__", token_css)
        .replace("__CLASS_CSS__", CLASS_CSS)
        .replace("__WIDTH__", width)
        .replace("__HEIGHT__", height)
        .replace("__BODY__", body)
    )
