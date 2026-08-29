"use client"

import type { LucideIcon } from "lucide-react"

interface FormFieldProps {
  id: string
  name: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  placeholder?: string
  type?: "text" | "email"
  as?: "input" | "textarea"
  rows?: number
  maxLength?: number
  showCharCount?: boolean
  required?: boolean
  disabled?: boolean
  icon?: LucideIcon
  error?: string
  labelExtra?: React.ReactNode
}

const INPUT_CLASS =
  "w-full pl-12 pr-6 py-3.5 rounded-xl bg-bg-sunken shadow-neu-sunken-subtle text-sm text-content-primary placeholder:text-content-muted border-none transition-[box-shadow,opacity] font-medium disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-theme-primary focus-visible:outline-offset-2 focus-visible:ring-2 focus-visible:ring-theme-primary"

export function FormField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  as = "input",
  rows = 3,
  maxLength,
  showCharCount = false,
  required = false,
  disabled = false,
  icon: Icon,
  error,
  labelExtra,
}: FormFieldProps) {
  const errorId = error ? `${id}-error` : undefined
  const charCountClass =
    value.length >= (maxLength ?? 500) * 0.96
      ? "text-red-500"
      : value.length >= (maxLength ?? 500) * 0.8
        ? "text-amber-500"
        : "text-content-muted"

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center ml-2">
        <label
          htmlFor={id}
          className="text-[10px] font-black uppercase tracking-widest text-content-secondary"
        >
          {label}
        </label>
        {showCharCount && maxLength && (
          <span
            className={`text-[10px] font-bold tracking-wider transition-colors duration-200 ${charCountClass}`}
          >
            {value.length}/{maxLength}
          </span>
        )}
        {labelExtra}
      </div>
      <div className="relative group">
        {Icon && (
          <Icon
            size={16}
            className={`absolute left-5 text-content-muted group-focus-within:text-theme-primary transition-colors ${
              as === "textarea" ? "top-6" : "top-1/2 -translate-y-1/2"
            }`}
          />
        )}
        {as === "textarea" ? (
          <textarea
            id={id}
            required={required}
            rows={rows}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
            aria-describedby={errorId}
            className={`${INPUT_CLASS} resize-none ${error ? "ring-1 ring-red-400" : ""}`}
          />
        ) : (
          <input
            id={id}
            required={required}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
            aria-describedby={errorId}
            className={`${INPUT_CLASS} ${error ? "ring-1 ring-red-400" : ""}`}
          />
        )}
        {error && (
          <p id={errorId} className="text-xs text-red-600 mt-1 pl-2">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
