"use client";

import dynamic from "next/dynamic";
import {
  useState,
  useEffect,
  useRef,
  useMemo,
  type ComponentType,
  type ReactNode,
} from "react";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/cn";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { usePillIndicator } from "@/hooks/usePillIndicator";

import { USE_CASES, PAGE_SECTIONS, SCROLL_OFFSET } from "./constants";
import type { UseCaseId } from "./constants";
import { SectionLoading } from "./shared/SectionLayout";

// ── Lazily-loaded use-case sections (code-split per tab) ──
type SectionProps = { stickyNav?: ReactNode };

const SECTIONS: Record<UseCaseId, ComponentType<SectionProps>> = {
  freelance: dynamic(
    () => import("./freelance/FreelanceSection").then((mod) => mod.FreelanceSection),
    { loading: () => <SectionLoading /> },
  ),
  ecommerce: dynamic(
    () => import("./ecommerce/EcommerceSection").then((mod) => mod.EcommerceSection),
    { loading: () => <SectionLoading /> },
  ),
  "dao-payroll": dynamic(
    () => import("./dao-payroll/DaoPayrollSection").then((mod) => mod.DaoPayrollSection),
    { loading: () => <SectionLoading /> },
  ),
  "real-estate": dynamic(
    () => import("./real-estate/RealEstateSection").then((mod) => mod.RealEstateSection),
    { loading: () => <SectionLoading /> },
  ),
  "service-platforms": dynamic(
    () => import("./service-platforms/ServicePlatformsSection").then((mod) => mod.ServicePlatformsSection),
    { loading: () => <SectionLoading /> },
  ),
};

const SECTION_IDS = PAGE_SECTIONS.map((s) => s.id);

export function UseCasesClient() {
  const [activeUseCase, setActiveUseCase] = useState<UseCaseId>("freelance");
  const [touchedId, setTouchedId] = useState<string | null>(null);

  const navRef = useRef<HTMLDivElement>(null);
  // Accumulates the latest known ratio per section id across observer
  // callbacks, since IntersectionObserver only reports entries whose ratio
  // changed since the last check, not every observed element each time.
  const visibilityMapRef = useRef<Map<string, number>>(new Map());

  // Discard stale ratios from the previous tab's sections before the new
  // tab's observer starts reporting — the section ids are identical across
  // tabs (PAGE_SECTIONS is fixed), only the DOM nodes get swapped.
  useEffect(() => {
    visibilityMapRef.current.clear();
  }, [activeUseCase]);

  const activeSection = useScrollSpy({
    ids: SECTION_IDS,
    threshold: [0, 0.1, 0.25, 0.4, 0.6, 0.75, 1],
    rootMargin: "-140px 0px -30% 0px",
    initialId: PAGE_SECTIONS[0].id,
    // Each use case's sections mount lazily (next/dynamic), so wait until
    // they all exist in the DOM before attaching the observer, and re-run
    // that wait whenever the tab changes even though the ids don't.
    waitForElements: true,
    resetKey: activeUseCase,
    pickActiveId: (entries) => {
      entries.forEach((entry) => {
        visibilityMapRef.current.set(entry.target.id, entry.intersectionRatio);
      });

      let bestId: string | undefined;
      let bestRatio = -1;
      visibilityMapRef.current.forEach((ratio, id) => {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = id;
        }
      });

      return bestRatio > 0.05 ? bestId : undefined;
    },
  });

  const scrollY = useScrollProgress();
  const isNavPinned = useMemo(
    () => (navRef.current ? navRef.current.getBoundingClientRect().top <= 81 : false),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scrollY],
  );

  const { containerRef: pillContainerRef, setItemRef: setLinkRef, pillStyle } =
    usePillIndicator(activeSection);

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const ActiveSection = SECTIONS[activeUseCase];

  // ── Sticky Section Navigation (Neumorphic Pill) ──
  // Built here (owns all state/refs) and injected into the active section.
  const stickyNav = (
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
            isNavPinned ? "shadow-neu-raised-scrolled" : "shadow-neu-raised",
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
                  aria-current={isActive ? "true" : undefined}
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
  );

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
          <div role="tablist" className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-wrap justify-center gap-3">
            {USE_CASES.map((uc) => {
              const isActive = activeUseCase === uc.id;
              const UCIcon = uc.icon;
              return (
                <button
                  key={uc.id}
                  role="tab"
                  aria-selected={isActive}
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

        {/* ── Active use-case section (lazy, code-split per tab) ── */}
        <ActiveSection stickyNav={stickyNav} />
      </main>

      <Footer />
    </div>
  );
}
