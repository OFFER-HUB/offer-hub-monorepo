"use client";

import { useState } from "react";
import { Workflow } from "lucide-react";
import { BlueprintMotionSection } from "@/components/shared/BlueprintMotionSection";
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
          className="rounded-2xl bg-bg-base p-4 shadow-neu-sunken-subtle text-left overflow-visible"
        >
          <div className="mb-2 inline-flex rounded-full bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-theme-primary">
            {item.label}
          </div>
          <p className="text-sm leading-6 text-content-secondary">{item.text}</p>
        </div>
      ))}
    </div>
  );
}

export function OrchestratorShowcase() {
  const [expandedKey, setExpandedKey] = useState<LayerKey | null>("logic");
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const handleToggle = (key: LayerKey) => {
    setExpandedKey((current) => (current === key ? null : key));
  };

  return (
    <BlueprintMotionSection id="orchestrator" className="px-0 sm:px-6 py-8 sm:py-12 bg-transparent">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-bg-elevated p-6 sm:p-10 shadow-neu-raised-l2 overflow-visible blueprint-layer">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-bg-base px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-theme-primary shadow-neu-sunken">
                <Workflow className="h-4 w-4" />
                The Orchestrator
              </div>
              <h2 className="mt-6 max-w-3xl text-2xl md:text-h2 font-bold leading-tight text-content-primary">
                Visualizing the invisible engine behind decentralized payments.
              </h2>
              <p className="mt-4 max-w-2xl text-sm md:text-base leading-7 text-content-secondary">
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
                  <div key={item.label} className="rounded-2xl bg-bg-base p-4 shadow-neu-sunken">
                    <p className="text-xs uppercase tracking-[0.12em] text-content-muted">{item.label}</p>
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
