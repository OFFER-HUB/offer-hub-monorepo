"use client";

// ── Freelance imports ──
import FreelanceHero from "@/components/use-cases/freelance/FreelanceHero";
import FreelanceEscrowFlowDiagram from "@/components/use-cases/freelance/EscrowFlowDiagram";
import FreelanceStellarImpactCards from "@/components/use-cases/freelance/StellarImpactCards";
import FreelanceCodeIntegrationShowcase from "@/components/use-cases/freelance/CodeIntegrationShowcase";

// ── eCommerce imports ──
import EcommerceHero from "@/components/use-cases/ecommerce/EcommerceHero";
import EcommerceEscrowFlowDiagram from "@/components/use-cases/ecommerce/EscrowFlowDiagram";
import EcommerceStellarImpactCards from "@/components/use-cases/ecommerce/StellarImpactCards";
import EcommerceCodeIntegrationShowcase from "@/components/use-cases/ecommerce/CodeIntegrationShowcase";

// ── DAO Payroll imports ──
import DaoPayrollHero from "@/components/use-cases/dao-payroll/DaoPayrollHero";
import DaoPayrollEscrowFlowDiagram from "@/components/use-cases/dao-payroll/EscrowFlowDiagram";
import DaoPayrollStellarImpactCards from "@/components/use-cases/dao-payroll/StellarImpactCards";
import DaoPayrollCodeIntegrationShowcase from "@/components/use-cases/dao-payroll/CodeIntegrationShowcase";

// ── Real Estate imports ──
import RealEstateHero from "@/components/use-cases/real-estate/RealEstateHero";
import RealEstateEscrowFlowDiagram from "@/components/use-cases/real-estate/EscrowFlowDiagram";
import RealEstateStellarImpactCards from "@/components/use-cases/real-estate/StellarImpactCards";
import RealEstateCodeIntegrationShowcase from "@/components/use-cases/real-estate/CodeIntegrationShowcase";

// ── Service Platforms imports ──
import ServicePlatformsHero from "@/components/use-cases/service-platforms/ServicePlatformsHero";
import ServicePlatformsEscrowFlowDiagram from "@/components/use-cases/service-platforms/EscrowFlowDiagram";
import ServicePlatformsStellarImpactCards from "@/components/use-cases/service-platforms/StellarImpactCards";
import ServicePlatformsCodeIntegrationShowcase from "@/components/use-cases/service-platforms/CodeIntegrationShowcase";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Users,
  ShieldCheck,
  Zap,
  Globe,
  BarChart3,
  Code2,
  ShoppingCart,
  Coins,
  Building2,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/cn";

// ── Top-level use-case switcher ──
const USE_CASES = [
  { id: "freelance", label: "Freelance", icon: Users },
  { id: "ecommerce", label: "eCommerce", icon: ShoppingCart },
  { id: "dao-payroll", label: "DAO Payroll", icon: Coins },
  { id: "real-estate", label: "Real Estate", icon: Building2 },
  { id: "service-platforms", label: "Service Platforms", icon: Briefcase },
] as const;

type UseCaseId = (typeof USE_CASES)[number]["id"];

// ── Per-use-case features content ──
const USE_CASE_FEATURES: Record<
  UseCaseId,
  {
    icon: React.FC<{ size?: number; className?: string }>;
    title: string;
    body: string;
  }[]
> = {
  freelance: [
    {
      icon: ShieldCheck,
      title: "Trustless Escrow",
      body: "Lock client funds into secure smart contracts at project kick-off. Funds are guaranteed to exist, protecting both the freelancer and the client.",
    },
    {
      icon: Zap,
      title: "Milestone Automation",
      body: "Trigger partial or full payments automatically when APIs dictate completion of deliverables, removing manual invoice friction.",
    },
    {
      icon: Globe,
      title: "Global Payouts",
      body: "Settle funds instantly in USDC or fiat-backed stablecoins directly to the freelancer's wallet, bypassing multi-day bank transfer delays and high FX fees.",
    },
  ],
  ecommerce: [
    {
      icon: ShieldCheck,
      title: "Buyer & Seller Protection",
      body: "Buyer funds are locked on-chain before the seller ships. Neither party can be defrauded — the escrow is the source of truth for every order.",
    },
    {
      icon: Zap,
      title: "Automatic Release on Delivery",
      body: "Funds release the moment delivery is confirmed — by tracking API, signature scan, or a buyer click — removing payout batch delays entirely.",
    },
    {
      icon: Globe,
      title: "On-Chain Dispute Resolution",
      body: "If an order is missing or misrepresented, the buyer opens a structured on-chain dispute. The outcome — release, refund, or split — is transparent and final.",
    },
  ],
  "dao-payroll": [
    {
      icon: Coins,
      title: "Governance-Gated Releases",
      body: "DAO votes directly trigger payroll disbursements. No multisig delays — a passed proposal automatically releases contributor funds from the vault.",
    },
    {
      icon: ShieldCheck,
      title: "Contributor Trust",
      body: "Budget is locked on-chain at the start of each epoch. Contributors can start work knowing their payment is already secured in escrow.",
    },
    {
      icon: Globe,
      title: "Multi-Currency Payouts",
      body: "Pay contributors globally in USDC, XLM, or any Stellar-issued asset. No bank accounts required. Settlement completes in under 5 seconds.",
    },
  ],
  "real-estate": [
    {
      icon: Building2,
      title: "Tokenised Escrow",
      body: "Earnest money and closing funds are held in programmable on-chain escrow, eliminating the need for a third-party title company for each step.",
    },
    {
      icon: ShieldCheck,
      title: "Condition-Based Releases",
      body: "Funds only release when contingencies are met: inspection approval, title clearance, mortgage funding. Automated and auditable at every stage.",
    },
    {
      icon: Zap,
      title: "Instant Cross-Border Closing",
      body: "International buyers settle in USDC with no wire delays or correspondent bank fees. Foreign national transactions close in the same time as domestic ones.",
    },
  ],
  "service-platforms": [
    {
      icon: Briefcase,
      title: "SOW-Backed Contracts",
      body: "Every engagement starts with a statement of work locked on-chain. Scope, milestones, and payment terms are immutable once both parties sign.",
    },
    {
      icon: ShieldCheck,
      title: "Milestone-Gated Payments",
      body: "Providers receive each tranche only after the corresponding deliverable is approved, eliminating late or non-payment risk for service professionals.",
    },
    {
      icon: Globe,
      title: "Structured Dispute Resolution",
      body: "Built-in on-chain arbitration ensures every dispute has a clear, auditable outcome — release, refund, or split — visible to all stakeholders.",
    },
  ],
};

const PAGE_SECTIONS = [
  { id: "overview", label: "Overview", icon: Users },
  { id: "features", label: "Features", icon: Zap },
  { id: "metrics", label: "Metrics", icon: BarChart3 },
  { id: "architecture", label: "Architecture", icon: Globe },
  { id: "sdk", label: "SDK", icon: Code2 },
] as const;

/** Offset (px) matching the sticky header height + breathing room */
const SCROLL_OFFSET = 140;

export default function UseCasesClient() {
  const [activeUseCase, setActiveUseCase] = useState<UseCaseId>("freelance");
  const [activeSection, setActiveSection] = useState<string>(
    PAGE_SECTIONS[0].id,
  );
  const [isNavPinned, setIsNavPinned] = useState(false);
  const [pillStyle, setPillStyle] = useState<{
    left: number;
    width: number;
  } | null>(null);
  const [touchedId, setTouchedId] = useState<string | null>(null);

  const navRef = useRef<HTMLDivElement>(null);
  const pillContainerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  const setLinkRef = useCallback((id: string, el: HTMLAnchorElement | null) => {
    if (el) linkRefs.current.set(id, el);
    else linkRefs.current.delete(id);
  }, []);

  const updatePillIndicator = useCallback(() => {
    const container = pillContainerRef.current;
    const activeLink = linkRefs.current.get(activeSection);
    if (!container || !activeLink) return;

    const containerRect = container.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();

    setPillStyle({
      left: linkRect.left - containerRect.left,
      width: linkRect.width,
    });
  }, [activeSection]);

  useEffect(() => {
    const sectionElements = PAGE_SECTIONS.map((s) =>
      document.getElementById(s.id),
    ).filter(Boolean) as HTMLElement[];

    if (sectionElements.length === 0) return;

    const visibilityMap = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibilityMap.set(entry.target.id, entry.intersectionRatio);
        });

        let bestId: string = activeSection;
        let bestRatio = -1;

        visibilityMap.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = id;
          }
        });

        if (bestRatio > 0.05 && bestId !== activeSection) {
          setActiveSection(bestId);
        }
      },
      {
        threshold: [0, 0.1, 0.25, 0.4, 0.6, 0.75, 1],
        rootMargin: "-140px 0px -30% 0px",
      },
    );

    sectionElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (navRef.current) {
          setIsNavPinned(navRef.current.getBoundingClientRect().top <= 81);
        }
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    updatePillIndicator();
  }, [activeSection, updatePillIndicator]);

  useEffect(() => {
    const onResize = () => updatePillIndicator();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [updatePillIndicator]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;

    const top =
      target.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const handleTouchStart = (id: string) => setTouchedId(id);
  const handleTouchEnd = () => setTouchedId(null);

  const handleUseCaseSwitch = (id: UseCaseId) => {
    setActiveUseCase(id);
    setActiveSection("overview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const features = USE_CASE_FEATURES[activeUseCase];

  return (
    <div className="bg-transparent min-h-[100dvh]">
      <Navbar />

      <main>
        {/* ── Use-Case Switcher ── */}
        <section
          id="overview"
          className="pt-28 pb-0 bg-transparent"
          style={{ scrollMarginTop: `${SCROLL_OFFSET}px` }}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-wrap justify-center gap-3">
            {USE_CASES.map((uc) => {
              const isActive = activeUseCase === uc.id;
              const UCIcon = uc.icon;
              return (
                <button
                  key={uc.id}
                  onClick={() => handleUseCaseSwitch(uc.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold",
                    "transition-all duration-300 select-none touch-manipulation",
                    isActive
                      ? "btn-neumorphic-primary text-white shadow-neu-sunken"
                      : "bg-bg-elevated shadow-neu-raised hover:shadow-neu-raised-hover text-content-secondary hover:text-content-primary",
                  )}
                >
                  <UCIcon size={15} className="flex-shrink-0" />
                  {uc.label}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Hero (swaps per use case) ── */}
        {activeUseCase === "freelance" && <FreelanceHero />}
        {activeUseCase === "ecommerce" && <EcommerceHero />}
        {activeUseCase === "dao-payroll" && <DaoPayrollHero />}
        {activeUseCase === "real-estate" && <RealEstateHero />}
        {activeUseCase === "service-platforms" && <ServicePlatformsHero />}

        {/* ── Sticky Section Navigation (Neumorphic Pill) ── */}
        <div
          ref={navRef}
          className={cn(
            "sticky z-40 pointer-events-none",
            "top-[80px] py-6",
            "md:top-[80px]",
          )}
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 flex justify-center">
            <div
              className={cn(
                "pointer-events-auto relative flex items-center p-1.5 sm:p-2 rounded-2xl bg-bg-base",
                "transition-shadow duration-500 will-change-[box-shadow]",
                isNavPinned
                  ? "shadow-neu-raised-scrolled"
                  : "shadow-neu-raised",
              )}
            >
              <div
                ref={pillContainerRef}
                className="relative flex items-center gap-1 sm:gap-2"
              >
                {pillStyle && (
                  <span
                    className="absolute top-0 h-full rounded-xl btn-neumorphic-primary pointer-events-none"
                    aria-hidden="true"
                    style={{
                      left: pillStyle.left,
                      width: pillStyle.width,
                      transition:
                        "left 350ms cubic-bezier(0.25, 1, 0.5, 1), width 300ms ease-out",
                      willChange: "left, width",
                    }}
                  />
                )}

                {PAGE_SECTIONS.map((section) => {
                  const isActive = activeSection === section.id;
                  const isTouched = touchedId === section.id;
                  const SectionIcon = section.icon;

                  return (
                    <a
                      key={section.id}
                      ref={(el) => setLinkRef(section.id, el)}
                      id={`nav-link-${section.id}`}
                      href={`#${section.id}`}
                      onClick={(e) => handleNavClick(e, section.id)}
                      onTouchStart={() => handleTouchStart(section.id)}
                      onTouchEnd={handleTouchEnd}
                      onTouchCancel={handleTouchEnd}
                      className={cn(
                        "relative z-10 flex items-center gap-1.5",
                        "min-w-[44px] min-h-[44px] px-4 sm:px-6 py-2.5",
                        "rounded-xl text-xs sm:text-sm font-bold",
                        "transition-all duration-300 select-none",
                        "touch-manipulation",
                        isActive
                          ? "text-white"
                          : "text-content-secondary hover:text-content-primary",
                        !isActive && "hover:shadow-neu-sunken-subtle",
                        isTouched &&
                          !isActive &&
                          "shadow-neu-sunken-subtle scale-[0.96]",
                      )}
                    >
                      <SectionIcon
                        size={14}
                        className="hidden sm:block flex-shrink-0"
                      />
                      {section.label}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Features Section ── */}
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

        {/* ── Metrics Section ── */}
        <section
          id="metrics"
          className="py-24 relative bg-transparent"
          style={{ scrollMarginTop: `${SCROLL_OFFSET}px` }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
            {activeUseCase === "freelance" && <FreelanceStellarImpactCards />}
            {activeUseCase === "ecommerce" && <EcommerceStellarImpactCards />}
            {activeUseCase === "dao-payroll" && (
              <DaoPayrollStellarImpactCards />
            )}
            {activeUseCase === "real-estate" && (
              <RealEstateStellarImpactCards />
            )}
            {activeUseCase === "service-platforms" && (
              <ServicePlatformsStellarImpactCards />
            )}
          </div>
        </section>

        {/* ── Architecture Section ── */}
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
              A simplified view of the smart contract interactions orchestrated
              by OFFER HUB APIs.
            </p>

            {activeUseCase === "freelance" && <FreelanceEscrowFlowDiagram />}
            {activeUseCase === "ecommerce" && <EcommerceEscrowFlowDiagram />}
            {activeUseCase === "dao-payroll" && <DaoPayrollEscrowFlowDiagram />}
            {activeUseCase === "real-estate" && <RealEstateEscrowFlowDiagram />}
            {activeUseCase === "service-platforms" && (
              <ServicePlatformsEscrowFlowDiagram />
            )}
          </div>
        </section>

        {/* ── SDK / Code Integration Section ── */}
        <section
          id="sdk"
          className="relative bg-transparent"
          style={{ scrollMarginTop: `${SCROLL_OFFSET}px` }}
        >
          {activeUseCase === "freelance" && (
            <FreelanceCodeIntegrationShowcase />
          )}
          {activeUseCase === "ecommerce" && (
            <EcommerceCodeIntegrationShowcase />
          )}
          {activeUseCase === "dao-payroll" && (
            <DaoPayrollCodeIntegrationShowcase />
          )}
          {activeUseCase === "real-estate" && (
            <RealEstateCodeIntegrationShowcase />
          )}
          {activeUseCase === "service-platforms" && (
            <ServicePlatformsCodeIntegrationShowcase />
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}