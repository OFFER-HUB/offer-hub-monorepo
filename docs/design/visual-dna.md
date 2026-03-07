# Visual DNA: The OFFER-HUB Design Language

This document defines the complete visual identity and aesthetic principles of OFFER-HUB. Every visual decision in the project stems from these foundational rules.

## Design Philosophy: Modern Neumorphic Bento

OFFER-HUB utilizes a **Modern Neumorphic Bento** design system based on the principle of **"Soft Depth"**. The UI simulates a physical 2.5D surface shaped by light, shadow, and tactile feedback.

### Core Principles

1. **Tactile Realism:** Components feel like physical objects that can be pressed, raised, or sunken
2. **Consistent Light Source:** All shadows originate from a light at 145° (top-left)
3. **Soft Transitions:** Movements are organic with easing functions
4. **Premium Feel:** Every element should feel polished and high-end
5. **Functional Beauty:** Aesthetics serve usability, not decoration

---

## The Chromatic Blueprint

Every color in OFFER-HUB has a specific semantic role. These are defined as CSS variables in Tailwind 4.

### Core Palette

| Token | Hex Value | Biological Usage & Strategy |
|:------|:----------|:---------------------------|
| `primary` | `#149A9B` | **The Pulse:** Main brand color. Used for progress indicators, primary buttons, active menu icons, and brand-defining highlights. |
| `primary-hover` | `#0d7377` | **Feedback:** A darker shade for hover states to maintain contrast while indicating interactivity. |
| `secondary` | `#002333` | **Structure:** High-density backgrounds. Used for the Top Navbar, Sidebar containers, and the Footer. Provides professional depth. |
| `accent` | `#15949C` | **Energy:** Mid-tone teal used for gradients, status highlights, and active icon backgrounds. |
| `background` | `#F1F3F7` | **The Canvas:** The universal base color. All shadows are calculated using this as the "neutral" light state. |
| `text-primary` | `#19213D` | **Voice:** Deep navy for headings and primary body content. Optimized for legibility against the light canvas. |
| `text-secondary`| `#6D758F` | **Metadata:** Muted gray for captions, subtitles, placeholders, and inactive labels. |

### Semantic Colors

| Token | Hex Value | Usage |
|:------|:----------|:------|
| `success` | `#16a34a` | **Affirmation:** Green tone representing completion. Used in `bg-success/10` for badges and notifications. |
| `warning` | `#d97706` | **Caution:** Amber tone for pending status or non-critical system alerts. |
| `error` | `#FF0000` | **Termination:** Pure red for form validation errors and destructive actions. |

### Color Usage Rules

**DO:**
- Use `primary` for primary CTAs and active states
- Use `secondary` for structural containers (navbar, sidebar, footer)
- Use `text-primary` for headings and body text
- Use `text-secondary` for metadata and placeholders
- Use semantic colors (`success`, `warning`, `error`) with 10% opacity backgrounds

**DON'T:**
- Use generic colors (plain red, blue, green) outside the palette
- Mix custom hex values; always use CSS variables
- Use `primary` for backgrounds (too vibrant)
- Use `error` for anything other than errors

---

## Typography System

### Font Stack

```css
font-family: 'Inter', 'Roboto', 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Primary Font:** Inter (modern, clean, excellent readability)  
**Fallbacks:** Roboto, Outfit, system fonts

### Type Scale

| Element | Size | Weight | Line Height | Usage |
|:--------|:-----|:-------|:------------|:------|
| H1 | 2.5rem (40px) | 700 | 1.2 | Page titles |
| H2 | 2rem (32px) | 600 | 1.3 | Section headers |
| H3 | 1.5rem (24px) | 600 | 1.4 | Subsection headers |
| H4 | 1.25rem (20px) | 500 | 1.4 | Card titles |
| Body | 1rem (16px) | 400 | 1.6 | Main content |
| Small | 0.875rem (14px) | 400 | 1.5 | Captions, metadata |
| Tiny | 0.75rem (12px) | 500 | 1.4 | Labels, badges |

### Typography Rules

**DO:**
- Use thin to medium weights (300-500) for body text
- Use semi-bold (600) for headings
- Maintain consistent line heights for readability
- Use `text-primary` for headings, `text-secondary` for metadata

**DON'T:**
- Use ultra-bold weights (800-900) except for hero text
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
| `rounded-2xl` | 16px | **Universal for high-level containers:** Bento cards, dashboard blocks, modals. Mathematically matched to shadow blur. |
| `rounded-xl` | 12px | **Universal for interactive elements:** Buttons, inputs, badges, dropdowns. |
| `rounded-lg` | 8px | Small cards, chips |
| `rounded-md` | 6px | Tiny elements, avatars |
| `rounded-full` | 9999px | Circular buttons, avatars |

### Radius Rules

**DO:**
- Use 16px for all major containers
- Use 12px for all interactive elements
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

All design tokens are defined in `globals.css` under the `@theme` directive:

```css
@theme {
  --color-primary: #149A9B;
  --color-primary-hover: #0d7377;
  --color-secondary: #002333;
  --color-accent: #15949C;
  --color-background: #F1F3F7;
  --color-text-primary: #19213D;
  --color-text-secondary: #6D758F;
  --color-success: #16a34a;
  --color-warning: #d97706;
  --color-error: #FF0000;
  
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}
```

---

## Visual Consistency Checklist

When creating new components, ensure:

- [ ] Colors use CSS variables from the palette
- [ ] Typography follows the type scale
- [ ] Spacing uses 8px grid multiples
- [ ] Border radius is 16px (containers) or 12px (interactive)
- [ ] Shadows follow neumorphic physics (see `neumorphism.md`)
- [ ] Animations use defined keyframes (see `motion.md`)
- [ ] Hover states provide clear feedback
- [ ] Focus states are visible and accessible
- [ ] Component matches the premium aesthetic
- [ ] Responsive behavior is tested

---

## Examples

### Primary Button
```css
background: var(--color-primary);
color: white;
padding: 12px 24px;
border-radius: 12px;
box-shadow: 6px 6px 12px #d1d5db, -6px -6px 12px #ffffff;
transition: all 400ms ease-out;

&:hover {
  background: var(--color-primary-hover);
  box-shadow: 2px 2px 4px #d1d5db, -2px -2px 4px #ffffff;
}
```

### Card Container
```css
background: var(--color-background);
padding: 32px;
border-radius: 16px;
box-shadow: 6px 6px 12px #d1d5db, -6px -6px 12px #ffffff;
```

### Input Field
```css
background: var(--color-background);
padding: 12px 16px;
border-radius: 12px;
box-shadow: inset 4px 4px 8px #d1d5db, inset -4px -4px 8px #ffffff;
color: var(--color-text-primary);

&::placeholder {
  color: var(--color-text-secondary);
}
```

---

**Next Steps:**
- Review [Neumorphism Guide](./neumorphism.md) for shadow physics
- See [Motion & Animation](./motion.md) for animation standards
- Check [Components](./components.md) for component specifications
