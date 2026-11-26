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
      /**
       * Shared type scale (issue #1737). Fluid sizes interpolate between the
       * mobile value at 390px and the desktop value at 1440px, then clamp.
       * Keep the names in sync with TYPE_SCALE_CLASSES in src/lib/cn.ts.
       */
      fontSize: {
        // 44 → 72, 800. Home hero display line only.
        display: ["clamp(2.75rem, 1.6rem + 4.762vw, 4.5rem)", { lineHeight: "1.05", letterSpacing: "-0.02em", fontWeight: "800" }],
        // 32 → 40, 700. Marketing and legal page titles.
        h1: ["clamp(2rem, 1.814rem + 0.762vw, 2.5rem)", { lineHeight: "1.15", letterSpacing: "-0.01em", fontWeight: "700" }],
        // 28 → 32, 700. Docs page titles.
        "h1-docs": ["clamp(1.75rem, 1.657rem + 0.381vw, 2rem)", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }],
        // 24 → 28, 700.
        h2: ["clamp(1.5rem, 1.407rem + 0.381vw, 1.75rem)", { lineHeight: "1.25", fontWeight: "700" }],
        // 18 → 20, 650.
        h3: ["clamp(1.125rem, 1.079rem + 0.19vw, 1.25rem)", { lineHeight: "1.3", fontWeight: "650" }],
        // 16 / 400, line-height 1.6.
        body: ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        // 14 / 400.
        small: ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        // 12 / 600, 0.12em. Pair with `uppercase` (the Eyebrow component does).
        label: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.12em", fontWeight: "600" }],
      },
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
        action: "var(--color-action)",
        "action-hover": "var(--color-action-hover)",
        "on-action": "var(--color-on-action)",
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
        // Three surface levels and two interaction states; colors follow the active theme.
        "neu-raised": "6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)",
        "neu-raised-sm": "3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)",
        "neu-raised-hover": "2px 2px 4px var(--shadow-dark), -2px -2px 4px var(--shadow-light)",
        "neu-sunken": "inset 4px 4px 8px var(--shadow-dark), inset -4px -4px 8px var(--shadow-light)",
        "neu-sunken-subtle": "inset 2px 2px 4px var(--shadow-dark), inset -2px -2px 4px var(--shadow-light)",

        // Level-2 is reserved for the nested Blueprint orchestrator showcase.
        "neu-raised-l2": "12px 12px 24px var(--shadow-dark), -12px -12px 24px var(--shadow-light)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
