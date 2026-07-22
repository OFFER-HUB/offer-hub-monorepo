"use client"

import { RouteError } from "@/components/ui/RouteError"

export default function UseCasesError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <RouteError
      title="Unable to load use cases"
      message="Something went wrong while loading the industry use cases. Please try again."
      reset={reset}
      showChrome
    />
  )
}
