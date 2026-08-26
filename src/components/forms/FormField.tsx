"use client"

import type { LucideIcon } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { cn } from "@/lib/cn"

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

const FIELD_CLASS =
  "pl-12 pr-6 py-3.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"

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
  const labelId = `${id}-label`
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
          id={labelId}
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
            className={cn(
              "absolute left-5 z-10 text-content-muted group-focus-within:text-theme-primary transition-colors pointer-events-none",
              as === "textarea" ? "top-6" : "top-1/2 -translate-y-1/2"
            )}
          />
        )}
        {as === "textarea" ? (
          <Textarea
            id={id}
            labelledBy={labelId}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            maxLength={maxLength}
            required={required}
            disabled={disabled}
            rows={rows}
            error={error}
            hideWrapper
            className={cn(FIELD_CLASS, Icon && "pl-12")}
          />
        ) : (
          <Input
            id={id}
            labelledBy={labelId}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            maxLength={maxLength}
            required={required}
            disabled={disabled}
            error={error}
            hideWrapper
            className={cn(FIELD_CLASS, Icon && "pl-12")}
          />
        )}
      </div>
    </div>
  )
}
