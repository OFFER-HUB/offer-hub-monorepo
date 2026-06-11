import { BlueprintMotionSection } from "@/components/blueprint/BlueprintMotionSection";
import { Info, DollarSign, Zap, Shield, Lock, Globe, Users } from "lucide-react";

export default function WhyStellarSection() {
  return (
    <BlueprintMotionSection id="why-stellar" className="px-6 py-24 bg-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center mb-6">
          <span className="inline-block rounded-full bg-bg-base shadow-neu-sunken px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-theme-primary mb-6">
            Why Stellar
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-content-primary mb-4 tracking-tight">
            The case for Stellar
          </h2>
          <p className="text-content-secondary max-w-2xl text-lg mb-8">
            What Stellar uniquely enables for OfferHub that no other chain or payment rail provides.
          </p>
        </div>

        <div className="rounded-2xl bg-bg-base shadow-neu-sunken-subtle px-5 py-4 mb-12 flex gap-3 items-start max-w-4xl mx-auto">
          <Info size={15} className="text-theme-primary shrink-0 mt-0.5" />
          <p className="text-sm text-content-secondary leading-relaxed">
            This section answers the SCF panel&apos;s core question: why is Stellar the right foundation for OfferHub, and what value does this integration bring to the Stellar ecosystem?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 max-w-5xl mx-auto">
          
          <div className="rounded-[2rem] bg-bg-elevated shadow-neu-raised-l2-sm p-7 flex flex-col gap-4">
            <div className="rounded-2xl p-3 shadow-neu-sunken-subtle bg-bg-base w-fit">
              <DollarSign size={24} className="text-theme-primary" />
            </div>
            <h3 className="text-base font-bold text-content-primary">USDC on Stellar</h3>
            <p className="text-sm text-content-secondary leading-relaxed">
              Stellar&apos;s native USDC support means freelancers receive payment in a stable, internationally liquid asset — no wrapping, no bridge risk, no slippage. Every escrow is denominated in USDC, eliminating currency volatility from the payment contract.
            </p>
          </div>

          <div className="rounded-[2rem] bg-bg-elevated shadow-neu-raised-l2-sm p-7 flex flex-col gap-4">
            <div className="rounded-2xl p-3 shadow-neu-sunken-subtle bg-bg-base w-fit">
              <Zap size={24} className="text-theme-primary" />
            </div>
            <h3 className="text-base font-bold text-content-primary">Sub-second finality, ~$0.0001/tx</h3>
            <p className="text-sm text-content-secondary leading-relaxed">
              Stellar confirms transactions in 3–5 seconds with fees under a fraction of a cent. For a marketplace processing hundreds of escrow releases weekly, this makes on-chain payment settlement economically viable at any order size — including micro-orders under $10.
            </p>
          </div>

          <div className="rounded-[2rem] bg-bg-elevated shadow-neu-raised-l2-sm p-7 flex flex-col gap-4">
            <div className="rounded-2xl p-3 shadow-neu-sunken-subtle bg-bg-base w-fit">
              <Shield size={24} className="text-[var(--color-secondary)]" />
            </div>
            <h3 className="text-base font-bold text-content-primary">Soroban smart contracts (TrustlessWork)</h3>
            <p className="text-sm text-content-secondary leading-relaxed">
              Soroban enables programmable, audited escrow logic on Stellar. OfferHub integrates TrustlessWork&apos;s open-source Soroban contracts rather than building from scratch — leveraging already-audited code and contributing to Stellar&apos;s composable DeFi layer.
            </p>
          </div>

          <div className="rounded-[2rem] bg-bg-elevated shadow-neu-raised-l2-sm p-7 flex flex-col gap-4">
            <div className="rounded-2xl p-3 shadow-neu-sunken-subtle bg-bg-base w-fit">
              <Lock size={24} className="text-theme-primary" />
            </div>
            <h3 className="text-base font-bold text-content-primary">Non-custodial by design</h3>
            <p className="text-sm text-content-secondary leading-relaxed">
              Stellar Wallets Kit allows client-side transaction signing. Funds never pass through OfferHub&apos;s servers. This is the correct model for a marketplace handling freelancer payments at scale — OfferHub cannot freeze, redirect, or lose user funds.
            </p>
          </div>

          <div className="rounded-[2rem] bg-bg-elevated shadow-neu-raised-l2-sm p-7 flex flex-col gap-4">
            <div className="rounded-2xl p-3 shadow-neu-sunken-subtle bg-bg-base w-fit">
              <Globe size={24} className="text-theme-primary" />
            </div>
            <h3 className="text-base font-bold text-content-primary">LATAM off-ramp coverage</h3>
            <p className="text-sm text-content-secondary leading-relaxed">
              BlindPay and Abroad together cover 11 payout corridors across 6 LATAM countries — all settled from on-chain USDC. This makes Stellar the settlement layer for a population where 47% of the workforce is unbanked and traditional payment rails are unreliable or inaccessible.
            </p>
          </div>

          <div className="rounded-[2rem] bg-bg-elevated shadow-neu-raised-l2-sm p-7 flex flex-col gap-4">
            <div className="rounded-2xl p-3 shadow-neu-sunken-subtle bg-bg-base w-fit">
              <Users size={24} className="text-[var(--color-secondary)]" />
            </div>
            <h3 className="text-base font-bold text-content-primary">Ecosystem value OfferHub adds</h3>
            <p className="text-sm text-content-secondary leading-relaxed">
              OfferHub brings real freelance transaction volume to Stellar mainnet. Every completed order is an on-chain USDC escrow release followed by a fiat settlement via a Stellar anchor. Open-sourcing the SWK + BlindPay + Abroad adapters in T3 creates reusable building blocks for any future Stellar marketplace.
            </p>
          </div>

        </div>
      </div>
    </BlueprintMotionSection>
  );
}
