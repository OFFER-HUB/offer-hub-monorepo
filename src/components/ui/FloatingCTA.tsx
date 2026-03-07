"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X, ArrowRight } from "lucide-react";

const STORAGE_KEY = "offer-hub-cta-dismissed";
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// Inline styles for the rotating border animation
const rotatingBorderStyles = `
  @keyframes rotate-border {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .animated-border-wrapper {
    position: relative;
    border-radius: 1rem;
    padding: 2px;
    overflow: hidden;
  }

  .animated-border-wrapper::before {
    content: "";
    position: absolute;
    inset: -150%;
    background: conic-gradient(
      from 0deg,
      transparent 0deg,
      transparent 340deg,
      #22e0e2 345deg,
      #149A9B 350deg,
      #0d7377 355deg,
      transparent 360deg
    );
    animation: rotate-border 3s linear infinite;
  }

  .animated-border-inner {
    position: relative;
    background: #F1F3F7;
    border-radius: calc(1rem - 2px);
    z-index: 1;
  }
`;

export function FloatingCTA() {
  const pathname = usePathname();
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
    // Navigate to home page waitlist section
    window.location.href = "/#waitlist-form";
  };

  if (!isAnimating) return null;

  return (
    <>
      {/* Inject animation styles */}
      <style>{rotatingBorderStyles}</style>

      <div
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out ${
          isVisible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95"
        }`}
      >
        {/* Main CTA Card */}
        <div className="relative group">
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#F1F3F7] shadow-raised-sm flex items-center justify-center text-[#6D758F] hover:text-[#19213D] hover:shadow-raised-sm-hover transition-all z-20"
            aria-label="Dismiss"
          >
            <X size={12} />
          </button>

          {/* Animated border wrapper */}
          <div className="animated-border-wrapper shadow-raised hover:shadow-raised-hover transition-shadow duration-300 group-hover:translate-y-0.5">
            {/* CTA Card */}
            <div
              onClick={handleClick}
              className="animated-border-inner cursor-pointer p-5 max-w-[280px]"
            >
              <div className="flex flex-col">
                {/* Content */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#149A9B] mb-1">
                    Early Access
                  </p>
                  <p className="text-sm font-bold text-[#19213D] leading-tight">
                    Join the Waitlist
                  </p>
                  <p className="text-xs text-[#6D758F] mt-1 leading-relaxed">
                    Be first to integrate secure escrow payments
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <button className="mt-4 w-full py-2.5 rounded-xl bg-[#149A9B] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:bg-[#0d7377] transition-colors group/btn">
                Get Started
                <ArrowRight
                  size={14}
                  className="group-hover/btn:translate-x-0.5 transition-transform"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
