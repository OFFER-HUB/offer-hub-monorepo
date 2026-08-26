"use client"

import { useState } from "react"
import { submitContactInquiry } from "@/services/contact"
import { contactFormSchema } from "@/lib/validation/contact.schema"
import { formatFieldErrors } from "@/lib/validation/errors"

export interface ContactFormData {
  company: string
  name: string
  email: string
  message: string
}

const INITIAL_FORM_DATA: ContactFormData = {
  company: "",
  name: "",
  email: "",
  message: "",
}

const ERROR_MESSAGES = {
  not_configured: "Contact is not configured. Please try again later.",
  error: "Something went wrong. Please try again.",
  network: "Network error. Please check your connection and try again.",
} as const

export function useContactForm() {
  const [formData, setFormData] = useState<ContactFormData>(INITIAL_FORM_DATA)
  const [errors, setErrors] = useState<
    Partial<Record<keyof ContactFormData, string>>
  >({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target as HTMLInputElement
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
    setSubmitError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    const parsed = contactFormSchema.safeParse(formData)
    if (!parsed.success) {
      setErrors(formatFieldErrors(parsed.error))
      return
    }

    setIsLoading(true)

    const result = await submitContactInquiry(parsed.data)

    if (result.ok) {
      setIsSubmitted(true)
      return
    }

    if (result.reason === "validation" && result.errors) {
      setErrors(result.errors)
      setIsLoading(false)
      return
    }

    setSubmitError(ERROR_MESSAGES[result.reason as keyof typeof ERROR_MESSAGES] ?? ERROR_MESSAGES.error)
    setIsLoading(false)
  }

  return {
    formData,
    errors,
    isLoading,
    isSubmitted,
    submitError,
    handleInputChange,
    handleSubmit,
  }
}
