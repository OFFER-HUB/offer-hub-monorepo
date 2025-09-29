"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type CalendarProps = {
  className?: string
  value?: string // yyyy-mm-dd
  onChange?: (value: string) => void
}

function Calendar({ className, value, onChange }: CalendarProps) {
  return (
    <input
      type="date"
      className={cn("p-2 rounded-md border bg-white text-sm", className)}
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
