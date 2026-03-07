"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Send } from "lucide-react";
import { cn } from "@/lib/cn";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it Works" },
  { href: "/use-cases", label: "Use Cases" },
  { href: "/docs", label: "Docs" },
  { href: "/community", label: "Community" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 12);
          ticking = false;
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <>
      {/*
       * NEUMORPHIC NAVBAR
       * ─────────────────
       * Background = bg-bg-base (theme-aware) → the container is invisible.
       * Depth comes exclusively from the bottom-projected dual shadow (dark ↘ / light ↖).
       * Buttons share the same base color and "emerge" via their own shadows.
       */}
      <header
        className={cn(
          "fixed top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-6xl xl:max-w-7xl md:w-full z-[500] transition-all duration-300 ease-out rounded-full bg-bg-base",
          isScrolled
            ? "shadow-neu-raised-scrolled py-1"
            : "shadow-neu-raised py-2"
        )}
      >
        <nav className="px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
              <Image
                src="/OFFER-HUB-logo.png"
                alt="OFFER-HUB"
                width={140}
                height={36}
                className="h-8 w-auto object-contain"
                priority
              />
            </Link>

            {/* ── Desktop nav links ── */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              <Link
                href="/"
                className={cn(
                  "px-3 py-2 rounded-full text-[13px] xl:text-sm font-medium",
                  "transition-all duration-300 ease-out bg-bg-base",
                  pathname === "/"
                    ? "text-content-primary shadow-neu-sunken-subtle"
                    : "text-content-secondary hover:text-content-primary hover:shadow-neu-sunken-subtle"
                )}
              >
                Home
              </Link>
              {navLinks.map((link) => {
                const isActive = link.href.startsWith("/") && link.href.length > 1
                  ? pathname.startsWith(link.href)
                  : pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-3 py-2 rounded-full text-[13px] xl:text-sm font-medium",
                      "transition-all duration-300 ease-out bg-bg-base",
                      isActive
                        ? "text-content-primary shadow-neu-sunken-subtle"
                        : "text-content-secondary hover:text-content-primary hover:shadow-neu-sunken-subtle"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* ── Desktop CTAs ── */}
            <div className="hidden lg:flex items-center gap-3">
              <ThemeToggle />
              <a
                href="#waitlist-form"
                className="px-6 py-2 rounded-full text-sm font-semibold btn-neumorphic-primary flex items-center gap-2 group"
              >
                Join Waitlist
                <Send size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>


            {/* ── Mobile hamburger ── */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-full transition-all duration-300 ease-out bg-bg-base text-content-secondary shadow-neu-raised hover:shadow-neu-sunken-subtle"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile menu overlay (outside the pill navbar) ── */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-[499] bg-black/20 dark:bg-black/40 backdrop-blur-sm animate-fadeIn"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu panel */}
          <div
            className="lg:hidden fixed top-24 left-4 right-4 z-[501] p-6 rounded-3xl bg-bg-base shadow-neu-raised-scrolled animate-fadeInUp"
          >
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                className={cn(
                  "px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 ease-out",
                  pathname === "/"
                    ? "text-content-primary bg-white/50 dark:bg-white/5 shadow-neu-sunken-subtle"
                    : "text-content-secondary hover:text-content-primary hover:bg-white/30 dark:hover:bg-white/5"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              {navLinks.map((link) => {
                const isActive = link.href.startsWith("/") && link.href.length > 1
                  ? pathname.startsWith(link.href)
                  : pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 ease-out",
                      isActive
                        ? "text-content-primary bg-white/50 dark:bg-white/5 shadow-neu-sunken-subtle"
                        : "text-content-secondary hover:text-content-primary hover:bg-white/30 dark:hover:bg-white/5"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-[#d1d5db]/50 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6D758F]">Theme</span>
                <ThemeToggle />
              </div>
              <a
                href="#waitlist-form"
                onClick={() => setIsMenuOpen(false)}
                className="w-full px-5 py-4 flex justify-center items-center gap-2 rounded-2xl text-sm font-bold btn-neumorphic-primary"
              >
                Join Waitlist
                <Send size={14} />
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}
