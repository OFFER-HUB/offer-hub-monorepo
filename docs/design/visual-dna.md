# Visual DNA: The OFFER-HUB Design Language

This document defines the complete visual identity and aesthetic principles of OFFER-HUB. Every visual decision in the project stems from these foundational rules.

## Design Philosophy: Modern Neumorphic Bento

OFFER-HUB utilizes a **Modern Neumorphic Bento** design system based on the principle of **"Soft Depth"**. The UI simulates a physical 2.5D surface shaped by light, shadow, and tactile feedback.

### Core Principles

1. **Tactile Realism:** Components feel like physical objects that can be pressed, raised, or sunken
2. **Consistent Light Source:** All shadows originate from a light at 135° (top-left)
3. **Soft Transitions:** Movements are organic with easing functions
4. **Premium Feel:** Every element should feel polished and high-end
5. **Functional Beauty:** Aesthetics serve usability, not decoration

---

## The Chromatic Blueprint

Every color in OFFER-HUB has a specific semantic role. These are defined as CSS variables in `src/app/globals.css` (`:root` for light mode, `.dark` for dark mode) and exposed as Tailwind utilities through `tailwind.config.ts` (Tailwind CSS 3.4).

### Core Palette

| Token | Hex Value | Biological Usage & Strategy |
|:------|:----------|:---------------------------|
| `primary` | `#149A9B` | **The Pulse:** Main brand color. Used for progress indicators, primary buttons, active menu icons, and brand-defining highlights. |
| `primary-hover` | `#0d7377` | **Feedback:** A darker shade for hover states to maintain contrast while indicating interactivity. |
| `secondary` | `#002333` | **Structure:** Deep-navy accent. Used for architecture-diagram labels and icon tints — not for the navbar or footer (the navbar is a canvas-colored floating pill, the footer is an elevated card). |
| `accent` | `#15949C` | **Energy:** Mid-tone teal used for gradients, status highlights, and active icon backgrounds. |
| `background` | `#F1F3F7` | **The Canvas:** The universal base color. All shadows are calculated using this as the "neutral" light state. |
| `text-primary` | `#19213D` | **Voice:** Deep navy for headings and primary body content. Optimized for legibility against the light canvas. |
| `text-secondary`| `#6D758F` | **Metadata:** Muted gray for captions, subtitles, placeholders, and inactive labels. |

### Semantic Colors

| Token | Hex Value | Usage |
|:------|:----------|:------|
| `success` | `#166534` (light) / `#4ade80` (dark) | **Affirmation:** Green tone representing completion. Use the tinted form `bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]` for badges and notifications — `bg-theme-success/10` emits no CSS in Tailwind 3. |
| `warning` | `#b45309` (light) / `#f59e0b` (dark) | **Caution:** Amber tone for pending status or non-critical system alerts. |
| `error` | `#c0392b` (light) / `#f87171` (dark) | **Termination:** Red for form validation errors and destructive actions. |

### Color Usage Rules

**DO:**
- Use `primary` for primary CTAs and active states
- Use `secondary` only for deep-navy accents (architecture diagrams, icon tints)
- Use `text-primary` for headings and body text
- Use `text-secondary` for metadata and placeholders
- Use semantic colors (`success`, `warning`, `error`) with a `color-mix(...)` tint for badges (never the `/10` opacity suffix, which emits no CSS in Tailwind 3)

**DON'T:**
- Use generic colors (plain red, blue, green) outside the palette
- Mix custom hex values; always use CSS variables
- Use `primary` for backgrounds (too vibrant)
- Use `error` for anything other than errors

---

## Typography System

### Font Stack

```css
font-family: var(--font-inter), Roboto, Outfit, sans-serif;
```

**Primary Font:** Inter (modern, clean, excellent readability)
**Monospace Font:** JetBrains Mono (code, `var(--font-jetbrains-mono)`)
**Fallbacks:** Roboto, Outfit, system fonts

### Type Scale

Each role is a Tailwind `fontSize` token in `tailwind.config.ts`. A token sets size, line height, weight and (for `label`) letter spacing in one class. The fluid sizes interpolate from the mobile value at 390px to the desktop value at 1440px.

| Token | Desktop | Mobile | Weight | Line height | Usage |
|:------|:--------|:-------|:-------|:------------|:------|
| `text-display` | 72px | 44px | 800 | 1.05 | Home hero display line only |
| `text-h1` | 40px | 32px | 700 | 1.15 | Page titles (marketing, legal) |
| `text-h1-docs` | 32px | 28px | 700 | 1.2 | Docs page titles |
| `text-h2` | 28px | 24px | 700 | 1.25 | Section headings |
| `text-h3` | 20px | 18px | 650 | 1.3 | Subsection and card headings |
| `text-body` | 16px | 16px | 400 | 1.6 | Main content |
| `text-small` | 14px | 14px | 400 | 1.5 | Captions, metadata |
| `text-label` | 12px | 12px | 600 | 1.4 | Uppercase labels and eyebrows, letter spacing 0.12em |

Nothing renders below 12px. `font-black` (900) is allowed only on the home display line; the target for that line is `text-display` (800).

### Page titles and eyebrows

- **`PageHeader`** (`src/components/shared/PageHeader.tsx`) renders every page title except the home hero. It takes an eyebrow, the title (the page's only `<h1>`), a lead, actions, `align` (`left` | `center`) and `size` (`page` | `docs`).
- **`Eyebrow`** (`src/components/shared/Eyebrow.tsx`) is the section label: `text-label uppercase` in `text-theme-primary-hover`. That token is 5.1:1 on `bg-base` in light mode, while `text-theme-primary` is only 3.2:1 at 12px.
- When merging classes, use `cn()` from `src/lib/cn.ts`. It registers the type-scale tokens with tailwind-merge, so `text-h1` is not dropped next to a text color.

### Typography Rules

**DO:**
- Use the type-scale tokens above (`text-display`, `text-h1`, `text-h2`, `text-h3`, `text-body`, `text-small`, `text-label`)
- Use `PageHeader` for page titles and `Eyebrow` for section labels
- Maintain consistent line heights for readability
- Use `text-content-primary` for headings, `text-content-secondary` for metadata

**DON'T:**
- Use weights 800–900 (`font-extrabold`, `font-black`) anywhere except the home display line
- Use arbitrary sizes such as `text-[10px]` or arbitrary letter spacing such as `tracking-[0.4em]`
- Mix multiple font families in the same view
- Use font sizes outside the defined scale
- Reduce line height below 1.2 (causes cramping)

---

## Spacing System

Based on an 8px grid for consistent rhythm.

| Token | Value | Usage |
|:------|:------|:------|
| `xs` | 4px | Icon padding, tight spacing |
| `sm` | 8px | Small gaps, compact layouts |
| `md` | 16px | Default component padding |
| `lg` | 24px | Section spacing |
| `xl` | 32px | Large container padding |
| `2xl` | 48px | Major section breaks |
| `3xl` | 64px | Hero spacing |

### Spacing Rules

**DO:**
- Use multiples of 8px for all spacing
- Maintain consistent padding within component types
- Use larger spacing for visual hierarchy
- Apply generous whitespace for premium feel

**DON'T:**
- Use arbitrary spacing values (e.g., 13px, 27px)
- Cram components together
- Mix spacing scales inconsistently

---

## Border Radius Standards

### Curvature Hierarchy

| Radius | Value | Usage |
|:-------|:------|:------|
| `rounded-xl` | 12px | **Controls:** buttons, inputs, fields |
| `rounded-2xl` | 16px | **Inner cards, code, callouts, tables** |
| `rounded-3xl` | 24px | **Section cards** |
| `rounded-full` | 9999px | **Badges, avatars** |

Only these four radii are allowed. No arbitrary radii.

### Radius Rules

**DO:**
- Use 24px for section cards and 16px for inner surfaces
- Use 12px for controls and pill radii for badges and avatars
- Match radius to component hierarchy
- Keep radius consistent within component families

**DON'T:**
- Use sharp corners (0px) except for specific design needs
- Mix radius values within the same component
- Use radius values outside the defined scale

---

## Elevation & Depth

OFFER-HUB uses a z-index scale for layering:

| Layer | Z-Index | Usage |
|:------|:--------|:------|
| Base | 0 | Default page content |
| Raised | 10 | Cards, panels |
| Dropdown | 100 | Dropdowns, popovers |
| Sticky | 500 | Sticky headers |
| Modal Backdrop | 1000 | Modal overlays |
| Modal | 1001 | Modal content |
| Toast | 2000 | Notifications |

---

## Responsive Design

### Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### Responsive Rules

**DO:**
- Design mobile-first
- Test all breakpoints
- Adjust spacing and typography for smaller screens
- Stack components vertically on mobile

**DON'T:**
- Assume desktop-only usage
- Use fixed pixel widths
- Hide critical content on mobile

---

## Accessibility

### Contrast Requirements

- **Normal text:** Minimum 4.5:1 contrast ratio
- **Large text (18px+):** Minimum 3:1 contrast ratio
- **Interactive elements:** Minimum 3:1 contrast ratio

### Accessibility Rules

**DO:**
- Provide focus states for all interactive elements
- Use semantic HTML
- Include ARIA labels where needed
- Test with keyboard navigation
- Ensure color is not the only indicator

**DON'T:**
- Rely solely on color for information
- Remove focus outlines without replacement
- Use low-contrast text
- Create keyboard traps

---

## Design Tokens (CSS Variables)

All design tokens are CSS variables in `src/app/globals.css` (`:root` for light mode, `.dark` for dark mode). `tailwind.config.ts` (Tailwind CSS 3.4) maps them to utilities — there is no `@theme` directive in this repo:

```ts
// tailwind.config.ts — theme.extend.colors (excerpt)
"theme-primary": "var(--color-primary)",
"theme-secondary": "var(--color-secondary)",
"bg-base": "var(--color-bg-base)",
"bg-elevated": "var(--color-bg-elevated)",
"bg-sunken": "var(--color-bg-sunken)",
"content-primary": "var(--color-text-primary)",
"content-secondary": "var(--color-text-secondary)",
"theme-success": "var(--color-success)",
"theme-warning": "var(--color-warning)",
"theme-error": "var(--color-error)",
"theme-border": "var(--color-border)",
```

```css
/* src/app/globals.css — :root (light mode) */
--color-primary: #149A9B;
--color-primary-hover: #0d7377;
--color-secondary: #002333;
--color-accent: #15949C;
--color-bg-base: #F1F3F7;
--color-bg-elevated: #ffffff;
--color-bg-sunken: #e8eaef;
--color-text-primary: #19213D;
--color-text-secondary: #6D758F;
--color-success: #166534;
--color-warning: #b45309;
--color-error: #c0392b;
```

Dark-mode values live in the `.dark` block of the same file (`--color-success: #4ade80`, `--color-warning: #f59e0b`, `--color-error: #f87171`, `--color-bg-base: #242433`, `--color-bg-elevated: #2e2e3f`, `--color-bg-sunken: #1a1a26`). The generated token tables in [Color Palette](./color-palette.md) list every token in both modes.

---

## Visual Consistency Checklist

When creating new components, ensure:

- [ ] Colors use CSS variables from the palette
- [ ] Typography follows the type scale
- [ ] Spacing uses 8px grid multiples
- [ ] Radius follows the 12 / 16 / 24 / pill role hierarchy
- [ ] Shadows follow neumorphic physics (see `neumorphism.md`)
- [ ] Animations use defined keyframes (see `motion.md`)
- [ ] Hover states provide clear feedback
- [ ] Focus states are visible and accessible
- [ ] Component matches the premium aesthetic
- [ ] Responsive behavior is tested

---

## Examples

### Primary Button
```tsx
<button className="bg-theme-primary text-content-primary rounded-xl px-6 py-3 shadow-neu-raised hover:shadow-neu-raised-hover transition-shadow duration-200 ease-out">
  Click Me
</button>
```

### Card Container
```tsx
<div className="bg-bg-base rounded-2xl p-8 shadow-neu-raised">
  Card Content
</div>
```

### Input Field
```tsx
<input
  className="bg-bg-sunken text-content-primary placeholder:text-content-muted rounded-xl px-4 py-3 shadow-neu-sunken"
  placeholder="Enter text..."
/>
```

---

**Next Steps:**
- Review [Neumorphism Guide](./neumorphism.md) for shadow physics
- See [Motion & Animation](./motion.md) for animation standards
