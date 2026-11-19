## Approach

`async`/`await` turns this into a readable loop:

```js
for (let attempt = 1; ; attempt++) {
  try {
    return await fn(attempt);
  } catch (error) {
    if (attempt > retries || !shouldRetry(error, attempt)) throw error;
    await sleep(delayFor(attempt));
  }
}
```

- `return await` matters. A bare `return fn(attempt)` inside `try` returns the promise without waiting for it, so a rejection skips the `catch` and nothing is retried.
- Calling `fn` inside `try` also catches synchronous throws.
- The attempt counter is 1-based. After attempt `k` fails, there have been `k - 1` retries, so we may retry while `k <= retries`. That gives at most `retries + 1` calls.
- The delay before retry `k` is `baseDelay * factor ** (k - 1)`, capped at `maxDelay`.

## Complexity

O(retries) calls. Worst-case total waiting time is the geometric sum `baseDelay * (factor^retries - 1) / (factor - 1)` (before capping), which is worth computing in an interview so you know whether "retry 10 times" means waiting two minutes.

## Edge cases

- **`retries: 0`:** one call and no waiting.
- **Non-retryable errors:** `shouldRetry` returns `false`, so we rethrow immediately and skip the sleep.
- **Rethrow the original error**, not a new "retries exhausted" error, unless you attach the original as `cause`. Callers usually branch on `error.status`.
- **Synchronous throw on the first attempt:** handled by `try`.

## Common mistakes

| Mistake | Consequence |
|---|---|
| `return fn()` without `await` inside `try` | Rejections bypass `catch`, so nothing is retried |
| Off-by-one between "attempts" and "retries" | One call too few or too many |
| Retrying every error | 400/401/404 are retried pointlessly; non-idempotent POSTs can double-charge |
| Starting a retry before the previous attempt settled | Parallel duplicate requests |
| Fixed delay with no backoff | Hammers a struggling server at full rate |

## Jitter and the thundering herd

If a backend goes down and 10,000 clients all retry at exactly 200ms, 400ms, 800ms, they arrive in synchronised waves that knock it over again. Production clients add **jitter**. "Full jitter" picks a random delay in `[0, computedDelay]`, which spreads retries out. The AWS SDKs, gRPC and Google Cloud client libraries all use exponential backoff with jitter. A fully random delay is hard to test deterministically, so the exercise leaves it out, but mention it.

## What to retry

- **Retry:** network errors (`TypeError: Failed to fetch`), 408, 429, 502, 503 and 504.
- **Don't retry:** 400, 401, 403, 404 and 422. The request won't succeed by repeating it.
- **Non-idempotent requests** (POST a payment): only retry with an **idempotency key**, so the server can deduplicate. That is how Stripe's API works.
- **`429` / `503` with `Retry-After`:** use the server's value instead of your own backoff.

## Real-world connection

React Query (TanStack Query) retries failed queries three times by default with exponential backoff (`retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000)`) and exposes `retry` as a boolean, a number or a predicate. That is the same shape as this exercise. Apollo's `RetryLink` and `axios-retry` follow the same idea.

## Follow-ups

- **Abort:** accept a `signal`, check `signal.aborted` before each attempt, and make `sleep` reject when the signal fires.
- **Per-attempt timeout:** race `fn` against a timer and treat a timeout as a retryable error.
- **Circuit breaker:** after N consecutive failures across *all* calls, fail fast for a cool-down period instead of retrying at all.
