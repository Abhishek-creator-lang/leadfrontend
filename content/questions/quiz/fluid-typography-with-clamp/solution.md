## TL;DR

`clamp(MIN, PREFERRED, MAX)` returns the preferred value, bounded by a minimum and a maximum. For fluid type you make the preferred value grow with the viewport (or container), such as `clamp(1.5rem, 1.1rem + 1.6vw, 2.5rem)`, so headings scale smoothly between breakpoints instead of jumping. The key accessibility rule: **always mix a `rem` component into the preferred value and keep min and max in `rem`**. A pure `vw` value **doesn't grow when the user zooms or raises their default font size**, which can fail WCAG 1.4.4 (Resize Text).

## Deriving the formula

Goal: 24px at a 360px viewport, growing linearly to 40px at a 1280px viewport.

```
slope     = (40 − 24) / (1280 − 360) = 0.01739  → 1.739vw
intercept = 24 − 0.01739 × 360       = 17.74px  → 1.109rem (at 16px root)

font-size: clamp(1.5rem, 1.109rem + 1.739vw, 2.5rem);
```

```css
:root {
  --step-0: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  --step-1: clamp(1.25rem, 1.1rem + 0.6vw, 1.6rem);
  --step-2: clamp(1.5rem, 1.109rem + 1.739vw, 2.5rem);
  --space-m: clamp(1rem, 0.8rem + 1vw, 1.75rem);
}
h1 { font-size: var(--step-2); }
.section { padding-block: var(--space-m); }
```

Generating these as **design tokens** (a type scale and a space scale, as tools like Utopia do) keeps the system consistent rather than hand-tuning each component.

## Container-relative fluid type

Inside components, use container query units so text scales with the component's slot, not the viewport:

```css
.card-slot { container-type: inline-size; }
.card h3 { font-size: clamp(1.1rem, 0.9rem + 3cqi, 1.6rem); }
```

## Accessibility pitfalls

1. **Pure viewport units.** `font-size: 4vw` ignores the user's font-size preference, and browser zoom has a limited effect on it. With the `rem` term in the preferred value, both zoom and default-size changes still enlarge text.
2. **Max too low.** WCAG 1.4.4 expects text to be resizable to **200%** without loss of content. If the `max` cap stops text growing, check that 200% zoom still produces at least double the size. Zoom also shrinks the CSS viewport, which *reduces* the `vw` part, so test it.
3. **Line length and height.** Fluid font sizes with fixed container widths change line length. Pair them with `max-inline-size: 65ch` and unitless `line-height`.
4. **Min too small on mobile.** Body text below ~16px hurts readability and triggers iOS Safari's zoom-on-focus for inputs under 16px.

## Other uses of `min()`, `max()` and `clamp()`

```css
.container { inline-size: min(100% - 2rem, 72rem); margin-inline: auto; }   /* gutter + cap */
.hero { min-block-size: max(50vh, 20rem); }
.grid { grid-template-columns: repeat(auto-fill, minmax(min(15rem, 100%), 1fr)); }
```

## Pitfalls

- Using `px` for min and max, which locks out user font preferences.
- A mix of one-off clamp values in every component instead of a token scale.
- Forgetting that `vw` includes the scrollbar width on desktop, a minor but real source of horizontal overflow when used for widths (`100vw`).

## In an interview, mention…

- How to derive slope and intercept, and generating a token scale.
- `rem + vw` in the preferred value for zoom and user preferences, and the WCAG 1.4.4 200% check.
- Container query units for component-level fluidity.
