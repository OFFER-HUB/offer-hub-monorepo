"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, FileText, Orbit, Sparkles } from "lucide-react";

const HERO_METADATA = [
  {
    label: "Target",
    value: "B2B / Freelance",
    accent: "Marketplace Scope",
  },
  {
    label: "Provider",
    value: "Stellar (USDC)",
    accent: "Settlement Layer",
  },
  {
    label: "Features",
    value: "Milestones, Escrow, Global Settlement",
    accent: "Release Logic",
  },
] as const;

const NETWORK_NODES = [
  { id: "origin", x: 16, y: 44, size: 12, delay: 0 },
  { id: "north", x: 34, y: 22, size: 8, delay: 0.3 },
  { id: "core", x: 50, y: 38, size: 14, delay: 0.6 },
  { id: "east", x: 72, y: 26, size: 9, delay: 0.9 },
  { id: "south", x: 64, y: 66, size: 11, delay: 1.2 },
  { id: "settlement", x: 86, y: 50, size: 10, delay: 1.5 },
] as const;

const NETWORK_LINKS = [
  ["origin", "north"],
  ["origin", "core"],
  ["north", "core"],
  ["core", "east"],
  ["core", "south"],
  ["east", "settlement"],
  ["south", "settlement"],
] as const;

const TECH_DOC_URL =
  "https://github.com/OFFER-HUB/offer-hub-monorepo/blob/main/docs/business/use-cases.md#use-case-1-freelance-platform";

function NetworkPattern() {
  const nodeMap = new Map(NETWORK_NODES.map((node) => [node.id, node]));
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(20,154,155,0.12), transparent 34%), radial-gradient(circle at 78% 28%, rgba(20,154,155,0.1), transparent 30%), radial-gradient(circle at 56% 76%, rgba(20,154,155,0.08), transparent 34%)",
        }}
      />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="freelance-network-line" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(20,154,155,0.08)" />
            <stop offset="50%" stopColor="rgba(20,154,155,0.32)" />
            <stop offset="100%" stopColor="rgba(20,154,155,0.12)" />
          </linearGradient>
        </defs>

        {NETWORK_LINKS.map(([from, to]) => {
          const source = nodeMap.get(from);
          const target = nodeMap.get(to);
          if (!source || !target) return null;

          return (
            <line
              key={`${from}-${to}`}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke="url(#freelance-network-line)"
              strokeWidth="0.35"
              strokeDasharray="1.8 1.8"
            />
          );
        })}

        {NETWORK_NODES.map((node) => (
          <g key={node.id}>
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={node.size / 2 + 1.8}
              fill="rgba(20,154,155,0.08)"
              animate={shouldReduceMotion ? {} : { scale: [1, 1.3, 1] }}
              transition={{
                duration: 2.8,
                delay: node.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ originX: `${node.x}%`, originY: `${node.y}%` }}
            />
            <circle
              cx={node.x}
              cy={node.y}
              r={node.size / 2}
              fill="rgba(20,154,155,0.18)"
              stroke="rgba(20,154,155,0.4)"
              strokeWidth="0.25"
            />
            <circle
              cx={node.x}
              cy={node.y}
              r={node.size / 4}
              fill="rgba(20,154,155,0.88)"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function FreelanceHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const titleY = useTransform(scrollYProgress, [0, 1], [0, -44]);
  const badgeY = useTransform(scrollYProgress, [0, 1], [0, -18]);

  return (
    <section
      ref={sectionRef}
      id="overview"
      className="relative min-h-[132vh] overflow-hidden bg-transparent"
      style={{ scrollMarginTop: "140px" }}
    >
      <NetworkPattern />

      <div className="absolute inset-x-0 top-24 bottom-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="sticky top-28">
          <div className="relative overflow-hidden rounded-[2.75rem] border border-theme-primary/10 bg-bg-elevated/80 px-6 py-10 shadow-neu-raised backdrop-blur-sm md:px-10 md:py-12">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(20,154,155,0.08) 0%, rgba(20,154,155,0) 52%, rgba(255,255,255,0.16) 100%)",
              }}
            />

            <div className="relative z-10 grid items-end gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
              <div className="max-w-3xl">
                <motion.div
                  style={{ y: badgeY }}
                  className="mb-8 inline-flex items-center gap-3 rounded-full border border-theme-primary/10 bg-bg-base px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-theme-primary shadow-neu-raised"
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-theme-primary/55" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-theme-primary" />
                  </span>
                  <span>CASE STUDY: LVL-1 REAL-WORLD</span>
                </motion.div>

                <motion.h1
                  style={{ y: titleY }}
                  className="text-5xl font-black tracking-tight text-content-primary md:text-7xl"
                >
                  Orchestrating the Global Talent Economy
                </motion.h1>

                <p className="mt-8 max-w-2xl text-lg font-medium leading-relaxed text-content-secondary md:text-xl">
                  The flagship OFFER-HUB deployment story, designed as a live study of
                  escrow-backed freelance infrastructure: mapped payment flows,
                  milestone controls, and global USDC settlement without custodial risk.
                </p>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <a
                    href={TECH_DOC_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold btn-neumorphic-primary"
                  >
                    <FileText size={16} />
                    Technical Doc
                    <ArrowUpRight size={15} />
                  </a>

                  <div className="inline-flex items-center gap-2 rounded-xl bg-bg-base px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-content-secondary shadow-neu-sunken-subtle">
                    <Orbit size={14} className="text-theme-primary" />
                    Deployment-grade architecture
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="flex items-center gap-3 px-5 text-[11px] font-black uppercase tracking-[0.32em] text-content-muted">
                  <Sparkles size={14} className="text-theme-primary" />
                  At a glance
                </div>

                {HERO_METADATA.map((item, index) => (
                  <motion.article
                    key={item.label}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{
                      delay: index * 0.12,
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="rounded-[1.75rem] border border-theme-primary/10 bg-bg-base/95 p-5 shadow-neu-raised"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-content-muted">
                          {item.label}
                        </p>
                        <p className="mt-3 text-lg font-bold leading-snug text-content-primary">
                          {item.value}
                        </p>
                      </div>

                      <div className="rounded-xl bg-bg-elevated px-3 py-2 text-right shadow-neu-sunken-subtle">
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-theme-primary">
                          {item.accent}
                        </p>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
