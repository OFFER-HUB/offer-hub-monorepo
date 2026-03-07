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
  const color = isActive ? "#149A9B" : "#6D758F";

  if (s.includes("api") || s.includes("dev") || s.includes("code")) return <Code size={16} color={color} />;
  if (s.includes("start") || s.includes("intro") || s.includes("welcome")) return <Rocket size={16} color={color} />;
  if (s.includes("escrow") || s.includes("contract")) return <Shield size={16} color={color} />;
  if (s.includes("sdk") || s.includes("tool")) return <Box size={16} color={color} />;
  if (s.includes("config") || s.includes("setting")) return <Settings size={16} color={color} />;
  if (s.includes("flow") || s.includes("lifecycle")) return <Workflow size={16} color={color} />;
  if (s.includes("helper") || s.includes("util")) return <Zap size={16} color={color} />;
  if (s.includes("design") || s.includes("ui") || s.includes("view")) return <Layers size={16} color={color} />;
  if (s.includes("network") || s.includes("stellar")) return <Compass size={16} color={color} />;

  return <FileText size={16} color={color} />;
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
        "w-full rounded-3xl p-5 shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] bg-[#F1F3F7] flex flex-col",
        className
      )}
    >
      <div className="flex-1 space-y-6 overflow-y-auto scrollbar-thin pr-1">
        <div>
          <div className="px-5 mb-3 text-[11px] font-extrabold uppercase tracking-widest text-[#6D758F]">
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
              <div className="px-5 mb-3 text-[11px] font-extrabold uppercase tracking-widest text-[#6D758F]">
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
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#149A9B] focus-visible:ring-offset-2",
          "bg-[#F1F3F7]",
          isActive
            ? "shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] text-[#149A9B]"
            : "text-[#6D758F] shadow-none hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] hover:text-[#19213D]"
        )}
      >
        <span className={cn("flex-shrink-0 transition-colors duration-300", isActive ? "text-[#149A9B]" : "text-[#6D758F] group-hover:text-[#19213D]")}>
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </Link>
    </li>
  );
}
