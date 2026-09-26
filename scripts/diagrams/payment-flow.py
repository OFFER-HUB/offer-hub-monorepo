"""
payment-flow.py — OFFER-HUB Orchestrator Payment Flow diagram.

Depicts the end-to-end payment lifecycle from a buyer topping up their balance
through escrow funding, work completion, and fund release to the freelancer.

Based on the architecture described in docs/guides/core-concepts.md and the
state machine in docs/architecture/payment-flows.md.

Run individually:
    python scripts/diagrams/payment-flow.py

Or via npm:
    npm run diagrams
"""

from __future__ import annotations

import sys
from pathlib import Path

# Make helpers importable when this file is run directly or via the runner.
sys.path.insert(0, str(Path(__file__).parent))

from helpers import color, make_graph, save_svg

# ---------------------------------------------------------------------------
# Build the diagram
# ---------------------------------------------------------------------------

g = make_graph(
    "payment-flow",
    label="OFFER-HUB — Payment & Escrow Lifecycle",
    rankdir="LR",
    fontsize="13",
)

# ── Actors ──────────────────────────────────────────────────────────────────

with g.subgraph(name="cluster_actors") as actors:
    actors.attr(
        label="Actors",
        style="filled,rounded",
        fillcolor=color("bg_sunken"),
        color=color("border"),
        fontcolor=color("text_secondary"),
        fontsize="11",
    )
    actors.node(
        "Buyer",
        "🧑‍💼 Buyer",
        shape="ellipse",
        fillcolor=color("bg_elevated"),
        color=color("primary"),
        fontcolor=color("text_primary"),
    )
    actors.node(
        "Freelancer",
        "💻 Freelancer",
        shape="ellipse",
        fillcolor=color("bg_elevated"),
        color=color("primary"),
        fontcolor=color("text_primary"),
    )

# ── Orchestrator states ──────────────────────────────────────────────────────

with g.subgraph(name="cluster_orch") as orch:
    orch.attr(
        label="OFFER-HUB Orchestrator",
        style="filled,rounded",
        fillcolor=color("bg_sunken"),
        color=color("primary"),
        fontcolor=color("text_secondary"),
        fontsize="11",
    )
    orch.node("TopUp",    "Top-up\n(Airtm)",        fillcolor=color("bg_elevated"), color=color("primary"))
    orch.node("Reserve",  "Funds\nReserved",         fillcolor=color("bg_elevated"), color=color("primary"))
    orch.node("Creating", "Escrow\nCreating",        fillcolor=color("bg_elevated"), color=color("accent"))
    orch.node("Funded",   "Escrow\nFunded",          fillcolor=color("bg_elevated"), color=color("accent"))
    orch.node("Release",  "Funds\nReleased",         fillcolor=color("bg_elevated"), color=color("success"))
    orch.node("Withdraw", "Withdrawal\n(Airtm)",     fillcolor=color("bg_elevated"), color=color("success"))

# ── Stellar / Trustless Work ─────────────────────────────────────────────────

with g.subgraph(name="cluster_stellar") as stellar:
    stellar.attr(
        label="Stellar · Trustless Work",
        style="filled,rounded",
        fillcolor=color("bg_sunken"),
        color=color("accent"),
        fontcolor=color("text_secondary"),
        fontsize="11",
    )
    stellar.node(
        "Contract",
        "Soroban\nEscrow Contract",
        shape="hexagon",
        fillcolor=color("bg_elevated"),
        color=color("accent"),
        fontcolor=color("text_primary"),
    )

# ── Edges ────────────────────────────────────────────────────────────────────

g.edge("Buyer",       "TopUp",     label="1. Deposit USDC")
g.edge("TopUp",       "Reserve",   label="2. Balance reserved")
g.edge("Reserve",     "Creating",  label="3. Create order")
g.edge("Creating",    "Contract",  label="4. Deploy contract")
g.edge("Contract",    "Funded",    label="5. On-chain funded")
g.edge("Funded",      "Release",   label="6. Approve release")
g.edge("Release",     "Contract",  label="7. On-chain release", style="dashed")
g.edge("Release",     "Withdraw",  label="8. Payout")
g.edge("Withdraw",    "Freelancer", label="9. USDC arrives")

# ── Dispute branch ───────────────────────────────────────────────────────────

g.node(
    "Dispute",
    "Dispute\n(Arbitration)",
    shape="diamond",
    fillcolor=color("bg_elevated"),
    color=color("warning"),
    fontcolor=color("warning"),
)
g.edge("Funded",   "Dispute",  label="dispute raised", style="dashed", color=color("warning"))
g.edge("Dispute",  "Release",  label="resolved → release", style="dashed", color=color("success"))
g.edge("Dispute",  "Reserve",  label="resolved → refund",  style="dashed", color=color("error"))

# ── Save ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    save_svg(g, "payment-flow")
