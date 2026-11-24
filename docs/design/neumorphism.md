# Neumorphism Guide: The Physics of Light & Shadow

This document defines the neumorphic shadow system that gives OFFER-HUB its distinctive tactile, 2.5D aesthetic.

## What is Neumorphism?

Neumorphism (or "soft UI") is a design style that simulates physical depth through subtle shadows and highlights. Unlike flat design or traditional drop shadows, neumorphism creates the illusion that UI elements are **extruded from or pressed into** the background surface.

### Key Characteristics

1. **Dual Shadows:** Every element uses both a dark shadow and a light highlight
2. **Consistent Light Source:** All shadows originate from the same angle (135° top-left)
3. **Soft Edges:** Shadows are heavily blurred for a soft, organic feel
4. **Monochromatic Base:** Elements share the background color, differentiated only by shadows
5. **Tactile Feedback:** Hover and press states simulate physical interaction

---

## The Light Source

**OFFER-HUB uses a single, consistent light source positioned at 135° (top-left).**

```
        💡 Light Source (135°)
         ↘
    ┌─────────────┐
    │             │  ← Light highlight (top-left)
    │   Element   │
    │             │  ← Dark shadow (bottom-right)
    └─────────────┘
```

This creates:
- **Light highlight** on the top-left edge
- **Dark shadow** on the bottom-right edge

---

## Elevation States

OFFER-HUB uses two primary elevation states:

### 1. Raised (Elevated) Surface

**Used for:** Cards, primary buttons, status badges, panels

The element appears to **protrude from** the background.

#### Light Theme Physics

```css
box-shadow: 
  6px 6px 12px #d1d5db,    /* Dark shadow (bottom-right) */
  -6px -6px 12px #ffffff;  /* Light highlight (top-left) */
```

**Breakdown:**
- `6px 6px 12px #d1d5db`: Dark shadow offset 6px right and 6px down, 12px blur
- `-6px -6px 12px #ffffff`: Light highlight offset 6px left and 6px up, 12px blur

#### Dark Theme Physics

```css
box-shadow:
  6px 6px 12px #1a1a26,    /* Dark shadow (bottom-right) */
  -6px -6px 12px #2e2e3f;  /* Light highlight (top-left) */
```

**Note:** Dark theme shadows use the `--shadow-dark` (`#1a1a26`) and `--shadow-light` (`#2e2e3f`) tokens from `src/app/globals.css`.

---

### 2. Sunken (Inset) Surface

**Used for:** Input fields, text areas, pressed button states, wells

The element appears to be **pressed into** the background, creating a receptacle.

#### Light Theme Physics

```css
box-shadow: 
  inset 4px 4px 8px #d1d5db,    /* Inner dark shadow */
  inset -4px -4px 8px #ffffff;  /* Inner light highlight */
```

**Breakdown:**
- `inset` keyword reverses the shadow direction
- Smaller offset (4px) and blur (8px) for subtlety
- Creates a "well" or "pocket" effect

#### Dark Theme Physics

```css
box-shadow:
  inset 4px 4px 8px #1a1a26,
  inset -4px -4px 8px #2e2e3f;
```

---

## Interaction States

Neumorphic elements must respond to user interaction to maintain the tactile illusion.

### Hover State: Compression

When hovered, the element appears to be **pushed closer to the surface**, compressing the shadows.

```css
/* Default (Raised) */
box-shadow: 6px 6px 12px #d1d5db, -6px -6px 12px #ffffff;

/* Hover (Compressed) */
box-shadow: 2px 2px 4px #d1d5db, -2px -2px 4px #ffffff;
```

**Effect:** Shadows become smaller and tighter, simulating the user pressing the element.

**Transition:**
```css
transition: box-shadow 200ms ease-out;
```

### Focus State: Ring

Focused elements receive a colored ring to indicate keyboard focus.

```css
outline: 2px solid var(--color-primary);
outline-offset: 2px;
```

**Accessibility:** Never remove focus outlines without providing an alternative visual indicator.

### Active/Pressed State: Inset

When clicked, the element transitions to a sunken state.

```css
/* Active (Pressed) */
box-shadow: 
  inset 2px 2px 4px #d1d5db, 
  inset -2px -2px 4px #ffffff;
```

**Effect:** Element appears pressed into the surface.

---

## Curvature Standards

Border radius follows the Review bar — only these four radii are allowed:

| Radius | Value | Usage |
|:-------|:------|:------|
| `rounded-xl` | 12px | Controls (buttons, inputs, fields) |
| `rounded-2xl` | 16px | Inner cards, code, callouts, tables |
| `rounded-3xl` | 24px | Section cards |
| `rounded-full` | 9999px | Badges, avatars |

**Rule:** Use `rounded-2xl` (16px) for cards and `rounded-xl` (12px) for interactive elements.

---

## Color Relationships

Neumorphism works best with **monochromatic or near-monochromatic** color schemes.

### Background Color: `#F1F3F7`

This is the **neutral canvas** from which all shadows are calculated.

### Shadow Colors

**Dark Shadow:** `#d1d5db` (light mode) / `#1a1a26` (dark mode)
- Slightly darker than background
- Creates depth on bottom-right

**Light Highlight:** `#ffffff` (light mode) / `#2e2e3f` (dark mode)
- Lighter than background
- Creates lift on top-left

See the generated shadow token table in [Color Palette](./color-palette.md).

### Contrast Ratio

For accessibility, ensure text on neumorphic surfaces maintains at least:
- **4.5:1** for normal text
- **3:1** for large text (18px+)

**Solution:** Use `text-content-primary` (`#19213D` light / `#f1f3f7` dark) for sufficient contrast against the canvas.

---

## Implementation Examples

### Raised Card

```tsx
<div className="bg-bg-base rounded-2xl p-8 shadow-neu-raised hover:shadow-neu-raised-hover transition-shadow duration-200 ease-out">
  Card Content
</div>
```

### Primary Button

```tsx
<button className="bg-theme-primary text-content-primary rounded-xl px-6 py-3 shadow-neu-raised hover:shadow-neu-raised-hover active:shadow-neu-sunken-subtle transition-shadow duration-200 ease-out focus:outline-2 focus:outline-theme-primary focus:outline-offset-2">
  Click Me
</button>
```

### Input Field (Sunken)

```tsx
<input className="bg-bg-sunken text-content-primary rounded-xl px-4 py-3 shadow-neu-sunken placeholder:text-content-muted focus:outline-2 focus:outline-theme-primary focus:outline-offset-2 transition-shadow duration-200"
  placeholder="Enter text..."
/>
```

### Status Badge (Raised)

```tsx
<span className="inline-flex items-center bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-theme-success rounded-full px-3 py-1 text-sm font-medium shadow-neu-raised-sm">
  Active
</span>
```

---

## Shadow Utilities

The shadow utilities are `boxShadow` tokens in `tailwind.config.ts` — use the `shadow-neu-*` classes, never arbitrary `shadow-[...]` values or inline `boxShadow`:

| Utility | Value |
|:--------|:------|
| `shadow-neu-raised` | `6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light)` |
| `shadow-neu-raised-sm` | `3px 3px 6px var(--shadow-dark), -3px -3px 6px var(--shadow-light)` |
| `shadow-neu-raised-hover` | `2px 2px 4px var(--shadow-dark), -2px -2px 4px var(--shadow-light)` |
| `shadow-neu-sunken` | `inset 4px 4px 8px var(--shadow-dark), inset -4px -4px 8px var(--shadow-light)` |
| `shadow-neu-sunken-subtle` | `inset 2px 2px 4px var(--shadow-dark), inset -2px -2px 4px var(--shadow-light)` |
| `shadow-neu-raised-l2` | `12px 12px 24px var(--shadow-dark), -12px -12px 24px var(--shadow-light)` (nested product diagram only) |

**Usage:**
```tsx
<div className="shadow-neu-raised hover:shadow-neu-raised-hover transition-shadow duration-200">
  Content
</div>
```

---

## Common Mistakes

### ❌ DON'T: Use Flat Drop Shadows

```css
/* Wrong: Traditional drop shadow */
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
```

**Why:** Breaks the neumorphic illusion; doesn't simulate light physics.

### ❌ DON'T: Mix Light Sources

```css
/* Wrong: Inconsistent shadow directions */
.card-1 { box-shadow: 6px 6px 12px #d1d5db, -6px -6px 12px #fff; }
.card-2 { box-shadow: -6px 6px 12px #d1d5db, 6px -6px 12px #fff; }
```

**Why:** Destroys spatial consistency; confuses depth perception.

### ❌ DON'T: Use High Contrast Colors

```css
/* Wrong: High contrast background */
background: #FF0000;
box-shadow: 6px 6px 12px #d1d5db, -6px -6px 12px #ffffff;
```

**Why:** Neumorphism requires subtle, monochromatic palettes.

### ❌ DON'T: Skip Hover States

```css
/* Wrong: No interaction feedback */
.button {
  box-shadow: 6px 6px 12px #d1d5db, -6px -6px 12px #ffffff;
}
```

**Why:** Breaks the tactile illusion; users need feedback.

---

## Best Practices

### ✅ DO: Maintain Consistent Light Source

All shadows should originate from 135° (top-left) across the entire application.

### ✅ DO: Use Subtle Colors

Stick to the defined palette with `background` (#F1F3F7) as the base.

### ✅ DO: Provide Interaction Feedback

Every interactive element should have hover, focus, and active states.

### ✅ DO: Match Radius to the Review Bar

Use `rounded-2xl` (16px) for cards and `rounded-xl` (12px) for interactive elements. Only `rounded-xl`, `rounded-2xl`, `rounded-3xl`, and `rounded-full` are allowed.

### ✅ DO: Test Accessibility

Ensure sufficient contrast for text and interactive elements.

---

## Neumorphism Checklist

When creating neumorphic components:

- [ ] Uses dual shadows (dark + light)
- [ ] Light source is at 135° (top-left)
- [ ] Background color is `#F1F3F7` (light) or `#242433` (dark)
- [ ] Shadow colors are `#d1d5db` / `#ffffff` (light) and `#1a1a26` / `#2e2e3f` (dark)
- [ ] Border radius is one of `rounded-xl` (12px), `rounded-2xl` (16px), `rounded-3xl` (24px), `rounded-full`
- [ ] Hover state compresses shadows
- [ ] Focus state shows outline ring
- [ ] Active state uses inset shadow
- [ ] Transition duration is 200ms for hover/press
- [ ] Text contrast meets WCAG AA standards

---

## Advanced: Layered Neumorphism

For complex components, you can layer neumorphic elements:

```tsx
<div className="shadow-neu-raised rounded-2xl p-8">
  {/* Outer raised card */}

  <div className="shadow-neu-sunken rounded-xl p-4 mb-4">
    {/* Inner sunken section */}
    <input className="shadow-neu-sunken-subtle rounded-xl p-2" />
  </div>

  <button className="shadow-neu-raised rounded-xl px-6 py-3">
    {/* Raised button */}
  </button>
</div>
```

**Effect:** Creates depth hierarchy with multiple elevation levels.

---

## Dark Mode Considerations

When implementing dark mode:

1. **Adjust background:** Use dark base color `#242433` (elevated `#2e2e3f`, sunken `#1a1a26`)
2. **Shadow colors:** Dark shadow `#1a1a26`, light highlight `#2e2e3f` (the `--shadow-dark` / `--shadow-light` tokens)
3. **Test contrast:** Ensure text remains readable

**Example Dark Theme:**
```css
.shadow-neu-raised {
  box-shadow: 6px 6px 12px #1a1a26, -6px -6px 12px #2e2e3f;
}
```

---

**Next Steps:**
- Review [Motion & Animation](./motion.md) for transition standards
- See [Visual DNA](./visual-dna.md) for complete design system
