import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  BENTO_CARD_CLASS,
  BENTO_EYEBROW_CLASS,
  BENTO_H2_CLASS,
  HeroSection,
} from "@/components/HeroSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { SupportedBySection } from "@/components/SupportedBySection";
import { StatsSection } from "@/components/StatsSection";
import { USE_CASES } from "@/components/use-cases/data";
import { LoadingBar } from "@/components/ui/LoadingBar";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "OFFER-HUB — Trustless Payments Orchestrator for Marketplaces",
  description:
    "OFFER-HUB empowers marketplaces to provide secure, non-custodial escrow payments without building complex payment infrastructure from scratch.",
  keywords: [
    "escrow",
    "marketplace payments",
    "non-custodial",
    "Stellar",
    "Trustless Work",
    "payment orchestration",
    "USDC",
  ],
};

const USE_CASE_PILL_CLASS =
  "inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-content-primary bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-elevated";

function BuiltForCard() {
  return (
    <section
      aria-labelledby="built-for-title"
      className={cn(BENTO_CARD_CLASS, "flex flex-col gap-6 p-6 sm:p-8 lg:col-span-3")}
    >
      <div>
        <p className={BENTO_EYEBROW_CLASS}>Built for</p>
        <h2 id="built-for-title" className={cn(BENTO_H2_CLASS, "mt-2")}>
          Any marketplace that moves money
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-content-secondary">
          See how the same escrow flow fits each kind of platform.
        </p>
      </div>
      <ul role="list" className="flex flex-wrap gap-3">
        {USE_CASES.map((useCase) => (
          <li key={useCase.id}>
            <Link href={`/use-cases/${useCase.id}`} className={USE_CASE_PILL_CLASS}>
              {useCase.label}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/use-cases"
        className="mt-auto inline-flex min-h-11 items-center gap-2 self-start rounded-xl text-sm font-semibold text-action hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-primary"
      >
        All use cases
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <LoadingBar />
      <Navbar />
      {/* Every other route wraps its content in <main>; without it the root
          layout's "Skip to main content" link has no landmark to land on. */}
      <main>
        {/* pt-32 clears the fixed pill navbar. */}
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 pb-8 pt-32 sm:px-6 lg:grid-cols-6 lg:px-8">
          <HeroSection />
          <HowItWorksSection />
          <FeaturesSection />
          <BuiltForCard />
          <SupportedBySection />
        </div>
        <StatsSection />
      </main>
      <Footer />
    </>
  );
}
