"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { AlertTriangle } from "lucide-react"
import { Footer } from "@/components/layout/Footer"
import { Navbar } from "@/components/layout/Navbar"

export interface RouteErrorProps {
  title: string
  message: string
  reset: () => void
  secondaryLink?: { href: string; label: string }
  showChrome?: boolean
  variant?: "page" | "inline"
}

const RouteErrorCard = ({
  title,
  message,
  reset,
  secondaryLink,
}: Pick<RouteErrorProps, "title" | "message" | "reset" | "secondaryLink">) => {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: "easeOut" }}
      className="w-full max-w-md"
    >
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
            strokeWidth={1.5}
            style={{ color: "var(--color-primary)" }}
            aria-hidden="true"
          />
        </div>

        <h1
          className="text-xl font-bold mb-3 leading-snug"
          style={{ color: "var(--color-text-primary)" }}
        >
          {title}
        </h1>

        <p
          className="text-sm leading-relaxed mb-8"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {message}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="btn-neumorphic-primary px-8 py-3 rounded-xl text-sm font-semibold"
          >
            Try again
          </button>
          {secondaryLink && (
            <Link
              href={secondaryLink.href}
              className="btn-neumorphic-primary px-8 py-3 rounded-xl text-sm font-semibold"
            >
              {secondaryLink.label}
            </Link>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

export const RouteError = ({
  title,
  message,
  reset,
  secondaryLink,
  showChrome = false,
  variant = "page",
}: RouteErrorProps) => {
  const card = (
    <RouteErrorCard
      title={title}
      message={message}
      reset={reset}
      secondaryLink={secondaryLink}
    />
  )

  if (variant === "inline") {
    return (
      <div
        className="flex items-center justify-center py-16 px-4"
        role="alert"
        aria-live="assertive"
      >
        {card}
      </div>
    )
  }

  if (showChrome) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-base text-content-primary">
        <Navbar />
        <main
          className="flex-grow flex items-center justify-center px-4 py-20"
          role="alert"
          aria-live="assertive"
        >
          {card}
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center bg-[var(--color-bg-base)] px-4"
      role="alert"
      aria-live="assertive"
    >
      {card}
    </main>
  )
}
