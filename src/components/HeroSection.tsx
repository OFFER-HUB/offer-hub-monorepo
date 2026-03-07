"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

/**
 * Liquid text effect: multiple radial gradient blobs orbit inside the heading
 * via requestAnimationFrame, visible through background-clip: text.
 * The dark page acts like a wall; the text is a "glass window" into the liquid.
 */
export default function HeroSection() {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = headingRef.current;
    if (!el) return;

    let frame: number;
    let t = 0;
    let paused = false;

    const animate = () => {
      if (paused) return;
      t += 0.022;

      const b1x = 50 + 28 * Math.sin(t * 0.70);
      const b1y = 50 + 22 * Math.cos(t * 0.50);
      const b2x = 50 + 22 * Math.sin(t * 0.40 + 2.0);
      const b2y = 50 + 28 * Math.cos(t * 0.60 + 1.2);
      const b3x = 50 + 32 * Math.sin(t * 0.85 + 4.2);
      const b3y = 50 + 18 * Math.cos(t * 0.75 + 3.0);
      const b4x = 50 + 18 * Math.sin(t * 1.10 + 1.0);
      const b4y = 50 + 30 * Math.cos(t * 0.95 + 5.1);
      const b5x = 50 + 38 * Math.sin(t * 0.55 + 5.5);
      const b5y = 50 + 24 * Math.cos(t * 0.42 + 4.0);
      const b6x = 50 + 14 * Math.sin(t * 1.30 + 3.0);
      const b6y = 50 + 14 * Math.cos(t * 1.15 + 2.0);

      el.style.backgroundImage = [
        `radial-gradient(ellipse 48% 55% at ${b1x}% ${b1y}%, #1bc8ca 0%, #149A9B 45%, rgba(20,154,155,0) 82%)`,
        `radial-gradient(ellipse 38% 46% at ${b2x}% ${b2y}%, #22e0e2 0%, #1bc8ca 40%, rgba(27,200,202,0) 80%)`,
        `radial-gradient(ellipse 32% 42% at ${b3x}% ${b3y}%, #15949C 0%, rgba(21,148,156,0) 78%)`,
        `radial-gradient(ellipse 28% 38% at ${b4x}% ${b4y}%, #0d7377 0%, rgba(13,115,119,0) 78%)`,
        `radial-gradient(ellipse 44% 52% at ${b5x}% ${b5y}%, #149A9B 0%, rgba(20,154,155,0) 82%)`,
        `radial-gradient(ellipse 20% 26% at ${b6x}% ${b6y}%, #22e0e2 0%, rgba(34,224,226,0) 72%)`,
        `radial-gradient(ellipse 62% 72% at ${b3x}% ${b2y}%, rgba(241,243,247,0.90) 0%, rgba(241,243,247,0.50) 40%, rgba(241,243,247,0) 78%)`,
        `radial-gradient(ellipse 52% 62% at ${b5x}% ${b4y}%, rgba(241,243,247,0.80) 0%, rgba(241,243,247,0.38) 38%, rgba(241,243,247,0) 72%)`,
        `radial-gradient(ellipse 42% 50% at ${b1x}% ${b6y}%, rgba(241,243,247,0.65) 0%, rgba(241,243,247,0.20) 45%, rgba(241,243,247,0) 70%)`,
      ].join(", ");

      frame = requestAnimationFrame(animate);
    };

    // Pause animation when tab is hidden to save CPU
    const onVisibility = () => {
      if (document.hidden) {
        paused = true;
        cancelAnimationFrame(frame);
      } else {
        paused = false;
        frame = requestAnimationFrame(animate);
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    frame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden select-none bg-transparent"
    >
      {/* ── Subtle teal glow centered ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 50% 50%, rgba(20,154,155,0.07) 0%, transparent 70%)",
        }}
      />

      {/* ── Hero content — pt-28 clears the fixed pill navbar ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 w-full pt-28">
        {/* Eyebrow — key value props from product docs */}
        <p
          className="animate-fadeIn text-xs font-medium uppercase tracking-[0.4em] mb-10"
          style={{ color: "#149A9B", animationDelay: "100ms" }}
        >
          Self-Hosted · Non-Custodial · Open Source
        </p>

        {/*
         * THE LIQUID TEXT
         * ───────────────
         * background-clip: text → the animated gradient is only visible
         * through the letter shapes. The page background acts as the "wall";
         * the text becomes a glass window into moving liquid teal.
         */}
        <h1
          ref={headingRef}
          className="font-black leading-[1.1] tracking-tight whitespace-nowrap px-8 py-4"
          style={{
            fontSize: "clamp(3.5rem, 13vw, 12rem)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            // backgroundColor is the absolute base — always visible through letters
            // even when no blob covers a given area, this solid teal shows through
            backgroundColor: "#149A9B",
            willChange: "background-image",
          }}
        >
          OFFER HUB
        </h1>

        {/* Tagline — product-accurate description */}
        <p
          className="animate-fadeInUp mt-10 text-lg md:text-xl font-light max-w-xl leading-relaxed"
          style={{ color: "#6D758F", animationDelay: "300ms" }}
        >
          A payments orchestrator for modern marketplaces.{" "}
          <span className="font-semibold" style={{ color: "#19213D" }}>
            Zero custodial risk. Complete developer control.
          </span>
        </p>

        {/* CTA buttons */}
        <div
          className="animate-fadeInUp flex flex-col sm:flex-row items-center gap-4 mt-12"
          style={{ animationDelay: "500ms" }}
        >
          {/* Primary — neumorphic raised, teal */}
          <a
            href="#waitlist-form"
            className="group flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-semibold btn-neumorphic-primary"
          >
            Get Started
            <ArrowRight
              size={15}
              className="group-hover:translate-x-0.5 transition-transform duration-[200ms]"
            />
          </a>

          {/* Secondary — neumorphic raised, same base color as page */}
          <Link
            href="/docs"
            className="px-7 py-3.5 rounded-xl text-sm font-medium btn-neumorphic-secondary"
          >
            View Docs
          </Link>
        </div>
      </div>

      {/* ── Scroll indicator ── */}
      <div
        className="animate-fadeIn absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: "rgba(0,35,51,0.30)", animationDelay: "900ms" }}
      >
        <span className="text-[10px] uppercase tracking-[0.35em] font-medium">
          Scroll
        </span>
        <ChevronDown size={14} className="animate-bounce" />
      </div>
    </section>
  );
}
