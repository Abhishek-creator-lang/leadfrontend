Build a reusable `StarRating` input, like the one under a recipe or a product review.

## Requirements

1. Renders `max` stars (default **5**). The value starts at `defaultValue` (default **0**, meaning no rating).
2. **Click** a star to set the rating. Every star up to and including the chosen one is filled.
3. **Hover preview:** while the pointer is over a star, fill up to that star. When the pointer leaves the widget, go back to showing the actual value.
4. Show the result as text below the stars: "3 out of 5" or "Not rated".
5. A **Clear** button resets the value to 0. Hide or disable it when there's no rating.
6. Accessibility: it has to work as a form control.
   - Each star is a radio input whose accessible name is "1 star", "2 stars", and so on.
   - The group has a visible label ("Rate this recipe") via `fieldset`/`legend`.
   - Arrow keys change the rating (radios give you this) and the focused star shows a visible focus ring.
7. Call an optional `onChange(value)` whenever the value changes.

## Follow-up

- How would you support half stars?
- How would you render a **read-only** rating (for example 4.3 average) accessibly?
- Why not build it from `<span>`s with click handlers?
