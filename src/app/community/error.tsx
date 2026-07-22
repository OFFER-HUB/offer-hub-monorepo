"use client"

import { RouteError } from "@/components/ui/RouteError"

export default function CommunityError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <RouteError
      title="Unable to load community data"
      message="We couldn't fetch the latest repository stats, contributors, pull requests, or issues from GitHub. The data may be temporarily unavailable due to API limits or network issues."
      reset={reset}
      showChrome
    />
  )
}
