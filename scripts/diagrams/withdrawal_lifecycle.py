"""Withdrawal lifecycle for the crypto-native rail.

Source of truth: ``packages/shared/src/enums/withdrawal-status.enum.ts`` defines
the withdrawal statuses. The withdrawals service creates the row as
``WITHDRAWAL_CREATED``, sends the on-chain payment, and then moves the
withdrawal to ``WITHDRAWAL_COMPLETED`` or, on error, restores the balance and
moves it to ``WITHDRAWAL_FAILED``.
"""

from __future__ import annotations

from theme import new_graph, render_diagram, state_node, terminal_node, transition_edge

OUTPUT_NAME = "withdrawal-lifecycle"

STATES = [
    "WITHDRAWAL_CREATED",
    "WITHDRAWAL_COMPLETED",
    "WITHDRAWAL_FAILED",
]

# The service writes these directly in the create request.
CRYPTO_TRANSITIONS = [
    ("WITHDRAWAL_CREATED", "WITHDRAWAL_COMPLETED", "crypto: Stellar payment sent"),
    ("WITHDRAWAL_CREATED", "WITHDRAWAL_FAILED", "crypto: payment error (balance restored)"),
]


def build() -> None:
    g = new_graph(OUTPUT_NAME)

    terminal_node(g, "start")
    for state in STATES:
        state_node(g, state, label=state.replace("_", "\n", 1))
    terminal_node(g, "end")

    transition_edge(g, "start", "WITHDRAWAL_CREATED", "POST /withdrawals")
    for source, target, label in CRYPTO_TRANSITIONS:
        transition_edge(g, source, target, label, alt=True)
    for terminal in ("WITHDRAWAL_COMPLETED", "WITHDRAWAL_FAILED"):
        transition_edge(g, terminal, "end")

    render_diagram(g, OUTPUT_NAME)


if __name__ == "__main__":
    build()
