"use client";

import { Cpu } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import { ARCHITECTURE_SCROLL_MARGIN_PX } from "@/lib/architecture-nav";

const layers = [
  { label: "Client", sublabel: "Next.js 15 + SWK", color: "var(--color-primary)" },
  { label: "API", sublabel: "NestJS + Prisma", color: "var(--color-secondary)" },
  { label: "Stellar", sublabel: "Soroban + USDC", color: "var(--color-primary)" },
];

export default function ArchitectureHero() {
  return (
    <PageHero
      id="overview"
      scrollMarginPx={ARCHITECTURE_SCROLL_MARGIN_PX}
      eyebrowIcon={<Cpu size={14} className="shrink-0 opacity-90" aria-hidden />}
      eyebrowText="SCF Build Award #44 — Integration Track"
      heading="Technical Architecture"
      paragraph="Complete system design for a non-custodial freelance marketplace on Stellar — from client-side Soroban signing to fiat settlement across 7 LATAM markets."
    >
      {/* Mini 3-layer diagram */}
      <div className="rounded-[2rem] bg-bg-elevated p-8 md:p-10 shadow-neu-raised">
        <div className="flex flex-col items-center gap-0">
          {layers.map((layer, i) => (
            <div key={layer.label} className="w-full flex flex-col items-center">
              <div className="w-full rounded-2xl bg-bg-base shadow-neu-raised-sm px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full animate-blockchainPulse"
                    style={{ backgroundColor: layer.color }}
                  />
                  <span className="text-sm font-bold text-content-primary">{layer.label}</span>
                </div>
                <span className="text-xs text-content-secondary">{layer.sublabel}</span>
              </div>
              {i < layers.length - 1 && (
                <div className="flex flex-col items-center my-1">
                  <svg width="2" height="20" className="overflow-visible">
                    <line
                      x1="1" y1="0" x2="1" y2="20"
                      stroke="var(--color-primary)"
                      strokeOpacity="0.4"
                      strokeWidth="2"
                      strokeDasharray="4 3"
                      className="animate-connectorDash"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-content-secondary text-center">
          Non-custodial · On-chain · LATAM-native
        </p>
      </div>
    </PageHero>
  );
}
