import { CheckCircle2, Lock, Loader2 } from "lucide-react";
import { statusColors, type StatusTone } from "@/components/ui/status-colors";
import type { PhaseDomain, PhaseStatus, StatusConfig } from "./types";

export const NEU_ELEVATED = "shadow-neu-raised";
export const NEU_SUNKEN = "shadow-neu-sunken";

export const DOMAINS: { key: "all" | PhaseDomain; label: string }[] = [
  { key: "all", label: "All Phases" },
  { key: "core", label: "Core (0-7)" },
  { key: "sdk", label: "SDK (Phase 8)" },
  { key: "qa", label: "QA (Phase 9)" },
  { key: "crypto", label: "Crypto-Native (Phase 10)" },
];

const STATUS_TONES: Record<PhaseStatus, StatusTone> = {
  completed: "success",
  "in-progress": "primary",
  planned: "muted",
};

const STATUS_VISUALS: Record<PhaseStatus, Pick<StatusConfig, "icon" | "label">> = {
  completed: { icon: CheckCircle2, label: "Completed" },
  "in-progress": { icon: Loader2, label: "In Progress" },
  planned: { icon: Lock, label: "Planned" },
};

export function statusConfig(status: PhaseStatus): StatusConfig {
  const colors = statusColors[STATUS_TONES[status]];

  return {
    ...STATUS_VISUALS[status],
    color: colors.text,
    bg: colors.bg,
    border: colors.border,
    dotColor: colors.cssVar,
    dotBg: colors.dotBg,
  };
}
