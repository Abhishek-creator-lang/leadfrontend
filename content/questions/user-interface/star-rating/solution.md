## Pick the right primitive first

A rating is "choose one of N ordered options". That's a **radio group**. Building it on real `<input type="radio">` elements inside a `<fieldset>` gets you, for free:

- Arrow-key navigation that changes the selection, and one Tab stop for the whole group (native roving focus).
- Form participation (`name`/`value`), so it submits with a `<form>` and works with `FormData`.
- The correct screen-reader output: "Rate this recipe, group. 3 stars, radio button, checked, 3 of 5".

The inputs are visually hidden (clipped, *not* `display:none`, which would remove them from the accessibility tree and from focus). The `<label>` wraps each input, so clicking the star glyph checks the radio. The glyph is `aria-hidden` and a visually hidden "3 stars" gives each radio its name.

## State design

| State | Purpose |
|---|---|
| `value` | Committed rating, 0 = none |
| `hover` | Transient preview, 0 = not hovering |

`displayed = hover || value` is derived during render. Hover is a *preview*, so it never touches `value`. `onMouseLeave` sits on the star container rather than on each star, so moving between stars doesn't flicker back to the committed value.

## Accessibility details

- `fieldset` + `legend` name the group. `getByRole('group', { name })` finds it.
- Focus: hidden inputs can't show an outline, so `.star:has(input:focus-visible)` draws the ring on the visible star. `:has()` works in all modern browsers. A fallback is tracking focus in state.
- Colour plus fill state plus the text summary ("3 out of 5") together mean the meaning isn't carried by colour alone.
- Hover only previews; it has no keyboard equivalent and doesn't need one, since arrow keys commit directly.
- The Clear button only appears when there's something to clear. A radio group has no native "none" option once one is checked, so the separate button is the accessible way to reset.

## Edge cases

- `useId` provides a unique `name` per instance. Two ratings sharing a `name` would form one radio group, and checking a star in one would uncheck the other.
- `max` changes: stars re-render. Clamp `value` if it exceeds the new `max`.
- Touch devices: there's no hover, and `mouseenter` may fire on tap, which is harmless because the click commits right after.

## Variants interviewers ask about

- **Half stars:** use 10 radios with names like "3.5 stars", and render each star as two clickable halves (left and right labels overlaid on one glyph using `clip-path`). Or use a slider (`input type="range" step="0.5"`), which is arguably more accessible.
- **Read-only display (average 4.3):** don't use disabled radios. Render `<span role="img" aria-label="Rated 4.3 out of 5">` and draw a partially filled star with a gradient or a clipped overlay at `width: 30%`.
- **Why not `<span onClick>`?** No focus, no keyboard, no role, no form value. You'd have to rebuild radio semantics with `role="radiogroup"`/`role="radio"`, `aria-checked`, roving tabindex and arrow handling. That's doable (the APG radio pattern), but more code to get the same result.

## Productionizing

- Support a controlled `value`/`onChange` API for form libraries, and forward `name`/`required`.
- Theme with CSS custom properties (`--star-size`, `--star-color`) and use an SVG icon instead of the `★` glyph for consistent rendering across fonts.
- Testing: query radios by name and assert `checked`. Hover is tested by firing `mouseEnter` on the label.
