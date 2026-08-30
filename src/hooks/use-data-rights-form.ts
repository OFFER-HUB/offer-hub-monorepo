"use client"

import { useState } from "react"
import { submitDataRightsRequest } from "@/services/data-rights"
import { dataRightsSchema } from "@/lib/validation/data-rights.schema"
import { formatFieldErrors } from "@/lib/validation/errors"
import { DATA_RIGHTS_EMAIL_ERROR } from "@/lib/validation/data-rights.schema"

type RequestStatus = { ok: boolean; message: string } | null

export function useDataRightsForm(
  endpoint: string,
  successMessage?: string
) {
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<{ email?: string }>({})
  const [status, setStatus] = useState<RequestStatus>(null)
  const [loading, setLoading] = useState(false)

  const handleEmailChange = (value: string) => {
    setEmail(value)
    setErrors((prev) => ({ ...prev, email: undefined }))
    setStatus(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus(null)

    const parsed = dataRightsSchema.safeParse({ email })
    if (!parsed.success) {
      const fieldErrors = formatFieldErrors(parsed.error)
      if (fieldErrors.email) {
        fieldErrors.email = DATA_RIGHTS_EMAIL_ERROR
      }
      setErrors(fieldErrors)
      return
    }

    setLoading(true)

    const result = await submitDataRightsRequest(endpoint, parsed.data.email)

    if (!result.ok) {
      if (result.reason === "validation" && result.errors) {
        setErrors(result.errors)
      }
      setStatus({ ok: false, message: result.message })
    } else {
      setStatus({
        ok: true,
        message: successMessage ?? result.message,
      })
      setEmail("")
      setErrors({})
    }

    setLoading(false)
  }

  return {
    email,
    errors,
    status,
    loading,
    setEmail: handleEmailChange,
    handleSubmit,
  }
}
