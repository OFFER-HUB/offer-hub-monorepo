"use client"

import { RouteError } from "@/components/ui/RouteError"

export default function ArchitectureError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <RouteError
      title="Unable to load architecture overview"
      message="Something went wrong while loading the system architecture page. Please try again."
      reset={reset}
      showChrome
    />
  )
}
