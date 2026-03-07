# Motion & Animation Standards

This document defines the animation system for OFFER-HUB. Movement should feel organic, purposeful, and enhance the user experience without being distracting.

## Animation Philosophy

1. **Organic Movement:** Animations should feel natural, not robotic
2. **Purposeful:** Every animation serves a functional purpose
3. **Consistent Timing:** Use standardized durations and easing functions
4. **Performance First:** Optimize for 60fps; use GPU-accelerated properties
5. **Respectful:** Honor `prefers-reduced-motion` for accessibility

---

## Timing Standards

### Duration Scale

| Duration | Value | Usage |
|:---------|:------|:------|
| `instant` | `100ms` | Micro-interactions (checkbox, toggle) |
| `fast` | `200ms` | Hover states, tooltips |
| `normal` | `300ms` | Dropdowns, popovers |
| `moderate` | `400ms` | Modals, cards, page transitions |
| `slow` | `600ms` | Complex animations, page loads |

**Default:** Use `400ms` for most animations.

### Easing Functions

| Easing | Curve | Usage |
|:-------|:------|:------|
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | **Primary:** Elements entering the screen |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Elements leaving the screen |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Elements moving within the screen |
| `linear` | `linear` | Continuous animations (spinners, progress) |

**Default:** Use `ease-out` for most animations.

---

## Standard Keyframes

All keyframes are defined in `globals.css` for consistency.

### 1. fadeInUp

**Usage:** Elements entering from below (cards, modals, toasts)

```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Application:**
```css
animation: fadeInUp 400ms ease-out;
```

**Example:**
```tsx
<div className="animate-[fadeInUp_400ms_ease-out]">
  Card Content
</div>
```

---

### 2. fadeIn

**Usage:** Simple opacity transitions (overlays, backdrops)

```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

**Application:**
```css
animation: fadeIn 300ms ease-out;
```

---

### 3. scaleIn

**Usage:** Modals, popovers, dropdowns

```css
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

**Application:**
```css
animation: scaleIn 300ms ease-out;
```

**Example:**
```tsx
<div className="animate-[scaleIn_300ms_ease-out]">
  Modal Content
</div>
```

---

### 4. slideInRight

**Usage:** Sidebars, drawers entering from right

```css
@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
```

**Application:**
```css
animation: slideInRight 400ms ease-out;
```

---

### 5. slideInLeft

**Usage:** Sidebars, drawers entering from left

```css
@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
```

---

### 6. spin

**Usage:** Loading spinners

```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

**Application:**
```css
animation: spin 1s linear infinite;
```

**Example:**
```tsx
<div className="animate-spin">
  <LoadingIcon />
</div>
```

---

### 7. pulse

**Usage:** Attention-grabbing elements (notifications, badges)

```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

**Application:**
```css
animation: pulse 2s ease-in-out infinite;
```

---

### 8. drawCheck

**Usage:** Success checkmarks (SVG path animation)

```css
@keyframes drawCheck {
  from {
    stroke-dashoffset: 100;
  }
  to {
    stroke-dashoffset: 0;
  }
}
```

**Application:**
```css
stroke-dasharray: 100;
animation: drawCheck 400ms ease-out forwards;
```

**Example:**
```tsx
<svg className="w-6 h-6">
  <path 
    className="animate-[drawCheck_400ms_ease-out_forwards]"
    strokeDasharray="100"
    d="M5 13l4 4L19 7"
  />
</svg>
```

---

## Staggered Animations

For lists and grids, stagger the entrance of child elements for a "waterfall" effect.

### Implementation

```tsx
{items.map((item, index) => (
  <div
    key={item.id}
    className="animate-[fadeInUp_400ms_ease-out]"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    {item.content}
  </div>
))}
```

**Delay Formula:** `100ms * index`

**Maximum Delay:** Cap at `500ms` to avoid excessive wait times

```tsx
style={{ animationDelay: `${Math.min(index * 100, 500)}ms` }}
```

---

## Page Transitions

### Route Changes

Use `fadeInUp` for new page content:

```tsx
<main className="animate-[fadeInUp_400ms_ease-out]">
  {children}
</main>
```

### Modal Entry/Exit

**Entry:** `scaleIn` with backdrop `fadeIn`

```tsx
{/* Backdrop */}
<div className="fixed inset-0 bg-black/50 animate-[fadeIn_300ms_ease-out]" />

{/* Modal */}
<div className="fixed inset-0 flex items-center justify-center">
  <div className="bg-background rounded-2xl p-8 animate-[scaleIn_300ms_ease-out]">
    Modal Content
  </div>
</div>
```

**Exit:** Use `opacity-0` with transition

```tsx
<div className={`
  transition-opacity duration-300
  ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
`}>
  Modal Content
</div>
```

---

## Hover Transitions

All interactive elements should have smooth hover transitions.

### Standard Hover

```css
transition: all 400ms ease-out;
```

**Properties to Transition:**
- `box-shadow` (neumorphic compression)
- `background-color` (button hover)
- `transform` (scale, translate)
- `opacity` (fade effects)

### Example: Button Hover

```tsx
<button className="
  bg-primary 
  text-white 
  rounded-xl 
  px-6 py-3
  shadow-raised
  hover:shadow-raised-hover
  hover:bg-primary-hover
  transition-all duration-400 ease-out
">
  Hover Me
</button>
```

### Example: Card Hover

```tsx
<div className="
  bg-background 
  rounded-2xl 
  p-6
  shadow-raised
  hover:shadow-raised-hover
  hover:-translate-y-1
  transition-all duration-400 ease-out
  cursor-pointer
">
  Card Content
</div>
```

---

## Loading States

### Skeleton Loaders

Use `pulse` animation for skeleton screens:

```tsx
<div className="animate-pulse">
  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
</div>
```

### Spinner

```tsx
<div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-primary"></div>
```

### Progress Bar

```tsx
<div className="w-full bg-gray-200 rounded-full h-2">
  <div 
    className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
    style={{ width: `${progress}%` }}
  ></div>
</div>
```

---

## Micro-Interactions

### Checkbox Check

```tsx
<input 
  type="checkbox" 
  className="
    appearance-none 
    w-5 h-5 
    border-2 border-gray-300 
    rounded 
    checked:bg-primary 
    checked:border-primary
    transition-all duration-200 ease-out
  "
/>
```

### Toggle Switch

```tsx
<button className={`
  relative w-12 h-6 rounded-full
  transition-colors duration-300 ease-out
  ${isOn ? 'bg-primary' : 'bg-gray-300'}
`}>
  <span className={`
    absolute top-1 left-1 w-4 h-4 bg-white rounded-full
    transition-transform duration-300 ease-out
    ${isOn ? 'translate-x-6' : 'translate-x-0'}
  `} />
</button>
```

---

## Special Animations

### 404 Page: Flicker Effect

```css
@keyframes flicker {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
```

**Usage:**
```tsx
<h1 className="animate-[flicker_2s_ease-in-out_infinite]">
  404
</h1>
```

### 404 Page: Lamp Swing

```css
@keyframes lampSwing {
  0%, 100% {
    transform: rotate(-3deg);
  }
  50% {
    transform: rotate(3deg);
  }
}
```

**Usage:**
```tsx
<div className="animate-[lampSwing_3s_ease-in-out_infinite]">
  🔦
</div>
```

---

## Performance Optimization

### GPU-Accelerated Properties

**Prefer animating:**
- `transform` (translate, scale, rotate)
- `opacity`

**Avoid animating:**
- `width`, `height` (causes reflow)
- `top`, `left` (use `transform: translate` instead)
- `margin`, `padding` (causes reflow)

### Will-Change Hint

For complex animations, hint the browser:

```css
will-change: transform, opacity;
```

**Warning:** Only use on actively animating elements; remove after animation completes.

---

## Accessibility: Reduced Motion

Always respect user preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Implementation:**
```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

<div className={prefersReducedMotion ? '' : 'animate-fadeInUp'}>
  Content
</div>
```

---

## Animation Checklist

When adding animations:

- [ ] Duration is from the standard scale (100-600ms)
- [ ] Easing function is appropriate (ease-out for entry)
- [ ] Animation serves a functional purpose
- [ ] Performance is optimized (transform/opacity only)
- [ ] Respects `prefers-reduced-motion`
- [ ] Staggered animations cap delay at 500ms
- [ ] Hover states have smooth transitions (400ms)
- [ ] Loading states use pulse or spin
- [ ] Keyframes are defined in `globals.css`

---

## Common Patterns

### Toast Notification

```tsx
<div className="
  fixed top-4 right-4
  bg-background 
  rounded-xl 
  p-4 
  shadow-raised
  animate-[fadeInUp_400ms_ease-out]
">
  Notification Content
</div>
```

### Dropdown Menu

```tsx
<div className="
  absolute top-full mt-2
  bg-background 
  rounded-xl 
  shadow-raised
  animate-[scaleIn_300ms_ease-out]
  origin-top
">
  Menu Items
</div>
```

### Modal

```tsx
{isOpen && (
  <>
    <div className="fixed inset-0 bg-black/50 animate-[fadeIn_300ms_ease-out]" />
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="
        bg-background 
        rounded-2xl 
        p-8 
        max-w-md 
        w-full
        animate-[scaleIn_300ms_ease-out]
      ">
        Modal Content
      </div>
    </div>
  </>
)}
```

---

## Examples in Code

### Staggered Card Grid

```tsx
<div className="grid grid-cols-3 gap-6">
  {cards.map((card, index) => (
    <div
      key={card.id}
      className="
        bg-background 
        rounded-2xl 
        p-6 
        shadow-raised
        animate-[fadeInUp_400ms_ease-out]
      "
      style={{ animationDelay: `${Math.min(index * 100, 500)}ms` }}
    >
      {card.content}
    </div>
  ))}
</div>
```

### Button with Hover

```tsx
<button className="
  bg-primary 
  text-white 
  rounded-xl 
  px-6 py-3
  shadow-raised
  hover:shadow-raised-hover
  hover:scale-105
  active:scale-95
  transition-all duration-400 ease-out
">
  Click Me
</button>
```

---

**Next Steps:**
- Apply animations to components in [Components Guide](./components.md)
- Review [Neumorphism Guide](./neumorphism.md) for shadow transitions
- See [Visual DNA](./visual-dna.md) for complete design system
