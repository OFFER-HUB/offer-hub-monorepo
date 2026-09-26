# Diagram Pipeline

OFFER-HUB ships architectural diagrams as **pre-generated, committed SVG
files** rather than rendering them client-side at runtime.  This gives us
fast load times, pixel-consistent output across browsers, and Git-diffable
artefacts that CI keeps in sync with their Python sources.

See [ADR 0001](./adr/0001-python-svg-diagram-pipeline.md) for the full
rationale behind this design choice.

---

## How it works

```
scripts/diagrams/          ← Python source files (authored by contributors)
  requirements.txt         ← pinned Python deps (drawsvg==2.4.0)
  diagram_helper.py        ← shared design-token palette + drawing helpers
  system_architecture.py   ← one file per diagram
  escrow_flow.py
  generate.py              ← entry point — runs all diagram modules

public/diagrams/           ← generated SVG output (committed to Git)
  system-architecture-light.svg
  system-architecture-dark.svg
  escrow-flow-light.svg
  escrow-flow-dark.svg
```

Each diagram module produces **two SVG files** — one for light mode and one
for dark mode — by calling `draw_diagram(LIGHT)` and `draw_diagram(DARK)`
with the shared `Palette` objects from `diagram_helper.py`.

---

## Prerequisites

- Python 3.9+ and `pip3`
- No system-level packages required (`drawsvg` is pure Python)

---

## Generate all diagrams

```bash
npm run diagrams
```

This runs `pip3 install -r scripts/diagrams/requirements.txt` followed by
`python3 scripts/diagrams/generate.py` and writes the SVGs to
`public/diagrams/`.

To check freshness without writing (what CI does):

```bash
npm run diagrams:check
```

---

## How to add a diagram

### Step 1 — Create the source file

Add a new file `scripts/diagrams/<your-diagram-slug>.py`.  Copy the skeleton
below as a starting point:

```python
"""
sample_diagram.py
─────────────────
Generates public/diagrams/sample-diagram-{light,dark}.svg

Cite the source files or docs this diagram represents, e.g.:
  - content/docs/guide/your-topic.mdx
  - docs/architecture/overview.md
"""

from __future__ import annotations
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

import drawsvg as draw
from diagram_helper import (
    DARK, LIGHT, Palette,
    arrow, arrow_marker, label, make_drawing,
    multiline_label, neu_box, save_svg,
)

WIDTH  = 800
HEIGHT = 400

def draw_diagram(palette: Palette) -> draw.Drawing:
    d = make_drawing(WIDTH, HEIGHT, palette, padding=24)
    d.append(arrow_marker(palette))

    # Title
    d.append(label("My Diagram Title", WIDTH / 2, 30, palette,
                   size=16, weight="700", color=palette.primary))

    # A neumorphic box
    d.append(neu_box(100, 80, 200, 80, palette))
    d.append(label("Service A", 200, 120, palette))

    # An arrow
    d.append(arrow(300, 120, 460, 120, palette))

    d.append(neu_box(460, 80, 200, 80, palette))
    d.append(label("Service B", 560, 120, palette))

    return d

if __name__ == "__main__":
    for palette, suffix in [(LIGHT, "light"), (DARK, "dark")]:
        dest = save_svg(draw_diagram(palette), "sample-diagram", suffix)
        print(f"  ✓  {dest.relative_to(Path.cwd())}")
```

**Naming rules** (from `docs/standards/naming-conventions.md`):
- Source file: `scripts/diagrams/<kebab-case>.py`
- Output slug: `<kebab-case>` — must match the `save_svg(…, "<kebab-case>", …)` call

### Step 2 — Register the diagram in generate.py

Open `scripts/diagrams/generate.py` and add your module to the `_register()`
function:

```python
def _register():
    from system_architecture import draw_diagram as sys_arch
    from escrow_flow import draw_diagram as escrow_flow
    from sample_diagram import draw_diagram as sample_diagram   # ← add this

    return [
        ("system-architecture", sys_arch),
        ("escrow-flow",         escrow_flow),
        ("sample-diagram",      sample_diagram),               # ← and this
    ]
```

### Step 3 — Generate and commit the SVGs

```bash
npm run diagrams          # writes public/diagrams/sample-diagram-{light,dark}.svg
git add public/diagrams/  # commit the generated artefacts
```

> **CI will fail** if you push a changed source file without regenerating and
> committing the corresponding SVGs.

### Step 4 — Use the diagram in MDX

Embed the generated SVG in any MDX page using the existing
`MermaidDiagram`-style pattern or a plain `<img>` tag.  For theme-aware
switching, use the `StaticDiagram` helper component described in
[`content/docs/guide/diagrams.mdx`](/docs/guide/diagrams):

```mdx
<StaticDiagram
  lightSrc="/diagrams/sample-diagram-light.svg"
  darkSrc="/diagrams/sample-diagram-dark.svg"
  alt="Sample diagram showing Service A calling Service B"
  caption="Sample: Service A → Service B"
/>
```

---

## Design system compliance

All diagrams **must** use the `Palette` tokens from `diagram_helper.py` —
never hardcode hex values in a diagram source file.  The palette maps
directly to the CSS custom properties in `tailwind.config.ts`:

| Palette field | CSS variable | Usage |
|---------------|-------------|-------|
| `palette.bg_base` | `--color-bg-base` | Page/canvas background |
| `palette.bg_elevated` | `--color-bg-elevated` | Card / box fill |
| `palette.bg_sunken` | `--color-bg-sunken` | Inset section fill |
| `palette.text_primary` | `--color-text-primary` | Main label text |
| `palette.text_secondary` | `--color-text-secondary` | Secondary label text |
| `palette.text_muted` | `--color-text-muted` | Annotations / captions |
| `palette.primary` | `--color-primary` | Brand accent, arrows, titles |
| `palette.border` | `--color-border` | Separator lines |
| `palette.shadow_dark` | `--shadow-dark` | Neumorphic dark shadow |
| `palette.shadow_light` | `--shadow-light` | Neumorphic light shadow |

**No coloured borders.**  Do not apply `stroke` colours other than
`palette.border` or `palette.primary` to box outlines.  The design system
uses neumorphic shadows (not border lines) for elevation.

---

## Existing diagrams

| File | Slug | Documents |
|------|------|-----------|
| `scripts/diagrams/system_architecture.py` | `system-architecture` | `docs/architecture/overview.md` · `backend/src/index.ts` |
| `scripts/diagrams/escrow_flow.py` | `escrow-flow` | `content/docs/guide/escrow.mdx` |

---

## Troubleshooting

**`ModuleNotFoundError: No module named 'drawsvg'`**  
Run `pip3 install -r scripts/diagrams/requirements.txt` or use
`npm run diagrams` which does this automatically.

**CI fails with "Stale or missing diagram SVGs"**  
You changed a source file but did not regenerate the SVGs.  Run
`npm run diagrams` and commit `public/diagrams/*.svg`.

**Arrow marker not rendering**  
Use `arrow_marker(palette)` from `diagram_helper.py` — the drawsvg
`Marker` constructor requires positional args `(minx, miny, maxx, maxy)`.
The helper abstracts this correctly.
