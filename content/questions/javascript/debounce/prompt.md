Implement `debounce(func, wait)`. It returns a debounced version of `func`, which runs only after `wait` milliseconds have passed since the **last** call. Each new call before the timer fires cancels the pending call and restarts the timer.

Debouncing is used for search-as-you-type, window `resize` handlers, autosave and similar cases where you only care about the final value of a burst of events.

```js
let i = 0;
const increment = () => i++;
const debounced = debounce(increment, 100);

debounced(); // t = 0
debounced(); // t = 50, cancels the first call and restarts the 100ms timer
// t = 150: increment runs once, so i === 1
```

## Requirements

- The debounced function must call `func` with the **arguments of the last call**.
- `func` must be called with the **`this` value of the last call**, so the debounced function also works as a method.
- `wait` defaults to `0` (the call is still deferred to a later macrotask).
- The returned function also exposes:
  - `cancel()`, which drops any pending invocation.
  - `flush()`, which runs any pending invocation immediately and clears the timer. It does nothing if no call is pending.

## Follow-up

- How would you add a `leading` option (fire on the first call and then ignore the rest of the burst)?
- How does debounce differ from throttle? When would you pick each one?
- How would you debounce inside a React component without recreating the timer on every render?
