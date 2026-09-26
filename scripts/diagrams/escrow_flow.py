"""
escrow_flow.py
──────────────
Generates public/diagrams/escrow-flow-{light,dark}.svg

Visualises the 3-transaction escrow release flow documented in:
  - content/docs/guide/escrow.mdx  (§ "The 3-Transaction Release Flow")
  - content/docs/guide/escrow.mdx  (§ "The 2-Transaction Refund Flow")
  - docs/guides/escrow.md          (state-machine reference)

Run directly:
    python3 scripts/diagrams/escrow_flow.py

Or via the pipeline:
    npm run diagrams
"""

from __future__ import annotations

import sys
from pathlib import Path

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
# Layout
# ─────────────────────────────────────────────────────────────────────────────

WIDTH  = 860
HEIGHT = 380

STEP_W  = 160
STEP_H  = 70
STEP_RX = 14

# Release flow row
RELEASE_Y = 140

# Refund flow row
REFUND_Y  = 300

# X centres for 4 steps each
def _xs(count: int) -> list[float]:
    total = count * STEP_W + (count - 1) * 40
    start = (WIDTH - total) / 2 + STEP_W / 2
    step  = STEP_W + 40
    return [start + i * step for i in range(count)]


RELEASE_XS = _xs(4)
REFUND_XS  = _xs(3)


# ─────────────────────────────────────────────────────────────────────────────
# Builder
# ─────────────────────────────────────────────────────────────────────────────

def draw_diagram(palette: Palette) -> draw.Drawing:
    d = make_drawing(WIDTH, HEIGHT, palette, padding=24)
    d.append(arrow_marker(palette))

    # ── Title ────────────────────────────────────────────────────────────────
    d.append(label("Escrow Fund Flows", WIDTH / 2, 28, palette,
                   size=16, weight="700", color=palette.primary))
    d.append(label("Source: content/docs/guide/escrow.mdx",
                   WIDTH / 2, 46, palette,
                   size=10, weight="400", color=palette.text_muted))

    # ── Row labels ────────────────────────────────────────────────────────────
    d.append(label("Release Flow  (happy path)", 10, RELEASE_Y, palette,
                   size=11, weight="700", color=palette.text_secondary, anchor="start"))
    d.append(label("Refund Flow  (dispute)", 10, REFUND_Y, palette,
                   size=11, weight="700", color=palette.text_secondary, anchor="start"))

    # ── Release steps ────────────────────────────────────────────────────────
    release_steps = [
        ("Seller signs\nchangeMilestone\nStatus", "serviceProvider"),
        ("Buyer signs\napproveMilestone", "approver"),
        ("Buyer signs\nreleaseFunds", "releaseSigner"),
        ("USDC sent\nto seller ✓", ""),
    ]

    for i, (text, role) in enumerate(release_steps):
        cx = RELEASE_XS[i]
        cy = RELEASE_Y
        is_last = i == len(release_steps) - 1
        fill = palette.success if is_last else palette.bg_elevated
        x = cx - STEP_W / 2
        y = cy - STEP_H / 2
        d.append(draw.Rectangle(x, y, STEP_W, STEP_H,
                                fill=fill, rx=STEP_RX, ry=STEP_RX,
                                filter="url(#neu-raised)"))
        lines = [l for l in text.split("\n")]
        text_col = palette.bg_base if is_last else palette.text_primary
        d.append(multiline_label(lines, cx, cy - 6, palette,
                                 color=text_col, size=11, weight="600"))
        if role:
            d.append(label(f"[{role}]", cx, cy + STEP_H / 2 - 10, palette,
                           size=9, weight="500", color=palette.text_muted))

    # Arrows between release steps
    for i in range(len(release_steps) - 1):
        x1 = RELEASE_XS[i]     + STEP_W / 2
        x2 = RELEASE_XS[i + 1] - STEP_W / 2
        d.append(arrow(x1, RELEASE_Y, x2, RELEASE_Y, palette))

    # ── Refund steps ─────────────────────────────────────────────────────────
    refund_steps = [
        ("Buyer signs\ndisputeEscrow", "approver (disputer)"),
        ("Platform signs\nresolveDispute", "disputeResolver"),
        ("USDC refunded\nto buyer ✓", ""),
    ]

    for i, (text, role) in enumerate(refund_steps):
        cx = REFUND_XS[i]
        cy = REFUND_Y
        is_last = i == len(refund_steps) - 1
        fill = palette.warning if i == 0 else (palette.success if is_last else palette.bg_elevated)
        x = cx - STEP_W / 2
        y = cy - STEP_H / 2
        d.append(draw.Rectangle(x, y, STEP_W, STEP_H,
                                fill=fill, rx=STEP_RX, ry=STEP_RX,
                                filter="url(#neu-raised)"))
        lines = [l for l in text.split("\n")]
        text_col = palette.bg_base if (is_last or i == 0) else palette.text_primary
        d.append(multiline_label(lines, cx, cy - 6, palette,
                                 color=text_col, size=11, weight="600"))
        if role:
            d.append(label(f"[{role}]", cx, cy + STEP_H / 2 - 10, palette,
                           size=9, weight="500", color=palette.text_muted))

    # Arrows between refund steps
    for i in range(len(refund_steps) - 1):
        x1 = REFUND_XS[i]     + STEP_W / 2
        x2 = REFUND_XS[i + 1] - STEP_W / 2
        d.append(arrow(x1, REFUND_Y, x2, REFUND_Y, palette))

    # ── Separator line ────────────────────────────────────────────────────────
    sep_y = (RELEASE_Y + REFUND_Y) / 2
    d.append(draw.Line(40, sep_y, WIDTH - 40, sep_y,
                       stroke=palette.border, stroke_width=1,
                       stroke_dasharray="4 4"))

    return d


if __name__ == "__main__":
    for palette, suffix in [(LIGHT, "light"), (DARK, "dark")]:
        dest = save_svg(draw_diagram(palette), "escrow-flow", suffix)
        print(f"  ✓  {dest.relative_to(Path.cwd())}")
