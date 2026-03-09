"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings, Code, Box, Layers,
  Shield, Workflow, FileText, Zap, Compass, Rocket, Home
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { SidebarSection } from "@/lib/mdx";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface DocsSidebarProps {
  nav: SidebarSection[];
  className?: string;
}

const getIconForSlug = (slug: string, isActive: boolean) => {
  const s = slug.toLowerCase();
  const iconClass = isActive ? "text-theme-primary" : "text-content-secondary";

  if (s.includes("api") || s.includes("dev") || s.includes("code")) return <Code size={16} className={iconClass} />;
  if (s.includes("start") || s.includes("intro") || s.includes("welcome")) return <Rocket size={16} className={iconClass} />;
  if (s.includes("escrow") || s.includes("contract")) return <Shield size={16} className={iconClass} />;
  if (s.includes("sdk") || s.includes("tool")) return <Box size={16} className={iconClass} />;
  if (s.includes("config") || s.includes("setting")) return <Settings size={16} className={iconClass} />;
  if (s.includes("flow") || s.includes("lifecycle")) return <Workflow size={16} className={iconClass} />;
  if (s.includes("helper") || s.includes("util")) return <Zap size={16} className={iconClass} />;
  if (s.includes("design") || s.includes("ui") || s.includes("view")) return <Layers size={16} className={iconClass} />;
  if (s.includes("network") || s.includes("stellar")) return <Compass size={16} className={iconClass} />;

  return <FileText size={16} className={iconClass} />;
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function DocsSidebar({ nav, className }: DocsSidebarProps) {
  const pathname = usePathname();

  if (!nav || nav.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Documentation navigation"
      className={cn(
        "w-full rounded-3xl p-5 shadow-neu-raised bg-bg-base flex flex-col",
        className
      )}
    >
      <div className="flex-1 space-y-6 overflow-y-auto scrollbar-thin pr-1">
        <div>
          <div className="px-5 mb-3 text-[11px] font-extrabold uppercase tracking-widest text-content-primary">
            Overview
          </div>
          <ul role="list" className="space-y-1.5">
            <SidebarItem
              href="/docs"
              icon={<Home size={16} />}
              label="Home"
              isActive={pathname === "/docs"}
            />
            <SidebarItem
              href="/docs/getting-started"
              icon={<Rocket size={16} />}
              label="Welcome"
              isActive={pathname === "/docs/getting-started"}
            />
          </ul>
        </div>

        {nav.map((section) => {
          if (!section.links || section.links.length === 0) {
            return null;
          }

          return (
            <div key={section.section} className="mt-6">
              <div className="px-5 mb-3 text-[11px] font-extrabold uppercase tracking-widest text-content-primary">
                {section.section}
              </div>
              <ul role="list" className="space-y-1.5">
                {section.links.map((link) => (
                  <SidebarItem
                    key={link.slug}
                    href={`/docs/${link.slug}`}
                    icon={getIconForSlug(link.slug, pathname === `/docs/${link.slug}`)}
                    label={link.title}
                    isActive={pathname === `/docs/${link.slug}`}
                  />
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </nav>
  );
}

function SidebarItem({ href, icon, label, isActive }: { href: string; icon: React.ReactNode; label: string; isActive: boolean }) {
  return (
    <li role="listitem">
      <Link
        href={href}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "group flex items-center gap-3.5 text-sm py-2.5 px-5 rounded-2xl transition-all duration-300 font-medium",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
          "bg-bg-base",
          isActive
            ? "bg-bg-sunken shadow-neu-sunken-subtle text-theme-primary"
            : "text-content-secondary shadow-none hover:shadow-neu-raised-sm hover:text-content-primary"
        )}
      >
        <span className={cn("flex-shrink-0 transition-colors duration-300", isActive ? "text-theme-primary" : "text-content-secondary group-hover:text-content-primary")}>
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </Link>
    </li>
  );
}
