## State design

- `now: Date` in a small `useNow()` hook, the only thing that changes over time.
- `use24h: boolean`, a display preference.
- The formatted strings are derived during render. Never store `"13:07:42"` in state.

Putting the ticking logic in `useNow()` keeps `App` declarative and lets any component (an analog clock, a countdown) reuse it.

## Ticking correctly

```js
const delay = 1000 - (Date.now() % 1000) + 5;
id = setTimeout(() => { setNow(new Date()); schedule(); }, delay);
```

Why not `setInterval(tick, 1000)`?

1. **Phase error.** If the component mounts at 12:00:00.900, an interval fires at .900 of every second, so the display lags the real clock by up to 900 ms. Side by side with the OS clock it visibly flips late.
2. **Drift and skips.** Intervals aren't exact. Callbacks run late under load and browsers clamp timers. A tick at 12:00:00.998 followed by one at 12:00:02.003 skips :01 entirely.

Scheduling each tick for *just after the next whole second* fixes both: the display flips within a few milliseconds of the system clock, and any lateness is corrected on the next tick because the delay is recomputed every time. The `+5` ms guards against waking at .999 and rendering the old second.

Cleanup clears the pending timeout. The recursive `schedule` always stores the latest id, so there's only ever one timer.

**Background tabs:** browsers throttle timers in hidden tabs (to 1 s or more). When the tab becomes visible again, the next tick corrects the time because we always read `new Date()` rather than incrementing a counter. Never count ticks to compute time.

## Formatting

- 12-hour conversion: `h % 12 === 0 ? 12 : h % 12` handles midnight (12 AM) and noon (12 PM), the classic off-by-one.
- Manual formatting gives a precise, testable output. For real users, prefer `Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12 })`. Locales differ in separators, AM/PM markers ("a.m.", "午後") and default cycles (`hourCycle: 'h23' | 'h12'`). The date line already uses `Intl` with `dateStyle: 'full'` in the user's locale.
- `font-variant-numeric: tabular-nums` makes every digit the same width, so `11:11:11` and `10:00:00` take up identical space and nothing jiggles.

## Accessibility

- `<time dateTime="13:07:42">` gives machines (and some assistive tech) an unambiguous value.
- **No `aria-live`.** A clock announcing every second makes a screen reader unusable. `role="timer"` is technically appropriate, but it's implicitly `aria-live="off"`, and its main benefit is semantic. Users read the clock when they want to.
- The toggle is a real button with `aria-pressed`, and a constant label describing the mode it enables.
- For a large-text display, `clamp()` scales with the viewport and remains zoomable.

## Edge cases

- DST changes and the user changing the system time: handled, because each tick reads the real clock.
- Server rendering: `new Date()` on the server differs from the client, which causes a hydration mismatch. Render a placeholder on the server, set the time in an effect, or use `suppressHydrationWarning` on the `<time>`.

## Performance and scaling

- One state update per second is trivial. If many components show the time, share one ticker (a context or an external store with `useSyncExternalStore`) instead of N timers.
- If you only show minutes, schedule ticks on the minute boundary instead. Don't re-render 60 times for nothing.

## Follow-ups

- **Time zones:** a world clock uses `Intl.DateTimeFormat(…, { timeZone: 'Asia/Tokyo' })`, with `now` still shared.
- **Seven-segment display:** draw each digit from a 7-bit mask with CSS or SVG segments. Give the container an `aria-label` with the time and mark the segments `aria-hidden`.
