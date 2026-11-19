## From "swap the image" to "move the track"

Part I rendered one `<img>` and replaced it. You can't animate between two things when only one exists, so the slide strip becomes a **track**: a flex row where every slide is `flex: 0 0 100%` and the track moves with `transform: translateX(-pos × 100%)`. `transform` is composited by the GPU, so it animates smoothly without triggering layout (unlike animating `left` or `margin`).

## The seamless loop: clones plus a silent jump

A naive version animates from slide 5 back to slide 1 by sliding *backwards through all of them*. The standard fix:

```
track:  [5'] [1] [2] [3] [4] [5] [1']
pos:     0    1   2   3   4   5   6
```

1. Next on slide 5 animates to `pos = 6`, the clone of 1. Visually it's identical to slide 1, so it looks like a forward wrap.
2. When the transition ends, turn the transition **off** and set `pos = 1`. Same pixels, different position, nobody notices.
3. The next click turns the transition back on and animates normally.

Previous on slide 1 is the mirror image: animate to `pos = 0` (the clone of 5), then jump to `pos = 5`.

State is just two values:

```js
const [pos, setPos] = useState(1);          // index in the track
const [animating, setAnimating] = useState(false);
const current = wrap(pos - 1, count);       // derived: real image index
```

The dots, slide label and `aria-current` all derive from `current`, so they can't drift out of sync with what's on screen.

## Robustness: the details interviewers probe

- **Rapid clicks.** While `animating` is true, clicks are ignored. Without this guard a fast double-click goes to `pos = 7`, which doesn't exist, and the track shows empty space. Queuing clicks instead of ignoring them is a nice follow-up, but ignoring is the safe minimum.
- **`transitionend` is not guaranteed.** It doesn't fire if the transition is cancelled, if the element is `display: none`, or if the computed value didn't actually change. An effect starts a `DURATION + 100 ms` timeout whenever `animating` turns true and calls the same `finish`. `finish` is idempotent (functional `setPos`), so calling it twice is harmless, and the effect cleanup clears the timer on unmount.
- **Bubbling.** `transitionend` bubbles. Check `e.target === e.currentTarget` and `e.propertyName === 'transform'` so a hover transition on a child doesn't end the slide early.
- **Same-target clicks.** Clicking the active dot would set `animating` with no transition to end it; `targetPos === pos` returns early.
- **Turning the transition off and on.** The silent jump renders with `transition: none`. Because the user's next click happens in a later frame, the browser has already committed the jump, so re-enabling the transition animates from the right place. If you ever need to do both in the same tick (e.g. autoplay), force a reflow (`el.offsetWidth`) or wait a `requestAnimationFrame` between them.

## Reduced motion

`usePrefersReducedMotion` reads `matchMedia('(prefers-reduced-motion: reduce)')` and subscribes to changes (with cleanup). When it's on, `moveTo` snaps directly to the real slide (`wrap(target - 1) + 1`), never visits a clone and never sets `animating`. WCAG 2.3.3 asks for motion triggered by interaction to be disable-able; honoring the OS setting is the expected baseline.

## Accessibility

- Off-screen slides and both clones get `aria-hidden="true"`. Clones also have `alt=""` and no `role`, so a screen-reader user never hears "Northern lights" twice or "6 of 5".
- The slides contain no focusable content here. If they did (a "Shop now" link), `aria-hidden` alone would leave a focusable element inside a hidden subtree, which is an a11y violation; use the `inert` attribute on non-active slides instead (React 19 supports `inert` as a boolean prop; in React 18 set `inert=""`).
- Everything from part I stays: `aria-roledescription`, `"N of M"` labels, named buttons, `aria-current` dot, arrow keys scoped to the section, `aria-live="polite"`.

## Performance and production

- All images are now in the DOM. Use `loading="lazy"` for slides far from the current one, plus `srcset`/`sizes`, and `decoding="async"`.
- `will-change: transform` promotes the track to its own layer; don't sprinkle it everywhere because each layer costs memory.
- For many slides (dozens), only render a window around the current one (current ± 2) plus the clones.
- Swipe: track pointer movement and set the transform directly (with the transition off) while dragging, then snap on release based on distance and velocity. Use `touch-action: pan-y` and `setPointerCapture`.

## Alternatives worth mentioning

- **CSS scroll snap** (`scroll-snap-type: x mandatory`) gives native swipe, momentum and keyboard scrolling for free, but true infinite looping still needs clone tricks plus scroll-position resets.
- **Web Animations API** (`el.animate(...)` returns an `Animation` with a `finished` promise), which removes the `transitionend` fragility.

## Follow-ups

- Autoplay with pause on hover/focus and a visible pause/play button; set `aria-live="off"` while it's rotating.
- Show peeking neighbours (each slide 80% wide) — the clone count then needs to cover the visible neighbours too.
- Variable-width slides: positions come from measured offsets (`offsetLeft`) instead of `pos × 100%`.
