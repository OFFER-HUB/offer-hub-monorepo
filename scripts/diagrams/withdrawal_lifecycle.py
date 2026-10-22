"""Withdrawal lifecycle, with the crypto and AirTM provider paths.

Source of truth (verified against OFFER-HUB/OFFER-HUB, not guessed):

- ``packages/shared/src/enums/withdrawal-status.enum.ts``: ``WITHDRAWAL_TRANSITIONS``
  defines every solid (AirTM) edge between statuses.
- ``apps/api/src/modules/withdrawals/withdrawals.service.ts``:
  ``createWithdrawal`` checks the available balance, then branches on
  ``destinationType``. ``executeCryptoWithdrawal`` deducts the balance, creates
  the row as ``WITHDRAWAL_CREATED``, calls ``paymentProvider.sendPayment`` and
  sets ``WITHDRAWAL_COMPLETED``, or on error restores the balance and sets
  ``WITHDRAWAL_FAILED``. The AirTM branch reserves the funds, creates the row,
  calls ``airtmPayout.createPayout`` and maps the provider status;
  ``commitWithdrawal`` is guarded by ``canCommitPayout`` and
  ``WITHDRAWAL_NOT_COMMITTABLE``.
- ``apps/api/src/providers/airtm/services/airtm-webhook.service.ts``:
  ``handlePayoutEvent`` updates the status and refunds the reserved balance
  when the new status is ``WITHDRAWAL_FAILED`` or ``WITHDRAWAL_CANCELED``.
"""

from __future__ import annotations

from theme import new_graph, render_diagram, state_node, terminal_node, transition_edge

OUTPUT_NAME = "withdrawal-lifecycle"

STATES = [
    "WITHDRAWAL_CREATED",
    "WITHDRAWAL_COMMITTED",
    "WITHDRAWAL_PENDING",
    "WITHDRAWAL_PENDING_USER_ACTION",
    "WITHDRAWAL_COMPLETED",
    "WITHDRAWAL_FAILED",
    "WITHDRAWAL_CANCELED",
]

# AirTM path: (source, target, label), mirrors WITHDRAWAL_TRANSITIONS exactly.
AIRTM_TRANSITIONS = [
    ("WITHDRAWAL_CREATED", "WITHDRAWAL_COMMITTED", "POST /withdrawals/{id}/commit"),
    ("WITHDRAWAL_CREATED", "WITHDRAWAL_CANCELED", "Canceled (funds refunded)"),
    ("WITHDRAWAL_COMMITTED", "WITHDRAWAL_PENDING", "AirTM payout pending"),
    ("WITHDRAWAL_PENDING", "WITHDRAWAL_PENDING_USER_ACTION", "AirTM needs user action"),
    ("WITHDRAWAL_PENDING_USER_ACTION", "WITHDRAWAL_PENDING", "User acts"),
    ("WITHDRAWAL_PENDING", "WITHDRAWAL_COMPLETED", "Payout completed"),
    ("WITHDRAWAL_PENDING", "WITHDRAWAL_FAILED", "Payout failed (funds refunded)"),
    ("WITHDRAWAL_PENDING_USER_ACTION", "WITHDRAWAL_FAILED", "Payout failed (funds refunded)"),
]

# Crypto path: the service writes these directly in the create request.
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
    for source, target, label in AIRTM_TRANSITIONS:
        transition_edge(g, source, target, label)
    for source, target, label in CRYPTO_TRANSITIONS:
        transition_edge(g, source, target, label, alt=True)
    for terminal in ("WITHDRAWAL_COMPLETED", "WITHDRAWAL_FAILED", "WITHDRAWAL_CANCELED"):
        transition_edge(g, terminal, "end")

    render_diagram(g, OUTPUT_NAME)


if __name__ == "__main__":
    build()
