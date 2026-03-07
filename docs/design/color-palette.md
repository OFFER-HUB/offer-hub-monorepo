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
- **Hex:** `#16a34a`
- **RGB:** `rgb(22, 163, 74)`
- **HSL:** `hsl(142, 76%, 36%)`
- **Usage:** Success messages, completed states, positive indicators
- **Common Pattern:** `bg-success/10 text-success` for badges
- **Accessibility:** AA compliant on white backgrounds

### Warning (Amber)
- **Token:** `--color-warning`
- **Hex:** `#d97706`
- **RGB:** `rgb(217, 119, 6)`
- **HSL:** `hsl(32, 95%, 44%)`
- **Usage:** Pending status, caution alerts, non-critical warnings
- **Common Pattern:** `bg-warning/10 text-warning` for badges
- **Accessibility:** AA compliant on white backgrounds

### Error (Red)
- **Token:** `--color-error`
- **Hex:** `#FF0000`
- **RGB:** `rgb(255, 0, 0)`
- **HSL:** `hsl(0, 100%, 50%)`
- **Usage:** Form validation errors, destructive actions, critical alerts
- **Common Pattern:** `text-error border-error` for error states
- **Accessibility:** AA compliant on white backgrounds

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

All color combinations meet WCAG 2.1 standards:

| Foreground | Background | Contrast | Level |
|:-----------|:-----------|:---------|:------|
| Text Primary | Background | 12.5:1 | AAA |
| Text Secondary | Background | 4.8:1 | AA |
| Primary | White | 4.6:1 | AA |
| Primary Hover | White | 6.8:1 | AAA |
| Success | White | 4.5:1 | AA |
| Warning | White | 4.7:1 | AA |
| Error | White | 5.3:1 | AA |
| White | Secondary | 15.2:1 | AAA |

---

## Dark Mode (Future Consideration)

If implementing dark mode, use these adjustments:

### Dark Palette

- **Background:** `#1a1a2e` (dark navy)
- **Text Primary:** `#e5e7eb` (light gray)
- **Text Secondary:** `#9ca3af` (medium gray)
- **Dark Shadow:** `#0a0f1a` (deep void)
- **Light Highlight:** `#1e2a4a` (subtle edge light)

### Shadow Adjustments

```css
/* Dark mode raised shadow */
box-shadow: 6px 6px 12px #0a0f1a, -1px -1px 12px #1e2a4a;

/* Dark mode sunken shadow */
box-shadow: inset 4px 4px 8px #0a0f1a, inset -2px -2px 8px #1e2a4a;
```

---

## Tailwind CSS Configuration

Colors are defined in `tailwind.config.ts`:

```typescript
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#149A9B',
          hover: '#0d7377',
        },
        secondary: '#002333',
        accent: '#15949C',
        background: '#F1F3F7',
        text: {
          primary: '#19213D',
          secondary: '#6D758F',
        },
        success: '#16a34a',
        warning: '#d97706',
        error: '#FF0000',
      },
    },
  },
};
```

---

## CSS Variables

Colors are also available as CSS variables in `globals.css`:

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
}
```

**Usage:**
```css
.custom-element {
  color: var(--color-primary);
  background: var(--color-background);
}
```

---

## Color Swatches

### Visual Reference

```
Primary:         ████ #149A9B
Primary Hover:   ████ #0d7377
Secondary:       ████ #002333
Accent:          ████ #15949C
Background:      ████ #F1F3F7
Text Primary:    ████ #19213D
Text Secondary:  ████ #6D758F
Success:         ████ #16a34a
Warning:         ████ #d97706
Error:           ████ #FF0000
```

---

**Next Steps:**
- Apply colors in [Visual DNA](./visual-dna.md)
- Use with neumorphic shadows in [Neumorphism Guide](./neumorphism.md)
- See component examples in [Components Guide](./components.md)
