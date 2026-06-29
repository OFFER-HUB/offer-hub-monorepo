import type { FC, ReactNode } from "react";
import { Users } from "lucide-react";
import { SCROLL_OFFSET } from "../constants";

export type FeatureCard = {
  icon: FC<{ size?: number; className?: string }>;
  title: string;
  body: string;
};

/**
 * Shared, interactivity-free chrome reused by every use-case section
 * component. Kept free of `"use client"` so the markup stays a Server
 * Component; the interactive leaf pieces are passed in as children.
 */

/** ── Features Section (3-card grid, data-driven) ── */
export function FeaturesGrid({ features }: { features: FeatureCard[] }) {
  return (
    <section
      id="features"
      className="py-24 relative bg-transparent"
      style={{ scrollMarginTop: `${SCROLL_OFFSET}px` }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat) => {
            const FeatIcon = feat.icon;
            return (
              <div
                key={feat.title}
                className="flex flex-col items-center text-center p-10 rounded-[2rem] bg-bg-elevated shadow-neu-raised hover:shadow-neu-raised-hover transition-all duration-300 ease-out group"
              >
                <div className="w-16 h-16 rounded-2xl shadow-neu-sunken-subtle bg-bg-base flex items-center justify-center mb-8 group-hover:shadow-neu-sunken transition-all duration-300 text-theme-primary">
                  <FeatIcon size={28} />
                </div>
                <h3 className="text-xl font-bold mb-4 text-content-primary">
                  {feat.title}
                </h3>
                <p className="text-sm font-medium leading-relaxed text-content-secondary">
                  {feat.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** ── Metrics Section (wraps a per-use-case StellarImpactCards) ── */
export function MetricsSection({ children }: { children: ReactNode }) {
  return (
    <section
      id="metrics"
      className="py-24 relative bg-transparent"
      style={{ scrollMarginTop: `${SCROLL_OFFSET}px` }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {children}
      </div>
    </section>
  );
}

/** ── Architecture Section (shared heading + per-use-case diagram) ── */
export function ArchitectureSection({ children }: { children: ReactNode }) {
  return (
    <section
      id="architecture"
      className="py-24 relative bg-transparent"
      style={{ scrollMarginTop: `${SCROLL_OFFSET}px` }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
        <div className="w-16 h-16 rounded-2xl shadow-neu-raised bg-bg-base mx-auto mb-8 flex items-center justify-center text-theme-primary">
          <Users size={24} />
        </div>

        <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-content-primary">
          How it works under the hood
        </h2>

        <p className="text-lg font-medium max-w-2xl mx-auto mb-16 leading-relaxed text-content-secondary">
          A simplified view of the smart contract interactions orchestrated by
          OFFER HUB APIs.
        </p>

        {children}
      </div>
    </section>
  );
}

/** ── SDK / Code Integration Section (wraps a per-use-case showcase) ── */
export function SdkSection({ children }: { children: ReactNode }) {
  return (
    <section
      id="sdk"
      className="relative bg-transparent"
      style={{ scrollMarginTop: `${SCROLL_OFFSET}px` }}
    >
      {children}
    </section>
  );
}

/** ── Placeholder shown while a lazily-loaded section bundle resolves ── */
export function SectionLoading() {
  return <div className="min-h-[60vh]" aria-hidden="true" />;
}
