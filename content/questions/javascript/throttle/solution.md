## Approach

Model the throttle as a small state machine with two states:

- **Idle** (`timerId === null`): the next call runs immediately and opens a window.
- **Cooling down** (`timerId !== null`): calls only overwrite `pendingArgs` / `pendingThis`.

When the window's timer fires:

- If a call is pending, run it and **open a new window**. Without the new window, a call made right after the trailing call would also run immediately, which allows two calls inside one `wait`.
- If nothing is pending, go back to idle.

```js
function startWindow() {
  timerId = setTimeout(() => {
    if (pendingArgs) {
      const args = pendingArgs, ctx = pendingThis;
      pendingArgs = pendingThis = null;
      startWindow();          // open the next window first
      func.apply(ctx, args);  // then run the trailing call
    } else {
      timerId = null;         // idle
    }
  }, wait);
}
```

Opening the window **before** calling `func` means that if `func` throws, the throttle is still in a consistent state.

## Complexity

O(1) time and space per call. Only the latest pending arguments are kept.

## Edge cases

- **A single call:** runs once immediately, with no trailing call, because nothing is pending when the window closes.
- **A continuous stream of calls:** `func` runs at roughly `0, wait, 2·wait, ...`, each time with the most recent arguments. That's exactly what you want for scroll position or pointer tracking.
- **`this`:** the throttled function must be a regular `function`, and both the immediate and trailing calls must use `apply` with the right context.
- **`cancel()`:** clear the timer and the pending call, and set `timerId = null` so the next call is a fresh leading call.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Ignoring calls during the window (no trailing call) | The final position or value is lost, for example a scroll that stops mid-window |
| Running the trailing call with the **first** ignored arguments | Stale data |
| Not starting a new window after the trailing call | Two calls can happen within `wait` |
| Timestamp-only throttle (`if (now - last >= wait)`) | Simple, but has no trailing call, so the last event can be dropped |
| Arrow function as the returned function | Wrong `this` for methods |

## Throttle vs debounce

- **Throttle** guarantees a steady rate during continuous activity: scroll and resize handlers that update UI, drag-and-drop, `mousemove` analytics, rate-limited API calls.
- **Debounce** waits for activity to stop: search-as-you-type, autosave, validation after typing.
- **"Save" button:** neither, really. Disable the button while the request is in flight, or use a leading-edge throttle to block double-clicks.

## Throttling to frames

For visual updates, throttle to the display refresh with `requestAnimationFrame`: store the latest event, and schedule one rAF if none is pending. In the rAF callback, read the stored event and render. This aligns work with paint and pauses automatically in background tabs. Also consider **passive listeners** (`{ passive: true }`) for scroll/touch, and `IntersectionObserver` instead of scroll math where possible.

## Follow-ups

- **Options** `{ leading, trailing }` like lodash. `leading: false` means the first call only schedules. `trailing: false` means calls during the window are dropped. lodash builds `throttle` on `debounce` with `maxWait: wait` (see `debounce-ii`).
- **Returning a value:** return the result of the last invocation. Callers of a throttled function can't rely on it reflecting *their* call.
- **React:** create the throttled function once (`useMemo` or `useRef`) and cancel it in an effect cleanup.
