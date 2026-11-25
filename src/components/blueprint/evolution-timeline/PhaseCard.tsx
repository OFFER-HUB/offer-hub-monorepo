"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { NEU_ELEVATED, NEU_SUNKEN, statusConfig } from "./config";
import type { Phase } from "./types";

interface PhaseCardProps {
  phase: Phase;
  index: number;
  isLeft: boolean;
}

export function PhaseCard({ phase, index, isLeft }: PhaseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const cfg = statusConfig(phase.status);
  const Icon = phase.icon;
  const StatusIcon = cfg.icon;

  const isCompleted = phase.status === "completed";
  const isPlanned = phase.status === "planned";
  const isInProgress = phase.status === "in-progress";

  return (
    <div
      className={`relative flex w-full items-start pl-14 md:pl-0 ${
        isLeft ? "md:flex-row-reverse" : "md:flex-row"
      }`}
    >
      <motion.article
        layout
        layoutId={`phase-card-${phase.id}`}
        initial={{ opacity: 0, x: isLeft ? 40 : -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
        className={`
          relative w-full rounded-2xl border
          bg-bg-base
          ${isPlanned ? NEU_SUNKEN + " opacity-70" : NEU_ELEVATED}
          ${
            isInProgress
              ? cfg.border
              : isCompleted
              ? "border-[color-mix(in_srgb,var(--color-success)_20%,transparent)]"
              : "border-[var(--color-border)]"
          }
          ${isInProgress ? "ring-1 ring-[color-mix(in_srgb,var(--color-primary)_30%,transparent)]" : ""}
          md:w-[calc(50%_-_2.5rem)]
          cursor-pointer select-none transition-[box-shadow,opacity,border-color] duration-300
        `}
        onClick={() => setExpanded((v) => !v)}
        whileHover={!isPlanned ? { y: -3, transition: { duration: 0.2 } } : {}}
      >
        {isInProgress && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-[color-mix(in_srgb,var(--color-primary)_50%,transparent)]"
            animate={shouldReduceMotion ? {} : { opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex items-center gap-3">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cfg.bg} ${NEU_SUNKEN}`}
              >
                <Icon size={17} className={cfg.color} />
              </span>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-content-secondary">
                  {phase.phase}
                  {phase.dateTag && (
                    <span className="ml-2 font-normal text-content-muted">
                      - {phase.dateTag}
                    </span>
                  )}
                </p>
                <h3 className="mt-0.5 text-base font-bold leading-tight text-content-primary">
                  {phase.title}
                </h3>
              </div>
            </div>

            <StatusBadge
              variant={cfg.tone}
              className="shrink-0"
              icon={
                <StatusIcon
                  size={12}
                  className={isInProgress ? "animate-spin motion-reduce:animate-none" : ""}
                />
              }
            >
              {cfg.label}
            </StatusBadge>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-content-secondary">{phase.goal}</p>

          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs text-content-muted">Completion</span>
              <span className={`text-xs font-bold ${cfg.color}`}>{phase.completion}%</span>
            </div>
            <div className={`h-2 w-full overflow-hidden rounded-full ${NEU_SUNKEN}`}>
              <motion.div
                className={`h-full rounded-full ${
                  isCompleted
                    ? "bg-[var(--color-success)]"
                    : isInProgress
                    ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]"
                    : "bg-[var(--color-text-muted)]"
                }`}
                initial={{ width: 0 }}
                whileInView={{ width: `${phase.completion}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: index * 0.05 + 0.3, ease: "easeOut" }}
              />
            </div>
          </div>

          <button
            className={`mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium transition-colors ${cfg.bg} ${cfg.color} hover:brightness-110`}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
          >
            {expanded ? (
              <>
                <ChevronUp size={13} /> Hide deliverables
              </>
            ) : (
              <>
                <ChevronDown size={13} /> Show {phase.deliverables.length} deliverables
              </>
            )}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className={`mx-5 mb-5 rounded-xl border border-[var(--color-border)] p-4 ${NEU_SUNKEN}`}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-content-muted">
                  Technical Deliverables
                </p>
                <ul className="space-y-2">
                  {phase.deliverables.map((deliverable) => (
                    <li key={deliverable.id} className="flex items-start gap-2.5">
                      <span
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          deliverable.done
                            ? "bg-[color-mix(in_srgb,var(--color-success)_20%,transparent)] text-theme-success"
                            : "bg-[color-mix(in_srgb,var(--color-text-muted)_15%,transparent)] text-content-muted"
                        }`}
                      >
                        {deliverable.done ? "\u2713" : "\u00b7"}
                      </span>
                      <span
                        className={`text-xs leading-snug ${
                          deliverable.done ? "text-content-primary" : "text-content-muted"
                        }`}
                      >
                        <span className="mr-1.5 font-mono text-xs text-content-muted">
                          [{deliverable.id}]
                        </span>
                        {deliverable.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>

      <div className="hidden w-20 shrink-0 md:block" />
    </div>
  );
}
