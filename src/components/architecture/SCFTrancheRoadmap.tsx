"use client";

import { useState } from "react";
import { BlueprintMotionSection } from "@/components/blueprint/BlueprintMotionSection";
import MermaidDiagram from "@/components/shared/MermaidDiagram";
import { SCF_GANTT_CHART } from "./scf-tranche-roadmap.charts";
import DiagramZoomModal from "./DiagramZoomModal";
import { Info, Maximize2 } from "lucide-react";

export default function SCFTrancheRoadmap() {
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const ganttChart = SCF_GANTT_CHART;

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
            Detailed timeline for the execution of our $74,000 SCF Build Award milestones.
          </p>
        </div>

        <div className="rounded-2xl bg-bg-base shadow-neu-sunken-subtle px-5 py-4 mb-12 flex gap-3 items-start max-w-4xl mx-auto">
          <Info size={15} className="text-theme-primary shrink-0 mt-0.5" />
          <p className="text-sm text-content-secondary leading-relaxed">
            Three tranches, each tied to verifiable on-chain or functional deliverables. Tranche 1 ships the wallet connection layer. Tranche 2 completes both SCF integrations on testnet. Tranche 3 migrates to Stellar RPC, launches on mainnet, records 10 live transactions as proof, and open-sources the integration adapters.
          </p>
        </div>

        <div className="rounded-[2.5rem] bg-bg-elevated shadow-neu-raised-l2 p-6 md:p-10 mb-12">
          <div className="relative rounded-[2rem] bg-bg-base shadow-neu-sunken p-6 overflow-x-auto w-full">
            <MermaidDiagram chart={ganttChart} className="w-full min-w-[800px]" variant="plain" />
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
            <MermaidDiagram chart={ganttChart} className="w-full" zoom variant="plain" />
          </DiagramZoomModal>
        </div>

        <div className="rounded-[2rem] bg-bg-base shadow-neu-sunken overflow-hidden max-w-4xl mx-auto border border-[var(--color-border)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-sunken text-content-muted text-xs uppercase tracking-widest">
                  <th className="py-4 px-6 font-semibold">Milestone</th>
                  <th className="py-4 px-6 font-semibold">Date</th>
                  <th className="py-4 px-6 font-semibold">Technical Cost</th>
                  <th className="py-4 px-6 font-semibold">SCF Payout</th>
                  <th className="py-4 px-6 font-semibold">%</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-[var(--color-border)]">
                  <td className="py-4 px-6 font-medium text-content-primary">T0 — Upfront</td>
                  <td className="py-4 px-6 text-content-secondary">On award</td>
                  <td className="py-4 px-6 text-content-secondary">—</td>
                  <td className="py-4 px-6 text-content-secondary">$8,000</td>
                  <td className="py-4 px-6 text-content-secondary">10%</td>
                </tr>
                <tr className="border-b border-[var(--color-border)]">
                  <td className="py-4 px-6 font-medium text-content-primary">T1 — MVP: SWK Connection & Auth</td>
                  <td className="py-4 px-6 text-content-secondary">Sept 1, 2026</td>
                  <td className="py-4 px-6 text-content-secondary">$16,000</td>
                  <td className="py-4 px-6 text-content-secondary">$16,000</td>
                  <td className="py-4 px-6 text-content-secondary">22%</td>
                </tr>
                <tr className="border-b border-[var(--color-border)]">
                  <td className="py-4 px-6 font-medium text-content-primary">T2 — Testnet: Core Integrations</td>
                  <td className="py-4 px-6 text-content-secondary">Oct 20, 2026</td>
                  <td className="py-4 px-6 text-content-secondary">$19,500</td>
                  <td className="py-4 px-6 text-content-secondary">$19,500</td>
                  <td className="py-4 px-6 text-content-secondary">26%</td>
                </tr>
                <tr className="border-b border-[var(--color-border)]">
                  <td className="py-4 px-6 font-medium text-content-primary">T3 — Mainnet Launch & OS Adapters</td>
                  <td className="py-4 px-6 text-content-secondary">Dec 5, 2026</td>
                  <td className="py-4 px-6 text-content-secondary">$30,500</td>
                  <td className="py-4 px-6 text-content-secondary">$30,500</td>
                  <td className="py-4 px-6 text-content-secondary">41%</td>
                </tr>
                <tr className="font-bold">
                  <td className="py-4 px-6 text-theme-primary">Total</td>
                  <td className="py-4 px-6 text-theme-primary"></td>
                  <td className="py-4 px-6 text-theme-primary">$74,000</td>
                  <td className="py-4 px-6 text-theme-primary">$74,000</td>
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
