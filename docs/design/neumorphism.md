# Neumorphism Guide: The Physics of Light & Shadow

This document defines the neumorphic shadow system that gives OFFER-HUB its distinctive tactile, 2.5D aesthetic.

## What is Neumorphism?

Neumorphism (or "soft UI") is a design style that simulates physical depth through subtle shadows and highlights. Unlike flat design or traditional drop shadows, neumorphism creates the illusion that UI elements are **extruded from or pressed into** the background surface.

### Key Characteristics

1. **Dual Shadows:** Every element uses both a dark shadow and a light highlight
2. **Consistent Light Source:** All shadows originate from the same angle (145° top-left)
3. **Soft Edges:** Shadows are heavily blurred for a soft, organic feel
4. **Monochromatic Base:** Elements share the background color, differentiated only by shadows
5. **Tactile Feedback:** Hover and press states simulate physical interaction

---

## The Light Source

**OFFER-HUB uses a single, consistent light source positioned at 145° (top-left).**

```
        💡 Light Source (145°)
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
  6px 6px 12px #0a0f1a,    /* Deep void (bottom-right) */
  -1px -1px 12px #1e2a4a;  /* Soft edge light (top-left) */
```

**Note:** Dark theme uses a subtler light highlight to avoid over-brightening.

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
  inset 4px 4px 8px #0a0f1a, 
  inset -2px -2px 8px #1e2a4a;
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
transition: box-shadow 400ms ease-out;
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

Border radius is mathematically matched to shadow blur for visual harmony.

| Radius | Blur | Usage |
|:-------|:-----|:------|
| `16px` | `12px` | High-level containers (cards, panels) |
| `12px` | `8px` | Interactive elements (buttons, inputs) |
| `8px` | `6px` | Small components (chips, badges) |

**Rule:** Radius should be approximately 1.3x the shadow blur radius.

---

## Color Relationships

Neumorphism works best with **monochromatic or near-monochromatic** color schemes.

### Background Color: `#F1F3F7`

This is the **neutral canvas** from which all shadows are calculated.

### Shadow Colors

**Dark Shadow:** `#d1d5db` (gray-300)  
- Slightly darker than background
- Creates depth on bottom-right

**Light Highlight:** `#ffffff` (white)  
- Lighter than background
- Creates lift on top-left

### Contrast Ratio

For accessibility, ensure text on neumorphic surfaces maintains at least:
- **4.5:1** for normal text
- **3:1** for large text (18px+)

**Solution:** Use `text-primary` (#19213D) for sufficient contrast against `background` (#F1F3F7).

---

## Implementation Examples

### Raised Card

```tsx
<div className="
  bg-background 
  rounded-2xl 
  p-8
  shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]
  hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
  transition-shadow duration-400 ease-out
">
  Card Content
</div>
```

### Primary Button

```tsx
<button className="
  bg-primary 
  text-white 
  rounded-xl 
  px-6 py-3
  shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]
  hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
  active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]
  transition-all duration-400 ease-out
  focus:outline-2 focus:outline-primary focus:outline-offset-2
">
  Click Me
</button>
```

### Input Field (Sunken)

```tsx
<input className="
  bg-background 
  text-primary 
  rounded-xl 
  px-4 py-3
  shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]
  placeholder:text-secondary
  focus:outline-2 focus:outline-primary focus:outline-offset-2
  transition-all duration-300
" 
placeholder="Enter text..."
/>
```

### Status Badge (Raised)

```tsx
<span className="
  inline-flex items-center
  bg-success/10 
  text-success 
  rounded-lg 
  px-3 py-1
  text-sm font-medium
  shadow-[3px_3px_6px_#d1d5db,-3px_-3px_6px_#ffffff]
">
  Active
</span>
```

---

## CSS Utility Classes

For consistency, define reusable shadow utilities in `globals.css`:

```css
@layer utilities {
  .shadow-raised {
    box-shadow: 6px 6px 12px #d1d5db, -6px -6px 12px #ffffff;
  }
  
  .shadow-raised-hover {
    box-shadow: 2px 2px 4px #d1d5db, -2px -2px 4px #ffffff;
  }
  
  .shadow-sunken {
    box-shadow: inset 4px 4px 8px #d1d5db, inset -4px -4px 8px #ffffff;
  }
  
  .shadow-sunken-subtle {
    box-shadow: inset 2px 2px 4px #d1d5db, inset -2px -2px 4px #ffffff;
  }
}
```

**Usage:**
```tsx
<div className="shadow-raised hover:shadow-raised-hover transition-shadow">
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

All shadows should originate from 145° (top-left) across the entire application.

### ✅ DO: Use Subtle Colors

Stick to the defined palette with `background` (#F1F3F7) as the base.

### ✅ DO: Provide Interaction Feedback

Every interactive element should have hover, focus, and active states.

### ✅ DO: Match Radius to Shadow

Use 16px radius with 12px blur, or 12px radius with 8px blur.

### ✅ DO: Test Accessibility

Ensure sufficient contrast for text and interactive elements.

---

## Neumorphism Checklist

When creating neumorphic components:

- [ ] Uses dual shadows (dark + light)
- [ ] Light source is at 145° (top-left)
- [ ] Background color is `#F1F3F7` or close to it
- [ ] Shadow colors are `#d1d5db` (dark) and `#ffffff` (light)
- [ ] Border radius matches shadow blur (16px/12px or 12px/8px)
- [ ] Hover state compresses shadows
- [ ] Focus state shows outline ring
- [ ] Active state uses inset shadow
- [ ] Transition duration is 300-400ms
- [ ] Text contrast meets WCAG AA standards

---

## Advanced: Layered Neumorphism

For complex components, you can layer neumorphic elements:

```tsx
<div className="shadow-raised rounded-2xl p-8">
  {/* Outer raised card */}
  
  <div className="shadow-sunken rounded-xl p-4 mb-4">
    {/* Inner sunken section */}
    <input className="shadow-sunken-subtle rounded-lg p-2" />
  </div>
  
  <button className="shadow-raised rounded-xl px-6 py-3">
    {/* Raised button */}
  </button>
</div>
```

**Effect:** Creates depth hierarchy with multiple elevation levels.

---

## Dark Mode Considerations

When implementing dark mode:

1. **Adjust background:** Use dark base color (e.g., `#1a1a2e`)
2. **Reduce light highlight:** Use subtle highlight to avoid over-brightening
3. **Increase dark shadow:** Use deeper shadow for contrast
4. **Test contrast:** Ensure text remains readable

**Example Dark Theme:**
```css
@media (prefers-color-scheme: dark) {
  .shadow-raised {
    box-shadow: 6px 6px 12px #0a0f1a, -1px -1px 12px #1e2a4a;
  }
}
```

---

**Next Steps:**
- Apply neumorphic shadows to components in [Components Guide](./components.md)
- Review [Motion & Animation](./motion.md) for transition standards
- See [Visual DNA](./visual-dna.md) for complete design system
