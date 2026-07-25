"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { BLUEPRINT_SCROLL_MARGIN_PX } from "@/lib/blueprint-nav";

type BlueprintMotionSectionProps = {
  id: string;
  className?: string;
  children: ReactNode;
};

export function BlueprintMotionSection({
  id,
  className,
  children,
}: BlueprintMotionSectionProps) {
  return (
    <motion.section
      id={id}
      layout
      className={className}
      style={{ scrollMarginTop: BLUEPRINT_SCROLL_MARGIN_PX }}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
}
