"use client";

import React, { useRef } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { Cpu, Workflow, Layers, Milestone } from "lucide-react";
import { cn } from "@/lib/cn";
import { PRODUCT_TABS, type ProductTabId } from "@/lib/product-nav";

const TAB_ICONS: Record<ProductTabId, React.ElementType> = {
  architecture: Cpu,
  orchestrator: Workflow,
  template: Layers,
  roadmap: Milestone,
};

interface ProductTabsProps {
  activeTab: ProductTabId;
  onTabChange: (tabId: ProductTabId) => void;
}

export function ProductTabs({ activeTab, onTabChange }: ProductTabsProps) {
  const tabRefs = useRef<Record<ProductTabId, HTMLButtonElement | null>>({
    architecture: null,
    orchestrator: null,
    template: null,
    roadmap: null,
  });

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const total = PRODUCT_TABS.length;
    let nextIndex = index;

    if (e.key === "ArrowRight") {
      nextIndex = (index + 1) % total;
    } else if (e.key === "ArrowLeft") {
      nextIndex = (index - 1 + total) % total;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = total - 1;
    } else {
      return;
    }

    e.preventDefault();
    const nextTab = PRODUCT_TABS[nextIndex];
    if (nextTab) {
      onTabChange(nextTab.id);
      tabRefs.current[nextTab.id]?.focus();
    }
  };

  return (
    <div className="sticky top-[80px] z-40 py-4 pointer-events-none">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex justify-center">
        <div className="pointer-events-auto flex items-center p-1.5 rounded-2xl bg-bg-base shadow-neu-raised transition-shadow duration-300">
          <LayoutGroup id="productNavTabsGroup">
            <nav
              role="tablist"
              aria-label="Product navigation tabs"
              className="flex flex-wrap items-center justify-center gap-1 sm:gap-2"
            >
              {PRODUCT_TABS.map(({ id, label }, idx) => {
                const isActive = activeTab === id;
                const Icon = TAB_ICONS[id];

                return (
                  <button
                    key={id}
                    ref={(el) => {
                      tabRefs.current[id] = el;
                    }}
                    role="tab"
                    id={`tab-${id}`}
                    aria-selected={isActive}
                    aria-controls={`tabpanel-${id}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => onTabChange(id)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    className={cn(
                      "relative px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-[color,box-shadow] duration-200 flex items-center gap-2",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary",
                      isActive
                        ? "text-theme-primary z-10"
                        : "text-content-secondary hover:text-content-primary"
                    )}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="productNavActivePill"
                        className="absolute inset-0 rounded-xl bg-bg-base shadow-neu-sunken -z-10"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    ) : null}
                    <Icon size={15} className="shrink-0" />
                    <span className="relative z-10">{label}</span>
                  </button>
                );
              })}
            </nav>
          </LayoutGroup>
        </div>
      </div>
    </div>
  );
}
