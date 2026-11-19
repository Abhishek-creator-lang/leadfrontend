## TL;DR

After style is recalculated, the browser may need to run **layout** (reflow: compute every affected box's geometry), **paint** (record drawing commands and rasterise pixels) and **composite** (assemble layers, usually on the GPU and off the main thread). Changing geometry (`width`, `top`, `font-size`) triggers all three. Changing only appearance (`color`, `background`) skips layout. Changing **`transform`** or **`opacity`** on an element with its own layer can be done by the **compositor alone**, which is why those are the properties to animate. **Layout thrashing** is interleaving DOM writes and layout reads in a loop, which forces synchronous layout repeatedly.

## The pipeline and what triggers it

| Change | Style | Layout | Paint | Composite |
|---|---|---|---|---|
| `width`, `height`, `margin`, `top`, `font-size`, adding DOM nodes | ✓ | ✓ | ✓ | ✓ |
| `color`, `background-color`, `box-shadow`, `visibility` | ✓ | – | ✓ | ✓ |
| `transform`, `opacity` (element on its own layer) | ✓ | – | – | ✓ |

Exact behaviour varies by engine (some paint properties are cheaper in some browsers), but the hierarchy holds.

## Layout thrashing (forced synchronous layout)

The browser batches style and layout work until it's needed. **Reading** a layout property (`offsetHeight`, `getBoundingClientRect()`, `scrollTop`, `getComputedStyle()` for layout-dependent values) after a **write** forces it to do the layout *now*. Doing it in a loop forces a layout per iteration:

```js
// Bad: read-write-read-write → N forced layouts
for (const el of items) {
  el.style.height = el.parentElement.offsetHeight / 2 + 'px';
}

// Good: batch reads, then batch writes → 1 layout
const heights = items.map(el => el.parentElement.offsetHeight);
items.forEach((el, i) => { el.style.height = heights[i] / 2 + 'px'; });
```

DevTools flags these as **"Forced reflow"** warnings with a purple layout block attached to your script. Libraries like FastDOM formalised the read/write batching pattern. Doing reads at the start of a `requestAnimationFrame` callback, before any writes, also helps.

## Smooth animations

```css
/* Janky: layout every frame */
.panel { transition: left 300ms; }

/* Smooth: compositor-only */
.panel { transition: transform 300ms; }
.panel.open { transform: translateX(0); }
```

- Animate `transform` and `opacity`. Use FLIP (First, Last, Invert, Play) to animate layout changes via transforms.
- Prefer CSS transitions, CSS animations or the Web Animations API. The browser can run compositor-eligible ones off the main thread, so they stay smooth even while JS is busy.
- `will-change: transform` hints that a layer should be created ahead of time. Apply it **sparingly** and ideally just before the animation. Every layer costs GPU memory, and thousands of layers ("layer explosion") make compositing slow, especially on mobile.
- `contain: layout paint` (or `content-visibility`) limits how far layout and paint invalidations spread.

## Diagnosing

- DevTools Performance panel: look for long purple (Layout) and green (Paint) blocks, and the "Layout shift" and "Forced reflow" insights.
- Rendering tab: **Paint flashing** and **Layer borders** show what repaints and what's layered.
- The Layers panel shows layer count and memory.

## Pitfalls

- Animating `height` for accordions. Use `transform: scaleY` with care, the `grid-template-rows: 0fr → 1fr` trick, or `interpolate-size` where it's supported (Chromium only so far).
- `will-change` on everything "for performance".
- Reading `getBoundingClientRect()` in scroll handlers. Use `IntersectionObserver` instead.
- Large DOMs: even a small change can force a big layout if nothing is contained.

## In an interview, mention…

- The style → layout → paint → composite pipeline and which properties hit which stage.
- Forced synchronous layout, the read/write batching fix, and how DevTools reveals it.
- Compositor-only animations, `will-change` costs, and containment.
