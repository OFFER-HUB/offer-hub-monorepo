"""OfferHub system architecture diagram.

Run directly to regenerate the committed SVG:

    python3 scripts/diagrams/system-architecture.py

or regenerate every diagram at once with `npm run diagrams`.
"""

from helpers import render, write_diagram

DOT = """
digraph SystemArchitecture {
    graph [rankdir=TB, bgcolor="transparent", pad=0.4, nodesep=0.45, ranksep=0.55]
    node  [shape=box, style="rounded,filled", class="dg-node",
           fontname="Inter", fontsize=13, margin="0.2,0.14"]
    edge  [class="dg-edge", fontname="Inter", fontsize=11, arrowsize=0.7]

    Client  [label="Client Layer\\nNext.js 15 · React 19 · Zustand", class="dg-node dg-accent"]
    Wallet  [label="Wallet Layer\\nStellar Wallets Kit · Freighter · Lobstr", class="dg-node dg-accent"]
    API     [label="NestJS API\\nAuth · Orders · Escrow · Payments · Webhooks", class="dg-node dg-backend"]
    Data    [label="Data Layer\\nPostgreSQL · Redis · BullMQ"]
    Stellar [label="Stellar\\nSoroban Contracts · TrustlessWork · USDC"]
    Offramp [label="Off-ramp\\nBlindPay (7 corridors)", class="dg-node dg-accent"]

    Client  -> API     [label="HTTPS / REST"]
    Client  -> Wallet  [label="client-side signing"]
    API     -> Data    [label="Prisma ORM"]
    API     -> Stellar [label="Stellar RPC"]
    Stellar -> API     [label="Webhook / on-chain event"]
    API     -> Offramp [label="API / Webhooks"]
    Wallet  -> Stellar [label="Sign & Submit", style=dashed]
}
"""

ARIA_LABEL = (
    "OfferHub system architecture: client and wallet layers, the NestJS API, "
    "the PostgreSQL/Redis data layer, Soroban contracts on Stellar and the "
    "BlindPay off-ramp."
)


def main() -> None:
    svg = render(DOT, aria_label=ARIA_LABEL)
    path = write_diagram("system-architecture", svg)
    print(f"wrote {path}")


if __name__ == "__main__":
    main()
