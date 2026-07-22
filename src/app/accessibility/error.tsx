"use client"

import { RouteError } from "@/components/ui/RouteError"

export default function AccessibilityError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <RouteError
      title="Unable to load accessibility statement"
      message="Something went wrong while loading the accessibility page. Please try again."
      reset={reset}
      showChrome
    />
  )
}
