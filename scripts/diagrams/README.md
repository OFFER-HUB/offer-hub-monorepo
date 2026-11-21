# Diagram pipeline

Generates the offline, token-driven SVG diagrams used in `content/docs/`. Tool choice and rationale: [`docs/adr/0001-python-diagram-pipeline.md`](../../docs/adr/0001-python-diagram-pipeline.md). User-facing walkthrough: [Diagram Pipeline](../../content/docs/guide/diagram-pipeline.mdx) in the docs site itself.

## Setup

Requires Python 3.11+ and the [Graphviz](https://graphviz.org/download/) `dot` binary on `PATH`.

```bash
pip install -r scripts/diagrams/requirements.txt
dot -V   # sanity check: should print a graphviz version
```

**Version matters.** `dot`'s layout is deterministic for a given Graphviz version, but not stable *across* versions — the same input graph laid out by two different versions can come out at different sizes/coordinates (see [the ADR](../../docs/adr/0001-python-diagram-pipeline.md#determinism) for how this bit us once already). CI pins `graphviz=2.42.2-9ubuntu0.1`. If `dot -V` doesn't report `2.42.2`, regenerate inside the same environment CI uses instead of trusting a bare local run:

```bash
docker run --rm -v "$(pwd):/work" -w /work ubuntu:24.04 bash -c '
  apt-get update -qq && apt-get install -y -qq graphviz=2.42.2-9ubuntu0.1 python3 python3-pip python3-venv
  python3 -m venv /tmp/venv
  /tmp/venv/bin/pip install -q -r scripts/diagrams/requirements.txt
  /tmp/venv/bin/python scripts/diagrams/generate_all.py
'
```

## Usage

```bash
npm run diagrams
```

Runs every diagram module registered in `generate_all.py`, writing one `.svg` per diagram into `public/diagrams/`. Commit whatever it produces — don't hand-edit files under `public/diagrams/`, since CI will overwrite your edits the next time someone regenerates and immediately flag the diff as stale (see [CI](#ci) below).

## Adding a diagram

1. Create `scripts/diagrams/your_diagram_name.py`.
2. Build it with the shared helpers from `theme.py`:

   ```python
   from theme import new_graph, render_diagram, state_node, terminal_node, transition_edge

   OUTPUT_NAME = "your-diagram-name"

   def build() -> None:
       g = new_graph(OUTPUT_NAME)
       state_node(g, "STATE_A")
       state_node(g, "STATE_B")
       transition_edge(g, "STATE_A", "STATE_B", "some event")
       render_diagram(g, OUTPUT_NAME)

   if __name__ == "__main__":
       build()
   ```

3. Add it to `generate_all.py`'s `DIAGRAM_MODULES` list.
4. Run `npm run diagrams`, review the new file under `public/diagrams/`, and commit it.
5. Embed it in an MDX page: `<StaticDiagram name="your-diagram-name" caption="..." />` (component: `src/components/docs/StaticDiagram.tsx`, already registered in `mdx-components.tsx`).

**Never pass a literal color** (a hex code, an X11 color name as the *visible* color, etc.) to a node or edge you expect readers to see. The placeholder colors graphviz requires structurally (`black`/`white` in `theme.py`'s `state_node`/`terminal_node`/`transition_edge`) are intentionally overridden by the injected `<style>` block — if you bypass those helpers and call `graphviz.Digraph` directly with your own `fillcolor=`, you've reintroduced a hardcoded color that won't react to light/dark mode. If an existing CSS token doesn't cover a color you need, add the token to `src/app/globals.css` first (both `:root` and `.dark`), then reference it from `theme.py`'s `STYLE_BLOCK`.

## How it's themed

See the "How theming works" section of the [Diagram Pipeline](../../content/docs/guide/diagram-pipeline.mdx) docs page — short version: semantic CSS classes on every node/edge, one injected `<style>` block built entirely from `var(--token)` references, inlined into the page DOM so those tokens resolve live against whichever theme (light/dark) is active.

## CI

`.github/workflows/ci.yml`'s `diagrams` job installs Graphviz + this directory's pinned `requirements.txt`, runs `npm run diagrams`, then runs `git diff --exit-code -- public/diagrams`. If that diff is non-empty, the job fails: either a diagram module changed without regenerating, or the installed Graphviz version drifted from what produced the committed SVGs. Regenerate locally and commit the result to fix it.
