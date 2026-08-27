"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DOMAINS, NEU_ELEVATED, NEU_SUNKEN, statusConfig } from "./config";
import { PHASES } from "./evolution-timeline.data";
import { ConnectorDot } from "./ConnectorDot";
import { PhaseCard } from "./PhaseCard";
import { TimelineLine } from "./TimelineLine";
import type { PhaseDomain, PhaseStatus } from "./types";


export function EvolutionTimelineView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeDomain, setActiveDomain] = useState<"all" | PhaseDomain>("all");
  const shouldReduceMotion = useReducedMotion();
  const filtered =
    activeDomain === "all"
      ? PHASES
      : PHASES.filter((phase) => phase.domain === activeDomain);

  const total = PHASES.length;
  const completed = PHASES.filter((phase) => phase.status === "completed").length;
  const inProgress = PHASES.filter((phase) => phase.status === "in-progress").length;
  const overallPct = Math.round(
    PHASES.reduce((acc, phase) => acc + phase.completion, 0) / PHASES.length
  );

  return (
    <section className="relative overflow-hidden py-24">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 opacity-[0.04]"
        style={{
          background:
            "radial-gradient(ellipse, var(--color-primary) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-center"
        >
          <span
            className={`inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/30 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-widest text-[var(--color-primary)] ${NEU_SUNKEN}`}
          >
            <motion.span
              animate={shouldReduceMotion ? {} : { opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]"
            />
            Live Roadmap
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-3 text-center text-4xl font-extrabold tracking-tight text-content-primary sm:text-5xl"
        >
          Evolution Timeline
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mb-10 max-w-xl text-center text-[15px] text-content-secondary"
        >
          Every milestone, every decision - the definitive visual guide to where
          we&apos;ve been and where we&apos;re going.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`mb-10 grid grid-cols-2 gap-4 rounded-2xl border border-[var(--color-border)] bg-bg-base p-5 sm:grid-cols-4 ${NEU_ELEVATED}`}
        >
          {[
            { label: "Total Phases", val: total, color: "text-content-primary" },
            {
              label: "Completed",
              val: completed,
              color: "text-[var(--color-success)]",
            },
            {
              label: "In Progress",
              val: inProgress,
              color: "text-[var(--color-primary)]",
            },
            {
              label: "Overall",
              val: `${overallPct}%`,
              color: "text-[var(--color-accent)]",
            },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-xl p-3 text-center ${NEU_SUNKEN}`}>
              <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.val}</p>
              <p className="mt-0.5 text-[11px] text-content-muted">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className={`mb-14 flex gap-2 overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-bg-base p-3 md:flex-wrap md:justify-center ${NEU_SUNKEN}`}
        >
          {DOMAINS.map((domainOption) => {
            const active = activeDomain === domainOption.key;
            return (
              <button
                key={domainOption.key}
                onClick={() => setActiveDomain(domainOption.key)}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-[13px] font-semibold transition-[background-color,color,box-shadow] duration-200 ${
                  active
                    ? `${NEU_ELEVATED} bg-[var(--color-primary)] text-white`
                    : "text-content-secondary hover:text-content-primary"
                }`}
              >
                {domainOption.label}
              </button>
            );
          })}
        </motion.div>

        <div ref={containerRef} className="relative">
          <TimelineLine containerRef={containerRef} />

          <div className="relative flex flex-col gap-10">
            <AnimatePresence mode="popLayout">
              {filtered.map((phase, index) => (
                <div key={phase.id} className="relative">
                  <ConnectorDot phase={phase} index={index} />
                  <PhaseCard phase={phase} index={index} isLeft={index % 2 === 0} />
                </div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 flex flex-col items-start gap-3 text-[12px] text-content-muted sm:items-center md:flex-row md:flex-wrap md:justify-center md:gap-6"
        >
          {[
            { status: "completed" as PhaseStatus, desc: "Solid elevated card" },
            { status: "in-progress" as PhaseStatus, desc: "Pulsing border" },
            { status: "planned" as PhaseStatus, desc: "Sunken card" },
          ].map(({ status, desc }) => {
            const cfg = statusConfig(status);
            const StatusIcon = cfg.icon;
            return (
              <span key={status} className="flex items-center gap-2">
                <StatusIcon
                  size={13}
                  className={`${cfg.color} ${status === "in-progress" ? "animate-spin" : ""}`}
                />
                <span className={`${cfg.color} font-medium`}>{cfg.label}</span>
                <span>- {desc}</span>
              </span>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
