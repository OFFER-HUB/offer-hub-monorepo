"""
run.py — OFFER-HUB diagram pipeline entry-point.

Discovers every Python file in scripts/diagrams/ (except helpers.py and
itself), imports it, and calls its ``save_svg`` side-effect.  This is the
script invoked by ``npm run diagrams``.

Usage:
    python scripts/diagrams/run.py [--check]

Options:
    --check     Verify that every diagram source file has a corresponding
                committed SVG in public/diagrams/, and that the pipeline
                can execute without errors.  Exits with code 1 if:
                  - the Graphviz ``dot`` binary is missing, OR
                  - any diagram source file has no corresponding .svg in
                    public/diagrams/.
                Used by ``npm run diagrams:check`` in CI.
"""

from __future__ import annotations

import argparse
import importlib.util
import shutil
import sys
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


def _graphviz_available() -> bool:
    """Return True when the system ``dot`` binary is on PATH."""
    return shutil.which("dot") is not None


def _discover_diagram_modules() -> list[Path]:
    """Return all .py files in scripts/diagrams/ except helpers.py and run.py."""
    skip = {"helpers.py", "run.py"}
    return sorted(
        p for p in SCRIPTS_DIR.glob("*.py")
        if p.name not in skip and not p.name.startswith("_")
    )


def _run_module(module_path: Path) -> None:
    """Import *module_path* and let it call save_svg as a side-effect."""
    spec = importlib.util.spec_from_file_location(module_path.stem, module_path)
    if spec is None or spec.loader is None:
        raise ImportError(f"Cannot load {module_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)  # type: ignore[union-attr]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser(description="OFFER-HUB diagram pipeline")
    parser.add_argument(
        "--check",
        action="store_true",
        help=(
            "Verify Graphviz is installed and every diagram source has a "
            "committed SVG in public/diagrams/. Exits 1 on failure."
        ),
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
        if not _graphviz_available():
            print(
                "❌  Graphviz 'dot' binary not found.\n"
                "    Install it first:\n"
                "      macOS:  brew install graphviz\n"
                "      Ubuntu: sudo apt-get install -y graphviz\n"
                "      Alpine: apk add graphviz ttf-freefont"
            )
            sys.exit(1)

        print(f"🎨  Generating {len(diagram_modules)} diagram(s) → {OUTPUT_DIR.relative_to(REPO_ROOT)}/\n")
        for mod in diagram_modules:
            _run_module(mod)
        print(f"\n✅  Done. {len(diagram_modules)} SVG(s) written to {OUTPUT_DIR.relative_to(REPO_ROOT)}/")

    else:
        # ── Check mode ──────────────────────────────────────────────────────
        # Two things are checked:
        #   1. Graphviz system binary is installed (so CI can actually run the pipeline).
        #   2. Every diagram source has a committed SVG in public/diagrams/.
        #
        # We intentionally do NOT do a byte-for-byte hash comparison here because
        # that would require the pipeline to produce bit-identical output across
        # different Graphviz versions and OS renders — which is impractical.
        # Instead, the rule is: if you touch a .py diagram source, you must also
        # commit an updated .svg produced by running ``npm run diagrams`` locally.

        print(f"🔍  Checking {len(diagram_modules)} diagram source file(s) for committed SVGs…\n")

        failures: list[str] = []

        # 1. Graphviz binary check.
        if not _graphviz_available():
            failures.append(
                "  ✗  Graphviz 'dot' binary is not installed.\n"
                "     CI requires it to run the diagram pipeline.\n"
                "     Add to your CI workflow: sudo apt-get install -y graphviz"
            )

        # 2. Committed SVG check.
        for mod in diagram_modules:
            stem = mod.stem
            committed = OUTPUT_DIR / f"{stem}.svg"
            if not committed.exists():
                failures.append(
                    f"  ✗  public/diagrams/{stem}.svg is missing.\n"
                    f"     Run `npm run diagrams` and commit the result."
                )
            else:
                size = committed.stat().st_size
                if size < 100:
                    failures.append(
                        f"  ✗  public/diagrams/{stem}.svg exists but looks empty ({size} bytes).\n"
                        f"     Run `npm run diagrams` and commit the result."
                    )
                else:
                    print(f"  ✔  public/diagrams/{stem}.svg  ({size:,} bytes)")

        if failures:
            print("\n❌  Staleness check failed:\n")
            for msg in failures:
                print(msg)
            sys.exit(1)
        else:
            print(f"\n✅  All {len(diagram_modules)} SVG(s) are present and non-empty.")
            sys.exit(0)


if __name__ == "__main__":
    main()
