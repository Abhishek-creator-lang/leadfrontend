Implement `throttle(func, wait)`. It returns a throttled version of `func` that runs **at most once per `wait` milliseconds**, no matter how often it's called.

Use the common "leading + trailing" behaviour:

1. **Leading:** a call made while no window is open runs `func` **immediately** and opens a `wait` ms window.
2. Calls made **during** the window don't run. The throttled function remembers only the **latest** one (its arguments and `this`).
3. **Trailing:** when the window closes, if a call was remembered, `func` runs with it and a **new** window opens. If nothing was remembered, the throttle goes idle.

```js
const log = throttle((x) => console.log(x), 100);

log('a'); // t=0: logs 'a' immediately, window until t=100
log('b'); // t=20: remembered
log('c'); // t=50: replaces 'b'
// t=100: logs 'c', new window until t=200
// t=200: nothing pending, idle again
log('d'); // t=300: logs 'd' immediately
```

## Requirements

- Forward the remembered call's **arguments** and **`this`**.
- `wait` defaults to `0`.
- The returned function has a `cancel()` method that drops any pending trailing call and resets the throttle, so the next call runs immediately.

## Follow-up

- Throttle vs debounce: which would you use for a scroll handler, a search box, and a "Save" button?
- How would you throttle to the screen's refresh rate instead of a fixed `wait`?
