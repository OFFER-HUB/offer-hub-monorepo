"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileQuestion, ArrowLeft, BookOpen } from "lucide-react";

const docSuggestions = [
  { title: "Getting Started", href: "/docs/getting-started", description: "Installation and first steps" },
  { title: "API Reference", href: "/docs/api-reference/overview", description: "Complete REST API docs" },
  { title: "Quick Start Guide", href: "/docs/guide/quick-start", description: "Build your first integration" },
  { title: "Escrow & Payments", href: "/docs/guide/escrow", description: "Smart contract escrow flows" },
];

export default function DocsNotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
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
            className="w-28 h-28 rounded-2xl flex items-center justify-center mb-6"
            style={{
              background: "var(--color-bg-sunken)",
              boxShadow:
                "inset 8px 8px 16px var(--shadow-dark), inset -8px -8px 16px var(--shadow-light)",
            }}
          >
            <FileQuestion
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
            Documentation page not found
          </h1>

          {/* Subtext */}
          <p
            className="text-sm leading-relaxed mb-8"
            style={{ color: "var(--color-text-secondary)" }}
          >
            The documentation page you&apos;re looking for doesn&apos;t exist or may have
            been moved. Try one of the sections below.
          </p>

          {/* Suggested sections */}
          <div className="w-full space-y-3 mb-8">
            {docSuggestions.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: "var(--color-bg-sunken)",
                  boxShadow:
                    "inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light)",
                }}
              >
                <BookOpen
                  size={18}
                  style={{ color: "var(--color-primary)" }}
                  className="flex-shrink-0"
                />
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {item.title}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4">
            <Link
              href="/docs"
              className="btn-neumorphic-primary px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Docs
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
