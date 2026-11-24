"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import type { RefObject } from "react";

interface TimelineLineProps {
  containerRef: RefObject<HTMLDivElement | null>;
}

export function TimelineLine({ containerRef }: TimelineLineProps) {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.2"],
  });

  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div className="pointer-events-none absolute left-5 top-0 z-10 flex h-full w-0 -translate-x-1/2 flex-col items-center md:left-1/2">
      <div className="absolute inset-y-0 w-[2px] rounded-full bg-[var(--color-primary)] opacity-20" />
      <motion.div
        className="absolute top-0 h-full w-[2px] origin-top rounded-full bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-accent)]"
        style={{ scaleY }}
      />
    </div>
  );
}
