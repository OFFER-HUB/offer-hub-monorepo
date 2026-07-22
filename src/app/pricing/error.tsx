"use client"

import { RouteError } from "@/components/ui/RouteError"

export default function PricingError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <RouteError
      title="Unable to load pricing"
      message="Something went wrong while loading pricing information. Please try again."
      reset={reset}
      showChrome
    />
  )
}
