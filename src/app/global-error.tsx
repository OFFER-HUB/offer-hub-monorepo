"use client";

import Link from "next/link";
import { MotionConfig } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import ErrorCard from "@/components/shared/ErrorCard";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-[var(--color-bg-base)] px-4 antialiased">
        <MotionConfig reducedMotion="user">
          <ErrorCard
            icon={
              <AlertTriangle
                size={48}
                strokeWidth={1.5}
                style={{ color: "var(--color-primary)" }}
              />
            }
            heading="Something went wrong"
            description={
              process.env.NODE_ENV === "development"
                ? error.message
                : "An unexpected error occurred. Please try again."
            }
            action={
              <div className="flex gap-3">
                <button
                  onClick={reset}
                  className="btn-neumorphic-primary px-8 py-3 rounded-xl text-sm font-semibold"
                >
                  Try again
                </button>
                <Link
                  href="/"
                  className="btn-neumorphic-primary px-8 py-3 rounded-xl text-sm font-semibold"
                >
                  Return to Home
                </Link>
              </div>
            }
          />
        </MotionConfig>
      </body>
    </html>
  );
}
