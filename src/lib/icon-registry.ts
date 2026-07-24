import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Ban,
  Box,
  Briefcase,
  Code,
  Coins,
  Compass,
  Cookie,
  CreditCard,
  Download,
  FileCheck,
  FileText,
  Gavel,
  HelpCircle,
  Home,
  Layers,
  Link2,
  Lock,
  Mail,
  Plug,
  RefreshCw,
  Rocket,
  Scale,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  Split,
  Trash2,
  UserCircle,
  Users,
  Workflow,
  Zap,
} from "lucide-react";

/**
 * Single string→Lucide icon registry used by docs sidebar, privacy/terms MDX,
 * and data-rights forms. Add icons here instead of local iconMap copies.
 */
export const ICON_REGISTRY = {
  AlertTriangle,
  Ban,
  Box,
  Briefcase,
  Code,
  Coins,
  Compass,
  Cookie,
  CreditCard,
  Download,
  FileCheck,
  FileText,
  Gavel,
  HelpCircle,
  Home,
  Layers,
  Link2,
  Lock,
  Mail,
  Plug,
  RefreshCw,
  Rocket,
  Scale,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  Split,
  Trash2,
  UserCircle,
  Users,
  Workflow,
  Zap,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICON_REGISTRY;

export function getIcon(name: string | undefined | null, fallback: IconName = "FileText"): LucideIcon {
  if (name && name in ICON_REGISTRY) {
    return ICON_REGISTRY[name as IconName];
  }
  return ICON_REGISTRY[fallback];
}

/** Docs sidebar slug → icon name heuristics (was local getIconForSlug). */
export function iconNameForDocsSlug(slug: string): IconName {
  const s = slug.toLowerCase();
  if (s.includes("api") || s.includes("dev") || s.includes("code")) return "Code";
  if (s.includes("start") || s.includes("intro") || s.includes("welcome")) return "Rocket";
  if (s.includes("escrow") || s.includes("contract")) return "Shield";
  if (s.includes("sdk") || s.includes("tool")) return "Box";
  if (s.includes("config") || s.includes("setting")) return "Settings";
  if (s.includes("flow") || s.includes("lifecycle")) return "Workflow";
  if (s.includes("helper") || s.includes("util")) return "Zap";
  if (s.includes("design") || s.includes("ui") || s.includes("view")) return "Layers";
  if (s.includes("network") || s.includes("stellar")) return "Compass";
  return "FileText";
}
