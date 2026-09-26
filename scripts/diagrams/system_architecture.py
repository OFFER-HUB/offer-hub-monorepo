"""
system_architecture.py
──────────────────────
Generates public/diagrams/system-architecture-{light,dark}.svg

This diagram visualises the high-level OFFER-HUB system architecture as
described in docs/architecture/overview.md and coded in:
  - backend/src/index.ts        (Express API, port 4000, /health endpoint)
  - src/app/layout.tsx          (Next.js 15 frontend, port 3000)
  - src/app/api/                (Next.js API routes)

Run directly:
    python3 scripts/diagrams/system_architecture.py

Or via the pipeline:
    npm run diagrams
"""

from __future__ import annotations

import sys
from pathlib import Path

# Allow running this file directly from any CWD
sys.path.insert(0, str(Path(__file__).resolve().parent))

import drawsvg as draw
from diagram_helper import (
    DARK,
    LIGHT,
    Palette,
    arrow,
    arrow_marker,
    label,
    make_drawing,
    multiline_label,
    neu_box,
    save_svg,
)

# ─────────────────────────────────────────────────────────────────────────────
# Layout constants
# ─────────────────────────────────────────────────────────────────────────────

WIDTH = 860
HEIGHT = 480
PAD = 32

# Column x-centres
COL_CLIENT  = 140
COL_CDN     = 430
COL_BACKEND = 720

# Row y-centres
ROW_TOP    = 100
ROW_MID    = 250
ROW_BOTTOM = 390

BOX_W = 200
BOX_H = 72


# ─────────────────────────────────────────────────────────────────────────────
# Diagram builder
# ─────────────────────────────────────────────────────────────────────────────

def draw_diagram(palette: Palette) -> draw.Drawing:
    d = make_drawing(WIDTH, HEIGHT, palette, padding=PAD)

    # ── Arrow marker ─────────────────────────────────────────────────────────
    d.append(arrow_marker(palette))

    # ── Title ────────────────────────────────────────────────────────────────
    d.append(
        label(
            "OFFER-HUB — System Architecture",
            WIDTH / 2, 34,
            palette,
            size=17,
            weight="700",
            color=palette.primary,
        )
    )
    d.append(
        label(
            "Source: docs/architecture/overview.md · backend/src/index.ts",
            WIDTH / 2, 54,
            palette,
            size=10,
            weight="400",
            color=palette.text_muted,
        )
    )

    # ── Layer backgrounds ────────────────────────────────────────────────────
    # Client layer
    d.append(
        draw.Rectangle(
            20, 72, 220, HEIGHT - 88,
            fill=palette.bg_sunken,
            rx=20, ry=20,
            opacity=0.6,
        )
    )
    d.append(label("Client Layer", COL_CLIENT, 88, palette, size=10, weight="700",
                   color=palette.text_muted))

    # CDN/Edge layer
    d.append(
        draw.Rectangle(
            310, 72, 240, HEIGHT - 88,
            fill=palette.bg_sunken,
            rx=20, ry=20,
            opacity=0.6,
        )
    )
    d.append(label("CDN / Edge Layer", COL_CDN, 88, palette, size=10, weight="700",
                   color=palette.text_muted))

    # Services layer
    d.append(
        draw.Rectangle(
            600, 72, 240, HEIGHT - 88,
            fill=palette.bg_sunken,
            rx=20, ry=20,
            opacity=0.6,
        )
    )
    d.append(label("Services Layer", COL_BACKEND, 88, palette, size=10, weight="700",
                   color=palette.text_muted))

    # ── Nodes ────────────────────────────────────────────────────────────────
    def _box(cx: float, cy: float, lines: list[str], highlight: bool = False) -> None:
        x = cx - BOX_W / 2
        y = cy - BOX_H / 2
        fill = palette.primary if highlight else palette.bg_elevated
        d.append(neu_box(x, y, BOX_W, BOX_H, palette, fill=fill))
        text_col = palette.bg_base if highlight else palette.text_primary
        d.append(multiline_label(lines, cx, cy, palette,
                                 color=text_col, size=12, weight="600"))

    # Client column
    _box(COL_CLIENT, ROW_TOP,    ["Browser", "(Desktop)"])
    _box(COL_CLIENT, ROW_MID,    ["Mobile App", "(Future)"])
    _box(COL_CLIENT, ROW_BOTTOM, ["Next.js Frontend", "Port 3000"])

    # CDN column
    _box(COL_CDN, ROW_TOP,    ["Vercel", "Edge Network"], highlight=True)
    _box(COL_CDN, ROW_MID,    ["Next.js API Routes", "src/app/api/"])
    _box(COL_CDN, ROW_BOTTOM, ["Static Assets", "public/"])

    # Backend column
    _box(COL_BACKEND, ROW_TOP,    ["Express API", "backend/src/index.ts"])
    _box(COL_BACKEND, ROW_MID,    ["PostgreSQL", "(Planned)"])
    _box(COL_BACKEND, ROW_BOTTOM, ["Redis + BullMQ", "(Queue / Cache)"])

    # ── Connections ───────────────────────────────────────────────────────────
    def _conn(x1: float, y1: float, x2: float, y2: float) -> None:
        d.append(arrow(x1, y1, x2, y2, palette))

    half_w = BOX_W / 2

    # Browser → CDN
    _conn(COL_CLIENT + half_w, ROW_TOP, COL_CDN - half_w, ROW_TOP)
    # Mobile → CDN
    _conn(COL_CLIENT + half_w, ROW_MID, COL_CDN - half_w, ROW_TOP + 10)
    # Frontend → CDN
    _conn(COL_CLIENT + half_w, ROW_BOTTOM, COL_CDN - half_w, ROW_MID)
    # CDN → Express API
    _conn(COL_CDN + half_w, ROW_TOP, COL_BACKEND - half_w, ROW_TOP)
    # API Routes → Express
    _conn(COL_CDN + half_w, ROW_MID, COL_BACKEND - half_w, ROW_MID - 8)
    # Express → Postgres
    _conn(COL_BACKEND, ROW_TOP + BOX_H / 2, COL_BACKEND, ROW_MID - BOX_H / 2)
    # Postgres → Redis
    _conn(COL_BACKEND, ROW_MID + BOX_H / 2, COL_BACKEND, ROW_BOTTOM - BOX_H / 2)

    # ── Legend ────────────────────────────────────────────────────────────────
    ly = HEIGHT - 24
    d.append(
        draw.Rectangle(20, ly - 10, 12, 12,
                       fill=palette.primary, rx=3, ry=3)
    )
    d.append(label("Primary service", 100, ly - 4, palette,
                   size=10, weight="500", color=palette.text_muted, anchor="start"))

    return d


# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    for palette, suffix in [(LIGHT, "light"), (DARK, "dark")]:
        dest = save_svg(draw_diagram(palette), "system-architecture", suffix)
        print(f"  ✓  {dest.relative_to(Path.cwd())}")
