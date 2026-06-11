"use client";

import { useState } from "react";
import { BlueprintMotionSection } from "@/components/blueprint/BlueprintMotionSection";
import MermaidDiagram from "./MermaidDiagram";
import DiagramZoomModal from "./DiagramZoomModal";
import { Info, Maximize2 } from "lucide-react";

export default function SystemArchitectureDiagram() {
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const chart = `
flowchart TD
    %% Node Styling
    classDef highlight fill:#149A9B,color:#fff,stroke:#0d7377,stroke-width:2px;
    classDef backend fill:#002333,color:#fff,stroke:#001522,stroke-width:2px;
    classDef subtle fill:#F1F3F7,color:#19213D,stroke:#d1d5db,stroke-width:1px;

    Client["Client Layer<br/><small>Next.js 15 · React 19 · Zustand · NextAuth v5</small>"]:::highlight
    Wallet["Wallet Layer<br/><small>Stellar Wallets Kit · Freighter · Lobstr · xBull</small>"]:::highlight
    API["NestJS API<br/><small>Auth · Orders · Escrow · Payments · Webhooks · Off-ramp</small>"]:::backend
    Data["Data Layer<br/><small>PostgreSQL · Redis · BullMQ</small>"]:::subtle
    Stellar["Stellar<br/><small>Soroban Contracts · TrustlessWork · USDC</small>"]:::subtle
    Offramp["Off-ramp<br/><small>BlindPay · Abroad</small>"]:::highlight

    Client -->|HTTPS / REST| API
    Client -->|Client-side Soroban signing| Wallet
    API -->|Prisma ORM| Data
    API -->|Stellar RPC| Stellar
    Stellar -->|Webhook / on-chain event| API
    API -->|API / Webhooks| Offramp
    Wallet -.->|Sign & Submit| Stellar
  `;

  return (
    <BlueprintMotionSection id="system" className="px-6 py-24 bg-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-[2.5rem] bg-bg-elevated shadow-neu-raised-l2 p-8 md:p-12">
          
          <div className="flex flex-col items-center text-center mb-10">
            <span className="inline-block rounded-full bg-bg-base shadow-neu-sunken px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-theme-primary mb-6">
              Architecture Overview
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-content-primary mb-4 tracking-tight">
              OfferHub System Architecture
            </h2>
            <p className="text-content-secondary max-w-2xl text-lg">
              A comprehensive view of the OfferHub platform, showing the flow between our modern frontend, NestJS orchestrator, and external integrations.
            </p>
          </div>

          <div className="rounded-2xl bg-bg-base shadow-neu-sunken-subtle px-5 py-4 mb-6 flex gap-3 items-start">
            <Info size={15} className="text-theme-primary shrink-0 mt-0.5" />
            <p className="text-sm text-content-secondary leading-relaxed">
              This flowchart maps every layer of the OfferHub stack — from the browser and Stellar Wallets Kit on the client side, through the NestJS orchestration API and PostgreSQL/Redis data layer, down to Soroban smart contracts on Stellar and the BlindPay/Abroad off-ramp providers. Arrows show the protocol or method used at each boundary. Teal nodes are the three SCF Integration Track building blocks.
            </p>
          </div>

          <div className="relative rounded-[2rem] bg-bg-base shadow-neu-sunken p-6 w-full overflow-x-auto">
            <MermaidDiagram chart={chart} className="w-full min-w-[600px]" />
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

          <DiagramZoomModal title="System Architecture" isOpen={isZoomOpen} onClose={() => setIsZoomOpen(false)}>
            <MermaidDiagram chart={chart} className="w-full" zoom />
          </DiagramZoomModal>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#149A9B] shadow-neu-raised-sm"></span>
              <span className="text-content-secondary">SCF Integration / Client</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#002333] shadow-neu-raised-sm"></span>
              <span className="text-content-secondary">Internal API</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F1F3F7] border border-[var(--color-border)] shadow-neu-raised-sm"></span>
              <span className="text-content-secondary">Persistence / Chain</span>
            </div>
          </div>

        </div>
      </div>
    </BlueprintMotionSection>
  );
}
