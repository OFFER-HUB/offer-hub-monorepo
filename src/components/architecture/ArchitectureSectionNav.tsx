"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { motion, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/cn";
import { ARCHITECTURE_SECTIONS, ARCHITECTURE_SCROLL_MARGIN_PX } from "@/lib/architecture-nav";

export default function ArchitectureSectionNav() {
  const [activeSection, setActiveSection] = useState("overview");
  const [isNavPinned, setIsNavPinned] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let best = entries[0];
        entries.forEach((entry) => {
          if (entry.intersectionRatio > best.intersectionRatio) best = entry;
        });
        if (best?.isIntersecting && best.target.id) {
          setActiveSection(best.target.id);
        }
      },
      { threshold: [0.08, 0.25, 0.45, 0.65], rootMargin: "-14% 0px -14% 0px" }
    );

    ARCHITECTURE_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          if (navRef.current) {
            setIsNavPinned(navRef.current.getBoundingClientRect().top <= 81);
          }
          ticking = false;
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const scrollToId = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - ARCHITECTURE_SCROLL_MARGIN_PX;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <motion.div
      ref={navRef}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-[80px] z-40 py-6 pointer-events-none"
    >
      <div className="max-w-3xl mx-auto px-6 flex justify-center">
        <div
          className={cn(
            "pointer-events-auto flex items-center p-2 rounded-2xl transition-all duration-500 bg-bg-base",
            isNavPinned ? "shadow-neu-raised-scrolled" : "shadow-neu-raised"
          )}
        >
          <LayoutGroup id="architectureSectionNav">
            <nav className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
              {ARCHITECTURE_SECTIONS.map(({ id, label }) => {
                const isActive = activeSection === id;
                return (
                  <a
                    key={id}
                    href={`#${id}`}
                    onClick={(e) => scrollToId(e, id)}
                    className={cn(
                      "relative px-4 sm:px-5 py-2.5 rounded-xl text-sm font-bold transition-colors duration-300",
                      isActive
                        ? "text-theme-primary z-10"
                        : "text-content-secondary hover:text-content-primary"
                    )}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="architectureNavActivePill"
                        className="absolute inset-0 rounded-xl bg-bg-base shadow-neu-sunken -z-10"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    ) : null}
                    <span className="relative z-10">{label}</span>
                  </a>
                );
              })}
            </nav>
          </LayoutGroup>
        </div>
      </div>
    </motion.div>
  );
}
