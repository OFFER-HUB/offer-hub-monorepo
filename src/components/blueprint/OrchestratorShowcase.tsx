"use client";

import { useState } from "react";
import { Workflow } from "lucide-react";
import { BlueprintMotionSection } from "@/components/blueprint/BlueprintMotionSection";
import { OrchestratorDiagram } from "./OrchestratorDiagram";
import { OrchestratorDetailPanel } from "./OrchestratorDetailPanel";
import { LayerKey } from "./OrchestratorShowcase.types";
import { flowNodes, detailCards } from "./OrchestratorShowcase.data";

function FlowLegend() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {[
        {
          label: "prepare()",
          text: "Normalize buyer input, verify custody accounts, and initialize the escrow envelope.",
        },
        {
          label: "authorize()",
          text: "Confirm bridge liquidity, approve trustline movement, and lock release rules.",
        },
        {
          label: "finalize()",
          text: "Settle to the seller, persist final state, and expose the payout event downstream.",
        },
      ].map((item) => (
        <div
          key={item.label}
          className="rounded-[1.5rem] bg-bg-base p-4 shadow-neu-sunken-l2-subtle text-left overflow-visible"
        >
          <div className="mb-2 inline-flex rounded-full bg-theme-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-theme-primary">
            {item.label}
          </div>
          <p className="text-sm leading-6 text-content-secondary">{item.text}</p>
        </div>
      ))}
    </div>
  );
}

export default function OrchestratorShowcase() {
  const [expandedKey, setExpandedKey] = useState<LayerKey | null>("logic");
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const handleToggle = (key: LayerKey) => {
    setExpandedKey((current) => (current === key ? null : key));
  };

  return (
    <BlueprintMotionSection id="orchestrator" className="px-6 py-24 bg-transparent">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2.5rem] bg-bg-elevated p-10 shadow-neu-raised-l2 overflow-visible blueprint-layer">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-bg-base px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-theme-primary shadow-neu-sunken">
                <Workflow className="h-4 w-4" />
                The Orchestrator
              </div>
              <h2 className="mt-6 max-w-3xl text-4xl font-semibold leading-tight text-content-primary md:text-5xl">
                Visualizing the invisible engine behind decentralized payments.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-content-secondary">
                This showcase turns escrow automation, vault custody, and payout sequencing into a
                flow you can read at a glance. OFFER-HUB ingests fiat or crypto, passes value
                through programmable escrow logic, and releases seller settlement only after the SDK
                state machine advances through its guarded checkpoints.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Input rails", value: "Fiat / Crypto" },
                  { label: "Custody core", value: "Escrow + Vault" },
                  { label: "Settlement", value: "Seller release" },
                ].map((item) => (
                  <div key={item.label} className="rounded-[1.5rem] bg-bg-base p-4 shadow-neu-sunken">
                    <p className="text-xs uppercase tracking-[0.2em] text-content-muted">{item.label}</p>
                    <p className="mt-2 text-sm font-semibold text-content-primary">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <OrchestratorDiagram 
              nodes={flowNodes} 
              selectedNode={selectedNode} 
              onNodeSelect={setSelectedNode} 
            />
          </div>

          <div className="mt-10">
            <FlowLegend />
          </div>

          <OrchestratorDetailPanel 
            cards={detailCards} 
            expandedKey={expandedKey} 
            onToggle={handleToggle} 
          />
        </div>
      </div>
    </BlueprintMotionSection>
  );
}