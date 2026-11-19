## TL;DR

All three replace expensive polling or event handlers with **batched, asynchronous callbacks**. **`IntersectionObserver`** tells you when an element enters or leaves the viewport (or a scroll container) by a threshold: lazy loading, infinite scroll, impression tracking, scroll-triggered animation. **`ResizeObserver`** tells you when an element's **box size** changes, for any reason: responsive components, charts, virtualised rows. **`MutationObserver`** tells you when the **DOM tree or attributes** change: integrating with third-party DOM, editors, auditing. None of them should be used where a declarative CSS feature would do (container queries, `loading="lazy"`, `content-visibility`).

## Comparison

| | IntersectionObserver | ResizeObserver | MutationObserver |
|---|---|---|---|
| Watches | Visibility ratio vs root + `rootMargin` | Content box, border box or device-pixel box size | Child list, attributes, character data, optionally subtree |
| Callback timing | Asynchronous, during the rendering steps; low priority | In the rendering steps, after layout and before paint | **Microtask** after the DOM change |
| Replaces | `scroll` listeners + `getBoundingClientRect()` | `window.resize` + measuring | Deprecated Mutation Events |
| Cost | Very low; browser computes intersections | Low; but your callback can trigger more layout | Can be high with `subtree: true` on busy DOMs |

## Examples

```js
// Infinite scroll sentinel, loading a bit before it's visible
const io = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) loadNextPage();
}, { rootMargin: '600px 0px' });
io.observe(document.querySelector('#sentinel'));

// Chart that redraws when its container changes size
const ro = new ResizeObserver(entries => {
  for (const e of entries) {
    const { inlineSize, blockSize } = e.contentBoxSize[0];
    chart.resize(inlineSize, blockSize);
  }
});
ro.observe(chartContainer);

// Wait for a third-party widget to inject its button
const mo = new MutationObserver((records, obs) => {
  const btn = widgetRoot.querySelector('.vendor-cta');
  if (btn) { decorate(btn); obs.disconnect(); }
});
mo.observe(widgetRoot, { childList: true, subtree: true });
```

## Details worth knowing

- **IntersectionObserver** `threshold` can be an array (`[0, 0.5, 1]`). For ad viewability ("50% visible for 1 s"), combine it with a timer. **IntersectionObserver v2** (`trackVisibility`) checks whether the element is actually visible, not just intersecting (not covered or transparent), which helps fraud and clickjacking defence. It's Chromium-only.
- **ResizeObserver loop errors**: if your callback changes sizes that cause new observations at the same or shallower depth, the browser stops the loop for that frame and fires the "ResizeObserver loop completed with undelivered notifications" error. It's often benign but noisy in error trackers. Avoid feedback loops, or defer writes to the next frame.
- **MutationObserver** callbacks run as microtasks, batched per task, so you get many records at once. Keep handlers cheap and filter early. Observing `document.body` with `subtree: true` on a React app sees every render.
- Always **`disconnect()`** or `unobserve()` on teardown to avoid leaks. One shared observer instance for many elements is cheaper than one per element.

## When not to use them

- Element-size-based styling → **container queries**.
- Lazy images and iframes → `loading="lazy"`.
- Skipping off-screen render work → `content-visibility: auto`.
- Scroll-linked animation → CSS **scroll-driven animations** (`animation-timeline: view()`), which run off the main thread. Supported in Chromium and Safari 26; Firefox has it behind a flag, so treat it as an enhancement.

## In an interview, mention…

- What each observes, and that callbacks are batched and asynchronous (microtask for MutationObserver, rendering steps for the other two).
- Performance wins over scroll and resize listeners and the forced layout they caused.
- The ResizeObserver loop error, cleanup, and sharing observers.
- Preferring declarative CSS where it exists.
