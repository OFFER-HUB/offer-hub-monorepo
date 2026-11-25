import type { StatusTone } from "@/components/ui/status-colors";
import type { ElementType } from "react";

export type PhaseStatus = "completed" | "in-progress" | "planned";
export type PhaseDomain = "core" | "sdk" | "qa" | "crypto";

export interface Deliverable {
  id: string;
  label: string;
  done: boolean;
}

export interface Phase {
  id: number;
  phase: string;
  title: string;
  goal: string;
  status: PhaseStatus;
  completion: number;
  domain: PhaseDomain;
  icon: ElementType;
  dateTag?: string;
  deliverables: Deliverable[];
}

export interface StatusConfig {
  icon: ElementType;
  /** Badge tone from status-colors.ts. */
  tone: StatusTone;
  color: string;
  bg: string;
  border: string;
  label: string;
  dotColor: string;
  dotBg: string;
}
