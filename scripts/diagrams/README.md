# scripts/diagrams — OFFER-HUB offline SVG diagram pipeline

This directory houses the Python-based offline diagram generation pipeline.
Each diagram is a self-contained Python source file.  Running the pipeline
produces deterministic, design-system-themed SVG files in `public/diagrams/`
that are served as static assets (no client-side rendering, no layout shift).

See [ADR 0001](../../docs/adr/0001-python-diagram-pipeline.md) for the full
rationale behind this toolchain choice.

---

## Prerequisites

| Requirement   | Version  | Install                                    |
|---------------|----------|--------------------------------------------|
| Python        | ≥ 3.9    | [python.org](https://www.python.org)       |
| Graphviz C lib| any      | `brew install graphviz` / `apt-get install graphviz` / `apk add graphviz` |
| graphviz PyPI | 0.20.3   | `pip install -r scripts/diagrams/requirements.txt` |

One-liner setup:
```bash
# macOS
brew install graphviz && pip install -r scripts/diagrams/requirements.txt

# Ubuntu / Debian
sudo apt-get install -y graphviz && pip install -r scripts/diagrams/requirements.txt

# Alpine (CI / Docker)
apk add graphviz ttf-freefont && pip install -r scripts/diagrams/requirements.txt
```

---

## Running the pipeline

```bash
# Generate (or regenerate) all SVGs into public/diagrams/
npm run diagrams

# CI staleness check — exits with code 1 if SVGs are out of date
npm run diagrams:check
```

You can also run a single diagram directly:
```bash
python scripts/diagrams/payment-flow.py
```

---

## How to add a new diagram

1. **Create a Python source file** in this directory using `kebab-case.py`:

   ```
   scripts/diagrams/my-new-diagram.py
   ```

2. **Use the shared helpers** to build your graph:

   ```python
   """
   my-new-diagram.py — short description.

   Cite the source: which file/controller/DTO this diagram depicts.
   """
   from __future__ import annotations
   import sys
   from pathlib import Path
   sys.path.insert(0, str(Path(__file__).parent))

   from helpers import color, make_graph, save_svg

   g = make_graph("my-new-diagram", label="My New Diagram", rankdir="TB")

   g.node("A", "Step A")
   g.node("B", "Step B")
   g.edge("A", "B", label="triggers")

   if __name__ == "__main__":
       save_svg(g, "my-new-diagram")
   ```

3. **Run the pipeline** to write the SVG:

   ```bash
   npm run diagrams
   ```

4. **Embed in MDX** using an `<img>` tag (static asset):

   ```mdx
   <img
     src="/diagrams/my-new-diagram.svg"
     alt="My new diagram"
     className="w-full rounded-2xl shadow-neu-raised"
   />
   ```

5. **Commit both** `scripts/diagrams/my-new-diagram.py` **and**
   `public/diagrams/my-new-diagram.svg`.

> The CI staleness check (`npm run diagrams:check`) will fail if the SVG is
> missing or does not match the source.  Always commit the generated SVG.

---

## Design guidelines

- **No hardcoded colours** — use `color("token_name")` from `helpers.py`.
  The helper returns a static hex string for Graphviz rendering, and the
  generated SVG includes an injected `<style>` block with CSS variables so
  diagrams adapt to light/dark mode automatically.
- **No border-l-4 accent bars** — no coloured left-border decorations on
  diagram nodes.  Use `color` and `fillcolor` attributes only.
- **No fixed pixel width/height** on SVGs — `save_svg()` strips these so
  diagrams scale fluidly.
- Keep diagram sources focused: one diagram per file, one concern per diagram.

---

## Files in this directory

| File              | Purpose                                      |
|-------------------|----------------------------------------------|
| `helpers.py`      | Shared utilities: tokens, graph factory, save_svg |
| `run.py`          | Pipeline entry-point (`npm run diagrams`)    |
| `requirements.txt`| Pinned Python dependencies                   |
| `payment-flow.py` | Sample: OFFER-HUB payment & escrow lifecycle |
| `README.md`       | This file                                    |
