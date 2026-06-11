import { BlueprintMotionSection } from "@/components/blueprint/BlueprintMotionSection";
import { Info } from "lucide-react";

export default function IntegrationsMap() {
  return (
    <BlueprintMotionSection id="integrations" className="px-6 py-24 bg-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center mb-6">
          <span className="inline-block rounded-full bg-bg-base shadow-neu-sunken px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-theme-primary mb-6">
            Ecosystem Integrations
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-content-primary mb-4 tracking-tight">
            Hub and Spoke Architecture
          </h2>
          <p className="text-content-secondary max-w-2xl text-lg mb-8">
            OfferHub acts as the orchestrator, integrating best-in-class solutions for wallet management, escrow, and global fiat off-ramps.
          </p>
        </div>

        <div className="rounded-2xl bg-bg-base shadow-neu-sunken-subtle px-5 py-4 mb-12 flex gap-3 items-start max-w-4xl mx-auto">
          <Info size={15} className="text-theme-primary shrink-0 mt-0.5" />
          <p className="text-sm text-content-secondary leading-relaxed">
            OfferHub uses three building blocks from the official SCF Integration List. Stellar Wallets Kit handles non-custodial wallet connection and client-side Soroban signing. BlindPay routes USDC to bank accounts across 7 LATAM corridors via SPEI, Pix, PSE, and Transfer 3.0. Abroad delivers funds to mobile wallets (Nequi, Daviplata, Bre-B) for unbanked users. The NestJS orchestrator selects the off-ramp route automatically based on freelancer country and payout preference.
          </p>
        </div>

        {/* Desktop Hub & Spoke / Mobile Stack */}
        <div className="relative w-full max-w-5xl mx-auto flex flex-col md:block min-h-[600px] gap-8">
          
          {/* Animated SVG Lines (Desktop Only) */}
          <svg className="hidden md:block absolute inset-0 w-full h-full pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
            <style>
              {`
                @keyframes dash-flow-left {
                  to { stroke-dashoffset: -20; }
                }
                @keyframes dash-flow-right {
                  to { stroke-dashoffset: 20; }
                }
                .anim-line-left { stroke-dasharray: 10; animation: dash-flow-left 1s linear infinite; }
                .anim-line-right { stroke-dasharray: 10; animation: dash-flow-right 1s linear infinite; }
              `}
            </style>
            
            {/* Hub to SWK (Left) */}
            <path d="M 500 300 Q 350 300 250 300" fill="none" stroke="#149A9B" strokeWidth="2" opacity="0.4" className="anim-line-left" />
            
            {/* Hub to BlindPay (Top Right) */}
            <path d="M 500 300 Q 650 200 750 150" fill="none" stroke="#149A9B" strokeWidth="2" opacity="0.4" className="anim-line-right" />
            
            {/* Hub to Abroad (Bottom Right) */}
            <path d="M 500 300 Q 650 400 750 450" fill="none" stroke="#149A9B" strokeWidth="2" opacity="0.4" className="anim-line-right" />
          </svg>

          {/* Mobile Connectors */}
          <div className="md:hidden absolute inset-0 w-full h-full flex justify-center pointer-events-none z-0">
             <div className="w-px h-full border-l-2 border-dashed border-[var(--color-primary)] opacity-40"></div>
          </div>

          {/* Center Hub: OfferHub */}
          <div className="relative z-10 w-full md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[220px]">
            <div className="rounded-[2rem] bg-bg-elevated shadow-neu-raised p-6 flex flex-col items-center text-center border border-[var(--color-border)]">
              <div className="w-4 h-4 rounded-full bg-[#149A9B] animate-pulse mb-3 shadow-[0_0_15px_rgba(20,154,155,0.6)]"></div>
              <h3 className="text-xl font-bold text-content-primary">OfferHub</h3>
              <p className="text-sm text-theme-primary font-medium mt-1 mb-3">NestJS Orchestrator</p>
              <div className="rounded-xl bg-bg-base shadow-neu-sunken-subtle p-3 w-full">
                <p className="text-xs text-content-secondary">Routes USDC based on freelancer country</p>
              </div>
            </div>
          </div>

          {/* Left Spoke: SWK */}
          <div className="relative z-10 w-full md:absolute md:left-[5%] md:top-1/2 md:-translate-y-1/2 md:w-[320px]">
            <div className="rounded-[2rem] bg-bg-elevated shadow-neu-raised p-6 border border-[var(--color-border)]">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-content-primary">Stellar Wallets Kit</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-bg-base shadow-neu-sunken px-2 py-1 rounded-full text-theme-primary">SCF Integration #1</span>
              </div>
              <p className="text-sm text-content-secondary mb-4">Non-custodial signing</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {['Freighter', 'Lobstr', 'xBull'].map(w => (
                  <span key={w} className="text-xs bg-bg-base shadow-neu-raised-sm px-3 py-1 rounded-full text-content-primary">{w}</span>
                ))}
              </div>
              
              <div className="rounded-xl bg-bg-base shadow-neu-sunken p-4">
                <ul className="text-xs font-mono text-content-secondary space-y-2">
                  <li>• create_escrow</li>
                  <li>• release_escrow</li>
                  <li>• refund_escrow</li>
                  <li>• resolve_dispute</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Top Spoke: BlindPay */}
          <div className="relative z-10 w-full md:absolute md:right-[5%] md:top-[10%] md:w-[340px]">
            <div className="rounded-[2rem] bg-bg-elevated shadow-neu-raised p-6 border border-[var(--color-border)]">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-content-primary">BlindPay</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-bg-base shadow-neu-sunken px-2 py-1 rounded-full text-theme-primary">SCF Integration #2</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-[10px] bg-bg-base shadow-neu-sunken-subtle px-2 py-1 rounded-md text-content-muted">FinCEN MSB</span>
                <span className="text-[10px] bg-bg-base shadow-neu-sunken-subtle px-2 py-1 rounded-md text-content-muted">YC-backed</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {['MX/SPEI', 'BR/Pix', 'CO/PSE', 'AR/Transfer 3.0', 'PE', 'CL', 'CR'].map(c => (
                  <div key={c} className="text-[10px] font-medium text-center bg-bg-base shadow-neu-raised-sm rounded-lg py-2 text-content-primary px-1">
                    {c}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Bottom Spoke: Abroad */}
          <div className="relative z-10 w-full md:absolute md:right-[5%] md:bottom-[10%] md:w-[340px]">
            <div className="rounded-[2rem] bg-bg-elevated shadow-neu-raised p-6 border border-[var(--color-border)]">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-content-primary">Abroad</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-bg-base shadow-neu-sunken px-2 py-1 rounded-full text-theme-primary">SCF Integration #3</span>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-[10px] bg-bg-base shadow-neu-sunken-subtle px-2 py-1 rounded-md text-content-muted">Circle Alliance</span>
                <span className="text-[10px] bg-bg-base shadow-neu-sunken-subtle px-2 py-1 rounded-md text-content-muted">47% unbanked</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {['Nequi', 'Daviplata', 'Bre-B', 'Pix'].map(c => (
                  <div key={c} className="text-xs font-medium text-center bg-bg-base shadow-neu-raised-sm rounded-xl py-3 text-content-primary">
                    {c}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Stats Strip */}
        <div className="mt-16 flex justify-center">
          <div className="rounded-2xl bg-bg-elevated shadow-neu-raised-sm border border-[var(--color-border)] px-8 py-4 inline-flex flex-wrap justify-center items-center gap-4 text-sm font-medium text-content-secondary">
            <span>3 SCF Integrations</span>
            <span className="text-[var(--color-border)]">•</span>
            <span>7 BlindPay Corridors</span>
            <span className="text-[var(--color-border)]">•</span>
            <span>4 Abroad Methods</span>
            <span className="text-[var(--color-border)]">•</span>
            <span className="text-theme-primary font-bold">11 Total Corridors</span>
          </div>
        </div>

      </div>
    </BlueprintMotionSection>
  );
}
