Implement `promiseTimeout(promise, duration)`. It returns a new promise that:

- settles **the same way as `promise`** if `promise` settles within `duration` milliseconds, or
- **rejects with a timeout error** if `duration` ms pass first.

```js
const fetchUser = () => new Promise((resolve) => setTimeout(() => resolve({ id: 1 }), 50));

await promiseTimeout(fetchUser(), 200); // { id: 1 }

try {
  await promiseTimeout(fetchUser(), 10);
} catch (e) {
  e instanceof Error; // true
  e.name; // 'TimeoutError'
}
```

## Requirements

- The timeout error is an `Error` instance whose `name` is `'TimeoutError'`. Include the duration in the message.
- If `promise` rejects in time, the result rejects with the **same** reason, not a timeout.
- `promise` may also be a plain value or a thenable. Treat it like `Promise.resolve` would.
- Once the result is settled, later settlement of the input is ignored.
- **Clear the timer** as soon as the input settles, so it doesn't keep running in the background.

## Follow-up

- The wrapped operation keeps running after a timeout. How would you actually cancel it, say for a `fetch`?
- How would you test this without waiting for real time to pass?
