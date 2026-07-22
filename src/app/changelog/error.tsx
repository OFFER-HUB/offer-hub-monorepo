"use client"

import { RouteError } from "@/components/ui/RouteError"

export default function ChangelogError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <RouteError
      title="Unable to load release history"
      message="We couldn't fetch release notes from the GitHub Releases API. The changelog may be temporarily unavailable due to API limits or network issues."
      reset={reset}
      showChrome
    />
  )
}
