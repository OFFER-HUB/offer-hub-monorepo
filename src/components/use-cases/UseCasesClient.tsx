"use client";

import dynamic from "next/dynamic";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ComponentType,
  type ReactNode,
} from "react";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/cn";

import { USE_CASES, PAGE_SECTIONS, SCROLL_OFFSET } from "./constants";
import type { UseCaseId } from "./constants";
import { SectionLoading } from "./shared/SectionLayout";

// ── Lazily-loaded use-case sections (code-split per tab) ──
type SectionProps = { stickyNav?: ReactNode };

const SECTIONS: Record<UseCaseId, ComponentType<SectionProps>> = {
  freelance: dynamic(() => import("./freelance/FreelanceSection"), {
    loading: () => <SectionLoading />,
  }),
  ecommerce: dynamic(() => import("./ecommerce/EcommerceSection"), {
    loading: () => <SectionLoading />,
  }),
  "dao-payroll": dynamic(() => import("./dao-payroll/DaoPayrollSection"), {
    loading: () => <SectionLoading />,
  }),
  "real-estate": dynamic(() => import("./real-estate/RealEstateSection"), {
    loading: () => <SectionLoading />,
  }),
  "service-platforms": dynamic(
    () => import("./service-platforms/ServicePlatformsSection"),
    { loading: () => <SectionLoading /> },
  ),
};

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

  // Re-establish the scroll-spy observer whenever the active use case changes:
  // the new section mounts lazily, so we retry on the next frame until all
  // section elements exist in the DOM.
  useEffect(() => {
    let raf = 0;
    let observer: IntersectionObserver | null = null;

    const setup = () => {
      const sectionElements = PAGE_SECTIONS.map((s) =>
        document.getElementById(s.id),
      ).filter(Boolean) as HTMLElement[];

      if (sectionElements.length < PAGE_SECTIONS.length) {
        raf = requestAnimationFrame(setup);
        return;
      }

      const visibilityMap = new Map<string, number>();

      observer = new IntersectionObserver(
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

      sectionElements.forEach((el) => observer!.observe(el));
    };

    setup();

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUseCase]);

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

        {/* ── Active use-case section (lazy, code-split per tab) ── */}
        <ActiveSection stickyNav={stickyNav} />
      </main>

      <Footer />
    </div>
  );
}
