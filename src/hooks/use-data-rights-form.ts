"use client"

import { useState } from "react"
import { submitDataRightsRequest } from "@/services/data-rights"

type RequestStatus = { ok: boolean; message: string } | null

export function useDataRightsForm(
  endpoint: string,
  successMessage?: string
) {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<RequestStatus>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    const result = await submitDataRightsRequest(endpoint, email)

    if (!result.ok) {
      setStatus({ ok: false, message: result.message })
    } else {
      setStatus({
        ok: true,
        message: successMessage ?? result.message,
      })
      setEmail("")
    }

    setLoading(false)
  }

  return {
    email,
    status,
    loading,
    setEmail,
    handleSubmit,
  }
}
