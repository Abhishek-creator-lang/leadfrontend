## Component architecture

- `App` owns the **list** of bars: `{ id, label }[]`. It knows nothing about progress.
- Each `ProgressBar` owns **its own timeline** in local state plus an effect. Bars are independent, so they don't need shared state.

This split is the main design decision. Keeping all the percentages in `App` would make every frame re-render every bar, and would mix "what exists" with "how far along it is". Contrast this with *Progress Bars III*, where pause and resume across bars do need centralised time.

Ids come from a ref counter, never from the array index. With index keys, removing a bar would hand one bar's state to another.

## Animation loop

```js
const step = (now) => {
  if (start === undefined) start = now;
  const next = Math.min(100, Math.round(((now - start) / duration) * 100));
  setPercent(next);
  if (next < 100) frame = requestAnimationFrame(step);
};
```

- **Time-based, not frame-based.** Adding 1% per frame runs at different speeds on 60 Hz and 120 Hz screens and stalls when frames drop. Computing from elapsed time is always correct.
- **Rounding** to whole percent means React bails out of renders whose value didn't change. That's at most about 100 renders per bar, not one per frame.
- **Cleanup** cancels the pending frame. That handles Clear, unmount and Strict Mode's mount, unmount and remount in development. The remount restarts the effect cleanly from 0, so the double invoke is harmless. That's the test of a correctly written effect.
- The loop stops by itself at 100%, so finished bars cost nothing.

## Background tabs

Browsers pause `requestAnimationFrame` in hidden tabs. Because progress comes from timestamps, the bar jumps to the right value when the tab becomes visible again. If the bar tracked a real download, progress would come from the network events instead, and rAF would only be used to smooth the display.

## CSS vs JS animation

A CSS alternative: mount at `scaleX(0)`, then on the next frame set `scaleX(1)` with `transition: transform 2s linear`. It's composited and costs no JavaScript per frame, but:

- `aria-valuenow` would be wrong (0 or 100) unless you also track time in JS.
- You need a forced reflow or a double rAF so the start state is painted before the transition.
- Pause, resume and concurrency limits (the follow-up parts) are much harder.

So JavaScript-driven state is the right default once behaviour matters. The fill still uses `transform: scaleX` so each paint is cheap.

## Accessibility

- Every bar is a labelled `role="progressbar"` with real `aria-valuenow`.
- The visible "42%"/"Done" text is `aria-hidden` to avoid double announcements. For production, add a polite live region announcing "Download 3 complete" when a bar finishes, rather than streaming every percent.
- Bars are in a `<ul>`, so screen readers announce "list, 3 items".
- Clear is disabled when there's nothing to clear.

## Scaling it

- **Hundreds of bars:** per-bar rAF loops add up. Move to one shared rAF loop (a small scheduler or store) that updates all active bars, or virtualise the list.
- **Real downloads:** progress comes from `XMLHttpRequest.upload.onprogress` or a streamed `fetch` body reader. The component then becomes purely presentational.
- **Reduced motion:** the animation *is* the information here, so keep it. You can drop easing.

## Follow-ups

- **Limit concurrency to 3:** see *Progress Bars II*.
- **Pause and resume:** see *Progress Bars III*.
- **Testing:** use short real waits wrapped in `act`, then assert `aria-valuenow` is between bounds. Don't assert exact values from timing-dependent code.
