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
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "Fira Code", "monospace"],
      },
      colors: {
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
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 400ms ease-out both",
        fadeIn: "fadeIn 300ms ease-out both",
        shimmer: "shimmer 1.5s ease-in-out infinite",
      },
      boxShadow: {
        // Theme-aware neumorphic shadows (use these for dark mode support)
        "neu-raised": "6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)",
        "neu-raised-scrolled":
          "8px 8px 18px var(--shadow-dark), -7px -7px 16px var(--shadow-light)",
        "neu-raised-sm": "3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)",
        "neu-raised-hover": "2px 2px 4px var(--shadow-dark), -2px -2px 4px var(--shadow-light)",
        "neu-sunken": "inset 4px 4px 8px var(--shadow-dark), inset -4px -4px 8px var(--shadow-light)",
        "neu-sunken-subtle": "inset 2px 2px 4px var(--shadow-dark), inset -2px -2px 4px var(--shadow-light)",

        // Level-2 (L2) — elevated depth for Blueprint nested layouts (Issue 1168)
        "neu-raised-l2": "12px 12px 24px var(--shadow-dark), -12px -12px 24px var(--shadow-light)",
        "neu-raised-l2-sm": "8px 8px 16px var(--shadow-dark), -8px -8px 16px var(--shadow-light)",
        "neu-sunken-l2": "inset 8px 8px 16px var(--shadow-dark), inset -8px -8px 16px var(--shadow-light)",
        "neu-sunken-l2-subtle": "inset 6px 6px 12px var(--shadow-dark), inset -6px -6px 12px var(--shadow-light)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
