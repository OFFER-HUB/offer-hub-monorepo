"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { SearchX } from "lucide-react";


export default function NotFound() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-bg-base)] px-4">
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
          {/* Sunken 404 badge */}
          <div
            className="w-36 h-36 rounded-2xl flex items-center justify-center mb-6"
            style={{
              background: "var(--color-bg-sunken)",
              boxShadow:
                "inset 10px 10px 20px var(--shadow-dark), inset -10px -10px 20px var(--shadow-light)",
            }}
          >
            <span
              className="text-5xl font-black tracking-tighter"
              style={{ color: "var(--color-primary)" }}
            >
              404
            </span>
          </div>

          {/* Icon */}
          <SearchX
            className="mb-4"
            size={36}
            style={{ color: "var(--color-primary)" }}
            strokeWidth={1.5}
          />

          {/* Headline */}
          <h1
            className="text-xl font-bold mb-3 leading-snug"
            style={{ color: "var(--color-text-primary)" }}
          >
            The transaction path was not found.
          </h1>

          {/* Subtext */}
          <p
            className="text-sm leading-relaxed mb-8"
            style={{ color: "var(--color-text-secondary)" }}
          >
            The route you are trying to access has not been signed or verified
            on our orchestrator.
          </p>

          {/* CTA Button */}
          <Link
            href="/"
            className="btn-neumorphic-primary px-8 py-3 rounded-xl text-sm font-semibold"
          >
            Return to Home
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
