"use client";

import { AlertTriangle } from "lucide-react";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { Button } from "@/components/ui/Button";

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
            <Button
              onClick={reset}
            >
              Try again
            </Button>
            <Button href="/">
              Return to Home
            </Button>
          </div>
        }
      />
    </main>
  );
}
