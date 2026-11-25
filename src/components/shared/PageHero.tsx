"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { heroContainerVariants, heroItemVariants } from "@/lib/motion-variants";
import { PageHeader } from "@/components/shared/PageHeader";

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

/**
 * Centered marketing hero: the shared PageHeader (the page's only <h1>) plus a
 * page-specific illustration slot. The oversized gradient "OFFER-HUB" wordmark
 * that used to sit above the title was removed: the wordmark lives in the
 * navbar, and display type is reserved for the home hero.
 */
export function PageHero({
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
    <section id={id} className="bg-transparent pb-20 pt-32" style={{ scrollMarginTop: scrollMarginPx }}>
      <motion.div
        variants={heroContainerVariants}
        initial="hidden"
        animate="show"
        className="mx-auto flex max-w-7xl flex-col items-center px-6 lg:px-8"
      >
        <motion.div variants={heroItemVariants} className="mb-12 w-full">
          <PageHeader
            align="center"
            eyebrow={eyebrowText}
            eyebrowIcon={eyebrowIcon}
            title={heading}
            lead={paragraph}
          />
        </motion.div>

        <motion.div variants={heroItemVariants} className={illustrationClassName}>
          {children}
        </motion.div>
      </motion.div>
    </section>
  );
}
