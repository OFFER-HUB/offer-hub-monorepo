"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Rocket } from "lucide-react";
import { cn } from "@/lib/cn";
import type { SidebarSection } from "@/lib/mdx";
import { getIcon, iconNameForDocsSlug } from "@/lib/icon-registry";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface DocsSidebarProps {
  nav: SidebarSection[];
  className?: string;
}

const getIconForSlug = (slug: string, isActive: boolean) => {
  const iconClass = isActive ? "text-theme-primary" : "text-content-secondary";
  const Icon = getIcon(iconNameForDocsSlug(slug));
  return <Icon size={16} className={iconClass} />;
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
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="px-5 mb-3 text-[11px] font-extrabold uppercase tracking-widest text-content-primary">
            Overview
          </div>
          <ul role="list" className="space-y-1.5">
            <SidebarItem
              href="/docs"
              icon={<Home size={16} className={pathname === "/docs" ? "text-theme-primary" : "text-content-secondary"} />}
              label="Home"
              isActive={pathname === "/docs"}
            />
            <SidebarItem
              href="/docs/getting-started"
              icon={<Rocket size={16} className={pathname === "/docs/getting-started" ? "text-theme-primary" : "text-content-secondary"} />}
              label="Welcome"
              isActive={pathname === "/docs/getting-started"}
            />
          </ul>
        </motion.div>

        <AnimatePresence>
          {nav.map((section, sectionIdx) => {
            if (!section.links || section.links.length === 0) {
              return null;
            }

            return (
              <motion.div
                key={section.section}
                className="mt-6"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * (sectionIdx + 1), ease: "easeOut" }}
              >
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
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </nav>
  );
}

function SidebarItem({ href, icon, label, isActive }: { href: string; icon: React.ReactNode; label: string; isActive: boolean }) {
  return (
    <li role="listitem" className="relative">
      <Link
        href={href}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "group relative flex items-center gap-3.5 text-sm py-2.5 px-5 rounded-2xl transition-all duration-300 font-medium overflow-hidden",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base",
          isActive
            ? "text-theme-primary"
            : "text-content-secondary hover:text-content-primary"
        )}
      >
        {/* Active Highlight - Animated Capsule */}
        {isActive && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute inset-0 bg-bg-sunken shadow-neu-sunken-subtle z-0"
            initial={false}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 35
            }}
          />
        )}

        {/* Hover Highlight */}
        <div className="absolute inset-0 bg-theme-primary/0 group-hover:bg-theme-primary/5 transition-colors z-0" />

        <span className={cn(
          "relative z-10 flex-shrink-0 transition-all duration-300",
          isActive ? "text-theme-primary scale-110" : "text-content-secondary group-hover:text-content-primary group-hover:scale-110"
        )}>
          {icon}
        </span>
        <span className={cn(
          "relative z-10 truncate transition-transform duration-300",
          isActive ? "font-bold translate-x-1" : "group-hover:translate-x-1"
        )}>
          {label}
        </span>

        {/* Subtle Indicator bar */}
        {isActive && (
          <motion.div
            layoutId="sidebar-indicator"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-theme-primary rounded-full"
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 35
            }}
          />
        )}
      </Link>
    </li>
  );
}

