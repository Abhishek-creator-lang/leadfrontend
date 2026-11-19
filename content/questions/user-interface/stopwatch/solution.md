## The core idea: store timestamps, derive elapsed time

```js
elapsed = banked + (running ? now - startedAt : 0);
```

| State | Meaning |
|---|---|
| `banked` | Milliseconds from previous Start/Stop runs |
| `startedAt` | `performance.now()` at the latest Start, or `null` when stopped (so `running` is derived) |
| `now` | Latest frame timestamp. It exists only to trigger re-renders. |
| `laps` | Total elapsed time at each lap press |

**Why "add 10 ms every 10 ms" is wrong:** timers are a *minimum* delay. Under load, in background tabs (throttled to ≥ 1 s) or on slow devices, callbacks fire late or get dropped, and a counter silently loses time. With timestamps, the update loop only controls how often the display *refreshes*. The value is always exact, even if no frame ran for a minute.

## Display loop

`requestAnimationFrame` while running:

- It's synced to the display refresh, so there's no wasted work between paints and no tearing.
- It pauses in background tabs automatically (saves battery), and the first frame back shows the correct time.
- Cleanup cancels the frame on Stop and unmount.

`setInterval(…, 10)` also works if the value is timestamp-based, but it renders more often than the screen can paint and keeps running in the background.

`performance.now()` is monotonic: it never jumps when the system clock changes (NTP sync, DST, the user changing the time). `Date.now()` can jump backwards, which would show negative elapsed time.

The loop calls `performance.now()` itself instead of using rAF's timestamp argument. They're the same clock in browsers, but reading one source everywhere (start, stop, lap, frames) rules out mismatches.

## Laps

Store each lap's *end time* (total elapsed). A lap's own duration is derived: `end[i] − end[i−1]`. Storing durations instead loses information (the total at each lap) and makes "fastest/slowest lap" highlighting harder. The list is shown newest first (`reverse()` on a derived copy, never on state).

## Accessibility

- `role="timer"` on the display. It's implicitly `aria-live="off"`, which is what we want: screen readers don't announce every hundredth of a second. Users read it on demand.
- The buttons change their **labels** to describe the action (Start/Stop, Lap/Reset), and the button positions stay fixed so muscle memory works.
- Reset is disabled at zero.
- Laps are an ordered list labelled "Laps".
- Colours (green Start, red Stop) are backed by text.
- `tabular-nums` stops the digits jittering at 100 updates per second.
- **Keyboard shortcuts** (Space to start or stop, L for lap): attach on `document`, but ignore events whose target is an input, textarea or content-editable element, and document the shortcuts. WCAG 2.1.4 also requires single-key shortcuts to be remappable or disableable.

## Edge cases

- Formatting floors to centiseconds, so the display never shows a time that hasn't passed yet.
- Over an hour, `H:MM:SS.cc`.
- Start, Stop and Start again in quick succession: each run is banked exactly.
- Unmounting while running: cleanup cancels the frame. Persist `banked` and `startedAt` (as `Date.now()`, because `performance.now()` resets per page) to `localStorage` if the stopwatch should survive reloads.

## Scaling and productionizing

- Extract `useStopwatch()` returning `{ elapsed, running, laps, start, stop, lap, reset }`. The UI becomes trivial and the hook is testable.
- A `useReducer` makes transitions explicit (`START`, `STOP`, `LAP`, `RESET`) and lets you reject invalid ones, such as LAP while stopped.
- Many timers on one page: share a single rAF ticker.

## Follow-ups

- **Highlight the fastest and slowest laps:** derive the min and max from lap durations once there are at least 2 laps.
- **Countdown timer:** same model with `remaining = target − elapsed`, plus an announcement when it hits zero. That's where a live region does belong.
