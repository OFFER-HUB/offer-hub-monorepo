"""
generate.py
───────────
Entry point for the OFFER-HUB offline SVG diagram pipeline.

Imports every diagram module in this directory and calls its draw_diagram()
for both LIGHT and DARK palettes, writing the results to public/diagrams/.

Usage
─────
    # via npm (preferred):
    npm run diagrams

    # directly:
    python3 scripts/diagrams/generate.py

    # check freshness only (used by CI):
    python3 scripts/diagrams/generate.py --check
"""

from __future__ import annotations

import argparse
import hashlib
import sys
from pathlib import Path

# Allow importing sibling modules regardless of CWD
sys.path.insert(0, str(Path(__file__).resolve().parent))

from diagram_helper import DARK, LIGHT, OUTPUT_DIR, save_svg

# ─────────────────────────────────────────────────────────────────────────────
# Registry: add each new diagram module + slug here
# ─────────────────────────────────────────────────────────────────────────────

def _register():
    """
    Return a list of (slug, draw_fn) pairs.

    Each draw_fn must accept a single Palette argument and return a
    drawsvg.Drawing.  Import lazily so a broken individual diagram doesn't
    abort the whole pipeline.
    """
    from system_architecture import draw_diagram as sys_arch
    from escrow_flow import draw_diagram as escrow_flow

    return [
        ("system-architecture", sys_arch),
        ("escrow-flow",         escrow_flow),
    ]


# ─────────────────────────────────────────────────────────────────────────────
# Hash helper (for --check mode)
# ─────────────────────────────────────────────────────────────────────────────

def _file_hash(path: Path) -> str:
    if not path.exists():
        return ""
    return hashlib.sha256(path.read_bytes()).hexdigest()


# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

def main(check_only: bool = False) -> int:
    """
    Generate (or verify) all registered diagrams.

    Returns 0 on success, 1 if --check finds stale/missing SVGs.
    """
    diagrams = _register()
    stale: list[str] = []

    for slug, draw_fn in diagrams:
        for palette, suffix in [(LIGHT, "light"), (DARK, "dark")]:
            dest = OUTPUT_DIR / f"{slug}-{suffix}.svg"

            if check_only:
                # Render to an in-memory string, compare hash
                import drawsvg as draw_module
                import re

                # We need to produce the drawing in-memory
                # to compare against the on-disk file.
                d = draw_fn(palette)
                raw = d.as_svg()
                raw = re.sub(r"<\?xml[^?]*\?>", "", raw, flags=re.IGNORECASE).strip()
                raw = re.sub(r">\s{2,}<", "> <", raw)

                disk_hash = _file_hash(dest)
                mem_hash  = hashlib.sha256(raw.encode()).hexdigest()

                if disk_hash != mem_hash:
                    stale.append(str(dest.relative_to(Path.cwd())))
            else:
                dest_path = save_svg(draw_fn(palette), slug, suffix)
                print(f"  ✓  {dest_path.relative_to(Path.cwd())}")

    if check_only:
        if stale:
            print("❌  Stale or missing diagram SVGs detected:")
            for s in stale:
                print(f"     {s}")
            print()
            print("Run  npm run diagrams  to regenerate, then commit the result.")
            return 1
        else:
            print("✅  All diagram SVGs are up to date.")
            return 0

    print(f"\n✅  Generated {len(diagrams) * 2} SVG files into {OUTPUT_DIR.relative_to(Path.cwd())}/")
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OFFER-HUB diagram pipeline")
    parser.add_argument(
        "--check",
        action="store_true",
        help="Verify SVGs are up to date without writing files (used by CI)",
    )
    args = parser.parse_args()
    sys.exit(main(check_only=args.check))
