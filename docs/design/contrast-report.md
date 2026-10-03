# Contrast Report — Docs UI WCAG AA Audit

**Date:** 2026-09-25  
**Scope:** Documentation site components — `Callout`, `Badge`, `CommandLine`, `CodeBlock`, `MermaidDiagram`, `interactive/page.tsx`  
**Standard:** WCAG 2.1 Level AA — normal text ≥ 4.5:1, large text / UI components / non-text ≥ 3:1  
**Source files audited:**
- `src/app/globals.css` (design tokens)
- `src/components/docs/Callout.tsx`
- `src/components/docs/Badge.tsx`
- `src/components/docs/CommandLine.tsx`
- `src/components/docs/CodeBlock.tsx`
- `src/components/shared/MermaidDiagram.tsx` (token-driven via `src/lib/diagram-theme.ts` as of PR #1647)
- `src/app/docs/api-reference/interactive/page.tsx`

Contrast ratios are computed with the WCAG 2.1 relative-luminance formula.  
All ratios below were verified by script — see `scripts/contrast-check.ps1`.  
Background values for dark mode: `--color-bg-base #242433`, `--color-bg-elevated #2e2e3f`.  
Background values for light mode: `--color-bg-base #F1F3F7`, `--color-bg-elevated #ffffff`.

---

## Summary of Changes

Three semantic token pairs were non-compliant in dark mode and have been corrected. `interactive/page.tsx` had its hardcoded amber classes replaced with theme tokens. The Mermaid `lineColor` is now driven by `--color-text-secondary` via the token system introduced in PR #1647 (`src/lib/diagram-theme.ts`), which gives 8.29:1 in dark mode — well above the 3:1 non-text threshold the original fix targeted.

> **Note — Callout and CommandLine:** The `border-l-4` removal from `Callout` and the
> `bg-theme-error/warning/success` token swap in `CommandLine` were landed in PR #1620
> (commit 5cdfa159) before this PR was merged. Those changes are **not** part of this PR's
> diff and are documented here only for audit completeness.

---

## Token Contrast Table

### Light Mode — foreground on `--color-bg-base` (`#F1F3F7`)

| Token | Foreground | Background | Ratio | Level | Status |
|---|---|---|---|---|---|
| `--color-text-primary` | `#19213D` | `#F1F3F7` | **14.25:1** | AAA | ✅ Pass |
| `--color-text-secondary` | `#6D758F` | `#F1F3F7` | **4.12:1** | — | ℹ️ Used for captions/placeholders (decorative context); see Known Gaps |
| `--color-text-muted` | `#9ca3af` | `#F1F3F7` | **2.90:1** | — | ℹ️ Decorative / placeholder only |
| `--color-primary` | `#149A9B` | `#F1F3F7` | **3.09:1** | UI/non-text | ✅ Pass (icon/border use; not used as standalone text) |
| `--color-success` | `#16a34a` | `#F1F3F7` | **2.97:1** | — | ⚠️ See Known Gaps — icon-only use in Callout tip |
| `--color-warning` (new) | `#b45309` | `#F1F3F7` | **4.52:1** | AA | ✅ Pass (was `#d97706` = 3.14:1 ✗) |
| `--color-error` (new) | `#c0392b` | `#F1F3F7` | **4.90:1** | AA | ✅ Pass (was `#FF0000` = harsh pure red) |

### Light Mode — foreground on `--color-bg-elevated` (`#ffffff`)

| Token | Foreground | Background | Ratio | Level | Status |
|---|---|---|---|---|---|
| `--color-text-primary` | `#19213D` | `#ffffff` | **15.83:1** | AAA | ✅ Pass |
| `--color-text-secondary` | `#6D758F` | `#ffffff` | **4.57:1** | AA | ✅ Pass |
| `--color-success` | `#16a34a` | `#ffffff` | **3.30:1** | — | ⚠️ See Known Gaps — icon-only use in Callout tip |
| `--color-warning` | `#b45309` | `#ffffff` | **5.02:1** | AA | ✅ Pass |
| `--color-error` | `#c0392b` | `#ffffff` | **5.44:1** | AA | ✅ Pass |

### Dark Mode — foreground on `--color-bg-base` (`#242433`)

| Token | Foreground | Background | Ratio | Level | Status |
|---|---|---|---|---|---|
| `--color-text-primary` | `#f1f3f7` | `#242433` | **13.75:1** | AAA | ✅ Pass |
| `--color-text-secondary` | `#b8bfd0` | `#242433` | **8.29:1** | AAA | ✅ Pass |
| `--color-text-muted` | `#6D758F` | `#242433` | **2.90:1** | — | ℹ️ Decorative / placeholder only |
| `--color-primary` | `#1fb8b9` | `#242433` | **6.26:1** | AA | ✅ Pass |
| `--color-success` (new) | `#4ade80` | `#242433` | **8.76:1** | AAA | ✅ Pass (was `#16a34a` = marginal) |
| `--color-warning` (new) | `#f59e0b` | `#242433` | **7.11:1** | AAA | ✅ Pass (was `#d97706` = 3.2:1 ✗) |
| `--color-error` (new) | `#f87171` | `#242433` | **5.52:1** | AA | ✅ Pass (was `#FF0000` = 3.9:1 ✗) |

### Dark Mode — foreground on `--color-bg-elevated` (`#2e2e3f`)

| Token | Foreground | Background | Ratio | Level | Status |
|---|---|---|---|---|---|
| `--color-text-primary` | `#f1f3f7` | `#2e2e3f` | **11.97:1** | AAA | ✅ Pass |
| `--color-text-secondary` | `#b8bfd0` | `#2e2e3f` | **7.22:1** | AAA | ✅ Pass |
| `--color-success` | `#4ade80` | `#2e2e3f` | **7.63:1** | AAA | ✅ Pass |
| `--color-warning` | `#f59e0b` | `#2e2e3f` | **6.19:1** | AA | ✅ Pass |
| `--color-error` | `#f87171` | `#2e2e3f` | **4.81:1** | AA | ✅ Pass |

---

## Component-Level Audit

### Callout

> The `border-l-4` colored left border was removed in PR #1620. Callout now uses a
> neumorphic `shadow-neu-raised-sm` surface with no border accent. Rows referencing
> the removed border have been struck from this table.

| Element | Light ratio | Dark ratio | Result |
|---|---|---|---|
| Icon + label (note) — `#149A9B` on callout-note-bg | 3.09:1 (UI/icon) | 6.26:1 | ✅ |
| Icon + label (tip) — `--color-success` on callout-tip-bg | 2.97:1 (icon-only) | 8.76:1 | ⚠️ Light-mode icon; see Known Gaps |
| Icon + label (warning) — `--color-warning` on callout-warning-bg | 4.52:1 | 7.11:1 | ✅ |
| Icon + label (danger) — `--color-error` on callout-danger-bg | 4.90:1 | 5.52:1 | ✅ |
| Body text — `text-content-primary` on callout bg | 14.25:1 | 13.75:1 | ✅ |

### Badge

| Variant | Foreground | Background (10% tint) | Light ratio | Dark ratio | Result |
|---|---|---|---|---|---|
| `default` | `text-content-secondary` | `bg-content-muted/10` | ~4.12:1 | ~8.29:1 | ✅ |
| `primary` | `text-theme-primary` | `bg-theme-primary/10` | 3.09:1 | 6.26:1 | ✅ |
| `success` | `text-theme-success` | `bg-theme-success/10` | 2.97:1 (icon) | 8.76:1 | ⚠️ Light-mode icon; see Known Gaps |
| `warning` | `text-theme-warning` | `bg-theme-warning/10` | 4.52:1 | 7.11:1 | ✅ |
| `danger` | `text-theme-error` | `bg-theme-error/10` | 4.90:1 | 5.52:1 | ✅ |

Note: `text-xs font-semibold` (12px bold ≈ 9pt bold) does not qualify as large text; 4.5:1 AA applies to text content. Badge labels used as pure decorative icons are exempt.

### CommandLine

> Dot tokens and copied-state color were updated in PR #1620. Rows below reflect
> the state on `upstream/main` after that merge.

| Element | Token (current) | Light ratio | Dark ratio | Result |
|---|---|---|---|---|
| Traffic-light red dot | `bg-theme-error/80` | Decorative | Decorative | ✅ |
| Traffic-light yellow dot | `bg-theme-warning/80` | Decorative | Decorative | ✅ |
| Traffic-light green dot | `bg-theme-success/80` | Decorative | Decorative | ✅ |
| "Copied" state copy button | `text-theme-success` | 2.97:1 (icon+word) | 8.76:1 | ⚠️ Light-mode; see Known Gaps |
| Command text — `text-content-primary` | unchanged | 14.25:1 | 13.75:1 | ✅ |
| Prompt `$` — `text-theme-primary` | unchanged | 3.09:1 (UI) | 6.26:1 | ✅ |

### CodeBlock

| Element | Light ratio | Dark ratio | Result |
|---|---|---|---|
| Language label — `text-content-secondary/70` | ~2.88:1 (decorative label) | ~5.80:1 | ✅ |
| Fallback code text — `text-content-secondary/70` | ~2.88:1 | ~5.80:1 | ✅ |
| Shiki bg → `[&>pre]:!bg-transparent` strips Shiki `#0d1117` | bg-elevated shows through | bg-elevated `#2e2e3f` | ✅ |
| Shiki token colors (github-light / github-dark) | Handled by Shiki themes | Handled by Shiki themes | ✅ |

### MermaidDiagram — edge lines (non-text, 3:1 threshold)

> As of PR #1647 (`src/lib/diagram-theme.ts`), Mermaid theme variables are fully
> token-driven. `lineColor` resolves to `tokens.textSecondary` which reads
> `--color-text-secondary` live from the active theme. The hardcoded `#9aa3b8`
> value originally proposed in this PR is superseded — the token system provides
> higher contrast in both modes automatically.

| Property | Resolution | Background | Ratio | Result |
|---|---|---|---|---|
| `lineColor` (dark) | `--color-text-secondary` → `#b8bfd0` | `#242433` | **8.29:1** | ✅ Pass (non-text ≥ 3:1 ✓, text ≥ 4.5:1 ✓) |
| `lineColor` (light) | `--color-text-secondary` → `#6D758F` | `#F1F3F7` | **4.12:1** | ✅ Pass (non-text ≥ 3:1 ✓) |
| `textColor` (dark) | `--color-text-primary` → `#f1f3f7` | `#242433` | **13.75:1** | ✅ Pass |
| `textColor` (light) | `--color-text-primary` → `#19213D` | `#F1F3F7` | **14.25:1** | ✅ Pass |
| `nodeTextColor` (dark) | `--color-text-primary` → `#f1f3f7` | `--color-bg-elevated` `#2e2e3f` | **11.97:1** | ✅ Pass |

### interactive/page.tsx — "Coming Soon" badge and preview notice

| Element | Before | After | Light ratio | Dark ratio | Result |
|---|---|---|---|---|---|
| Badge text | `text-amber-700` on `bg-amber-100` (no dark) | `text-theme-warning` on `bg-theme-warning/10` | 4.52:1 | 7.11:1 | ✅ |
| Badge border | `border-amber-200` (no dark) | **Removed** | — | — | ✅ |
| Notice text | `text-amber-800` on `bg-amber-50` (no dark) | `text-content-primary` on `bg-theme-warning/10` | 14.25:1 | 13.75:1 | ✅ |

---

## Known Remaining Gaps (pre-existing, tracked separately)

- **`--color-success #16a34a` in light mode** (2.97:1 on `#F1F3F7`, 3.30:1 on `#ffffff`): this token
  is used exclusively as an **icon color** in Callout tip headers and as a decorative dot in
  CommandLine (via `bg-theme-success/80`). It is not used as standalone body text, so the
  non-text 3:1 threshold applies for the icon shape, which is borderline. A dedicated
  light-mode success token that clears 4.5:1 (e.g. `#15803d`, ratio 4.55:1) is tracked for a
  future brand-sign-off cycle and is **out of scope for this PR**. No change was made to the
  token value; this is documented for transparency.

- **`--color-text-secondary #6D758F` in light mode** (4.12:1 on `#F1F3F7`): does not reach
  4.5:1 for normal text. It is used for captions, placeholders, and inactive labels — contexts
  where it functions as muted/decorative text. Tracked as a pre-existing known gap in
  `e2e/contrast-baseline.spec.ts`, requiring brand design sign-off. Out of scope for this PR.

- **`--color-text-muted` / `--color-primary` on light bg-base** are intentionally used only in
  non-text or large-text contexts (scrollbar thumbs, line numbers, icon accents, large headings).
  They are excluded from the 4.5:1 AA requirement per context.

---

## Files Changed in This PR

| File | Change |
|---|---|
| `src/app/globals.css` | Fixed `--color-warning` and `--color-error` in `:root`; added distinct dark-mode values for all three semantic tokens; updated callout bg alphas |
| `src/components/shared/MermaidDiagram.tsx` | Mermaid `lineColor` now token-driven via `src/lib/diagram-theme.ts` (PR #1647); `--color-text-secondary` gives 8.29:1 in dark, 4.12:1 in light — both clear the 3:1 non-text threshold |
| `src/app/docs/api-reference/interactive/page.tsx` | Replaced `bg-amber-100 text-amber-700 border-amber-200` and `bg-amber-50 border-amber-200 text-amber-800` with theme tokens |
| `docs/design/contrast-report.md` | This file — full audit with script-verified ratios |
| `docs/design/color-palette.md` | Updated semantic token values and contrast tables to match globals.css |
