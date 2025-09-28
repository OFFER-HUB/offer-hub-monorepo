"use client"

import { Badge } from "@/components/ui/badge"

interface ProjectStatusBadgeProps {
  status: "active" | "completed" | "dispute"
}

export function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          label: "Active",
          variant: "default" as const
        }
      case "completed":
        return {
          label: "Completed",
          variant: "success" as const
        }
      case "dispute":
        return {
          label: "Dispute",
          variant: "destructive" as const
        }
      default:
        return {
          label: "Unknown",
          variant: "secondary" as const
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
}

