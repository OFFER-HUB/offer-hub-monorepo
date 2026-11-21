"""Order state machine — sample diagram for the static diagram pipeline.

Source of truth (verified against the orchestrator repository, not guessed):

- States and transitions: ``ORDER_TRANSITIONS`` in
  ``packages/shared/src/enums/order-status.enum.ts``, OFFER-HUB/OFFER-HUB.
- Enforcement: ``OrderStateMachine.assertTransition`` in
  ``packages/shared/src/utils/state-machine.ts``, OFFER-HUB/OFFER-HUB, which
  wraps the same ``ORDER_TRANSITIONS`` table via the shared ``StateMachine``
  class and throws ``InvalidStateTransitionError`` on an invalid transition.

Edge labels follow the HTTP endpoints and internal events already documented
for this exact diagram in content/docs/guide/orchestrator.mdx (the live
Mermaid version of the same state machine), so both renderings describe the
same transitions in the same words.

``CLOSED`` is the machine's only terminal state (``ORDER_TRANSITIONS[CLOSED]``
is an empty list).
"""

from __future__ import annotations

from theme import new_graph, render_diagram, state_node, terminal_node, transition_edge

OUTPUT_NAME = "order-state-machine"

STATES = [
    "ORDER_CREATED",
    "FUNDS_RESERVED",
    "ESCROW_CREATING",
    "ESCROW_FUNDING",
    "ESCROW_FUNDED",
    "IN_PROGRESS",
    "RELEASE_REQUESTED",
    "RELEASED",
    "REFUND_REQUESTED",
    "REFUNDED",
    "DISPUTED",
    "CLOSED",
]

# (source, target, label) — mirrors ORDER_TRANSITIONS exactly, one row per
# allowed transition, labeled with the endpoint or event that triggers it.
TRANSITIONS = [
    ("ORDER_CREATED", "FUNDS_RESERVED", "POST /orders/{id}/reserve"),
    ("ORDER_CREATED", "CLOSED", "POST /orders/{id}/cancel"),
    ("FUNDS_RESERVED", "ESCROW_CREATING", "POST /orders/{id}/escrow"),
    ("FUNDS_RESERVED", "CLOSED", "POST /orders/{id}/cancel"),
    ("ESCROW_CREATING", "ESCROW_FUNDING", "Escrow created in TW"),
    ("ESCROW_FUNDING", "ESCROW_FUNDED", "POST /orders/{id}/escrow/fund"),
    ("ESCROW_FUNDING", "IN_PROGRESS", "Funding confirmed (fast path)"),
    ("ESCROW_FUNDED", "IN_PROGRESS", "Work starts"),
    ("IN_PROGRESS", "RELEASE_REQUESTED", "POST /orders/{id}/resolution/release"),
    ("IN_PROGRESS", "REFUND_REQUESTED", "POST /orders/{id}/resolution/refund"),
    ("IN_PROGRESS", "DISPUTED", "POST /orders/{id}/resolution/dispute"),
    ("RELEASE_REQUESTED", "RELEASED", "TW confirms release"),
    ("REFUND_REQUESTED", "REFUNDED", "TW confirms refund"),
    ("DISPUTED", "RELEASE_REQUESTED", "Re-request release"),
    ("DISPUTED", "REFUND_REQUESTED", "Re-request refund"),
    ("DISPUTED", "RELEASED", "Resolve to release"),
    ("DISPUTED", "REFUNDED", "Resolve to refund"),
    ("RELEASED", "CLOSED", "Cleanup"),
    ("REFUNDED", "CLOSED", "Cleanup"),
]


def build() -> None:
    g = new_graph(OUTPUT_NAME)

    terminal_node(g, "start")
    for state in STATES:
        state_node(g, state, label=state.replace("_", "\n", 1))
    terminal_node(g, "end")

    transition_edge(g, "start", "ORDER_CREATED")
    for source, target, label in TRANSITIONS:
        transition_edge(g, source, target, label)
    transition_edge(g, "CLOSED", "end")

    render_diagram(g, OUTPUT_NAME)


if __name__ == "__main__":
    build()
