"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { submitWaitlistEntry } from "@/services/waitlist"

const COOLDOWN_SECONDS = 30

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          "expired-callback": () => void
          "error-callback": () => void
        }
      ) => string
      reset: (widgetId: string) => void
    }
  }
}

export interface WaitlistFormData {
  name: string
  email: string
  purpose: string
  referral: string
}

const INITIAL_FORM_DATA: WaitlistFormData = {
  name: "",
  email: "",
  purpose: "",
  referral: "",
}

const ERROR_MESSAGES = {
  captcha: "Please complete the CAPTCHA verification.",
  not_configured: "Waitlist is not configured yet. Please try again later.",
  duplicate: "This email is already registered on our waitlist.",
  error: "Something went wrong. Please try again.",
  network: "Network error. Please check your connection and try again.",
} as const

export function useWaitlistForm() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [formData, setFormData] = useState<WaitlistFormData>(INITIAL_FORM_DATA)

  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const turnstileContainerRef = useRef<HTMLDivElement>(null)
  const turnstileWidgetId = useRef<string | null>(null)

  const isTurnstileConfigured = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const canSubmit =
    !isLoading &&
    cooldownSeconds === 0 &&
    (!isTurnstileConfigured || !!turnstileToken)

  const startCooldown = useCallback(() => {
    if (cooldownRef.current) clearInterval(cooldownRef.current)
    setCooldownSeconds(COOLDOWN_SECONDS)
    cooldownRef.current = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!)
          cooldownRef.current = null
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const resetTurnstile = useCallback(() => {
    if (
      turnstileWidgetId.current &&
      typeof window !== "undefined" &&
      window.turnstile
    ) {
      window.turnstile.reset(turnstileWidgetId.current)
      setTurnstileToken(null)
    }
  }, [])

  const renderTurnstile = useCallback(() => {
    const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    if (
      !sitekey ||
      !turnstileContainerRef.current ||
      turnstileWidgetId.current ||
      typeof window === "undefined" ||
      !window.turnstile
    ) {
      return
    }

    turnstileWidgetId.current = window.turnstile.render(
      turnstileContainerRef.current,
      {
        sitekey,
        callback: (token) => setTurnstileToken(token),
        "expired-callback": () => setTurnstileToken(null),
        "error-callback": () => setTurnstileToken(null),
      }
    )
  }, [])

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current)
    }
  }, [])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cooldownSeconds > 0 || isLoading) return

    if (isTurnstileConfigured && !turnstileToken) {
      setError(ERROR_MESSAGES.captcha)
      return
    }

    setIsLoading(true)
    setError(null)

    const result = await submitWaitlistEntry(formData)

    if (result.ok) {
      setIsSubmitted(true)
      return
    }

    setError(ERROR_MESSAGES[result.reason])
    setIsLoading(false)
    startCooldown()
    resetTurnstile()
  }

  return {
    formData,
    isSubmitted,
    isLoading,
    error,
    cooldownSeconds,
    turnstileContainerRef,
    isTurnstileConfigured,
    canSubmit,
    handleInputChange,
    handleSubmit,
    renderTurnstile,
  }
}
