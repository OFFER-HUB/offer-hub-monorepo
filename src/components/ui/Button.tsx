import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger"; size?: "sm" | "md" | "lg" }) {
  return <button {...props} className={cn("inline-flex min-h-11 items-center justify-center rounded-xl px-5 font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-primary disabled:cursor-not-allowed disabled:opacity-50", size === "sm" ? "min-h-9 text-sm" : size === "lg" ? "min-h-12 text-base" : "text-sm", variant === "primary" ? "bg-theme-primary text-bg-base hover:bg-theme-primary-hover" : variant === "secondary" ? "bg-bg-elevated text-content-primary shadow-neu-raised-sm" : variant === "danger" ? "bg-[color-mix(in_srgb,var(--color-error)_12%,transparent)] text-theme-error hover:bg-[color-mix(in_srgb,var(--color-error)_20%,transparent)]" : "text-content-primary hover:bg-bg-sunken", className)} />;
}
