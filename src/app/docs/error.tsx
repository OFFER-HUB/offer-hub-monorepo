"use client"

import { RouteError } from "@/components/ui/RouteError"

export default function DocsError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <RouteError
      title="Unable to load documentation"
      message="We couldn't read this documentation page. The file may be missing, corrupted, or temporarily unavailable."
      reset={reset}
      secondaryLink={{ href: "/docs", label: "Back to Docs" }}
      variant="inline"
    />
  )
}
