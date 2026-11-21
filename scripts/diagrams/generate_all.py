"""Entry point for `npm run diagrams`.

Runs every diagram module's `build()` function, writing deterministic SVGs
into public/diagrams/. To add a new diagram, see scripts/diagrams/README.md.
"""

from __future__ import annotations

import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import deposit_airtm_flow  # noqa: E402  (must follow the sys.path insert above)
import deposit_crypto_flow  # noqa: E402
import order_state_machine  # noqa: E402
import wallet_model  # noqa: E402
import wallet_provisioning  # noqa: E402
import withdrawal_lifecycle  # noqa: E402

DIAGRAM_MODULES = [
    order_state_machine,
    deposit_crypto_flow,
    deposit_airtm_flow,
    withdrawal_lifecycle,
    wallet_model,
    wallet_provisioning,
]


def main() -> None:
    for module in DIAGRAM_MODULES:
        start = time.monotonic()
        module.build()
        elapsed_ms = (time.monotonic() - start) * 1000
        print(f"  generated {module.OUTPUT_NAME}.svg ({elapsed_ms:.0f}ms)")

    print(f"Generated {len(DIAGRAM_MODULES)} diagram(s) into public/diagrams/.")


if __name__ == "__main__":
    main()
