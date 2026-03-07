import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Roboto", "Outfit", "sans-serif"],
      },
      colors: {
        // Legacy colors (kept for backwards compatibility during migration)
        primary: {
          DEFAULT: "#149A9B",
          hover: "#0d7377",
        },
        secondary: "#002333",
        accent: "#15949C",
        background: "#F1F3F7",
        "text-primary": "#19213D",
        "text-secondary": "#6D758F",
        success: "#16a34a",
        warning: "#d97706",
        error: "#FF0000",

        // Theme-aware colors (use these for dark mode support)
        "theme-primary": "var(--color-primary)",
        "theme-primary-hover": "var(--color-primary-hover)",
        "theme-secondary": "var(--color-secondary)",
        "theme-accent": "var(--color-accent)",
        "bg-base": "var(--color-bg-base)",
        "bg-elevated": "var(--color-bg-elevated)",
        "bg-sunken": "var(--color-bg-sunken)",
        "content-primary": "var(--color-text-primary)",
        "content-secondary": "var(--color-text-secondary)",
        "content-muted": "var(--color-text-muted)",
        "theme-success": "var(--color-success)",
        "theme-warning": "var(--color-warning)",
        "theme-error": "var(--color-error)",
        "theme-border": "var(--color-border)",
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 400ms ease-out both",
        fadeIn: "fadeIn 300ms ease-out both",
      },
      boxShadow: {
        // Legacy shadows (kept for backwards compatibility)
        raised: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        "raised-sm": "3px 3px 6px #d1d5db, -3px -3px 6px #ffffff",
        sunken: "inset 4px 4px 8px #d1d5db, inset -4px -4px 8px #ffffff",
        "sunken-subtle": "inset 2px 2px 4px #d1d5db, inset -2px -2px 4px #ffffff",
        neu: "4px 4px 8px #d1d5db, -4px -4px 8px #ffffff",
        "neu-inset": "inset 4px 4px 8px #d1d5db, inset -4px -4px 8px #ffffff",

        // Theme-aware neumorphic shadows (use these for dark mode support)
        "neu-raised": "6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)",
        "neu-raised-sm": "3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)",
        "neu-raised-hover": "2px 2px 4px var(--shadow-dark), -2px -2px 4px var(--shadow-light)",
        "neu-sunken": "inset 4px 4px 8px var(--shadow-dark), inset -4px -4px 8px var(--shadow-light)",
        "neu-sunken-subtle": "inset 2px 2px 4px var(--shadow-dark), inset -2px -2px 4px var(--shadow-light)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
