Implement `retry(fn, options)`. It calls the async function `fn` and, if it fails, tries again after a delay that grows exponentially. It resolves with the first successful result, or rejects with the **last** error once it runs out of retries.

```js
const data = await retry(
  (attempt) => fetchJSON('/api/orders'), // attempt is 1, 2, 3, ...
  {
    retries: 3,        // up to 3 retries, so at most 4 calls in total
    baseDelay: 200,    // wait 200ms, then 400ms, then 800ms
    factor: 2,
    shouldRetry: (error) => error.status !== 404,
  }
);
```

## Options

| Option | Default | Meaning |
|---|---|---|
| `retries` | `3` | Number of **re**-tries after the first attempt. `0` means call once. |
| `baseDelay` | `100` | Delay in ms before the first retry. |
| `factor` | `2` | Multiplier applied to the delay after each retry. |
| `maxDelay` | `Infinity` | Upper bound for any single delay. |
| `shouldRetry` | `() => true` | `(error, attempt) => boolean`. If it returns `false`, reject immediately with that error. |

The delay before retry number `k` (1-based) is `min(baseDelay * factor ** (k - 1), maxDelay)`.

## Requirements

- `fn` receives the 1-based attempt number.
- `fn` may return a value, return a promise, or throw synchronously. A synchronous throw is a failure like any other.
- Never call `fn` twice at the same time: wait for each attempt to settle before scheduling the next.

## Follow-up

- Why is **jitter** important when thousands of clients retry at the same time?
- Which HTTP errors should and shouldn't be retried? What about non-idempotent requests like `POST /payments`?
- How would you honour a server's `Retry-After` header?
- How would you let the caller abort the whole retry loop?
