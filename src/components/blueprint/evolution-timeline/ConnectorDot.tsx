"use client";

import { motion, useReducedMotion } from "framer-motion";
import { NEU_ELEVATED, statusConfig } from "./config";
import type { Phase } from "./types";


interface ConnectorDotProps {
  phase: Phase;
  index: number;
}

export function ConnectorDot({ phase, index }: ConnectorDotProps) {
  const cfg = statusConfig(phase.status);
  const isInProgress = phase.status === "in-progress";
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="absolute left-5 top-7 z-20 -translate-x-1/2 md:left-1/2"
    >
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${NEU_ELEVATED}`}
        style={{
          borderColor: cfg.dotColor,
          background: "var(--color-bg-base)",
        }}
      >
        {isInProgress ? (
          <motion.div
            className={`h-3 w-3 rounded-full ${cfg.dotBg}`}
            animate={shouldReduceMotion ? {} : { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : (
          <div className={`h-3 w-3 rounded-full ${cfg.dotBg}`} />
        )}
      </div>
    </motion.div>
  );
}
