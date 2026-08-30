"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/cn";

interface ThemeToggleProps {
  className?: string;
  size?: number;
}

export function ThemeToggle({ className, size = 18 }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={(e) => toggleTheme(e)}
      className={cn(
        "neu-circle flex items-center justify-center transition-colors duration-300 ease-out",
        "text-content-secondary hover:text-theme-primary",
        className
      )}
      style={{ width: "40px", height: "40px" }}
      aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
    >
      {resolvedTheme === "dark" ? (
        <Sun size={size} className="transition-transform duration-300" />
      ) : (
        <Moon size={size} className="transition-transform duration-300" />
      )}
    </button>
  );
}
