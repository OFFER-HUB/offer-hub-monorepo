import {
  Users,
  ShoppingCart,
  Coins,
  Building2,
  Briefcase,
  Zap,
  BarChart3,
  Globe,
  Code2,
} from "lucide-react";

// ── Top-level use-case switcher ──
export const USE_CASES = [
  { id: "freelance", label: "Freelance", icon: Users },
  { id: "ecommerce", label: "eCommerce", icon: ShoppingCart },
  { id: "dao-payroll", label: "DAO Payroll", icon: Coins },
  { id: "real-estate", label: "Real Estate", icon: Building2 },
  { id: "service-platforms", label: "Service Platforms", icon: Briefcase },
] as const;

export type UseCaseId = (typeof USE_CASES)[number]["id"];

// ── In-page section navigation (sticky pill) ──
export const PAGE_SECTIONS = [
  { id: "overview", label: "Overview", icon: Users },
  { id: "features", label: "Features", icon: Zap },
  { id: "metrics", label: "Metrics", icon: BarChart3 },
  { id: "architecture", label: "Architecture", icon: Globe },
  { id: "sdk", label: "SDK", icon: Code2 },
] as const;

/** Offset (px) matching the sticky header height + breathing room */
export const SCROLL_OFFSET = 140;
