"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, FileText, Sparkles } from "lucide-react";

/* ── Types ── */

type IconComponent = React.FC<{ size?: number; className?: string }>;

/** A single "At a glance" metadata card in the right-hand column. */
export interface UseCaseHeroStat {
  label: string;
  value: string;
  accent: string;
}

/** A node in the animated background network graph. */
export interface HeroNode {
  id: string;
  x: number;
  y: number;
  size: number;
  delay: number;
}

/** A link between two nodes, referenced by node id. */
export type HeroLink = readonly [string, string];

export interface UseCaseHeroProps {
  /** Unique per use case — used for the SVG line gradient id. */
  gradientId: string;
  /** Pill text above the headline, e.g. "CASE STUDY: LVL-1 REAL-WORLD". */
  badgeLabel: string;
  headline: string;
  subheadline: string;
  /** Absolute URL for the primary CTA (opens in a new tab). */
  docsUrl: string;
  /** Primary CTA label. Defaults to "Technical Doc". */
  ctaLabel?: string;
  /** Icon + label for the sunken pill next to the CTA. */
  footerIcon: IconComponent;
  footerLabel: string;
  /** The three "At a glance" cards. */
  stats: UseCaseHeroStat[];
  /** Background network graph nodes and their connecting links. */
  nodes: HeroNode[];
  links: HeroLink[];
}

/* ── Animated background network ── */

function NetworkPattern({
  gradientId,
  nodes,
  links,
}: Pick<UseCaseHeroProps, "gradientId" | "nodes" | "links">) {
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
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
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(20,154,155,0.08)" />
            <stop offset="50%" stopColor="rgba(20,154,155,0.32)" />
            <stop offset="100%" stopColor="rgba(20,154,155,0.12)" />
          </linearGradient>
        </defs>

        {links.map(([from, to]) => {
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
              stroke={`url(#${gradientId})`}
              strokeWidth="0.35"
              strokeDasharray="1.8 1.8"
            />
          );
        })}

        {nodes.map((node) => (
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

/**
 * Shared hero for every use-case page (Freelance, eCommerce, DAO Payroll,
 * Real Estate, Service Platforms). All per-use-case content — copy, stats,
 * CTA link, footer pill, and the background network graph — is passed in as
 * typed props from each use case's `data.tsx`.
 */
export function UseCaseHero({
  gradientId,
  badgeLabel,
  headline,
  subheadline,
  docsUrl,
  ctaLabel = "Technical Doc",
  footerIcon: FooterIcon,
  footerLabel,
  stats,
  nodes,
  links,
}: UseCaseHeroProps) {
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
      <NetworkPattern gradientId={gradientId} nodes={nodes} links={links} />

      <div className="absolute inset-x-0 top-24 bottom-10 mx-auto max-w-7xl w-full min-w-0 overflow-hidden px-6 lg:px-8">
        <div className="sticky top-28 min-w-0 max-w-full">
          <div className="relative overflow-hidden rounded-[2.75rem] border border-theme-primary/10 bg-bg-elevated/80 px-4 py-10 shadow-neu-raised backdrop-blur-sm sm:px-6 md:px-10 md:py-12">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(20,154,155,0.08) 0%, rgba(20,154,155,0) 52%, rgba(255,255,255,0.16) 100%)",
              }}
            />

            <div className="relative z-10 grid min-w-0 max-w-full items-end gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              <div className="min-w-0 w-full max-w-3xl">
                <motion.div
                  style={{ y: badgeY }}
                  className="mb-8 inline-flex max-w-full min-w-0 flex-wrap items-center gap-3 rounded-full border border-theme-primary/10 bg-bg-base px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-theme-primary shadow-neu-raised sm:px-5"
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-theme-primary/55" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-theme-primary" />
                  </span>
                  <span className="min-w-0 max-w-full break-words">{badgeLabel}</span>
                </motion.div>

                <motion.h1
                  style={{ y: titleY }}
                  className="max-w-full min-w-0 break-words text-5xl font-black tracking-tight text-content-primary md:text-7xl"
                >
                  {headline}
                </motion.h1>

                <p className="mt-8 max-w-2xl text-lg font-medium leading-relaxed text-content-secondary md:text-xl">
                  {subheadline}
                </p>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <a
                    href={docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold btn-neumorphic-primary"
                  >
                    <FileText size={16} />
                    {ctaLabel}
                    <ArrowUpRight size={15} />
                  </a>

                  <div className="inline-flex max-w-full min-w-0 flex-wrap items-center gap-2 rounded-xl bg-bg-base px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-content-secondary shadow-neu-sunken-subtle">
                    <FooterIcon size={14} className="text-theme-primary shrink-0" />
                    <span className="min-w-0 break-words">{footerLabel}</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="flex min-w-0 max-w-full flex-wrap items-center gap-3 px-1 text-[11px] font-black uppercase tracking-[0.32em] text-content-muted sm:px-5">
                  <Sparkles size={14} className="text-theme-primary" />
                  At a glance
                </div>

                {stats.map((item, index) => (
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
                    className="rounded-[1.75rem] border border-theme-primary/10 bg-bg-base/95 p-5 shadow-neu-raised transition-elevation hover:shadow-neu-raised-hover min-w-0 max-w-full overflow-hidden"
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
                        <p className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.24em] text-theme-primary">
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
