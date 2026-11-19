## TL;DR

Both limit how often a function runs in response to rapid events. **Debounce** waits until events **stop** for a given delay, then runs once (search-as-you-type, autosave, resize-end). **Throttle** runs **at most once per interval** while events keep coming (scroll position tracking, drag, rate-limited analytics). Debounce = "after the burst"; throttle = "steadily during the burst".

## Visualising it

```
events:    x x x x x x x x x        x x x
debounce:                    ▲              ▲   (fires after 300 ms of silence)
throttle:  ▲     ▲     ▲     ▲      ▲     ▲     (fires every 300 ms at most)
```

## Debounce implementation

```js
function debounce(fn, wait) {
  let timerId;
  function debounced(...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), wait);
  }
  debounced.cancel = () => clearTimeout(timerId);
  return debounced;
}

const search = debounce((q) => fetchResults(q), 300);
input.addEventListener('input', (e) => search(e.target.value));
```

Variants: **leading** (fire immediately on the first event, then ignore until quiet, good for preventing double-submits) and **maxWait** (guarantee execution at least every N ms during a long burst; Lodash's `debounce` supports both).

## Throttle implementation

```js
function throttle(fn, interval) {
  let last = 0;
  let timerId;
  let lastArgs;
  return function throttled(...args) {
    const now = Date.now();
    const remaining = interval - (now - last);
    lastArgs = args;
    if (remaining <= 0) {
      clearTimeout(timerId);
      timerId = undefined;
      last = now;
      fn.apply(this, args);
    } else if (!timerId) {
      // trailing call so the final state isn't lost
      timerId = setTimeout(() => {
        last = Date.now();
        timerId = undefined;
        fn.apply(this, lastArgs);
      }, remaining);
    }
  };
}

window.addEventListener('scroll', throttle(updateProgressBar, 100), { passive: true });
```

For visual updates, throttling to the frame rate with `requestAnimationFrame` is often better than a fixed interval:

```js
function rafThrottle(fn) {
  let scheduled = false;
  let lastArgs;
  return (...args) => {
    lastArgs = args;
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; fn(...lastArgs); });
  };
}
```

## Choosing

| Scenario | Use |
|---|---|
| Search suggestions, form validation on typing | Debounce (250–400 ms) |
| Autosave a draft | Debounce with `maxWait` |
| Window resize → recompute layout | Debounce, or rAF throttle for live updates |
| Scroll-linked UI, drag handlers, pointer tracking | Throttle / rAF |
| Infinite scroll trigger | Prefer `IntersectionObserver` over either |
| Prevent double submit | Leading-edge debounce or disable the button |

## Pitfalls

- **Creating a new debounced function on every render** (React) resets the timer each time, so it never fires. Create it once with `useMemo`/`useRef`, and cancel on unmount.
- **Stale closures**: the debounced callback captures old props/state; read latest values via refs.
- **Losing the last event**: a throttle without a trailing call can skip the final scroll position.
- **`this` and arguments**: forward them with `apply`.
- **Debouncing network calls isn't enough**: responses can still arrive out of order; abort the previous request or ignore stale results.
- **Accessibility**: very long debounce delays make interfaces feel unresponsive; give immediate feedback (a spinner, "searching…").
- Modern platform features often remove the need: `IntersectionObserver`, `ResizeObserver`, passive listeners, CSS scroll-driven animations, and React's `useDeferredValue` for expensive renders.

## In an interview, mention…

- One-sentence definitions and a use case for each.
- Leading/trailing options and `maxWait`.
- Implementation details: closures, timers, `this`/args forwarding, cancellation.
- Framework pitfalls (stable instances, cleanup) and observer-based alternatives.
