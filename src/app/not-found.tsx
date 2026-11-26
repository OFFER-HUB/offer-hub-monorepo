"use client";

import { SearchX } from "lucide-react";
import { ErrorCard } from "@/components/shared/ErrorCard";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-bg-base)] px-4">
      <ErrorCard
        icon={
          <span
            className="text-5xl font-bold tracking-tighter"
            style={{ color: "var(--color-primary)" }}
          >
            404
          </span>
        }
        secondaryIcon={
          <SearchX
            className="mb-4"
            size={36}
            style={{ color: "var(--color-primary)" }}
            strokeWidth={1.5}
          />
        }
        heading="The transaction path was not found."
        description="The route you are trying to access has not been signed or verified on our orchestrator."
        action={
          <Button href="/">
            Return to Home
          </Button>
        }
      />
    </main>
  );
}
