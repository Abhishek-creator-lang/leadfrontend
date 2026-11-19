## Component design

`ProgressBar` is a **pure presentational component**: no state, just props in and markup out. Everything is derived:

```js
const current = clamp(value, 0, max);
const percent = Math.round((current / max) * 100);
```

Clamp *before* computing both the width and the ARIA values, so the visuals and the accessibility tree always agree. Also guard against `max <= 0`, which would otherwise mean dividing by zero, and against `NaN`.

## Accessibility

| Attribute | Value |
|---|---|
| `role="progressbar"` | Identifies the widget |
| `aria-valuenow` / `aria-valuemin` / `aria-valuemax` | Current value and range (in the caller's units, so `3` of `4` steps) |
| `aria-valuetext` | Human-friendly string ("75%"). Use it when units differ from a percentage, for example "Step 3 of 4". |
| `aria-labelledby` | Points at the visible label. Every progress bar needs a name. |

- The visible percentage text is `aria-hidden` because `aria-valuetext` already conveys it. Otherwise screen readers would read the number twice.
- **Indeterminate:** omit `aria-valuenow`. That's how ARIA (and `<progress>` without `value`) signals "busy, unknown duration".
- **Announcing changes:** screen readers don't reliably announce `aria-valuenow` changes on a progressbar unless it has focus. For long tasks, add a polite live region that announces milestones ("50% uploaded") rather than every tick, and announce completion.
- Animations respect `prefers-reduced-motion`, and a transparent outline keeps the track visible in Windows High Contrast mode.

## Why not `<progress>`?

`<progress value="42" max="100">` gives the role and values for free, and you should mention it first. Teams still build custom bars because `<progress>` styling needs vendor pseudo-elements (`::-webkit-progress-value`, `::-moz-progress-bar`), it can't hold children (labels, segments, a buffer bar) and indeterminate styling is inconsistent across browsers. A custom bar with full ARIA is a legitimate choice in a design system.

## Performance: animate `transform`, not `width`

Changing `width` triggers layout on every frame. `transform: scaleX()` with `transform-origin: left` is composited on the GPU, so it stays smooth even when the main thread is busy. The trade-off is that a scaled element's border radius distorts. If you need rounded fill ends, clip the fill with the track's `overflow: hidden` (as done here), or translate a full-width fill with `translateX(-(100 - p)%)`.

## Edge cases

- `value > max` and negative values are clamped. `NaN`, `null` and `undefined` all give the indeterminate state.
- Rounding: 99.6% shows as "100%" while the task isn't done. Some products floor the value instead, so the bar reads 100% only when it truly completes.
- RTL: set `transform-origin: right` under `[dir=rtl]`.

## Scaling it

- Variants via props or CSS variables: size, colour (success, warning, error), striped, buffered (a second, lighter fill for buffered video).
- For multi-step flows, a segmented bar or a stepper (`<ol>` with `aria-current="step"`) is often a better fit than a percentage.

## Follow-ups

- **"Make it fill over 3 seconds":** see *Progress Bars*. Drive the value from time with `requestAnimationFrame`, or let CSS animate it.
- **Testing:** query by role and name, then assert `aria-valuenow`. Never assert on inline style strings.
