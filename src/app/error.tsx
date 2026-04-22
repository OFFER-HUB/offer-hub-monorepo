"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-bg-base)] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <motion.div
          animate={{ y: [0, -12, 0] }}
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
          {/* Sunken error badge */}
          <div
            className="w-36 h-36 rounded-2xl flex items-center justify-center mb-6"
            style={{
              background: "var(--color-bg-sunken)",
              boxShadow:
                "inset 10px 10px 20px var(--shadow-dark), inset -10px -10px 20px var(--shadow-light)",
            }}
          >
            <AlertTriangle
              size={48}
              style={{ color: "var(--color-primary)" }}
              strokeWidth={1.5}
            />
          </div>

          {/* Headline */}
          <h1
            className="text-xl font-bold mb-3 leading-snug"
            style={{ color: "var(--color-text-primary)" }}
          >
            Something went wrong
          </h1>

          {/* Subtext */}
          <p
            className="text-sm leading-relaxed mb-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            An unexpected error occurred while rendering this page. You can try
            again or return to the homepage.
          </p>

          {error.digest && (
            <p
              className="text-xs mb-8 font-mono"
              style={{ color: "var(--color-text-secondary)", opacity: 0.5 }}
            >
              Error ID: {error.digest}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={reset}
              className="btn-neumorphic-primary px-8 py-3 rounded-xl text-sm font-semibold"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-300"
              style={{
                background: "var(--color-bg-sunken)",
                color: "var(--color-text-secondary)",
                boxShadow:
                  "inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light)",
              }}
            >
              Go Home
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
