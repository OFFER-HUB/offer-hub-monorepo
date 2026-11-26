"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductHero } from "./ProductHero";
import { ProductTabs } from "./ProductTabs";
import { normalizeProductTab, type ProductTabId } from "@/lib/product-nav";
import { SystemArchitectureDiagram } from "@/components/architecture/SystemArchitectureDiagram";
import { PaymentFlowDiagram } from "@/components/architecture/PaymentFlowDiagram";
import { WhyStellarSection } from "@/components/architecture/WhyStellarSection";
import { IntegrationsMap } from "@/components/architecture/IntegrationsMap";
import { OrchestratorShowcase } from "@/components/blueprint/OrchestratorShowcase";
import { MarketplaceTemplate } from "@/components/blueprint/MarketplaceTemplate";
import { ProductRoadmapTab } from "./ProductRoadmapTab";

export function ProductPageClient() {
  const [activeTab, setActiveTab] = useState<ProductTabId>("architecture");

  // Read initial hash from URL on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const initialTab = normalizeProductTab(window.location.hash);
      setActiveTab(initialTab);
    }
  }, []);

  // Sync hash changes from browser history (e.g. Back/Forward)
  useEffect(() => {
    const handleHashChange = () => {
      const currentTab = normalizeProductTab(window.location.hash);
      setActiveTab(currentTab);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Update hash when tab changes
  const handleTabChange = useCallback((tabId: ProductTabId) => {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${tabId}`);
    }
  }, []);

  return (
    <div className="w-full">
      <ProductHero />

      <ProductTabs activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          tabIndex={0}
          className="focus:outline-none"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {activeTab === "architecture" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Main column: System diagram + Payment flow */}
                  <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8 min-w-0 max-w-full">
                    <SystemArchitectureDiagram />
                    <PaymentFlowDiagram />
                  </div>

                  {/* Side column: Why Stellar + Integrations */}
                  <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-8 min-w-0 max-w-full">
                    <WhyStellarSection />
                    <IntegrationsMap />
                  </div>
                </div>
              )}

              {activeTab === "orchestrator" && <OrchestratorShowcase />}

              {activeTab === "template" && <MarketplaceTemplate />}

              {activeTab === "roadmap" && <ProductRoadmapTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
