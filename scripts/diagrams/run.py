"""
run.py — OFFER-HUB diagram pipeline entry-point.

Discovers every Python file in scripts/diagrams/ (except helpers.py and
itself), imports it, and calls its ``save_svg`` side-effect.  This is the
script invoked by ``npm run diagrams``.

Usage:
    python scripts/diagrams/run.py [--check]

Options:
    --check     Render into a temp directory and exit with code 1 if any
                generated SVG differs from the committed copy in
                public/diagrams/.  Used by ``npm run diagrams:check`` in CI.
"""

from __future__ import annotations

import argparse
import difflib
import hashlib
import importlib.util
import sys
import tempfile
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

SCRIPTS_DIR: Path = Path(__file__).parent
REPO_ROOT: Path = SCRIPTS_DIR.parents[1]
OUTPUT_DIR: Path = REPO_ROOT / "public" / "diagrams"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _discover_diagram_modules() -> list[Path]:
    """Return all .py files in scripts/diagrams/ except helpers.py and run.py."""
    skip = {"helpers.py", "run.py"}
    return sorted(
        p for p in SCRIPTS_DIR.glob("*.py")
        if p.name not in skip and not p.name.startswith("_")
    )


def _run_module(module_path: Path, output_dir: Path | None = None) -> None:
    """Import *module_path* and let it call save_svg as a side-effect.

    If *output_dir* is given, temporarily override helpers.OUTPUT_DIR so the
    SVGs are written to a different location (used during --check).
    """
    import helpers  # noqa: PLC0415 — must be importable at runtime

    original_output = helpers.OUTPUT_DIR
    if output_dir is not None:
        # Monkey-patch so save_svg writes to the temp dir.
        helpers.OUTPUT_DIR = output_dir
        output_dir.mkdir(parents=True, exist_ok=True)

    try:
        spec = importlib.util.spec_from_file_location(module_path.stem, module_path)
        if spec is None or spec.loader is None:
            raise ImportError(f"Cannot load {module_path}")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)  # type: ignore[union-attr]
        # Trigger save_svg if the module exposes the graph at module level.
        if hasattr(module, "g") and not output_dir:
            pass  # save_svg already called inside __main__ block
        elif hasattr(module, "g") and output_dir:
            helpers.save_svg(module.g, module_path.stem)
    finally:
        helpers.OUTPUT_DIR = original_output


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser(description="OFFER-HUB diagram pipeline")
    parser.add_argument(
        "--check",
        action="store_true",
        help="Compare generated SVGs against committed copies; exit 1 if different.",
    )
    args = parser.parse_args()

    # Ensure helpers is importable.
    sys.path.insert(0, str(SCRIPTS_DIR))

    diagram_modules = _discover_diagram_modules()

    if not diagram_modules:
        print("⚠  No diagram source files found in scripts/diagrams/.")
        sys.exit(0)

    if not args.check:
        # ── Normal run: generate SVGs into public/diagrams/ ────────────────
        print(f"🎨  Generating {len(diagram_modules)} diagram(s) → {OUTPUT_DIR.relative_to(REPO_ROOT)}/\n")
        for mod in diagram_modules:
            _run_module(mod)
        print(f"\n✅  Done. {len(diagram_modules)} SVG(s) written to {OUTPUT_DIR.relative_to(REPO_ROOT)}/")
    else:
        # ── Check mode: compare against committed SVGs ──────────────────────
        print(f"🔍  Checking {len(diagram_modules)} diagram(s) for staleness…\n")

        failures: list[str] = []

        with tempfile.TemporaryDirectory(prefix="oh-diagrams-") as tmp:
            tmp_dir = Path(tmp)
            for mod in diagram_modules:
                _run_module(mod, output_dir=tmp_dir)

            for mod in diagram_modules:
                stem = mod.stem
                committed = OUTPUT_DIR / f"{stem}.svg"
                generated = tmp_dir / f"{stem}.svg"

                if not committed.exists():
                    failures.append(
                        f"  ✗  public/diagrams/{stem}.svg is missing — run `npm run diagrams` to generate it."
                    )
                    continue

                if _sha256(committed) != _sha256(generated):
                    # Show a unified diff of the first 40 lines for context.
                    old_lines = committed.read_text(encoding="utf-8").splitlines(keepends=True)
                    new_lines = generated.read_text(encoding="utf-8").splitlines(keepends=True)
                    diff = "".join(
                        difflib.unified_diff(
                            old_lines[:40],
                            new_lines[:40],
                            fromfile=f"committed/{stem}.svg",
                            tofile=f"generated/{stem}.svg",
                            n=3,
                        )
                    )
                    failures.append(
                        f"  ✗  public/diagrams/{stem}.svg is out of date.\n"
                        f"     Run `npm run diagrams` and commit the result.\n"
                        f"{diff}"
                    )

        if failures:
            print("❌  Staleness check failed:\n")
            for msg in failures:
                print(msg)
            sys.exit(1)
        else:
            print(f"✅  All {len(diagram_modules)} SVG(s) are up to date.")
            sys.exit(0)


if __name__ == "__main__":
    main()
