"""Generate every brand asset in public/ from the official logo, public/logo.svg.

Requires `rsvg-convert` (librsvg) on PATH and Pillow (`pip install -r scripts/brand/requirements.txt`).
Run with `npm run brand`. Do not hand-edit the generated files; edit public/logo.svg and regenerate.
"""

from __future__ import annotations

import io
import re
import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "public"
SOURCE = PUBLIC / "logo.svg"

BRAND_TEAL = "#149A9B"
INK_LIGHT = "#19213D"
INK_DARK = "#F1F3F7"
SURFACE_LIGHT = "#F1F3F7"
INK_MUTED = "#4A5270"


def read_source() -> tuple[float, float, str]:
    svg = SOURCE.read_text()
    match = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', svg)
    if not match:
        sys.exit(f"{SOURCE} has no viewBox")
    body = svg[svg.index(">", svg.index("<svg")) + 1 : svg.rindex("</svg>")].strip()
    if INK_LIGHT not in body or BRAND_TEAL not in body:
        sys.exit(f"{SOURCE} must use {BRAND_TEAL} and {INK_LIGHT}")
    return float(match.group(1)), float(match.group(2)), body


def square_svg(width: float, height: float, body: str, *, mark_ratio: float,
               background: str | None = None, ink: str = INK_LIGHT,
               adaptive: bool = False) -> str:
    """Center the mark in a square canvas; mark_ratio is the mark width / canvas side."""
    side = width / mark_ratio
    dx, dy = (side - width) / 2, (side - height) / 2
    mark = body.replace(f'fill="{INK_LIGHT}"', 'class="ink"' if adaptive else f'fill="{ink}"')
    style = ""
    if adaptive:
        style = (f"<style>.ink{{fill:{INK_LIGHT}}}"
                 f"@media (prefers-color-scheme: dark){{.ink{{fill:{INK_DARK}}}}}</style>")
    bg = f'<rect width="{side:g}" height="{side:g}" fill="{background}"/>' if background else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {side:g} {side:g}">'
            f'{style}{bg}<g transform="translate({dx:g} {dy:g})">{mark}</g></svg>\n')


def render(svg: str, width: int, height: int | None = None) -> Image.Image:
    args = ["rsvg-convert", "-w", str(width), "-h", str(height or width), "-f", "png"]
    png = subprocess.run(args, input=svg.encode(), capture_output=True, check=True).stdout
    return Image.open(io.BytesIO(png)).convert("RGBA")


def og_svg(width: float, height: float, body: str) -> str:
    w, h = 1200, 630
    mark_w = 300
    scale = mark_w / width
    mark_h = height * scale
    x, y = 120, (h - mark_h) / 2
    font = "Inter, Helvetica Neue, Helvetica, Arial, sans-serif"
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}">'
            f'<rect width="{w}" height="{h}" fill="{SURFACE_LIGHT}"/>'
            f'<rect y="{h - 12}" width="{w}" height="12" fill="{BRAND_TEAL}"/>'
            f'<g transform="translate({x:g} {y:g}) scale({scale:g})">{body}</g>'
            f'<g font-family="{font}" fill="{INK_LIGHT}">'
            f'<text x="500" y="290" font-size="76" font-weight="800" letter-spacing="-2">OFFER-HUB</text>'
            f'<text x="502" y="352" font-size="30" font-weight="500" fill="{INK_MUTED}">Non-custodial escrow payments</text>'
            f'<text x="502" y="394" font-size="30" font-weight="500" fill="{INK_MUTED}">for your marketplace</text>'
            f'</g></svg>\n')


def save_png(image: Image.Image, name: str) -> None:
    image.save(PUBLIC / name, "PNG", optimize=True)
    print(f"  {name:28} {image.width}x{image.height}")


def main() -> None:
    width, height, body = read_source()
    print(f"source {SOURCE.relative_to(ROOT)} ({width:g}x{height:g})")

    # Browser tab: tight crop so the mark stays legible at 16px.
    tab = square_svg(width, height, body, mark_ratio=0.98, adaptive=True)
    (PUBLIC / "icon.svg").write_text(tab)
    print("  icon.svg                     adaptive light/dark")

    tab_light = square_svg(width, height, body, mark_ratio=0.98)
    tab_dark = square_svg(width, height, body, mark_ratio=0.98, ink=INK_DARK)
    for size in (16, 32):
        save_png(render(tab_light, size), f"favicon-{size}x{size}.png")
        save_png(render(tab_dark, size), f"favicon-dark-{size}x{size}.png")
    ico = render(tab_light, 48)
    ico.save(PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    print("  favicon.ico                  16, 32, 48")

    # App icons: opaque surface, mark inside the maskable safe zone (80% circle).
    app = square_svg(width, height, body, mark_ratio=0.62, background=SURFACE_LIGHT)
    save_png(render(app, 180).convert("RGB"), "apple-touch-icon.png")
    for size in (192, 512):
        save_png(render(app, size).convert("RGB"), f"android-chrome-{size}x{size}.png")

    # Raster logo for contexts that cannot inline SVG (PDF export).
    logo_h = 192
    save_png(render(SOURCE.read_text(), round(width * logo_h / height), logo_h), "logo.png")

    save_png(render(og_svg(width, height, body), 1200, 630).convert("RGB"), "og-image.png")


if __name__ == "__main__":
    main()
