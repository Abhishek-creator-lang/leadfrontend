Build a reusable `ProgressBar` component, then use it in a small demo.

## Requirements

1. `ProgressBar` accepts `value` (a number), an optional `max` (default `100`) and a `label`.
2. The filled part's width shows `value / max` as a percentage. The percentage is also printed as text inside or next to the bar, rounded to a whole number ("42%").
3. **Clamp** out-of-range values: anything below 0 shows as 0% and anything above `max` shows as 100%.
4. Accessibility: expose it as a progress bar with `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and an accessible name from `label`.
5. If `value` is `null` or `undefined`, render an **indeterminate** bar (an animated stripe) with no `aria-valuenow`.
6. The demo `App` shows a bar with **−10%** and **+10%** buttons that change its value, starting at 30%.

## Follow-up

- Why not just use the native `<progress>` element?
- Animate the width smoothly. Which CSS property should you animate, and why?
- How would a screen-reader user learn that the progress changed?
