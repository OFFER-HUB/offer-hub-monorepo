# Diagram Generation Pipeline

This directory contains the offline diagram generation pipeline. It
renders the SVG diagrams used throughout the documentation site and
writes them to `public/diagrams/`.

The decision to use Graphviz is documented in
[docs/adr/0001-diagram-generation-pipeline.md](../../docs/adr/0001-diagram-generation-pipeline.md).

## Prerequisites

- Python 3.10+
- [Graphviz](https://graphviz.org/download) (`dot` must be on the `PATH`)

## Installation

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r scripts/diagrams/requirements.txt
```

## Generating diagrams

```bash
npm run diagrams
```

This runs every `*.py` file in `scripts/diagrams/`, except `__init__.py`
and `helpers.py`, and writes the resulting SVG to `public/diagrams/`.

To generate a single diagram:

```bash
python3 scripts/diagrams/system-architecture.py
```

## Adding a new diagram

1. Create a new Python file in this directory. The file name must match
   the output SVG name, e.g. `system-architecture.py` produces
   `public/diagrams/system-architecture.svg`.
2. Import the helpers and define the Graphviz source. Colour the nodes and
   edges with the `dg-*` classes so the diagram follows the design tokens:

   ```python
   from helpers import render, write_diagram

   DOT = """
   digraph Example {
       node [shape=box, style="rounded,filled", class="dg-node"]
       edge [class="dg-edge"]

       A [label="A", class="dg-node dg-accent"]
       B [label="B"]

       A -> B [label="edge"]
   }
   """

   def main() -> None:
       svg = render(DOT, aria_label="A simple diagram")
       write_diagram("example", svg)

   if __name__ == "__main__":
       main()
   ```

3. Use the SVG in MDX with the existing image component:

   ```mdx
   <img src="/diagrams/system-architecture.svg" alt="System architecture" />
   ```

4. Run `npm run diagrams` and commit the generated SVG along with your
   Python source.

## Design tokens

All colors must come from the design tokens exposed by `helpers.py`. Use the
`dg-node`, `dg-accent` and `dg-backend` classes on your nodes and edges; the
helper injects CSS that resolves them to CSS variables (e.g.
`var(--dg-accent)`), so the SVG automatically adapts to light and dark mode.
Do not hardcode hex colors in a diagram source.

## CI drift check

`npm run diagrams:check` runs the generator again and compares the
`dg-source-sha256` stamp embedded in the committed SVG with the one the
current sources produce. If the two differ, the job fails and you must run
`npm run diagrams` and commit the result.

The check compares the source stamp rather than the SVG bytes on purpose:
Graphviz's layout changes between releases, so a byte-for-byte comparison
would report drift every time the CI runner image upgrades Graphviz. The
stamp only changes when a diagram source, or `helpers.py` itself, changes.
