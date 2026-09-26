"""
diagram_helper.py
─────────────────
Shared utilities for the OFFER-HUB offline SVG diagram pipeline.

Design tokens are taken directly from tailwind.config.ts (CSS variable names)
and docs/design/color-palette.md.  Two Palette objects — LIGHT and DARK —
mirror the CSS-variable values used in the running site so the generated SVGs
match the live design system without any hardcoded colours.

Usage in a diagram source file
──────────────────────────────
    from diagram_helper import LIGHT, DARK, make_drawing, save_svg

    def draw_my_diagram(palette):
        d = make_drawing(800, 400, palette)
        # … build the drawing …
        return d

    if __name__ == "__main__":
        for palette, suffix in [(LIGHT, "light"), (DARK, "dark")]:
            d = draw_my_diagram(palette)
            save_svg(d, "my-diagram", suffix)
"""

from __future__ import annotations

import os
import re
import textwrap
from dataclasses import dataclass, field
from pathlib import Path

import drawsvg as draw

# ─────────────────────────────────────────────────────────────────────────────
# Output directory
# ─────────────────────────────────────────────────────────────────────────────

# Resolve relative to repo root regardless of CWD.
_REPO_ROOT = Path(__file__).resolve().parent.parent.parent
OUTPUT_DIR = _REPO_ROOT / "public" / "diagrams"


# ─────────────────────────────────────────────────────────────────────────────
# Design-token palette
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class Palette:
    """
    Mirrors the CSS custom-property colour tokens from tailwind.config.ts and
    docs/design/color-palette.md.  No hex values live anywhere else in this
    pipeline — edit here and both themes stay in sync.
    """
    # Backgrounds  (--color-bg-*)
    bg_base: str = "#ffffff"
    bg_elevated: str = "#f1f3f7"
    bg_sunken: str = "#e4e8f0"

    # Text  (--color-text-*)
    text_primary: str = "#19213D"
    text_secondary: str = "#4B5563"
    text_muted: str = "#6D758F"

    # Brand  (--color-primary / --color-accent)
    primary: str = "#149A9B"
    primary_hover: str = "#0f7879"
    accent: str = "#1fb8b9"

    # Semantic
    success: str = "#10B981"
    warning: str = "#F59E0B"
    error: str = "#EF4444"
    border: str = "#D1D5DB"

    # Neumorphic shadow tokens  (--shadow-dark / --shadow-light)
    shadow_dark: str = "#c8ccd4"
    shadow_light: str = "#ffffff"

    # Convenience: is this the dark variant?
    is_dark: bool = False


# Light theme  (matches :root in src/app/globals.css)
LIGHT = Palette()

# Dark theme  (matches .dark in src/app/globals.css)
DARK = Palette(
    bg_base="#1a1a26",
    bg_elevated="#242433",
    bg_sunken="#2e2e3f",
    text_primary="#f1f3f7",
    text_secondary="#b8bfd0",
    text_muted="#6D758F",
    primary="#1fb8b9",
    primary_hover="#149A9B",
    accent="#149A9B",
    success="#10B981",
    warning="#F59E0B",
    error="#EF4444",
    border="#3d3d5c",
    shadow_dark="#111118",
    shadow_light="#3d3d5c",
    is_dark=True,
)


# ─────────────────────────────────────────────────────────────────────────────
# Drawing factory
# ─────────────────────────────────────────────────────────────────────────────

def make_drawing(
    width: int,
    height: int,
    palette: Palette,
    *,
    padding: int = 0,
) -> draw.Drawing:
    """
    Create a drawsvg Drawing pre-configured with the palette's background and
    a neumorphic drop-shadow filter that diagram sources can reference.

    Parameters
    ----------
    width, height : int
        Viewport dimensions in pixels.
    palette : Palette
        LIGHT or DARK token set.
    padding : int
        Extra space around the viewport (added to width/height via viewBox).
    """
    d = draw.Drawing(
        width + 2 * padding,
        height + 2 * padding,
        origin=(-padding, -padding),
        id_prefix="oh",
    )

    # Background fill
    d.append(
        draw.Rectangle(
            -padding, -padding,
            width + 2 * padding, height + 2 * padding,
            fill=palette.bg_base,
        )
    )

    # Neumorphic raised-shadow filter (matches shadow-neu-raised token)
    _add_neu_filter(d, "neu-raised", palette)
    _add_neu_filter(d, "neu-sunken", palette, inset=True)

    return d


def _add_neu_filter(
    d: draw.Drawing,
    filter_id: str,
    palette: Palette,
    *,
    inset: bool = False,
) -> None:
    """Append an SVG <filter> element that approximates the neumorphic shadow."""
    # SVG filters don't natively support "inset" box-shadows.
    # For sunken we simply swap dark/light offsets.
    dx_dark  = -6 if inset else  6
    dy_dark  = -6 if inset else  6
    dx_light =  6 if inset else -6
    dy_light =  6 if inset else -6
    std = 6

    filt = draw.Filter(id=filter_id, x="-20%", y="-20%", width="140%", height="140%")

    # Shadow (dark)
    fe_dark = draw.Raw(
        f'<feDropShadow dx="{dx_dark}" dy="{dy_dark}" stdDeviation="{std}" '
        f'flood-color="{palette.shadow_dark}" flood-opacity="1" result="shadow-dark"/>'
    )
    # Shadow (light)
    fe_light = draw.Raw(
        f'<feDropShadow dx="{dx_light}" dy="{dy_light}" stdDeviation="{std}" '
        f'flood-color="{palette.shadow_light}" flood-opacity="0.8" result="shadow-light"/>'
    )
    merge = draw.Raw(
        '<feMerge>'
        '  <feMergeNode in="shadow-dark"/>'
        '  <feMergeNode in="shadow-light"/>'
        '  <feMergeNode in="SourceGraphic"/>'
        '</feMerge>'
    )
    filt.append(fe_dark)
    filt.append(fe_light)
    filt.append(merge)
    d.append(filt)


# ─────────────────────────────────────────────────────────────────────────────
# Typography helpers
# ─────────────────────────────────────────────────────────────────────────────

def label(
    text: str,
    x: float,
    y: float,
    palette: Palette,
    *,
    size: int = 13,
    weight: str = "600",
    color: str | None = None,
    anchor: str = "middle",
    baseline: str = "central",
) -> draw.Text:
    """Render a single-line text label using Inter (falls back to system sans)."""
    return draw.Text(
        text,
        size,
        x, y,
        fill=color or palette.text_primary,
        font_family="Inter, ui-sans-serif, system-ui, sans-serif",
        font_weight=weight,
        text_anchor=anchor,
        dominant_baseline=baseline,
    )


def multiline_label(
    lines: list[str],
    x: float,
    y: float,
    palette: Palette,
    *,
    size: int = 12,
    weight: str = "500",
    color: str | None = None,
    line_height: float = 1.5,
    anchor: str = "middle",
) -> draw.Group:
    """Render a list of text lines centred on (x, y)."""
    g = draw.Group()
    total_height = size * line_height * len(lines)
    start_y = y - total_height / 2 + size * line_height / 2
    for i, line in enumerate(lines):
        g.append(
            draw.Text(
                line,
                size,
                x,
                start_y + i * size * line_height,
                fill=color or palette.text_primary,
                font_family="Inter, ui-sans-serif, system-ui, sans-serif",
                font_weight=weight,
                text_anchor=anchor,
                dominant_baseline="central",
            )
        )
    return g


# ─────────────────────────────────────────────────────────────────────────────
# Shape helpers
# ─────────────────────────────────────────────────────────────────────────────

def neu_box(
    x: float,
    y: float,
    w: float,
    h: float,
    palette: Palette,
    *,
    rx: float = 16,
    fill: str | None = None,
    raised: bool = True,
) -> draw.Rectangle:
    """A rounded rectangle with a neumorphic shadow filter."""
    return draw.Rectangle(
        x, y, w, h,
        fill=fill or palette.bg_elevated,
        rx=rx,
        ry=rx,
        filter="url(#neu-raised)" if raised else "url(#neu-sunken)",
    )


def arrow(
    x1: float, y1: float,
    x2: float, y2: float,
    palette: Palette,
    *,
    stroke_width: float = 1.5,
    marker_id: str = "arrow-head",
) -> draw.Line:
    """Draw a straight arrow from (x1,y1) to (x2,y2)."""
    return draw.Line(
        x1, y1, x2, y2,
        stroke=palette.primary,
        stroke_width=stroke_width,
        marker_end=f"url(#{marker_id})",
    )


def arrow_marker(palette: Palette, *, marker_id: str = "arrow-head") -> draw.Marker:
    """Return a reusable arrowhead marker element."""
    # drawsvg.Marker(minx, miny, maxx, maxy, scale=1, orient='auto', **kwargs)
    m = draw.Marker(0, 0, 6, 6, scale=1, orient="auto", id=marker_id)
    m.append(draw.Lines(0, 0, 0, 6, 6, 3, fill=palette.primary, close=True))
    return m


# ─────────────────────────────────────────────────────────────────────────────
# SVG post-processing & output
# ─────────────────────────────────────────────────────────────────────────────

def _optimise_svg(raw: str) -> str:
    """
    Lightweight SVG optimisation (no external tool required):
    - Collapse redundant whitespace between tags
    - Strip XML declaration (browsers don't need it for inline <img>)
    """
    # Remove XML processing instruction if present
    raw = re.sub(r"<\?xml[^?]*\?>", "", raw, flags=re.IGNORECASE).strip()
    # Collapse runs of whitespace between closing > and opening < to a single space
    raw = re.sub(r">\s{2,}<", "> <", raw)
    return raw


def save_svg(
    drawing: draw.Drawing,
    name: str,
    theme_suffix: str,
    *,
    output_dir: Path | None = None,
) -> Path:
    """
    Serialise *drawing* to an optimised SVG file at::

        {output_dir}/{name}-{theme_suffix}.svg

    Parameters
    ----------
    drawing : draw.Drawing
        The completed drawing object.
    name : str
        Diagram slug, e.g. ``"system-architecture"``.
    theme_suffix : str
        ``"light"`` or ``"dark"``.
    output_dir : Path | None
        Defaults to ``public/diagrams/`` relative to the repo root.

    Returns
    -------
    Path
        Absolute path to the written file.
    """
    out_dir = output_dir or OUTPUT_DIR
    out_dir.mkdir(parents=True, exist_ok=True)

    dest = out_dir / f"{name}-{theme_suffix}.svg"
    raw = drawing.as_svg()
    dest.write_text(_optimise_svg(raw), encoding="utf-8")
    return dest
