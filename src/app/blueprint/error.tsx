"use client"

import { RouteError } from "@/components/ui/RouteError"

export default function BlueprintError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <RouteError
      title="Unable to load blueprint"
      message="Something went wrong while loading the platform blueprint. Please try again."
      reset={reset}
      showChrome
    />
  )
}
