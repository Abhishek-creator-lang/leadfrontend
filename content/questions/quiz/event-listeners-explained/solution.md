## TL;DR

An **event listener** is a function (or an object with `handleEvent`) registered on an **`EventTarget`** (elements, `document`, `window`, `XMLHttpRequest`, `WebSocket`, workers, `AbortSignal`…) with **`addEventListener(type, listener, options)`**. When an event of that type is dispatched, the browser calls the listener with an **`Event` object**. The options **`capture`, `once`, `passive` and `signal`** control phase, auto-removal, scroll performance and cleanup. Remove listeners you no longer need to avoid leaks.

## Basic usage

```js
const button = document.querySelector('#save');

function onSave(event) {
  console.log(event.type);           // 'click'
  console.log(event.currentTarget);  // the button
  console.log(event.target);         // innermost clicked element (e.g. an <svg> icon)
}

button.addEventListener('click', onSave);
button.removeEventListener('click', onSave); // same type + same function reference + same capture flag
```

Multiple listeners for the same event run in **registration order**. Adding the exact same function twice (same type and capture) is ignored.

## Options

```js
const controller = new AbortController();

window.addEventListener('scroll', updateProgress, {
  passive: true,              // promise not to call preventDefault → smooth scrolling
  signal: controller.signal,  // removed when controller.abort() is called
});

dialog.addEventListener('transitionend', cleanup, { once: true }); // auto-removed after first call

document.addEventListener('focus', trackFocus, { capture: true }); // run during the capture phase

controller.abort(); // removes every listener registered with this signal
```

- **`passive`:** browsers default `touchstart`, `touchmove` and `wheel` listeners on `window`/`document`/`body` to passive. Calling `preventDefault()` in a passive listener is ignored (with a console warning).
- **`signal`:** the cleanest way to remove many listeners at once, e.g. in a component's teardown.
- **`once`:** good for one-off events (`load`, `animationend`, the first user interaction).

## `addEventListener` vs `on*` properties

```js
button.onclick = handlerA;
button.onclick = handlerB;               // replaces handlerA
button.addEventListener('click', handlerA);
button.addEventListener('click', handlerB); // both run
```

`on*` properties allow only one handler and no options. Inline HTML attributes (`onclick="..."`) also conflict with Content Security Policy. Prefer `addEventListener`.

## Custom events

```js
const event = new CustomEvent('cart:updated', { detail: { count: 3 }, bubbles: true });
cartEl.dispatchEvent(event);

document.addEventListener('cart:updated', (e) => badge.textContent = e.detail.count);
```

`dispatchEvent` calls listeners **synchronously**, unlike browser-generated events, which arrive as tasks. Subclassing `EventTarget` gives any class a native event-emitter API.

## Patterns

- **Event delegation:** one listener on a container handles events from many (and future) children, via `event.target.closest(selector)`.
- **Throttle/debounce** high-frequency events (`scroll`, `resize`, `input`), or use `requestAnimationFrame`, `IntersectionObserver` and `ResizeObserver` instead of scroll/resize listeners.
- **Keep handlers short:** long handlers delay the next paint and hurt INP. Do the minimum, then defer the rest.

## Pitfalls

- **Removal requires the same reference:** `removeEventListener('click', () => …)` with a new arrow does nothing. The same goes for `fn.bind(this)` called twice.
- **Forgetting cleanup** in SPAs (listeners on `window`/`document` from unmounted components) causes leaks and duplicate handling.
- **`this` in arrows** is not the element; use `event.currentTarget`.
- **Listening too late:** registering a `load` listener after the event fired means it never runs. Check `document.readyState` for `DOMContentLoaded` cases.

## In an interview, mention…

- `addEventListener` signature and the four options, especially `passive` and `signal`.
- `target` vs `currentTarget`, propagation phases and delegation.
- Lifecycle hygiene: removal by reference, `AbortController` cleanup, and keeping handlers fast for INP.
