This extends the **Debounce** question. Implement `debounce(func, wait, options)` with these options:

| Option | Default | Meaning |
|---|---|---|
| `leading` | `false` | Invoke `func` on the call that **starts** a burst. |
| `trailing` | `true` | Invoke `func` when the burst **ends** (no calls for `wait` ms), if there were calls since the last invocation. |
| `maxWait` | none | During a continuous burst, invoke `func` at least once every `maxWait` ms. Values below `wait` are raised to `wait`. |

A **burst** starts with a call made while the debouncer is idle, and ends once `wait` ms pass without a call. Every call inside the burst restarts the `wait` timer.

```js
const save = debounce(saveDraft, 300, { leading: true, trailing: true });
save('a'); // runs immediately with 'a' (leading)
save('b');
save('c'); // after 300ms of quiet: runs with 'c' (trailing)

const track = debounce(sendPosition, 100, { maxWait: 500 });
// While the user keeps moving, `wait` never elapses, but sendPosition still
// runs at least every 500ms with the latest position.
```

## Requirements

- Invocations always use the **arguments and `this` of the latest call** not yet invoked.
- With `leading: true, trailing: true`, a burst of **one** call invokes `func` **once**, not twice.
- A `maxWait` invocation happens only if there's a pending call, and it does not end the burst. It fires regardless of `trailing`.
- The debounced function returns the result of the **most recent invocation** (`undefined` until the first one).
- `debounced.cancel()` drops any pending call and ends the burst, so the next call starts a new one.
- `debounced.flush()` ends the burst **immediately, as if `wait` had elapsed**: the trailing call runs now if one would have run. It returns the latest result.

## Follow-up

- Show how `throttle` can be expressed with this `debounce`.
- How would you test this reliably?
