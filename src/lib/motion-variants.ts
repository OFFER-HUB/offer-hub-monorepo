import type { Variants } from "framer-motion";

/**
 * Shared stagger choreography for marketing page heroes.
 * Consumed by PageHero (Architecture, Blueprint).
 */
export const heroContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.04 },
  },
};

export const heroItemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] as const },
  },
};
