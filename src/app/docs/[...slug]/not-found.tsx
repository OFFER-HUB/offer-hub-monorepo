"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { FileQuestion, Home, BookOpen, Search } from "lucide-react";

export default function DocsNotFound() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: "easeOut" }}
        className="w-full max-w-2xl"
      >
        {/* Floating card */}
        <motion.div
          animate={shouldReduceMotion ? {} : { y: [0, -8, 0] }}
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
            className="w-32 h-32 rounded-2xl flex items-center justify-center mb-6"
            style={{
              background: "var(--color-bg-sunken)",
              boxShadow:
                "inset 8px 8px 16px var(--shadow-dark), inset -8px -8px 16px var(--shadow-light)",
            }}
          >
            <FileQuestion
              size={56}
              style={{ color: "var(--color-primary)" }}
              strokeWidth={1.5}
            />
          </div>

          {/* Headline */}
          <h1
            className="text-2xl font-bold mb-3 leading-snug"
            style={{ color: "var(--color-text-primary)" }}
          >
            Documentation Page Not Found
          </h1>

          {/* Subtext */}
          <p
            className="text-base leading-relaxed mb-8 max-w-md"
            style={{ color: "var(--color-text-secondary)" }}
          >
            The documentation page you're looking for doesn't exist or may have been moved.
            Try exploring the docs from the beginning or search for what you need.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              href="/docs"
              className="btn-neumorphic-primary px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2"
            >
              <BookOpen size={18} strokeWidth={2} />
              Browse Docs
            </Link>
            
            <Link
              href="/"
              className="btn-neumorphic-secondary px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2"
            >
              <Home size={18} strokeWidth={2} />
              Go Home
            </Link>
          </div>

          {/* Helpful links section */}
          <div className="mt-10 pt-8 border-t w-full" style={{ borderColor: "var(--color-border)" }}>
            <p
              className="text-sm font-medium mb-4"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Popular Documentation Sections
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <Link
                href="/docs/getting-started"
                className="px-4 py-3 rounded-xl text-sm transition-all duration-300"
                style={{
                  background: "var(--color-bg-base)",
                  boxShadow: "4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light)",
                  color: "var(--color-text-primary)",
                }}
              >
                <span className="font-medium">Getting Started</span>
                <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
                  Quick start guide
                </p>
              </Link>

              <Link
                href="/docs/api"
                className="px-4 py-3 rounded-xl text-sm transition-all duration-300"
                style={{
                  background: "var(--color-bg-base)",
                  boxShadow: "4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light)",
                  color: "var(--color-text-primary)",
                }}
              >
                <span className="font-medium">API Reference</span>
                <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
                  Complete API docs
                </p>
              </Link>

              <Link
                href="/docs/architecture"
                className="px-4 py-3 rounded-xl text-sm transition-all duration-300"
                style={{
                  background: "var(--color-bg-base)",
                  boxShadow: "4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light)",
                  color: "var(--color-text-primary)",
                }}
              >
                <span className="font-medium">Architecture</span>
                <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
                  System design
                </p>
              </Link>

              <Link
                href="/docs/guides"
                className="px-4 py-3 rounded-xl text-sm transition-all duration-300"
                style={{
                  background: "var(--color-bg-base)",
                  boxShadow: "4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light)",
                  color: "var(--color-text-primary)",
                }}
              >
                <span className="font-medium">Guides</span>
                <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
                  Step-by-step tutorials
                </p>
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
