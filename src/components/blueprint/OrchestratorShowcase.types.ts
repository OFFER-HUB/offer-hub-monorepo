import { LucideIcon } from "lucide-react";

export type LayerKey = "security" | "liquidity" | "logic";

export type FlowNode = {
  id: string;
  label: string;
  sublabel: string;
  x: number;
  y: number;
};

export type DetailCard = {
  key: LayerKey;
  title: string;
  eyebrow: string;
  icon: LucideIcon;
  summary: string;
  bullets: string[];
  callout: string;
  method: string;
  docHref: string;
  docLabel: string;
};
