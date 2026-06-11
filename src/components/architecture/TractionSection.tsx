import { BlueprintMotionSection } from "@/components/blueprint/BlueprintMotionSection";
import { Info, CheckCircle2 } from "lucide-react";

export default function TractionSection() {
  return (
    <BlueprintMotionSection id="traction" className="px-6 py-24 bg-bg-base">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center mb-6">
          <span className="inline-block rounded-full bg-bg-elevated shadow-neu-raised-sm px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-theme-primary mb-6">
            Platform Traction
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-content-primary mb-4 tracking-tight">
            Live on testnet. Built for scale.
          </h2>
          <p className="text-content-secondary max-w-2xl text-lg mb-8">
            Current platform metrics and the validated LATAM freelance market opportunity.
          </p>
        </div>

        <div className="rounded-2xl bg-bg-base shadow-neu-sunken-subtle px-5 py-4 mb-12 flex gap-3 items-start max-w-4xl mx-auto">
          <Info size={15} className="text-theme-primary shrink-0 mt-0.5" />
          <p className="text-sm text-content-secondary leading-relaxed">
            The SCF Integration Track requires verifiable traction. This section shows OfferHub&apos;s current testnet status, team readiness, and the market context that validates the integration investment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Block A — Current platform status */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-content-primary">Platform status</h3>
              <div className="flex items-center gap-2 rounded-full bg-bg-elevated shadow-neu-raised-sm px-3 py-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs font-bold text-content-secondary uppercase">Testnet live</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-bg-base shadow-neu-sunken p-5 text-center flex flex-col justify-center">
                <p className="text-sm font-bold text-content-primary mb-1">NestJS API</p>
                <p className="text-xs text-content-secondary">12 modules in production</p>
              </div>
              <div className="rounded-2xl bg-bg-base shadow-neu-sunken p-5 text-center flex flex-col justify-center">
                <p className="text-sm font-bold text-content-primary mb-1">PostgreSQL</p>
                <p className="text-xs text-content-secondary">Orders, escrow, reviews, payments</p>
              </div>
              <div className="rounded-2xl bg-bg-base shadow-neu-sunken p-5 text-center flex flex-col justify-center">
                <p className="text-sm font-bold text-content-primary mb-1">GitHub</p>
                <p className="text-xs text-content-secondary">Open-source codebase</p>
              </div>
              <div className="rounded-2xl bg-bg-base shadow-neu-sunken p-5 text-center flex flex-col justify-center">
                <p className="text-sm font-bold text-content-primary mb-1">Next.js 15</p>
                <p className="text-xs text-content-secondary">Production frontend deployed</p>
              </div>
            </div>

            <div className="rounded-2xl bg-bg-elevated shadow-neu-raised-sm p-5 mt-2">
              <h4 className="text-sm font-bold text-content-primary mb-4">Build readiness</h4>
              <ul className="space-y-3 text-sm text-content-secondary">
                <li className="flex gap-3 items-start">
                  <CheckCircle2 size={16} className="text-theme-primary shrink-0 mt-0.5" />
                  <span>Full-stack TypeScript team with NestJS + Next.js experience</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle2 size={16} className="text-theme-primary shrink-0 mt-0.5" />
                  <span>Existing Stellar integration (custodial keypairs → migrating to non-custodial via SWK)</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle2 size={16} className="text-theme-primary shrink-0 mt-0.5" />
                  <span>TrustlessWork integration contracts already tested on testnet</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle2 size={16} className="text-theme-primary shrink-0 mt-0.5" />
                  <span>BlindPay and Abroad onboarding initiated — estimated 1–2 weeks to production</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Block B — Market opportunity */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold text-content-primary">The LATAM freelance gap</h3>
            
            <div className="flex flex-col gap-4">
              <div className="rounded-[2rem] bg-bg-elevated shadow-neu-raised-l2-sm p-7 flex items-center justify-between">
                <span className="text-3xl md:text-4xl font-black text-theme-primary">$85B</span>
                <span className="text-sm text-content-muted text-right max-w-[150px]">LATAM freelance market size (2024)</span>
              </div>
              <div className="rounded-[2rem] bg-bg-elevated shadow-neu-raised-l2-sm p-7 flex items-center justify-between">
                <span className="text-3xl md:text-4xl font-black text-theme-primary">47%</span>
                <span className="text-sm text-content-muted text-right max-w-[150px]">Workforce without bank accounts — Colombia</span>
              </div>
              <div className="rounded-[2rem] bg-bg-elevated shadow-neu-raised-l2-sm p-7 flex items-center justify-between">
                <span className="text-3xl md:text-4xl font-black text-theme-primary">7</span>
                <span className="text-sm text-content-muted text-right max-w-[150px]">Countries covered by BlindPay + Abroad corridors</span>
              </div>
            </div>

            <div className="rounded-2xl bg-bg-base shadow-neu-sunken p-5 text-sm text-content-secondary leading-relaxed mt-2">
              Traditional platforms (Upwork, Fiverr) cannot pay unbanked LATAM freelancers directly. OfferHub + Stellar + BlindPay + Abroad closes this gap: any freelancer with a mobile wallet receives USDC-settled payments in seconds, converted to local fiat via established licensed corridors.
            </div>
          </div>

        </div>
      </div>
    </BlueprintMotionSection>
  );
}
