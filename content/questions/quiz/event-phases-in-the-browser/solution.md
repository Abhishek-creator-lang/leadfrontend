## TL;DR

When a DOM event is dispatched, the browser computes the **propagation path** from `window` down to the target and then runs listeners in **three phases**: **1. capture** (from `window` down to the target's parent, for capture listeners), **2. target** (on the target itself), and **3. bubble** (from the target's parent back up to `window`, for non-capture listeners, only if the event bubbles). `event.eventPhase` reports which phase is running (`1`, `2`, `3`; `0` when not dispatching).

## Visualising the order

```html
<body>
  <section id="card">
    <button id="buy">Buy</button>
  </section>
</body>
```

```js
const log = (label) => (e) => console.log(label, e.eventPhase);

window.addEventListener('click', log('window capture'), true);
card.addEventListener('click', log('card capture'), true);
buy.addEventListener('click', log('buy capture'), true);
buy.addEventListener('click', log('buy bubble'));
card.addEventListener('click', log('card bubble'));
window.addEventListener('click', log('window bubble'));
```

Clicking the button logs:

```
window capture 1
card capture 1
buy capture 2     ← target phase
buy bubble 2      ← target phase
card bubble 3
window bubble 3
```

At the target, the spec runs **capture listeners first, then non-capture ones** (browsers aligned with this around 2021; before that, the target ran listeners purely in registration order).

## Details of each phase

**Capture:** opt in with `{ capture: true }`. Useful when an ancestor needs to see or intercept the event **before** descendants, and to observe events that don't bubble (`focus`, `blur`, `mouseenter`, `scroll` on elements).

**Target:** listeners on `event.target` itself. `event.currentTarget === event.target` here.

**Bubble:** the default phase for listeners and the basis of **event delegation**. Only happens if `event.bubbles` is `true`. Most UI events bubble (`click`, `input`, `keydown`, `submit`, `focusin`); some don't (`focus`, `blur`, `load`, `mouseenter`/`mouseleave`).

## Controlling propagation

```js
card.addEventListener('click', (e) => {
  e.stopPropagation();          // later nodes in the path won't get it
  // e.stopImmediatePropagation(); // also skip remaining listeners on this node
}, true);
```

Stopping during capture means the target never receives the event. Neither method affects the browser's **default action**. That's `preventDefault()`.

## Things that change the picture

- **The path is fixed at dispatch time.** Moving or removing elements in a handler doesn't change which nodes the event visits.
- **Shadow DOM:** events crossing a shadow boundary are **retargeted**. Outside listeners see the host element as `event.target`. `event.composedPath()` returns the full path (open shadow roots only), and `composed: false` events (many custom events by default) stop at the shadow root.
- **Custom events** don't bubble unless you pass `bubbles: true`.
- **React** listens at the root container and simulates both phases for its synthetic events (`onClick` / `onClickCapture`), so native listeners on inner elements run before React's bubble handlers.

## Pitfalls

- Expecting `stopPropagation` in a bubble handler to block a capture listener on an ancestor; the capture listener has already run.
- Overusing `stopPropagation`, which silently breaks analytics, outside-click logic and delegated handlers elsewhere.
- Forgetting that `removeEventListener` must match the capture flag.

## In an interview, mention…

- Capture → target → bubble, `eventPhase`, and which events don't bubble.
- `target` vs `currentTarget`, and how phases enable delegation and outside-click detection.
- Shadow DOM retargeting / `composedPath()` and the React root listener model as senior-level details.
