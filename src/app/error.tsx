"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import ErrorCard from "@/components/shared/ErrorCard";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-bg-base)] px-4">
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
    </main>
  );
}
