import { CheckCircle2, Lock, Loader2 } from "lucide-react";
import type { PhaseDomain, PhaseStatus, StatusConfig } from "./types";

export const NEU_ELEVATED =
  "shadow-[6px_6px_14px_var(--shadow-dark),-6px_-6px_14px_var(--shadow-light)]";

export const NEU_SUNKEN =
  "shadow-[inset_4px_4px_10px_var(--shadow-dark),inset_-4px_-4px_10px_var(--shadow-light)]";

export const DOMAINS: { key: "all" | PhaseDomain; label: string }[] = [
  { key: "all", label: "All Phases" },
  { key: "core", label: "Core (0-7)" },
  { key: "sdk", label: "SDK (Phase 8)" },
  { key: "qa", label: "QA (Phase 9)" },
  { key: "crypto", label: "Crypto-Native (Phase 10)" },
];

export function statusConfig(status: PhaseStatus): StatusConfig {
  switch (status) {
    case "completed":
      return {
        icon: CheckCircle2,
        color: "text-[var(--color-success)]",
        bg: "bg-[var(--color-success)]/10",
        border: "border-[var(--color-success)]/30",
        label: "Completed",
        dotColor: "var(--color-success)",
        dotBg: "bg-[var(--color-success)]",
      };
    case "in-progress":
      return {
        icon: Loader2,
        color: "text-[var(--color-primary)]",
        bg: "bg-[var(--color-primary)]/10",
        border: "border-[var(--color-primary)]/40",
        label: "In Progress",
        dotColor: "var(--color-primary)",
        dotBg: "bg-[var(--color-primary)]",
      };
    case "planned":
      return {
        icon: Lock,
        color: "text-[var(--color-text-muted)]",
        bg: "bg-[var(--color-text-muted)]/10",
        border: "border-[var(--color-text-muted)]/20",
        label: "Planned",
        dotColor: "var(--color-text-muted)",
        dotBg: "bg-[var(--color-text-muted)]",
      };
  }
}
