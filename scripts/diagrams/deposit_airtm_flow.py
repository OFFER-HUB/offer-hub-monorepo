"""AirTM top-up flow (deposit through AirTM; ``PAYMENT_PROVIDER`` stays ``crypto``).

Source of truth (verified against OFFER-HUB/OFFER-HUB, not guessed):

- ``packages/shared/src/enums/topup-status.enum.ts``: ``TOPUP_TRANSITIONS``
  defines every status edge drawn below.
- ``apps/api/src/modules/topups/topups.controller.ts``: ``POST /topups``,
  ``POST /topups/:id/refresh``, ``POST /topups/:id/cancel``.
- ``apps/api/src/modules/topups/topups.service.ts``: ``createTopUp`` emits
  ``topup.confirmation_required`` or ``topup.processing`` depending on the
  provider status; ``refreshTopUp`` credits ``balanceService.creditAvailable``
  on the transition into ``TOPUP_SUCCEEDED`` and emits ``topup.succeeded``;
  ``cancelTopUp`` only allows ``TOPUP_AWAITING_USER_CONFIRMATION``.
- ``apps/api/src/modules/webhooks/webhooks.controller.ts`` (``POST
  /webhooks/airtm``) and ``apps/api/src/providers/airtm/services/
  airtm-webhook.service.ts``: Svix signature check, de-duplication by event
  id, then ``handlePayinEvent`` maps the AirTM event to a top-up status.
"""

from __future__ import annotations

from theme import cluster, new_graph, render_diagram, state_node, terminal_node, transition_edge

OUTPUT_NAME = "deposit-airtm-flow"

STATES = [
    "TOPUP_CREATED",
    "TOPUP_AWAITING_USER_CONFIRMATION",
    "TOPUP_PROCESSING",
    "TOPUP_SUCCEEDED",
    "TOPUP_FAILED",
    "TOPUP_CANCELED",
]

# (source, target, label) — mirrors TOPUP_TRANSITIONS exactly.
TRANSITIONS = [
    ("TOPUP_CREATED", "TOPUP_AWAITING_USER_CONFIRMATION", "AirTM returns confirmationUri"),
    ("TOPUP_AWAITING_USER_CONFIRMATION", "TOPUP_PROCESSING", "User confirms in AirTM"),
    ("TOPUP_AWAITING_USER_CONFIRMATION", "TOPUP_CANCELED", "POST /topups/{id}/cancel"),
    ("TOPUP_PROCESSING", "TOPUP_SUCCEEDED", "Payment completed"),
    ("TOPUP_PROCESSING", "TOPUP_FAILED", "Payment failed"),
]


def build() -> None:
    g = new_graph(OUTPUT_NAME)
    g.attr(compound="true")

    terminal_node(g, "start")
    state_node(g, "request", label="POST /topups\n(userId, amount, currency)")

    with cluster(g, "airtm", "AirTM provider path") as c:
        for state in STATES:
            state_node(c, state, label=state.replace("_", "\n", 1))

    state_node(g, "webhook", label="POST /webhooks/airtm\n(Svix signature, de-duplicated)\nor POST /topups/{id}/refresh")
    state_node(g, "credit", label="Credit balance.available\nEmit topup.succeeded")
    terminal_node(g, "end")

    transition_edge(g, "start", "request")
    transition_edge(g, "request", "TOPUP_CREATED")
    for source, target, label in TRANSITIONS:
        transition_edge(g, source, target, label)
    transition_edge(g, "webhook", "TOPUP_CREATED", "updates status", alt=True, lhead="cluster_airtm")
    transition_edge(g, "TOPUP_SUCCEEDED", "credit")
    transition_edge(g, "credit", "end")

    render_diagram(g, OUTPUT_NAME)


if __name__ == "__main__":
    build()
