"use client";

import { motion } from "framer-motion";
import { Cpu } from "lucide-react";
import { ARCHITECTURE_SCROLL_MARGIN_PX } from "@/lib/architecture-nav";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] as const } },
};

const layers = [
  { label: "Client", sublabel: "Next.js 15 + SWK", color: "var(--color-primary)" },
  { label: "API", sublabel: "NestJS + Prisma", color: "var(--color-secondary)" },
  { label: "Stellar", sublabel: "Soroban + USDC", color: "var(--color-primary)" },
];

export default function ArchitectureHero() {
  return (
    <section
      id="overview"
      className="relative isolate overflow-hidden pt-44 md:pt-48 pb-20 bg-transparent"
      style={{ scrollMarginTop: ARCHITECTURE_SCROLL_MARGIN_PX }}
    >
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse 58% 48% at 50% 38%, rgba(20,154,155,0.085) 0%, transparent 68%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center flex flex-col items-center">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center w-full"
        >
          <motion.div variants={item} className="mb-6">
            <div
              className="text-[clamp(3rem,10vw,7.75rem)] font-black tracking-tight leading-none whitespace-nowrap select-none"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(31,184,185,1) 0%, rgba(20,154,155,1) 45%, rgba(34,224,226,0.95) 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
              aria-label="OFFER-HUB"
            >
              OFFER-HUB
            </div>
          </motion.div>

          <motion.div variants={item}>
            <div className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-8 shadow-neu-raised text-theme-primary bg-bg-base inline-flex items-center gap-2.5">
              <Cpu size={14} className="shrink-0 opacity-90" aria-hidden />
              SCF Build Award #44 — Integration Track
            </div>
          </motion.div>

          <motion.h1
            variants={item}
            className="text-5xl md:text-7xl font-black tracking-tight mb-8 text-content-primary max-w-4xl"
          >
            Technical Architecture
          </motion.h1>

          <motion.p
            variants={item}
            className="text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed mb-12 text-content-secondary"
          >
            Complete system design for a non-custodial freelance marketplace on Stellar — from
            client-side Soroban signing to fiat settlement across 7 LATAM markets.
          </motion.p>

          {/* Mini 3-layer diagram */}
          <motion.div variants={item} className="w-full max-w-2xl">
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
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
