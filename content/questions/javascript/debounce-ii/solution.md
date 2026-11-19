## Mental model

Think in terms of **bursts** with three possible invocation points:

```
calls:      x  x x   x  x   x                (quiet ≥ wait)
leading:    ▲
maxWait:             ▲ (every maxWait ms while the burst continues)
trailing:                                   ▲
```

State kept in the closure:

| Variable | Purpose |
|---|---|
| `waitTimer` | the "quiet period" timer. `null` means idle (no burst) |
| `maxTimer` | the periodic `maxWait` timer, only during a burst |
| `pendingArgs` / `pendingThis` | latest call **not yet invoked**. `null` means nothing pending |
| `result` | last return value of `func` |

The key design choice is that **`invoke()` consumes the pending call**: it copies `pendingArgs`/`pendingThis`, sets them to `null`, then calls `func`. Every "should I invoke?" question then becomes "is anything pending?", which naturally prevents double invocations:

- **Leading + trailing with one call:** leading consumes the call, so at the end nothing is pending and there's no trailing call.
- **`maxWait` near the end of a burst:** if `maxWait` just invoked, the trailing edge finds nothing pending.

## The handlers

**On each call**

1. Record `pendingArgs`/`pendingThis`.
2. Restart `waitTimer`.
3. If this call **started** the burst (the timer was `null` before), start `maxTimer` if `maxWait` is set, and invoke immediately if `leading`.
4. Return `result`.

**When `waitTimer` fires** (the burst ends): clear both timers, set them to `null`, and invoke only if `trailing` and something is pending. Otherwise drop the pending call so it can't leak into the next burst.

**When `maxTimer` fires**: re-arm it (the burst is still going), then invoke if something is pending.

## `maxWait` details

- It is clamped to at least `wait`. A `maxWait` shorter than `wait` would make the trailing timer meaningless.
- Anchoring the periodic timer at the start of the burst gives an even cadence: invocations at `0` (if leading), `maxWait`, `2·maxWait`, and so on. That's exactly throttle behaviour:

```js
const throttle = (fn, wait, { leading = true, trailing = true } = {}) =>
  debounce(fn, wait, { leading, trailing, maxWait: wait });
```

## `cancel` and `flush`

- `cancel`: clear both timers, reset them to `null`, and clear the pending call. The next call starts a new burst, so `leading` fires again.
- `flush`: if a burst is active, run the same code as the `waitTimer` handler right now. Reusing the handler keeps `flush` consistent with `trailing: false` (nothing runs) without special cases.

## Complexity

O(1) time and space per call.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Tracking "did leading fire" with a boolean instead of consuming pending args | Single-call bursts run twice, or second-call bursts never trail |
| Deciding "start of burst" from `pendingArgs === null` | After a leading call, the next call in the same burst looks like a new burst |
| Not clearing pending args when `trailing: false` | A stale call fires at the next `maxWait` or `flush` |
| Forgetting to stop `maxTimer` when the burst ends | It keeps firing forever and leaks |
| Arrow functions for `debounced` | Wrong `this` |

## Testing

Real timers make tests slow and flaky under CI load. Prefer fake timers (`vi.useFakeTimers()` / `jest.useFakeTimers()` with `advanceTimersByTime`), or inject a clock. With real timers, keep generous margins: assert on states well inside a window, never near the edges. The tests in this question use real delays with wide gaps for that reason.

## Follow-ups

- **Promise-returning debounce:** every caller in a burst gets the same promise, resolved with the trailing result. Callers whose calls were superseded share the final answer.
- **lodash's version** is timestamp-based: it computes the remaining time on each call instead of using two timers. It's harder to read but uses fewer timers, and it handles `Date.now()` going backwards. Mention this as a trade-off.
- **React:** keep the debounced function stable across renders (`useMemo`/`useRef`), keep `func` fresh with a ref, and call `cancel()` (or `flush()` for autosave) in the cleanup.
