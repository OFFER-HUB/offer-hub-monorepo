import { DollarSign, Zap, Shield, Lock, Globe, Users } from "lucide-react";

export function WhyStellarSection() {
  const points = [
    {
      icon: DollarSign,
      title: "USDC on Stellar",
      desc: "Stellar's native USDC support means freelancers receive payment in a stable, internationally liquid asset — no wrapping, no bridge risk, no slippage. Every escrow is denominated in USDC, eliminating currency volatility from the payment contract.",
    },
    {
      icon: Zap,
      title: "Sub-second finality, ~$0.0001/tx",
      desc: "Stellar confirms transactions in 3–5 seconds with fees under a fraction of a cent. For a marketplace processing hundreds of escrow releases weekly, this makes on-chain payment settlement economically viable at any order size — including micro-orders under $10.",
    },
    {
      icon: Shield,
      title: "Soroban smart contracts (TrustlessWork)",
      desc: "Soroban enables programmable, audited escrow logic on Stellar. OfferHub integrates TrustlessWork's open-source Soroban contracts rather than building from scratch — leveraging already-audited code and contributing to Stellar's composable DeFi layer.",
    },
    {
      icon: Lock,
      title: "Non-custodial by design",
      desc: "Stellar Wallets Kit allows client-side transaction signing. Funds never pass through OfferHub's servers. This is the correct model for a marketplace handling freelancer payments at scale — OfferHub cannot freeze, redirect, or lose user funds.",
    },
    {
      icon: Globe,
      title: "LATAM off-ramp coverage",
      desc: "BlindPay covers 7 payout corridors across 6 LATAM countries — all settled from on-chain USDC. This makes Stellar the settlement layer for a population where 47% of the workforce is unbanked and traditional payment rails are unreliable or inaccessible.",
    },
    {
      icon: Users,
      title: "Ecosystem value OfferHub adds",
      desc: "OfferHub brings real freelance transaction volume to Stellar mainnet. Every completed order is an on-chain USDC escrow release followed by a fiat settlement via a Stellar anchor. Open-sourcing the SWK + BlindPay adapters in T3 creates reusable building blocks for any future Stellar marketplace.",
    },
  ];

  return (
    <div className="rounded-3xl bg-bg-elevated shadow-neu-raised p-6 md:p-8 flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="inline-block rounded-full bg-bg-base shadow-neu-sunken px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-theme-primary w-fit">
          Why Stellar
        </span>
        <h2 className="text-xl md:text-2xl font-bold text-content-primary">
          The case for Stellar
        </h2>
        <p className="text-xs md:text-sm text-content-secondary leading-relaxed">
          What Stellar uniquely enables for OFFER-HUB that no other chain or payment rail provides.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {points.map((pt) => {
          const Icon = pt.icon;
          return (
            <div
              key={pt.title}
              className="rounded-2xl bg-bg-base shadow-neu-raised-sm p-5 flex flex-col gap-2.5 transition-shadow hover:shadow-neu-raised"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-xl p-2.5 shadow-neu-sunken-subtle bg-bg-base shrink-0">
                  <Icon size={18} className="text-theme-primary" />
                </div>
                <h3 className="text-sm font-bold text-content-primary leading-snug">
                  {pt.title}
                </h3>
              </div>
              <p className="text-xs text-content-secondary leading-relaxed pl-1">
                {pt.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
