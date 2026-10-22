"""Wallet provisioning when a user is created.

Source of truth (verified against OFFER-HUB/OFFER-HUB, not guessed):

- ``apps/api/src/modules/users/users.service.ts`` calls
  ``paymentProvider.initializeUser(userId)``; for the crypto provider
  (``apps/api/src/providers/payment/crypto-native.provider.ts``) that calls
  ``walletService.createWallet``.
- ``apps/api/src/modules/wallet/wallet.service.ts`` ``createWallet``: returns
  the existing active wallet if there is one; otherwise ``Keypair.random()``,
  ``encrypt(secret)``, ``wallet.create``, and only when
  ``stellarConfig.isTestnet()`` it funds the account (``fundTestAccount``) and
  adds the USDC trustline (``setupTestTrustline``).
"""

from __future__ import annotations

from theme import new_graph, render_diagram, state_node, terminal_node, transition_edge

OUTPUT_NAME = "wallet-provisioning"


def build() -> None:
    g = new_graph(OUTPUT_NAME)

    terminal_node(g, "start")
    state_node(g, "user", label="POST /users")
    state_node(g, "init", label="paymentProvider.initializeUser\n(crypto provider)")
    state_node(g, "exists", label="Active wallet\nalready exists?")
    state_node(g, "reuse", label="Return existing\npublic key")
    state_node(g, "keypair", label="Generate Stellar\nkeypair")
    state_node(g, "encrypt", label="Encrypt the secret\nkey")
    state_node(g, "store", label="Save wallet row\n(INVISIBLE, STELLAR, primary)")
    state_node(g, "testnet", label="Testnet?")
    state_node(g, "fund", label="Fund account\nAdd USDC trustline")
    state_node(g, "done", label="Return public key")
    terminal_node(g, "end")

    transition_edge(g, "start", "user")
    transition_edge(g, "user", "init")
    transition_edge(g, "init", "exists")
    transition_edge(g, "exists", "reuse", "yes")
    transition_edge(g, "exists", "keypair", "no")
    transition_edge(g, "keypair", "encrypt")
    transition_edge(g, "encrypt", "store")
    transition_edge(g, "store", "testnet")
    transition_edge(g, "testnet", "fund", "yes")
    transition_edge(g, "fund", "done")
    transition_edge(g, "testnet", "done", "no (not done by createWallet)", alt=True)
    transition_edge(g, "reuse", "end")
    transition_edge(g, "done", "end")

    render_diagram(g, OUTPUT_NAME)


if __name__ == "__main__":
    build()
