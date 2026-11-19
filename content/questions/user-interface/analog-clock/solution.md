## Geometry

Everything is drawn in a 200 × 200 `viewBox` centred on (100, 100), so the clock scales to any `size`. Each hand is a vertical line from the centre pointing at 12 o'clock, rotated about the centre:

```jsx
<line x1="100" y1="100" x2="100" y2={100 - length} transform={`rotate(${angle} 100 100)`} />
```

Drawing every hand at 12 and rotating it avoids all trigonometry. The same trick places the 12 ticks (`rotate(i * 30)`).

## Angles

```js
const s = date.getSeconds();
const m = date.getMinutes() + s / 60;          // fractional minutes
const h = (date.getHours() % 12) + m / 60;     // fractional hours
hour = h * 30;  minute = m * 6;  second = s * 6;
```

- 360° / 12 hours = **30° per hour**. 360° / 60 = **6° per minute or second**.
- Using *fractional* minutes and hours is the requirement most solutions miss. Without it, the hour hand points straight at 3 all the way from 3:00 to 3:59, then jumps.
- `handAngles` is a pure exported function, so it's easy to unit-test with fixed dates (3:30 → hour 105°).

## Ticking

The `useNow` hook is the same as in the digital clock: a chained `setTimeout` aimed just past each whole second, so the second hand flips in step with the system clock and self-corrects after throttling. Cleanup clears the pending timeout.

## The 59 → 0 problem

If you animate the hands with a CSS `transition: transform`, going from 354° to 0° spins the hand **backwards** the whole way round. Fixes:

1. **Don't wrap the angle.** Keep it increasing (`totalSeconds * 6`, where `totalSeconds` counts from mount), so 59 → 60 is 354° → 360°.
2. Disable the transition for that one frame.
3. Skip transitions entirely and tick, as this solution does. That's also the most honest representation for `prefers-reduced-motion`.

## Smooth sweep

For a sweeping second hand, either:

- drive angles from `requestAnimationFrame` using milliseconds (`(s + ms/1000) * 6`), which means about 60 renders per second (fine for one clock, wasteful for many), or
- better: set the angle **once** and let a CSS `@keyframes` rotation run for 60 s linear infinite, with a negative `animation-delay` equal to the current seconds offset. It's composited and costs no JavaScript per frame. Resync occasionally, because CSS animation time can drift from the wall clock.

## Accessibility

- The `<svg>` has `role="img"` and an `aria-label` such as "Current time 3:45 PM". Children of `role="img"` are presentational, so screen readers don't read out a jumble of lines.
- The label is at minute precision and the clock is **not** a live region, so there's no announcement spam. It still updates every second, which is harmless.
- If visual users must read it precisely (an exam, a booking), pair the clock with a digital readout. Analog clocks are hard for many people to read.
- Contrast: dark hands on a white face. The red second hand is decorative.

## Time zones

Pass `timeZone` and compute hours, minutes and seconds with `Intl.DateTimeFormat(…, { timeZone, hour: 'numeric', hourCycle: 'h23', minute: 'numeric', second: 'numeric' }).formatToParts(now)`, rather than `getHours()`, which always uses the local zone.

## Scaling and productionizing

- Many clocks (a world-clock dashboard): one shared ticker through context or `useSyncExternalStore`, not one timer per clock.
- Memoise the static face (ticks and numerals) in its own component so only the hands re-render.
- SSR: the server time differs from the client's, so render the face only and add the hands after mount to avoid a hydration mismatch.
