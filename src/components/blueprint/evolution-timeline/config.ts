import { CheckCircle2, Lock, Loader2 } from "lucide-react";
import type { PhaseDomain, PhaseStatus, StatusConfig } from "./types";
import { statusColors, type StatusSeverity } from "@/lib/statusColors";

export const NEU_ELEVATED = "shadow-neu-raised";
export const NEU_SUNKEN = "shadow-neu-sunken";

export const DOMAINS: { key: "all" | PhaseDomain; label: string }[] = [
  { key: "all", label: "All Phases" },
  { key: "core", label: "Core (0-7)" },
  { key: "sdk", label: "SDK (Phase 8)" },
  { key: "qa", label: "QA (Phase 9)" },
  { key: "crypto", label: "Crypto-Native (Phase 10)" },
];

const PHASE_STATUS_ICON: Record<PhaseStatus, StatusConfig["icon"]> = {
  completed: CheckCircle2,
  "in-progress": Loader2,
  planned: Lock,
};

const PHASE_STATUS_LABEL: Record<PhaseStatus, string> = {
  completed: "Completed",
  "in-progress": "In Progress",
  planned: "Planned",
};

/** Severity each phase status maps to in the shared `statusColors` palette. */
const PHASE_SEVERITY: Record<PhaseStatus, StatusSeverity> = {
  completed: "success",
  "in-progress": "primary",
  planned: "neutral",
};

/**
 * Builds the per-status style config from the shared `statusColors` palette.
 *
 * `cfg.color` is a Tailwind text class (used as a `className`), while
 * `cfg.dotColor` is a raw CSS colour string (used in inline `style`), so each
 * is sourced from the matching `statusColors` field.
 */
export function statusConfig(status: PhaseStatus): StatusConfig {
  const { text, bg, border, color, solidBg } = statusColors[PHASE_SEVERITY[status]];

  return {
    icon: PHASE_STATUS_ICON[status],
    color: text,
    bg,
    border,
    label: PHASE_STATUS_LABEL[status],
    dotColor: color,
    dotBg: solidBg,
  };
}
