"use client"

import { RouteError } from "@/components/ui/RouteError"

export default function ContactError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <RouteError
      title="Unable to load contact page"
      message="Something went wrong while loading the contact form. Please try again, or reach out to us directly through our community channels."
      reset={reset}
      secondaryLink={{ href: "/community", label: "Visit Community" }}
    />
  )
}
