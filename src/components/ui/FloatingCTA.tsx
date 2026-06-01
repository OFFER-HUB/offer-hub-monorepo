"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X, ArrowRight } from "lucide-react";

const STORAGE_KEY = "offer-hub-cta-dismissed";
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export function FloatingCTA() {
  const pathname = usePathname();
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Don't show on community page (has registration form)
  const isExcludedPage = pathname === "/community";

  useEffect(() => {
    // Check if dismissed recently
    const dismissedAt = localStorage.getItem(STORAGE_KEY);
    if (dismissedAt) {
      const elapsed = Date.now() - parseInt(dismissedAt, 10);
      if (elapsed < DISMISS_DURATION) {
        return;
      }
      localStorage.removeItem(STORAGE_KEY);
    }

    // Show CTA after a delay for better UX
    const timer = setTimeout(() => {
      if (!isExcludedPage) {
        setIsAnimating(true);
        setTimeout(() => setIsVisible(true), 50);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isExcludedPage]);

  // Hide when navigating to excluded pages
  useEffect(() => {
    if (isExcludedPage && isVisible) {
      setIsVisible(false);
      setTimeout(() => setIsAnimating(false), 300);
    } else if (!isExcludedPage && !isVisible) {
      const dismissedAt = localStorage.getItem(STORAGE_KEY);
      if (!dismissedAt) {
        setIsAnimating(true);
        setTimeout(() => setIsVisible(true), 50);
      }
    }
  }, [pathname, isExcludedPage, isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsAnimating(false);
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    }, 300);
  };

  const handleClick = () => {
    // Navigate to home page waitlist section using client-side navigation
    router.push("/#waitlist-form");
  };

  if (!isAnimating) return null;

  return (
    <div
        className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 transition-all duration-300 ease-out print:hidden ${isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-4 scale-95"
          }`}
      >
        {/* Main CTA Card */}
        <div className="relative group">
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-bg-base shadow-neu-raised-sm flex items-center justify-center text-content-secondary hover:text-content-primary hover:shadow-neu-raised-hover transition-all z-20"
            aria-label="Dismiss"
          >
            <X size={12} />
          </button>

          {/* Animated border wrapper */}
          <div className="animated-border-wrapper shadow-neu-raised hover:shadow-neu-raised-hover transition-shadow duration-300 group-hover:translate-y-0.5">
            {/* CTA Card */}
            <button
              type="button"
              onClick={handleClick}
              className="animated-border-inner appearance-none border-0 text-left cursor-pointer px-4 py-3 md:px-6 md:py-5 max-w-[240px] md:max-w-[280px] w-full"
            >
              <div className="flex flex-col">
                {/* Content */}
                <div>
                  <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-theme-primary mb-1">
                    Early Access
                  </p>
                  <p className="text-xs md:text-sm font-bold text-content-primary leading-tight">
                    Join the Waitlist
                  </p>
                  <p className="text-[10px] md:text-xs text-content-secondary mt-1 leading-relaxed">
                    Be first to integrate secure escrow payments
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="mt-3 md:mt-4 w-full py-2 md:py-2.5 rounded-xl bg-theme-primary text-white text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:bg-theme-primary-hover transition-colors group/btn">
                Get Started
                <ArrowRight
                  size={14}
                  className="group-hover/btn:translate-x-0.5 transition-transform"
                />
              </div>
            </button>
          </div>
        </div>
      </div>
  );
}
