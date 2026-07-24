"use client";

import { useState } from "react";
import { BlueprintMotionSection } from "@/components/blueprint/BlueprintMotionSection";
import MermaidDiagram from "@/components/shared/MermaidDiagram";
import { PAYMENT_SEQUENCE_CHART, PAYMENT_STATE_CHART } from "./payment-flow.charts";
import DiagramZoomModal from "./DiagramZoomModal";
import { Info, Maximize2 } from "lucide-react";

export default function PaymentFlowDiagram() {
  const [isSeqZoomOpen, setIsSeqZoomOpen] = useState(false);
  const [isStateZoomOpen, setIsStateZoomOpen] = useState(false);

  const sequenceChart = PAYMENT_SEQUENCE_CHART;

  const stateChart = PAYMENT_STATE_CHART;

  return (
    <BlueprintMotionSection id="flow" className="px-6 py-24 bg-bg-base">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="inline-block rounded-full bg-bg-elevated shadow-neu-raised-sm px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-theme-primary mb-6">
            Payment Flow Lifecycle
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-content-primary mb-4 tracking-tight">
            Escrow Lifecycle & Payouts
          </h2>
          <p className="text-content-secondary max-w-2xl text-lg">
            A secure, non-custodial workflow powered by Soroban smart contracts and executed via Stellar Wallets Kit.
          </p>
        </div>

        <div className="rounded-2xl bg-bg-base shadow-neu-sunken-subtle px-5 py-4 mb-6 flex gap-3 items-start">
          <Info size={15} className="text-theme-primary shrink-0 mt-0.5" />
          <p className="text-sm text-content-secondary leading-relaxed">
            The sequence diagram traces a complete escrow lifecycle: from order creation to fiat settlement. All Soroban transactions (fund_escrow and release_escrow) are signed client-side by the user&apos;s wallet via Stellar Wallets Kit — no private keys ever touch the server. The state diagram on the right shows every valid order state, including the dispute resolution path.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-[2.5rem] bg-bg-elevated shadow-neu-raised-l2 p-6 md:p-8 flex flex-col h-full">
            <h3 className="text-xl font-bold text-content-primary mb-6 ml-2">Transaction Flow</h3>
            <div className="relative rounded-[2rem] bg-bg-base shadow-neu-sunken p-6 flex-grow overflow-x-auto">
              <MermaidDiagram chart={sequenceChart} className="w-full min-w-[500px]" variant="plain" />
              <button
                onClick={() => setIsSeqZoomOpen(true)}
                className="absolute top-4 right-4 rounded-xl bg-bg-base shadow-neu-raised-sm p-2 hover:shadow-neu-sunken transition-all z-10"
                aria-label="Expand diagram"
              >
                <Maximize2 size={15} className="text-theme-primary" />
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-content-muted">
              For a better view, click <Maximize2 size={11} className="inline text-theme-primary mx-0.5 -mt-0.5" /> to expand
            </p>
            <DiagramZoomModal title="Transaction Flow" isOpen={isSeqZoomOpen} onClose={() => setIsSeqZoomOpen(false)}>
              <MermaidDiagram chart={sequenceChart} className="w-full" zoom variant="plain" />
            </DiagramZoomModal>
          </div>

          <div className="rounded-[2.5rem] bg-bg-elevated shadow-neu-raised-l2 p-6 md:p-8 flex flex-col h-full">
            <h3 className="text-xl font-bold text-content-primary mb-6 ml-2">Escrow State Machine</h3>
            <div className="relative rounded-[2rem] bg-bg-base shadow-neu-sunken p-6 flex-grow overflow-x-auto">
              <MermaidDiagram chart={stateChart} className="w-full min-w-[300px]" variant="plain" />
              <button
                onClick={() => setIsStateZoomOpen(true)}
                className="absolute top-4 right-4 rounded-xl bg-bg-base shadow-neu-raised-sm p-2 hover:shadow-neu-sunken transition-all z-10"
                aria-label="Expand diagram"
              >
                <Maximize2 size={15} className="text-theme-primary" />
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-content-muted">
              For a better view, click <Maximize2 size={11} className="inline text-theme-primary mx-0.5 -mt-0.5" /> to expand
            </p>
            <DiagramZoomModal title="Escrow State Machine" isOpen={isStateZoomOpen} onClose={() => setIsStateZoomOpen(false)}>
              <MermaidDiagram chart={stateChart} className="w-full" zoom variant="plain" />
            </DiagramZoomModal>
          </div>
        </div>
      </div>
    </BlueprintMotionSection>
  );
}
