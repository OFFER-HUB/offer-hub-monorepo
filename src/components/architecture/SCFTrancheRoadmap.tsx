"use client";

import { useState } from "react";
import { BlueprintMotionSection } from "@/components/blueprint/BlueprintMotionSection";
import MermaidDiagram from "./MermaidDiagram";
import DiagramZoomModal from "./DiagramZoomModal";
import { Info, Maximize2 } from "lucide-react";

export default function SCFTrancheRoadmap() {
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const ganttChart = `
gantt
  title OfferHub SCF Build #44 — Delivery Roadmap
  dateFormat YYYY-MM-DD
  axisFormat %b %d

  section T1 — Foundation ($15K)
    SWK Wallet Connection + Balance Display    :t1a, 2026-07-01, 2026-09-01
    Wallet-Based Auth (hybrid)                 :t1b, 2026-08-01, 2026-09-01

  section T2 — Core Integrations ($47K)
    Soroban Client-Side Signing (SWK)          :t2a, 2026-09-01, 2026-10-20
    BlindPay — 7 LATAM Corridors               :t2b, 2026-09-01, 2026-10-20
    Abroad — Nequi/Daviplata/Bre-B/Pix         :t2c, 2026-09-15, 2026-10-20
    Off-ramp Orchestration + Webhooks          :t2d, 2026-09-15, 2026-10-20
    E2E Integration Testing                    :t2e, 2026-10-01, 2026-10-20

  section T3 — Mainnet & Open-Source ($18K)
    Horizon → Stellar RPC Migration            :t3a, 2026-10-20, 2026-12-05
    Mainnet Launch + Monitoring                :t3b, 2026-10-20, 2026-12-05
    Open-Source Integration Adapters           :t3c, 2026-11-15, 2026-12-05
  `;

  return (
    <BlueprintMotionSection id="roadmap" className="px-6 py-24 bg-bg-base">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center mb-6">
          <span className="inline-block rounded-full bg-bg-elevated shadow-neu-raised-sm px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-theme-primary mb-6">
            Delivery Schedule
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-content-primary mb-4 tracking-tight">
            SCF Build #44 Roadmap
          </h2>
          <p className="text-content-secondary max-w-2xl text-lg mb-8">
            Detailed timeline for the execution of our $80,000 SCF Build Award milestones.
          </p>
        </div>

        <div className="rounded-2xl bg-bg-base shadow-neu-sunken-subtle px-5 py-4 mb-12 flex gap-3 items-start max-w-4xl mx-auto">
          <Info size={15} className="text-theme-primary shrink-0 mt-0.5" />
          <p className="text-sm text-content-secondary leading-relaxed">
            Three tranches, each tied to verifiable on-chain or functional deliverables. Tranche 1 ships the wallet connection layer. Tranche 2 completes all three SCF integrations on testnet. Tranche 3 migrates to Stellar RPC, launches on mainnet, records 10 live transactions as proof, and open-sources the integration adapters.
          </p>
        </div>

        <div className="rounded-[2.5rem] bg-bg-elevated shadow-neu-raised-l2 p-6 md:p-10 mb-12">
          <div className="relative rounded-[2rem] bg-bg-base shadow-neu-sunken p-6 overflow-x-auto w-full">
            <MermaidDiagram chart={ganttChart} className="w-full min-w-[800px]" />
            <button
              onClick={() => setIsZoomOpen(true)}
              className="absolute top-4 right-4 rounded-xl bg-bg-base shadow-neu-raised-sm p-2 hover:shadow-neu-sunken transition-all z-10"
              aria-label="Expand diagram"
            >
              <Maximize2 size={15} className="text-theme-primary" />
            </button>
          </div>
          <p className="mt-3 text-center text-xs text-content-muted">
            For a better view, click <Maximize2 size={11} className="inline text-theme-primary mx-0.5 -mt-0.5" /> to expand
          </p>

          <DiagramZoomModal title="SCF Build #44 Roadmap" isOpen={isZoomOpen} onClose={() => setIsZoomOpen(false)}>
            <MermaidDiagram chart={ganttChart} className="w-full" zoom />
          </DiagramZoomModal>
        </div>

        <div className="rounded-[2rem] bg-bg-base shadow-neu-sunken overflow-hidden max-w-4xl mx-auto border border-[var(--color-border)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-sunken text-content-muted text-xs uppercase tracking-widest">
                  <th className="py-4 px-6 font-semibold">Milestone</th>
                  <th className="py-4 px-6 font-semibold">Date</th>
                  <th className="py-4 px-6 font-semibold">Budget</th>
                  <th className="py-4 px-6 font-semibold">SCF Payment</th>
                  <th className="py-4 px-6 font-semibold">%</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-[var(--color-border)]">
                  <td className="py-4 px-6 font-medium text-content-primary">T0 Upfront</td>
                  <td className="py-4 px-6 text-content-secondary">On award</td>
                  <td className="py-4 px-6 text-content-secondary">—</td>
                  <td className="py-4 px-6 text-content-secondary">$8,000</td>
                  <td className="py-4 px-6 text-content-secondary">10%</td>
                </tr>
                <tr className="border-b border-[var(--color-border)]">
                  <td className="py-4 px-6 font-medium text-content-primary">T1 Complete</td>
                  <td className="py-4 px-6 text-content-secondary">Sept 1, 2026</td>
                  <td className="py-4 px-6 text-content-secondary">$15,000</td>
                  <td className="py-4 px-6 text-content-secondary">$16,000</td>
                  <td className="py-4 px-6 text-content-secondary">20%</td>
                </tr>
                <tr className="border-b border-[var(--color-border)]">
                  <td className="py-4 px-6 font-medium text-content-primary">T2 Complete</td>
                  <td className="py-4 px-6 text-content-secondary">Oct 20, 2026</td>
                  <td className="py-4 px-6 text-content-secondary">$47,000</td>
                  <td className="py-4 px-6 text-content-secondary">$24,000</td>
                  <td className="py-4 px-6 text-content-secondary">30%</td>
                </tr>
                <tr className="border-b border-[var(--color-border)]">
                  <td className="py-4 px-6 font-medium text-content-primary">T3 Complete</td>
                  <td className="py-4 px-6 text-content-secondary">Dec 5, 2026</td>
                  <td className="py-4 px-6 text-content-secondary">$18,000</td>
                  <td className="py-4 px-6 text-content-secondary">$32,000</td>
                  <td className="py-4 px-6 text-content-secondary">40%</td>
                </tr>
                <tr className="font-bold">
                  <td className="py-4 px-6 text-theme-primary">Total</td>
                  <td className="py-4 px-6 text-theme-primary"></td>
                  <td className="py-4 px-6 text-theme-primary">$80,000</td>
                  <td className="py-4 px-6 text-theme-primary">$80,000</td>
                  <td className="py-4 px-6 text-theme-primary">100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </BlueprintMotionSection>
  );
}
