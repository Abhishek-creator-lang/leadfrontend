## Approach: cache the promise, not the value

The single most important idea: store the **promise** in the cache the moment the request starts. If you cache only the resolved value, two calls made in the same tick both miss the cache and both hit the network, which is the classic "thundering herd on page load".

Each entry is `{ promise, expiresAt }`:

1. Compute the key. If an entry exists and `Date.now() < expiresAt`, return `entry.promise`.
2. Otherwise call `fn.apply(this, args)` inside `try/catch` and wrap it with `Promise.resolve` / `Promise.reject`, so the wrapper always returns a promise.
3. Store the entry with `expiresAt = Infinity`. A pending request never expires; its TTL hasn't started yet.
4. When it **resolves**, set `expiresAt = Date.now() + ttl`.
5. When it **rejects**, delete the entry, but only if `cache.get(key) === entry`.

### Why the identity check in step 5?

Imagine `getUser(1)` is in flight, then the user clicks *Refresh*, which calls `getUser.delete(1)` and `getUser(1)` again. If the **first** request now fails, a naive `cache.delete(key)` would evict the **second**, healthy request. Comparing the stored entry with the one this promise belongs to prevents that race.

### Returning the original promise

We attach `.then(onResolve, onReject)` for bookkeeping but return the **original** promise. The bookkeeping chain handles the rejection, so there is no unhandled-rejection warning from it, and callers still see the rejection on the promise they received.

## Complexity

O(1) average per call plus the cost of computing the key. `JSON.stringify` is O(size of args).

## Edge cases

- **Synchronous throw from `fn`:** becomes a rejected promise and is not cached.
- **`ttl: 0`:** in-flight dedupe still works, but every call after resolution refetches.
- **Expired entries:** checked lazily on access. Memory isn't reclaimed until the key is requested again; a periodic sweep or an LRU bound fixes that.
- **`this`:** use a regular `function` wrapper and `fn.apply(this, args)` so it works as a method.

## When `JSON.stringify` is a poor key

- Objects with the same data but a different key order produce different strings.
- `undefined`, functions and symbols disappear; `NaN` becomes `null`.
- `Map`, `Set` and class instances serialise to `{}`.
- Large arguments are expensive to stringify on every call.

Libraries such as TanStack Query ask you for an explicit, serialisable `queryKey` and hash it with sorted object keys for exactly these reasons.

## Common mistakes

| Mistake | Consequence |
|---|---|
| Caching the resolved value instead of the promise | Concurrent calls fire duplicate requests |
| Caching rejected promises | One network blip "poisons" the key until the TTL expires |
| Starting the TTL when the request starts | Slow requests expire immediately after resolving |
| `cache.delete(key)` on rejection without an identity check | A stale failure evicts a fresh request |
| Returning the `.then(...)` chain instead of the original promise | Rejections are swallowed, or the value is changed |

## Real-world connection

- **TanStack Query / SWR** dedupe identical in-flight queries, cache by key, mark data stale after `staleTime`, garbage-collect after `gcTime`, and do not cache errors.
- **React's `cache()`** (React Server Components) and Next.js's `fetch` deduplication give per-request memoisation of async work.
- **DataLoader** (GraphQL) dedupes and batches loads per request.

## Follow-ups

- **Stale-while-revalidate:** keep serving the last value after `staleTime`, fire a background refresh, and swap the entry when it succeeds.
- **Bounded size:** back the store with an LRU cache (see *LRU Cache*).
- **Cancellation:** if every caller has abandoned a request, abort it. That needs reference counting of subscribers.
