## TL;DR

Every DOM event dispatch has a **capture phase** that travels **from the `window` down through each ancestor to the target** before the event bubbles back up. Listeners only run during capture if you register them with **`{ capture: true }`** (or `true` as the third argument). Capturing is useful when an ancestor must see an event **before** descendants can react or stop it.

## How it works

```html
<div id="outer">
  <button id="btn">Click</button>
</div>
```

```js
const log = (label) => () => console.log(label);
outer.addEventListener('click', log('outer capture'), { capture: true });
outer.addEventListener('click', log('outer bubble'));
btn.addEventListener('click', log('button'));

// Click the button:
// outer capture → button → outer bubble
```

The dispatch path is computed once, when dispatch starts: `window → document → <html> → <body> → #outer → #btn`. The event then:

1. **Capture:** visits each ancestor top-down and runs listeners registered with `capture: true`.
2. **Target:** runs listeners on the target itself. Since modern browsers (Chrome 89+, aligned with the DOM spec), capture listeners on the target run before non-capture ones, regardless of registration order.
3. **Bubble:** walks back up and runs non-capture listeners, but only if `event.bubbles` is true.

## Why capture is useful

- **Events that don't bubble.** `focus`, `blur`, `mouseenter`, `load` on images and `scroll` on elements do not bubble, but they *do* go through the capture phase. A single capturing listener on a container can therefore observe focus for all descendants (or use `focusin`/`focusout`, which bubble).
- **Seeing events first.** Analytics, "click outside to close" logic and modal focus traps can listen in capture on `document`, so a child calling `stopPropagation()` in its bubble handler cannot hide the event.
- **Intercepting.** A capture listener on a container can call `stopPropagation()` to prevent descendants from ever receiving an event, for example to block interaction while a section is disabled. Use this sparingly, because it is invisible to whoever maintains the child code.

```js
// Close a popover on any outside pointer down, even if inner code stops propagation
document.addEventListener('pointerdown', (e) => {
  if (!popover.contains(e.target)) closePopover();
}, { capture: true });
```

## Pitfalls

- **Removing listeners needs the same capture flag.** `removeEventListener('click', fn)` does not remove a listener added with `{ capture: true }`. You must pass `{ capture: true }` again, because capture is part of the listener's identity. (`once`/`passive` are not.)
- Stopping propagation in capture breaks every component underneath. Prefer checking `e.target` and returning early.
- Frameworks: React exposes `onClickCapture` etc. Since React 17, React attaches its listeners to the root container rather than `document`, so native capture listeners on `document` still run before React's.

## In an interview, mention…

- Order: capture (top-down), target, bubble (bottom-up), with `event.eventPhase` being `1`, `2` or `3`.
- Capture is opt-in per listener and is the way to handle non-bubbling events at a container.
- Real use cases: outside-click detection, focus management, and guaranteeing a global handler runs before component code.
