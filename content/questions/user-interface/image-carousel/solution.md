## State design

The only state is the **index of the current image**. Everything else (which `<img>` to render, which dot is active, the slide label) is derived from it during render.

```js
const [index, setIndex] = useState(0);
const wrap = (i, n) => ((i % n) + n) % n;
```

`wrap` is a modulo that works for negative numbers (`-1 % 5` is `-1` in JavaScript, not `4`), so "previous on the first slide" and "next on the last slide" are the same one-liner.

Two defensive details:

- **Clamp against the prop.** If the parent passes a shorter `images` array while you're on slide 7, `images[7]` is `undefined` and the render crashes. Computing `current = Math.min(index, count - 1)` during render avoids it without an effect.
- **Empty list.** Return an empty state rather than dividing by zero in `wrap`. Hooks are called before the early return so the hook order never changes.

## Accessibility (WAI-ARIA Carousel pattern)

| Element | Markup | Why |
|---|---|---|
| Container | `<section aria-roledescription="carousel" aria-label="Photo gallery">` | Screen readers announce "Photo gallery, carousel" instead of a generic region |
| Slide | `role="group" aria-roledescription="slide" aria-label="2 of 5"` | Gives position context; the image's own `alt` describes the content |
| Slide container | `aria-live="polite"` | Announces the new slide when the user presses Next. If you add autoplay, switch this to `off` while rotating, otherwise the screen reader talks constantly |
| Prev/next/dots | Real `<button>`s with `aria-label`, `aria-controls` | Icon-only buttons need names; glyphs are `aria-hidden` |
| Active dot | `aria-current="true"` | Conveys the selection without colour alone |

The APG also describes a "tabbed carousel" variant where the dots are a `tablist`. Plain buttons with `aria-current` are simpler and are an equally valid choice for a picker that doesn't own tab panels.

**Keyboard:** the buttons already work with Tab/Enter/Space. The `ArrowLeft`/`ArrowRight` handler is attached to the `<section>`, so it only fires when focus is inside the carousel and never hijacks page scrolling elsewhere.

**Alt text** is data, not decoration. A carousel of product photos with `alt=""` is a carousel of nothing for a screen-reader user.

## Edge cases

- One image: the controls still work (wrap to itself). You might hide them when `count === 1`.
- Duplicate `src` values would produce duplicate keys; in production use a stable `id` from the data.
- Layout shift while images load: `aspect-ratio: 16 / 9` on the viewport reserves space, and `object-fit: cover` handles images with other ratios.

## Performance and production

- **Preload neighbours.** Rendering only the current `<img>` keeps the DOM tiny, but the next image starts downloading only after the click. Preload `images[current ± 1]` with `new Image().src = …` in an effect, or render them hidden with `loading="lazy"`.
- **Responsive images.** Use `srcset`/`sizes` so phones don't download 2 000 px images.
- **Swipe** support on touch devices via Pointer Events (`pointerdown` → `pointermove` → threshold on `pointerup`), with `touch-action: pan-y` so vertical scrolling still works.
- **Autoplay** must pause on hover, on focus, and with a visible pause button (WCAG 2.2.2 Pause, Stop, Hide), and should be off when `prefers-reduced-motion: reduce`.

## Follow-ups

- **Controlled API:** accept `index`/`onIndexChange` so a parent can sync the slide to the URL.
- **Transitions:** see *Image Carousel II* for sliding animation and seamless infinite looping.
- **Testing:** query by role and name (`getByRole('button', { name: 'Next image' })`) and assert on the rendered `alt` text and `aria-current`, which tests what users perceive rather than class names.
