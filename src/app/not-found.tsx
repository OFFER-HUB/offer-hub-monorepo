"use client";

import Link from "next/link";
import { SearchX } from "lucide-react";
import ErrorCard from "@/components/shared/ErrorCard";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-bg-base)] px-4">
      <ErrorCard
        icon={
          <span
            className="text-5xl font-black tracking-tighter"
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
          <Link
            href="/"
            className="btn-neumorphic-primary px-8 py-3 rounded-xl text-sm font-semibold"
          >
            Return to Home
          </Link>
        }
      />
    </main>
  );
}
