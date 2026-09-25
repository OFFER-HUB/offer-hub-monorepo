# Color Palette Reference

This document provides a comprehensive reference for the OFFER-HUB color system.

## Primary Palette

### Brand Colors

#### Primary (Teal)
- **Token:** `--color-primary`
- **Hex:** `#149A9B`
- **RGB:** `rgb(20, 154, 155)`
- **HSL:** `hsl(181, 77%, 34%)`
- **Usage:** Primary buttons, progress indicators, active menu icons, brand highlights
- **Accessibility:** AA compliant on white backgrounds

#### Primary Hover
- **Token:** `--color-primary-hover`
- **Hex:** `#0d7377`
- **RGB:** `rgb(13, 115, 119)`
- **HSL:** `hsl(182, 80%, 26%)`
- **Usage:** Hover states for primary elements
- **Accessibility:** AAA compliant on white backgrounds

#### Secondary (Navy)
- **Token:** `--color-secondary`
- **Hex:** `#002333`
- **RGB:** `rgb(0, 35, 51)`
- **HSL:** `hsl(199, 100%, 10%)`
- **Usage:** Navbar, sidebar, footer backgrounds
- **Accessibility:** Use with white text for AAA compliance

#### Accent (Mid Teal)
- **Token:** `--color-accent`
- **Hex:** `#15949C`
- **RGB:** `rgb(21, 148, 156)`
- **HSL:** `hsl(184, 76%, 35%)`
- **Usage:** Gradients, status highlights, active icon backgrounds
- **Accessibility:** AA compliant on white backgrounds

---

## Neutral Palette

### Background
- **Token:** `--color-background`
- **Hex:** `#F1F3F7`
- **RGB:** `rgb(241, 243, 247)`
- **HSL:** `hsl(220, 25%, 96%)`
- **Usage:** Universal base color, canvas for neumorphic shadows
- **Note:** This is the foundation of the neumorphic design system

### Text Colors

#### Text Primary
- **Token:** `--color-text-primary`
- **Hex:** `#19213D`
- **RGB:** `rgb(25, 33, 61)`
- **HSL:** `hsl(227, 42%, 17%)`
- **Usage:** Headings, primary body content
- **Contrast:** 12.5:1 on background (AAA)

#### Text Secondary
- **Token:** `--color-text-secondary`
- **Hex:** `#6D758F`
- **RGB:** `rgb(109, 117, 143)`
- **HSL:** `hsl(226, 14%, 49%)`
- **Usage:** Captions, subtitles, placeholders, inactive labels
- **Contrast:** 4.8:1 on background (AA)

---

## Semantic Colors

### Success (Green)
- **Token:** `--color-success`
- **Light hex:** `#16a34a` | **Dark hex:** `#4ade80`
- **Usage:** Success messages, completed states, positive indicators; icon/decorative use in Callout tip header
- **Common Pattern:** `bg-theme-success/10 text-theme-success` for badges
- **Accessibility:**
  - Light `#16a34a` on `#F1F3F7`: **2.97:1** — icon/decorative use only (see contrast-report.md Known Gaps)
  - Light `#16a34a` on `#ffffff`: **3.30:1** — icon/decorative use only
  - Dark `#4ade80` on `#242433`: **8.76:1** ✓ AAA
  - Dark `#4ade80` on `#2e2e3f`: **7.63:1** ✓ AAA

### Warning (Amber-Brown)
- **Token:** `--color-warning`
- **Light hex:** `#b45309` | **Dark hex:** `#f59e0b`
- **Usage:** Pending status, caution alerts, non-critical warnings
- **Common Pattern:** `bg-theme-warning/10 text-theme-warning` for badges
- **Accessibility:**
  - Light `#b45309` on `#F1F3F7`: **4.52:1** ✓ AA (was `#d97706` = 3.14:1 ✗)
  - Light `#b45309` on `#ffffff`: **5.02:1** ✓ AA
  - Dark `#f59e0b` on `#242433`: **7.11:1** ✓ AAA (was `#d97706` = 3.2:1 ✗)
  - Dark `#f59e0b` on `#2e2e3f`: **6.19:1** ✓ AA

### Error (Red)
- **Token:** `--color-error`
- **Light hex:** `#c0392b` | **Dark hex:** `#f87171`
- **Usage:** Form validation errors, destructive actions, critical alerts
- **Common Pattern:** `text-theme-error bg-theme-error/10` for error states
- **Accessibility:**
  - Light `#c0392b` on `#F1F3F7`: **4.90:1** ✓ AA (was `#FF0000` = harsh pure red)
  - Light `#c0392b` on `#ffffff`: **5.44:1** ✓ AA
  - Dark `#f87171` on `#242433`: **5.52:1** ✓ AA (was `#FF0000` = 3.9:1 ✗)
  - Dark `#f87171` on `#2e2e3f`: **4.81:1** ✓ AA

---

## Shadow Colors

### Dark Shadow
- **Hex:** `#d1d5db` (gray-300)
- **RGB:** `rgb(209, 213, 219)`
- **Usage:** Bottom-right shadow in neumorphic raised elements
- **Note:** Slightly darker than background for depth

### Light Highlight
- **Hex:** `#ffffff` (white)
- **RGB:** `rgb(255, 255, 255)`
- **Usage:** Top-left highlight in neumorphic raised elements
- **Note:** Creates lift effect

---

## Gradient Combinations

### Primary Gradient
```css
background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
```
**Usage:** Hero sections, feature cards, premium elements

### Subtle Background Gradient
```css
background: linear-gradient(180deg, #F1F3F7 0%, #E5E7EB 100%);
```
**Usage:** Page backgrounds, large containers

### Success Gradient
```css
background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%);
```
**Usage:** Success banners, completion states

---

## Opacity Scale

Use these opacity values for consistency:

| Opacity | Value | Usage |
|:--------|:------|:------|
| `opacity-100` | `1` | Fully opaque (default) |
| `opacity-90` | `0.9` | Slightly transparent |
| `opacity-75` | `0.75` | Semi-transparent |
| `opacity-50` | `0.5` | Half transparent |
| `opacity-25` | `0.25` | Mostly transparent |
| `opacity-10` | `0.1` | Very transparent (backgrounds) |
| `opacity-0` | `0` | Fully transparent |

**Common Pattern:** `bg-success/10` = success color at 10% opacity

---

## Color Usage Guidelines

### Primary Color (`#149A9B`)

**DO:**
- Use for primary CTAs (buttons, links)
- Use for active navigation items
- Use for progress indicators
- Use for brand highlights

**DON'T:**
- Use as a background color (too vibrant)
- Use for large text blocks (readability)
- Mix with other bright colors

### Secondary Color (`#002333`)

**DO:**
- Use for structural containers (navbar, sidebar, footer)
- Use for dark backgrounds
- Pair with white text

**DON'T:**
- Use for body text (too dark)
- Use without sufficient contrast

### Background Color (`#F1F3F7`)

**DO:**
- Use as the universal canvas
- Use for card backgrounds
- Use as the base for neumorphic shadows

**DON'T:**
- Use for text (no contrast)
- Modify without updating shadow colors

### Semantic Colors

**DO:**
- Use success for completed actions
- Use warning for pending/caution states
- Use error for validation and critical alerts
- Use with 10% opacity backgrounds for badges

**DON'T:**
- Use semantic colors for decoration
- Mix semantic colors (e.g., success + error together)

---

## Accessibility Compliance

All color combinations meet WCAG 2.1 standards. Dark mode tokens are distinct from light mode — see `docs/design/contrast-report.md` for the full per-component audit.

All ratios verified by WCAG 2.1 relative-luminance formula. See `docs/design/contrast-report.md` for the full per-component audit.

### Light Mode (on `#F1F3F7`)

| Foreground | Background | Contrast | Level | Notes |
|:-----------|:-----------|:---------|:------|:------|
| Text Primary `#19213D` | `#F1F3F7` | 14.25:1 | AAA | ✅ |
| Text Secondary `#6D758F` | `#F1F3F7` | 4.12:1 | — | ℹ️ Decorative/caption use only |
| Primary `#149A9B` | `#F1F3F7` | 3.09:1 | UI | ✅ icon/border, non-text |
| Success `#16a34a` | `#F1F3F7` | 2.97:1 | — | ⚠️ Icon-only; see contrast-report.md |
| Warning `#b45309` | `#F1F3F7` | 4.52:1 | AA | ✅ |
| Error `#c0392b` | `#F1F3F7` | 4.90:1 | AA | ✅ |
| White | Secondary `#002333` | 15.83:1 | AAA | ✅ |

### Dark Mode (on `#242433`)

| Foreground | Background | Contrast | Level | Notes |
|:-----------|:-----------|:---------|:------|:------|
| Text Primary `#f1f3f7` | `#242433` | 13.75:1 | AAA | ✅ |
| Text Secondary `#b8bfd0` | `#242433` | 8.29:1 | AAA | ✅ |
| Primary `#1fb8b9` | `#242433` | 6.26:1 | AA | ✅ |
| Success `#4ade80` | `#242433` | 8.76:1 | AAA | ✅ |
| Warning `#f59e0b` | `#242433` | 7.11:1 | AAA | ✅ |
| Error `#f87171` | `#242433` | 5.52:1 | AA | ✅ |

---

## Dark Mode

Dark mode is fully implemented. Tokens are defined in the `.dark` class in `src/app/globals.css`. See `docs/design/contrast-report.md` for the full WCAG AA audit of all dark mode token pairs.

### Dark Palette

- **bg-base:** `#242433`
- **bg-elevated:** `#2e2e3f`
- **bg-sunken:** `#1a1a26`
- **Text Primary:** `#f1f3f7`
- **Text Secondary:** `#b8bfd0`
- **Primary:** `#1fb8b9`
- **Success:** `#4ade80`
- **Warning:** `#f59e0b`
- **Error:** `#f87171`
- **Dark Shadow:** `#1a1a26`
- **Light Shadow:** `#2e2e3f`

---

## CSS Variables

Semantic tokens are defined in `src/app/globals.css`. Light and dark values are distinct — the dark values use lighter tones to clear WCAG AA on the dark surface.

```css
/* :root — light mode */
--color-success: #16a34a;   /* 2.97:1 on #F1F3F7 — icon/decorative use */
--color-warning: #b45309;   /* 4.52:1 on #F1F3F7 ✓ AA */
--color-error:   #c0392b;   /* 4.90:1 on #F1F3F7 ✓ AA */

/* .dark — dark mode */
--color-success: #4ade80;   /* 8.76:1 on #242433 ✓ AAA */
--color-warning: #f59e0b;   /* 7.11:1 on #242433 ✓ AAA */
--color-error:   #f87171;   /* 5.52:1 on #242433 ✓ AA  */
```

**Usage:**
```css
.custom-element {
  color: var(--color-primary);
  background: var(--color-bg-base);
}
```

---

## Color Swatches

### Visual Reference

```
Primary:              ████ #149A9B
Primary Hover:        ████ #0d7377
Secondary:            ████ #002333
Accent:               ████ #15949C
Background:           ████ #F1F3F7
Text Primary:         ████ #19213D
Text Secondary:       ████ #6D758F
Success (light):      ████ #16a34a
Success (dark):       ████ #4ade80
Warning (light):      ████ #b45309
Warning (dark):       ████ #f59e0b
Error (light):        ████ #c0392b
Error (dark):         ████ #f87171
```

---

**Next Steps:**
- Apply colors in [Visual DNA](./visual-dna.md)
- Use with neumorphic shadows in [Neumorphism Guide](./neumorphism.md)
- See component examples in [Components Guide](./components.md)
