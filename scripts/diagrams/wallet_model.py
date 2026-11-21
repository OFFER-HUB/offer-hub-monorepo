"""How an invisible wallet maps to the balance a user sees.

Source of truth (verified against OFFER-HUB/OFFER-HUB, not guessed):

- ``apps/api/src/modules/wallet/wallet.service.ts``: ``createWallet`` stores a
  ``wallet`` row (``type: INVISIBLE``, ``provider: STELLAR``, ``publicKey`` and
  ``secretEncrypted``); ``getKeypair`` decrypts the secret only to sign;
  ``getBalance`` reads the USDC balance from Stellar Horizon.
- ``apps/api/src/modules/wallet/blockchain-monitor.service.ts`` and
  ``apps/api/src/modules/withdrawals/withdrawals.service.ts``: deposits credit
  and withdrawals debit the off-chain ``balance`` (``available`` / ``reserved``).
"""

from __future__ import annotations

from theme import cluster, new_graph, render_diagram, state_node, transition_edge

OUTPUT_NAME = "wallet-model"


def build() -> None:
    g = new_graph(OUTPUT_NAME, rankdir="LR")

    with cluster(g, "visible", "What the user sees") as c:
        state_node(c, "balance", label="Balance\navailable / reserved\n(USD)")

    with cluster(g, "hidden", "Managed by OFFER-HUB") as c:
        state_node(c, "wallet", label="Wallet record\nINVISIBLE / STELLAR\npublicKey")
        state_node(c, "secret", label="secretEncrypted\n(decrypted only to sign)")
        state_node(c, "usdc", label="USDC on Stellar\n(read via Horizon)")

    transition_edge(g, "balance", "wallet", "backed by")
    transition_edge(g, "wallet", "secret", "holds")
    transition_edge(g, "wallet", "usdc", "address of")
    transition_edge(g, "usdc", "balance", "deposits credit /\nwithdrawals debit", alt=True)

    render_diagram(g, OUTPUT_NAME)


if __name__ == "__main__":
    build()
