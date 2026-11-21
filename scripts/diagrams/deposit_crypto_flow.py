"""Crypto deposit flow (``PAYMENT_PROVIDER=crypto``).

Source of truth (verified against OFFER-HUB/OFFER-HUB, not guessed):

- ``apps/api/src/modules/wallet/blockchain-monitor.service.ts``:
  ``startMonitoringAllWallets`` opens a Horizon payment stream per wallet and
  ``handlePayment`` filters (type ``payment``, ``to`` equals the wallet,
  configured USDC asset code and issuer), de-duplicates by transaction hash
  (in-memory set, then ``ProcessedTransaction`` in the database), credits
  ``balance.available`` and writes the ``ProcessedTransaction`` row in one
  ``$transaction``, then emits ``EVENT_CATALOG.BALANCE_CREDITED``.
- ``apps/api/src/modules/wallet/wallet.controller.ts``: the deposit address
  comes from ``GET /users/:id/wallet/deposit``.
"""

from __future__ import annotations

from theme import new_graph, render_diagram, state_node, terminal_node, transition_edge

OUTPUT_NAME = "deposit-crypto-flow"

STEPS = [
    ("addr", "GET /users/{id}/wallet/deposit\nreturns the Stellar address"),
    ("send", "User sends USDC\nfrom any Stellar wallet"),
    ("stream", "Horizon payment stream\n(BlockchainMonitorService)"),
    ("filter", "Filter: incoming payment,\nconfigured USDC code + issuer"),
    ("dedup", "De-duplicate by\ntransaction hash"),
    ("credit", "One DB transaction:\nbalance.available += amount\n+ ProcessedTransaction row"),
    ("event", "Emit balance.credited\n(SSE event stream)"),
]


def build() -> None:
    g = new_graph(OUTPUT_NAME)

    terminal_node(g, "start")
    for key, label in STEPS:
        state_node(g, key, label=label)
    terminal_node(g, "end")
    state_node(g, "skip", label="Ignored\n(other asset, outgoing,\nor already processed)")

    transition_edge(g, "start", "addr")
    chain = [key for key, _ in STEPS]
    for source, target in zip(chain, chain[1:]):
        transition_edge(g, source, target)
    transition_edge(g, "event", "end")
    transition_edge(g, "filter", "skip", "no match")
    transition_edge(g, "dedup", "skip", "seen")

    render_diagram(g, OUTPUT_NAME)


if __name__ == "__main__":
    build()
