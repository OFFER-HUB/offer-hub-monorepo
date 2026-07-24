"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type ErrorCardProps = {
  icon: ReactNode;
  secondaryIcon?: ReactNode;
  heading: string;
  description: ReactNode;
  action: ReactNode;
};

export default function ErrorCard({
  icon,
  secondaryIcon,
  heading,
  description,
  action,
}: ErrorCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={shouldReduceMotion ? {} : { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      {/* Floating card */}
      <motion.div
        animate={shouldReduceMotion ? {} : { y: [0, -12, 0] }}
        transition={{
          duration: 4,
          ease: "easeInOut" as const,
          repeat: Infinity,
        }}
        className="rounded-3xl p-10 flex flex-col items-center text-center"
        style={{
          background: "var(--color-bg-base)",
          boxShadow:
            "10px 10px 20px var(--shadow-dark), -10px -10px 20px var(--shadow-light)",
        }}
      >
        {/* Sunken icon badge */}
        <div
          className="w-36 h-36 rounded-2xl flex items-center justify-center mb-6"
          style={{
            background: "var(--color-bg-sunken)",
            boxShadow:
              "inset 10px 10px 20px var(--shadow-dark), inset -10px -10px 20px var(--shadow-light)",
          }}
        >
          {icon}
        </div>

        {secondaryIcon}

        {/* Headline */}
        <h1
          className="text-xl font-bold mb-3 leading-snug"
          style={{ color: "var(--color-text-primary)" }}
        >
          {heading}
        </h1>

        {/* Description */}
        <p
          className="text-sm leading-relaxed mb-8"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {description}
        </p>

        {action}
      </motion.div>
    </motion.div>
  );
}
