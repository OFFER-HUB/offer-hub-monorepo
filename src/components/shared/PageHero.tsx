"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  heroContainerVariants,
  heroItemVariants,
} from "@/lib/motion-variants";

type PageHeroProps = {
  id: string;
  scrollMarginPx: number;
  eyebrowIcon: ReactNode;
  eyebrowText: string;
  heading: string;
  paragraph: ReactNode;
  /** Width constraint for the page-specific illustration slot. */
  illustrationClassName?: string;
  children: ReactNode;
};

export default function PageHero({
  id,
  scrollMarginPx,
  eyebrowIcon,
  eyebrowText,
  heading,
  paragraph,
  illustrationClassName = "w-full max-w-2xl",
  children,
}: PageHeroProps) {
  return (
    <section
      id={id}
      className="relative isolate overflow-hidden pt-44 md:pt-48 pb-20 bg-transparent"
      style={{ scrollMarginTop: scrollMarginPx }}
    >
      {/* Same soft teal glow language as the home hero — ties pages together */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(ellipse 58% 48% at 50% 38%, rgba(20,154,155,0.085) 0%, transparent 68%)",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center flex flex-col items-center">
        <motion.div
          variants={heroContainerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center w-full"
        >
          {/* Brand mark — large, clean, no surface behind */}
          <motion.div variants={heroItemVariants} className="mb-6">
            <div
              className="text-[clamp(3rem,10vw,7.75rem)] font-black tracking-tight leading-none whitespace-nowrap select-none"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(31,184,185,1) 0%, rgba(20,154,155,1) 45%, rgba(34,224,226,0.95) 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
              aria-label="OFFER-HUB"
            >
              OFFER-HUB
            </div>
          </motion.div>

          {/* Eyebrow — matches Use Cases / app-wide marketing heroes */}
          <motion.div variants={heroItemVariants}>
            <div className="px-5 py-2 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-8 shadow-neu-raised text-theme-primary bg-bg-base inline-flex items-center gap-2.5">
              {eyebrowIcon}
              {eyebrowText}
            </div>
          </motion.div>

          <motion.h1
            variants={heroItemVariants}
            className="text-5xl md:text-7xl font-black tracking-tight mb-8 text-content-primary max-w-4xl"
          >
            {heading}
          </motion.h1>

          <motion.p
            variants={heroItemVariants}
            className="text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed mb-12 text-content-secondary"
          >
            {paragraph}
          </motion.p>

          {/* Page-specific illustration */}
          <motion.div variants={heroItemVariants} className={illustrationClassName}>
            {children}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
